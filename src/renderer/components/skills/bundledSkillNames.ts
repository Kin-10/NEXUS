import type { LocalizedText } from '../../types/skill';

/**
 * Localized display names for the skills bundled with the app
 * (the ones listed in SKILLs/skills.config.json).
 *
 * The skill store currently ships English-only ids as names, so these give
 * Chinese users a readable title today. Once the server sends `displayName`
 * for a skill, that value wins over this map — see
 * `skillService.getLocalizedSkillName()`.
 *
 * When adding a bundled skill, add its display name here too; a missing entry
 * only means the prettified English name is shown.
 */
export const BUNDLED_SKILL_DISPLAY_NAMES: Record<string, LocalizedText> = {
  'deep-research': { zh: '深度研究', en: 'Deep Research' },
  'docx': { zh: 'Word 文档处理', en: 'Word Documents' },
  'drafter-diagram': { zh: '工程蓝图绘图', en: 'Drafter Diagram' },
  'find-skills': { zh: '查找技能', en: 'Find Skills' },
  'frontend-design': { zh: '前端界面设计', en: 'Frontend Design' },
  'install-skill-dependency': { zh: '安装技能依赖', en: 'Install Skill Dependency' },
  'local-tools': { zh: '本地工具', en: 'Local Tools' },
  'pdf': { zh: 'PDF 处理', en: 'PDF Toolkit' },
  'playwright': { zh: '浏览器自动化', en: 'Playwright CLI' },
  'pptx': { zh: 'PPT 制作', en: 'PowerPoint Slides' },
  'skill-creator': { zh: '技能创建', en: 'Skill Creator' },
  'skill-vetter': { zh: '技能安全审查', en: 'Skill Vetter' },
  'ui-designer': { zh: 'UI 设计师', en: 'UI Designer' },
  'weather': { zh: '天气查询', en: 'Weather' },
  'web-search': { zh: '联网搜索', en: 'Web Search' },
  'wecom-unified': { zh: '企业微信套件', en: 'WeCom Unified' },
  'xlsx': { zh: '表格处理', en: 'Excel Spreadsheets' },
};
