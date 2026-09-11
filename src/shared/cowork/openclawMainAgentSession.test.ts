import { describe, expect, test } from 'vitest';

import {
  isHiddenOpenClawMainAgentSessionTitle,
  OPENCLAW_MAIN_AGENT_SESSION_TITLE,
} from './openclawMainAgentSession';

describe('openclawMainAgentSession', () => {
  test('matches the historical mirror title only', () => {
    expect(isHiddenOpenClawMainAgentSessionTitle(OPENCLAW_MAIN_AGENT_SESSION_TITLE)).toBe(true);
    expect(isHiddenOpenClawMainAgentSessionTitle(' [OpenClaw] ')).toBe(true);
    expect(isHiddenOpenClawMainAgentSessionTitle('OpenClaw')).toBe(false);
    expect(isHiddenOpenClawMainAgentSessionTitle('新对话')).toBe(false);
    expect(isHiddenOpenClawMainAgentSessionTitle(null)).toBe(false);
  });
});
