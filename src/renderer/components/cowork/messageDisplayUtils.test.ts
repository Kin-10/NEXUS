import { expect, test } from 'vitest';

import type { CoworkMessage } from '../../types/cowork';
import {
  formatStructuredText,
  getStreamingActivityStatusText,
  getToolActivityStatusText,
  getToolInputSummary,
  getToolResultCollapsedDisplay,
  getToolResultDisplay,
  shouldMaskCapabilityToolDetails,
  STRUCTURED_TEXT_FORMAT_MAX_CHARS,
  TOOL_RESULT_COLLAPSED_FULL_DISPLAY_MAX_CHARS,
} from './messageDisplayUtils';

const createToolResultMessage = (content: string): CoworkMessage => ({
  id: 'tool-result-test',
  type: 'tool_result',
  content,
  timestamp: 0,
});

test('tool result display still formats small JSON output', () => {
  const message = createToolResultMessage('{"ok":true,"count":2}');

  expect(getToolResultDisplay(message)).toBe('{\n  "ok": true,\n  "count": 2\n}');
});

test('structured text formatting skips oversized JSON output', () => {
  const oversizedJson = `{"value":"${'x'.repeat(STRUCTURED_TEXT_FORMAT_MAX_CHARS)}"}`;

  expect(formatStructuredText(oversizedJson)).toBe(oversizedJson);
});

test('collapsed tool result display keeps small output details', () => {
  const collapsed = getToolResultCollapsedDisplay(createToolResultMessage('line one\nline two'));

  expect(collapsed.hasText).toBe(true);
  expect(collapsed.isLarge).toBe(false);
  expect(collapsed.lineCount).toBe(2);
  expect(collapsed.text).toBe('line one\nline two');
});

test('collapsed tool result display summarizes medium output without structured formatting', () => {
  const mediumJson = `{"value":"${'x'.repeat(TOOL_RESULT_COLLAPSED_FULL_DISPLAY_MAX_CHARS)}"}`;
  const collapsed = getToolResultCollapsedDisplay(createToolResultMessage(mediumJson));

  expect(collapsed.hasText).toBe(true);
  expect(collapsed.isLarge).toBe(true);
  expect(collapsed.sizeLabel).not.toBeNull();
  expect(collapsed.lineCount).toBe(0);
  expect(collapsed.text.length).toBeLessThan(mediumJson.length);
  expect(collapsed.text).not.toContain('\n  "value"');
});

test('collapsed tool result display summarizes large output without full formatting', () => {
  const largeOutput = `first line\n${'x'.repeat(TOOL_RESULT_COLLAPSED_FULL_DISPLAY_MAX_CHARS)}`;
  const collapsed = getToolResultCollapsedDisplay(createToolResultMessage(largeOutput));

  expect(collapsed.hasText).toBe(true);
  expect(collapsed.isLarge).toBe(true);
  expect(collapsed.sizeLabel).not.toBeNull();
  expect(collapsed.lineCount).toBe(0);
  expect(collapsed.text.length).toBeLessThan(largeOutput.length);
  expect(collapsed.text).toContain('first line');
});

test('streaming activity status shows generic running before assistant content', () => {
  const messages: CoworkMessage[] = [{
    id: 'user-1',
    type: 'user',
    content: 'hello',
    timestamp: 1,
  }];

  expect(getStreamingActivityStatusText(messages)).toBe('正在努力生成中...');
});

test('streaming activity status keeps unresolved tool progress visible', () => {
  const messages: CoworkMessage[] = [{
    id: 'user-1',
    type: 'user',
    content: 'hello',
    timestamp: 1,
  }, {
    id: 'tool-1',
    type: 'tool_use',
    content: '',
    timestamp: 2,
    metadata: {
      toolUseId: 'tool-use-1',
      toolName: 'exec_command',
    },
  }];

  expect(getStreamingActivityStatusText(messages)).toBe('正在检查结果...');
});

test('streaming activity status shows context maintenance state', () => {
  expect(getStreamingActivityStatusText([], true)).toBe('正在整理上下文...');
});

test('internal skill paths are masked in tool display helpers', () => {
  const input = {
    file_path: '/Users/alice/.codex/skills/frontend/SKILL.md',
  };

  expect(shouldMaskCapabilityToolDetails('Read', input)).toBe(true);
  expect(getToolActivityStatusText('Read', input)).toBe('正在努力生成中...');
});

test('mcp names are masked in tool display helpers', () => {
  expect(shouldMaskCapabilityToolDetails('mcp__docs__search', { query: 'theme API' })).toBe(true);
  expect(getToolActivityStatusText('mcp__docs__search', { query: 'theme API' })).toBe('正在努力生成中...');
});

test('normal project paths still appear in tool input summaries', () => {
  const input = {
    file_path: '/Users/alice/project/src/shared/mcp/constants.ts',
  };

  expect(shouldMaskCapabilityToolDetails('Read', input)).toBe(false);
  expect(getToolInputSummary('Read', input)).toBe(input.file_path);
});
