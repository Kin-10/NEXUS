const LEGACY_BAIYING_SESSION_PREFIX = 'baiying:';
const AGENT_SESSION_PREFIX = 'agent:';
const BAIYING_SESSION_MARKER = 'baiying';
const SUBAGENT_SESSION_MARKER = 'subagent';

export function isAskUserQuestionCandidateSessionKey(sessionKey: string | undefined | null): boolean {
  const raw = (sessionKey ?? '').trim();
  if (!raw) return false;

  if (raw.startsWith(LEGACY_BAIYING_SESSION_PREFIX)) {
    return raw.slice(LEGACY_BAIYING_SESSION_PREFIX.length).trim().length > 0;
  }

  if (!raw.startsWith(AGENT_SESSION_PREFIX)) {
    return false;
  }

  const parts = raw.split(':');
  if (parts.length < 4 || parts[0] !== 'agent') {
    return false;
  }

  const agentId = parts[1]?.trim() ?? '';
  const source = parts[2]?.trim() ?? '';
  const rest = parts.slice(3).join(':').trim();
  if (!agentId || !rest) {
    return false;
  }

  return source === BAIYING_SESSION_MARKER || source === SUBAGENT_SESSION_MARKER;
}
