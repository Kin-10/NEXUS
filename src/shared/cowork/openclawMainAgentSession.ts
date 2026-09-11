/**
 * Title used historically when mirroring OpenClaw gateway main-agent sessions
 * (`agent:{id}:main`) into local Cowork. These mirrors are no longer created or
 * shown in the sidebar.
 */
export const OPENCLAW_MAIN_AGENT_SESSION_TITLE = '[OpenClaw]';

export const isHiddenOpenClawMainAgentSessionTitle = (
  title: string | null | undefined,
): boolean => (title ?? '').trim() === OPENCLAW_MAIN_AGENT_SESSION_TITLE;
