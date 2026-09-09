# Avoid Gateway Restart on Model Switching — Design

## Overview

Eliminate OpenClaw gateway process restarts when users switch between 套餐模型 (baiying-server) and 自定义模型 (custom providers), or between different custom providers with different apiKeys.

## Problem

When switching models across provider types, the gateway process is killed and restarted:

```
User switches model
  → store:set('app_config')
  → syncOpenClawConfig({ restartGatewayIfRunning: false })
  → collectSecretEnvVars() returns new baiying_PROVIDER_API_KEY value
  → secretEnvVarsChanged = true
  → stopGateway() + startGateway()  ← user-visible disruption
```

Root cause: a single `baiying_PROVIDER_API_KEY` env var holds the active provider's apiKey. Switching providers changes this value, and env vars are fixed at process spawn time — forcing a restart.

## Design

### Approach: Per-Provider Env Vars

Pre-register ALL configured provider apiKeys as separate env vars at gateway startup. Each provider in `openclaw.json` references its own placeholder. Switching models only changes which placeholder is used — env vars stay the same.

```
Before (single env var):
  baiying_PROVIDER_API_KEY = <active provider's key>   ← changes on switch

After (per-provider env vars):
  baiying_APIKEY_SERVER    = <accessToken>              ← always set
  baiying_APIKEY_MOONSHOT  = <moonshot key>             ← always set
  baiying_APIKEY_ANTHROPIC = <anthropic key>            ← always set
  baiying_PROVIDER_API_KEY = <active key>               ← legacy fallback
```

### Architecture

```
resolveAllProviderApiKeys() ──────────────────────────┐
  (claudeSettings.ts)                                  │
  Enumerates all enabled providers + baiying-server   │
  Returns: { SERVER: token, MOONSHOT: key, ... }        │
                                                        ▼
collectSecretEnvVars() ◄──── Sets baiying_APIKEY_<NAME> for each provider
  (openclawConfigSync.ts)    All injected at gateway spawn time

buildProviderSelection() ──► apiKey: '${baiying_APIKEY_<NAME>}'
  (openclawConfigSync.ts)    Each provider references its own placeholder
```

### Env Var Naming Convention

| Provider | Env Var Name | Source |
|----------|-------------|--------|
| baiying-server | `baiying_APIKEY_SERVER` | accessToken from auth |
| moonshot | `baiying_APIKEY_MOONSHOT` | provider config apiKey |
| anthropic | `baiying_APIKEY_ANTHROPIC` | provider config apiKey |
| ollama | `baiying_APIKEY_OLLAMA` | `sk-baiying-local` (no key needed) |
| custom | `baiying_APIKEY_CUSTOM` | provider config apiKey |
| (legacy) | `baiying_PROVIDER_API_KEY` | active provider's key (backward compat) |

Formula: `baiying_APIKEY_` + `providerName.toUpperCase().replace(/[^A-Z0-9]/g, '_')`

For baiying-server, hardcoded as `SERVER` (since it's a dynamic provider, not in app_config.providers).

### Changes

#### `src/main/libs/claudeSettings.ts`

New export `resolveAllProviderApiKeys()`:
- Reads auth tokens → sets `SERVER` key with accessToken
- Iterates `app_config.providers` → sets `<PROVIDER_NAME>` key for each enabled provider
- Skips providers without apiKey (except those that don't require one, like ollama)

#### `src/main/libs/openclawConfigSync.ts`

1. New helper `providerApiKeyEnvVar(providerName)` → `baiying_APIKEY_<NAME>`
2. `buildProviderSelection()` — all 4 cases updated:
   - baiying-server: `${baiying_APIKEY_SERVER}` (was inline apiKey)
   - moonshot+codingPlan: `${baiying_APIKEY_MOONSHOT}` (was `${baiying_PROVIDER_API_KEY}`)
   - moonshot: `${baiying_APIKEY_MOONSHOT}` (was `${baiying_PROVIDER_API_KEY}`)
   - default: `${baiying_APIKEY_<PROVIDER>}` (was `${baiying_PROVIDER_API_KEY}`)
3. `collectSecretEnvVars()` — calls `resolveAllProviderApiKeys()` to set all env vars, keeps legacy `baiying_PROVIDER_API_KEY` for backward compat

### When Gateway Still Restarts (Expected)

| Scenario | Restarts? | Why |
|----------|-----------|-----|
| Switch 套餐→自定义 | No | Both env vars pre-set |
| Switch between custom providers | No | Both env vars pre-set |
| User edits a provider's apiKey | Yes | Env var value changed |
| New provider enabled for first time | Yes | New env var added |
| accessToken refreshed | Yes | SERVER env var changed (infrequent) |

### Backward Compatibility

- `baiying_PROVIDER_API_KEY` is still set (to active provider's key) as a legacy fallback
- Stale `openclaw.json` files referencing the old placeholder will still work
- After first sync, new placeholder format is written

## Testing

- Unit tests verify env var naming convention and switching stability
- Manual: switch between 套餐/自定义 models, verify no `stopGateway`/`startGateway` in logs
- Manual: send messages after switch to verify correct model/apiKey is used
