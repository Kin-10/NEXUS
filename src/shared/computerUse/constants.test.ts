import { describe, expect, test } from 'vitest';

import { isComputerUseToolName } from '../../shared/computerUse/constants';

describe('isComputerUseToolName', () => {
  test('matches bare and prefixed computer-use MCP tool names', () => {
    expect(isComputerUseToolName('list_windows')).toBe(true);
    expect(isComputerUseToolName('click')).toBe(true);
    expect(isComputerUseToolName('computer-use__type_text')).toBe(true);
    expect(isComputerUseToolName('mcp__computer-use__scroll')).toBe(true);
    expect(isComputerUseToolName('Read')).toBe(false);
    expect(isComputerUseToolName('exec')).toBe(false);
    expect(isComputerUseToolName('')).toBe(false);
    expect(isComputerUseToolName(undefined)).toBe(false);
  });
});
