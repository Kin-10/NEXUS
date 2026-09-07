import { AgentId, LegacyAgentName, LegacyDefaultAgentProfileName } from '@shared/agent';

import { i18nService } from '../services/i18n';

interface AgentDisplaySource {
  id: string;
  name?: string;
  icon?: string;
}

export const isDefaultAgentId = (agentId?: string | null): boolean => {
  return agentId?.trim() === AgentId.Main;
};

/**
 * True when the main agent still uses a legacy/empty sentinel name that should
 * be shown via `defaultAgentDisplayName` instead of the raw stored value.
 *
 * Do NOT treat `DefaultAgentProfile.Name` (百应) as a sentinel — that is the
 * real default display name, and mapping it away makes renames to「百应」look
 * like a no-op.
 */
export const isDefaultAgentProfileName = (agent: Pick<AgentDisplaySource, 'id' | 'name'>): boolean => {
  if (!isDefaultAgentId(agent.id)) return false;
  const normalizedName = agent.name?.trim() ?? '';
  return !normalizedName
    || normalizedName.toLowerCase() === LegacyAgentName.Main
    || normalizedName === LegacyDefaultAgentProfileName;
};

export const getAgentDisplayName = (agent: Pick<AgentDisplaySource, 'id' | 'name'>): string => {
  if (isDefaultAgentProfileName(agent)) {
    return i18nService.t('defaultAgentDisplayName');
  }

  const normalizedName = agent.name?.trim();
  return normalizedName || agent.id;
};

export const getAgentDisplayNameById = (
  agentId: string,
  agents: Array<Pick<AgentDisplaySource, 'id' | 'name'>>,
): string | null => {
  const normalizedAgentId = agentId.trim();
  if (!normalizedAgentId) return null;

  const agent = agents.find((item) => item.id === normalizedAgentId);
  if (agent) return getAgentDisplayName(agent);

  if (isDefaultAgentId(normalizedAgentId)) {
    return i18nService.t('defaultAgentDisplayName');
  }

  return normalizedAgentId;
};

export const shouldUseDefaultAgentIcon = (agent: Pick<AgentDisplaySource, 'id' | 'icon'>): boolean => {
  return isDefaultAgentId(agent.id) && !agent.icon?.trim();
};
