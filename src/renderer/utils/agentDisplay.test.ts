import { AgentId, DefaultAgentProfile, LegacyDefaultAgentProfileName } from '@shared/agent';
import { describe, expect, test } from 'vitest';

import {
  getAgentDisplayName,
  isDefaultAgentProfileName,
} from './agentDisplay';

describe('agentDisplay', () => {
  test('shows 百应 as the real main-agent name instead of mapping it away', () => {
    const agent = { id: AgentId.Main, name: DefaultAgentProfile.Name };
    expect(isDefaultAgentProfileName(agent)).toBe(false);
    expect(getAgentDisplayName(agent)).toBe('百应');
  });

  test('still maps legacy BaiYing sentinel to the localized default label', () => {
    const agent = { id: AgentId.Main, name: LegacyDefaultAgentProfileName };
    expect(isDefaultAgentProfileName(agent)).toBe(true);
  });

  test('keeps custom main-agent renames visible', () => {
    const agent = { id: AgentId.Main, name: '工作助手' };
    expect(isDefaultAgentProfileName(agent)).toBe(false);
    expect(getAgentDisplayName(agent)).toBe('工作助手');
  });
});
