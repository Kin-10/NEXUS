import { expect, test } from 'vitest';

import type { CoworkMessage } from '../../types/cowork';
import {
  formatStructuredText,
  getCoworkWorkingStageIndex,
  getCoworkWorkingStageText,
  getStreamingActivityStatusText,
  getToolResultCollapsedDisplay,
  getToolResultDisplay,
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

test('streaming activity status uses employee-style waiting stages', () => {
  const messages: CoworkMessage[] = [{
    id: 'user-1',
    type: 'user',
    content: 'hello',
    timestamp: 1,
  }];

  expect(getStreamingActivityStatusText(messages)).toBe('收到，我先理清你的需求…');
  expect(getStreamingActivityStatusText(messages, false, 2_500)).toBe('正在翻资料、对齐上下文…');
  expect(getStreamingActivityStatusText(messages, false, 12_000)).toBe('还在跟进细节，再稍等片刻…');
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

  expect(getStreamingActivityStatusText(messages)).toBe('正在用 exec_command 帮你处理…');
});

test('streaming activity status shows context maintenance state', () => {
  expect(getStreamingActivityStatusText([], true)).toBe('正在整理桌上的上下文…');
});

test('streaming activity status keeps unresolved tool progress during a prolonged wait', () => {
  const messages: CoworkMessage[] = [{
    id: 'tool-1',
    type: 'tool_use',
    content: '',
    timestamp: 1,
    metadata: {
      toolUseId: 'tool-use-1',
      toolName: 'exec_command',
    },
  }];

  expect(getStreamingActivityStatusText(messages, false, 30_000))
    .toBe('正在用 exec_command 帮你处理…');
});

test('cowork working stage index advances with elapsed wait time', () => {
  expect(getCoworkWorkingStageIndex(0)).toBe(0);
  expect(getCoworkWorkingStageIndex(1_999)).toBe(0);
  expect(getCoworkWorkingStageIndex(2_000)).toBe(1);
  expect(getCoworkWorkingStageIndex(5_000)).toBe(2);
  expect(getCoworkWorkingStageIndex(10_000)).toBe(3);
  expect(getCoworkWorkingStageIndex(20_000)).toBe(4);
  expect(getCoworkWorkingStageText(20_000)).toBe('事情比预想复杂一点，我继续盯着…');
});
