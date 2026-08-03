import { describe, expect, test, vi } from 'vitest';

vi.mock('electron', () => ({
  app: {
    getAppPath: () => process.cwd(),
    getPath: () => process.cwd(),
    isPackaged: false,
  },
  utilityProcess: {
    fork: vi.fn(),
  },
}));

import {
  buildOpenClawCompileCacheEnv,
  buildOpenClawGatewayExecArgv,
  isOpenClawConfigStartupFailure,
  isOpenClawGatewayHeapOutOfMemory,
  isOpenClawGatewayVerboseLogLevel,
  resolveOpenClawGatewayLogLevel,
  shouldMirrorOpenClawGatewayStreamToMainLog,
} from './openclawEngineManager';

describe('buildOpenClawCompileCacheEnv', () => {
  test('prevents the packaged launcher from respawning Electron Helper', () => {
    expect(buildOpenClawCompileCacheEnv('/tmp/openclaw-cache')).toEqual({
      NODE_COMPILE_CACHE: '/tmp/openclaw-cache',
      OPENCLAW_PACKAGED_COMPILE_CACHE_RESPAWNED: '1',
    });
  });
});

describe('buildOpenClawGatewayExecArgv', () => {
  test('adds a gateway heap limit when NODE_OPTIONS is empty', () => {
    expect(buildOpenClawGatewayExecArgv(undefined)).toEqual(['--max-old-space-size=4096']);
  });

  test('adds a gateway heap limit alongside unrelated NODE_OPTIONS', () => {
    expect(buildOpenClawGatewayExecArgv('--trace-warnings')).toEqual(['--max-old-space-size=4096']);
  });

  test('respects an existing max old space setting with equals syntax', () => {
    expect(buildOpenClawGatewayExecArgv('--max-old-space-size=8192 --trace-warnings')).toEqual([]);
  });

  test('respects an existing max old space setting with space syntax', () => {
    expect(buildOpenClawGatewayExecArgv('--max-old-space-size 8192 --trace-warnings')).toEqual([]);
  });
});

describe('isOpenClawConfigStartupFailure', () => {
  test('matches OpenClaw config validation failures', () => {
    expect(isOpenClawConfigStartupFailure([
      '[stderr] Error: Invalid config at /Users/test/Library/Application Support/LobsterAI/openclaw/state/openclaw.json.',
      '[stderr] - models.providers.openai.api: invalid config: unsupported value',
    ].join('\n'))).toBe(true);
  });

  test('matches JSON5 parse failures for openclaw.json', () => {
    expect(isOpenClawConfigStartupFailure(
      '[stderr] JSON5 parse failed: invalid character at 4:3 in openclaw.json'
    )).toBe(true);
  });

  test('matches schema validation messages', () => {
    expect(isOpenClawConfigStartupFailure(
      '[stderr] Config validation failed: plugins.allow: unknown plugin id'
    )).toBe(true);
  });

  test('does not match unrelated runtime configuration errors', () => {
    expect(isOpenClawConfigStartupFailure(
      '[stderr] Invalid configuration: region from ARN does not match client region'
    )).toBe(false);
  });
});

describe('isOpenClawGatewayHeapOutOfMemory', () => {
  test('matches the V8 fatal heap OOM emitted by the gateway', () => {
    expect(isOpenClawGatewayHeapOutOfMemory(
      'FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory',
    )).toBe(true);
  });

  test('matches the alternate mark-compacts heap limit signature', () => {
    expect(isOpenClawGatewayHeapOutOfMemory(
      'FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed',
    )).toBe(true);
  });

  test('does not classify ordinary gateway disconnects as heap OOM', () => {
    expect(isOpenClawGatewayHeapOutOfMemory(
      'gateway websocket closed with code=1006',
    )).toBe(false);
  });
});

describe('resolveOpenClawGatewayLogLevel', () => {
  test('defaults to info when unset or invalid', () => {
    expect(resolveOpenClawGatewayLogLevel(undefined)).toBe('info');
    expect(resolveOpenClawGatewayLogLevel('')).toBe('info');
    expect(resolveOpenClawGatewayLogLevel('nope')).toBe('info');
  });

  test('accepts explicit levels case-insensitively', () => {
    expect(resolveOpenClawGatewayLogLevel('DEBUG')).toBe('debug');
    expect(resolveOpenClawGatewayLogLevel(' warn ')).toBe('warn');
  });
});

describe('isOpenClawGatewayVerboseLogLevel', () => {
  test('treats debug and below as verbose', () => {
    expect(isOpenClawGatewayVerboseLogLevel('debug')).toBe(true);
    expect(isOpenClawGatewayVerboseLogLevel('info')).toBe(false);
  });
});

describe('shouldMirrorOpenClawGatewayStreamToMainLog', () => {
  test('mirrors everything when verbose', () => {
    expect(shouldMirrorOpenClawGatewayStreamToMainLog(
      'debug',
      'stdout',
      '[agent/embedded] embedded run start',
    )).toBe(true);
  });

  test('drops routine stdout when quiet', () => {
    expect(shouldMirrorOpenClawGatewayStreamToMainLog(
      'info',
      'stdout',
      '[agent/embedded] embedded run start',
    )).toBe(false);
  });

  test('keeps warn/error tagged stdout when quiet', () => {
    expect(shouldMirrorOpenClawGatewayStreamToMainLog(
      'info',
      'stdout',
      '[plugins] [warn] something odd',
    )).toBe(true);
  });

  test('drops noisy stderr skill symlink warnings when quiet', () => {
    expect(shouldMirrorOpenClawGatewayStreamToMainLog(
      'info',
      'stderr',
      '[skills] failed to create plugin skill symlink "browser-automation": Error: EEXIST',
    )).toBe(false);
  });

  test('keeps fatal stderr when quiet', () => {
    expect(shouldMirrorOpenClawGatewayStreamToMainLog(
      'info',
      'stderr',
      'FATAL ERROR: JavaScript heap out of memory',
    )).toBe(true);
  });
});
