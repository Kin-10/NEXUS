export const SkillsPluginsHubTab = {
  Skills: 'skills',
  Plugins: 'plugins',
  Mcp: 'mcp',
} as const;

export type SkillsPluginsHubTab =
  typeof SkillsPluginsHubTab[keyof typeof SkillsPluginsHubTab];
