import fs from 'fs';
import path from 'path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const TEST_USER_DATA = path.join(process.cwd(), '.test-computer-use-runtime');
const originalPlatform = process.platform;
const originalArch = process.arch;

vi.mock('electron', () => ({
  app: {
    getAppPath: vi.fn(() => process.cwd()),
    getPath: vi.fn((name: string) => (name === 'userData' ? TEST_USER_DATA : '')),
    isPackaged: false,
  },
  session: {
    defaultSession: {
      fetch: vi.fn(),
    },
  },
  BrowserWindow: vi.fn(),
  globalShortcut: {
    register: vi.fn(() => true),
    unregister: vi.fn(),
  },
  screen: {
    getAllDisplays: vi.fn(() => []),
    on: vi.fn(),
  },
}));

import { ComputerUseActivityState, ComputerUseBridgePath } from '../../shared/computerUse/constants';
import {
  ComputerUseActivityController,
} from './computerUseActivityOverlay';
import {
  ComputerUseMcpEnv,
  deriveComputerUseActivityUrl,
  ensureComputerUseMcpServerScript,
  resolveComputerUseMcpServer,
  resolveComputerUseRuntimePaths,
  resolvePackageRoot,
} from './computerUseMcpServer';
import {
  ComputerUseRuntime,
  getComputerUseHelperStateHome,
  getComputerUseRuntimeRoot,
  inspectComputerUseRuntime,
} from './computerUseRuntime';

beforeEach(() => {
  Object.defineProperty(process, 'platform', { value: ComputerUseRuntime.Platform });
  Object.defineProperty(process, 'arch', { value: ComputerUseRuntime.Arch });
});

afterEach(() => {
  Object.defineProperty(process, 'platform', { value: originalPlatform });
  Object.defineProperty(process, 'arch', { value: originalArch });
  fs.rmSync(TEST_USER_DATA, { recursive: true, force: true });
  vi.unstubAllEnvs();
});

describe('resolvePackageRoot', () => {
  test('resolves the MCP SDK package root instead of its exported cjs package marker', () => {
    const root = resolvePackageRoot('@modelcontextprotocol/sdk');

    expect(root).toBeTruthy();
    expect(path.basename(root!)).toBe('sdk');
    expect(root).not.toContain(`${path.sep}dist${path.sep}cjs`);
  });
});

describe('resolveComputerUseRuntimePaths', () => {
  function writeRuntimeFixture(): {
    clientModulePath: string;
    helperExePath: string;
    rootDir: string;
    runtimePackageRoot: string;
  } {
    const rootDir = getComputerUseRuntimeRoot();
    const runtimePackageRoot = path.join(rootDir, 'node_modules', '@baiying', 'computer-use');
    const helperExePath = path.join(runtimePackageRoot, 'bin', 'windows', 'baiying-computer-use.exe');
    const clientPath = path.join(
      runtimePackageRoot,
      'dist',
      'windows',
      'computer_use_client.js',
    );
    fs.mkdirSync(path.dirname(helperExePath), { recursive: true });
    fs.mkdirSync(path.dirname(clientPath), { recursive: true });
    fs.writeFileSync(path.join(rootDir, 'runtime.json'), `\uFEFF${JSON.stringify({
      arch: ComputerUseRuntime.Arch,
      id: ComputerUseRuntime.Id,
      platform: ComputerUseRuntime.Platform,
      version: ComputerUseRuntime.Version,
      clientModule: 'node_modules/@baiying/computer-use/dist/windows/computer_use_client.js',
      helper: 'node_modules/@baiying/computer-use/bin/windows/baiying-computer-use.exe',
      runtimePackageRoot: 'node_modules/@baiying/computer-use',
    })}`);
    fs.writeFileSync(helperExePath, '');
    fs.writeFileSync(clientPath, '');
    return { clientModulePath: clientPath, helperExePath, rootDir, runtimePackageRoot };
  }

  test('resolves the installed runtime from userData runtimes directory', () => {
    const { clientModulePath, helperExePath, rootDir, runtimePackageRoot } = writeRuntimeFixture();

    const inspection = inspectComputerUseRuntime();
    const paths = resolveComputerUseRuntimePaths();

    expect(inspection.missing).toEqual([]);
    expect(paths).toEqual({ clientModulePath, helperExePath, rootDir, runtimePackageRoot });
  });

  test('configures the helper with BaiYing branding', () => {
    writeRuntimeFixture();

    const askUserCallbackUrl = 'http://127.0.0.1:1234/ask-user';
    const server = resolveComputerUseMcpServer({
      askUserCallbackUrl,
      bridgeSecret: 'secret',
      electronNodePath: process.execPath,
    });
    const helperStateHome = getComputerUseHelperStateHome();
    const config = JSON.parse(fs.readFileSync(
      path.join(helperStateHome, 'computer-use', 'config.json'),
      'utf8',
    )) as { strings?: { escToCancel?: string; usingComputer?: string } };

    expect(server?.env?.[ComputerUseMcpEnv.HelperStateHome]).toBe(helperStateHome);
    expect(server?.env?.[ComputerUseMcpEnv.ActivityUrl]).toBe(
      deriveComputerUseActivityUrl(askUserCallbackUrl),
    );
    expect(server?.env?.[ComputerUseMcpEnv.ActivityUrl]).toBe(
      `http://127.0.0.1:1234${ComputerUseBridgePath.Activity}`,
    );
    expect(server?.env?.[ComputerUseMcpEnv.ClientModulePath]).toContain(path.join(
      'node_modules',
      '@baiying',
      'computer-use',
      'dist',
      'windows',
      'computer_use_client.js',
    ));
    expect(server?.env?.[ComputerUseMcpEnv.LogDir]).toBe(path.join(TEST_USER_DATA, 'computer-use', 'logs'));
    expect(server?.env?.[ComputerUseMcpEnv.LogLevel]).toBe('info');
    expect(server?.env?.[ComputerUseMcpEnv.LogRetentionDays]).toBe('7');
    expect(config.strings?.usingComputer).toBe('百应正在接管你的电脑');
    expect(config.strings?.escToCancel).toBe('按Esc键退出');
    expect(config).toMatchObject({
      accentColor: '#5B9DFF',
      locale: 'zh-CN',
    });
  });

  test('reports Escape cancellation before renewing the helper turn', () => {
    const scriptPath = ensureComputerUseMcpServerScript();
    const script = fs.readFileSync(scriptPath, 'utf8');

    expect(script).toContain("requireEnv('baiying_COMPUTER_USE_HOME')");
    expect(script).toContain("requireEnv('baiying_COMPUTER_USE_CLIENT_MODULE')");
    expect(script).toContain("requireEnv('baiying_COMPUTER_USE_ACTIVITY_URL')");
    expect(script).toContain('async function notifyActivity(state)');
    expect(script).toContain("await notifyActivity('active')");
    expect(script).toContain("await notifyActivity('stopped')");
    expect(script).not.toContain("await notifyActivity('idle')");
    expect(script).not.toContain("requireEnv('CODEX_HOME')");
    expect(script).not.toContain('sky_js');
    expect(script).not.toContain('@oai');
    expect(script).not.toContain('x-oai-cua-approved-app');
    expect(script).toContain("const APPROVED_APP_META_KEY = 'x-baiying-computer-use-approved-app'");
    expect(script).toContain('computerUseHome: helperStateHome');
    expect(script).toContain('function hasHelperInterruptMarker()');
    expect(script).toContain('function assertHelperTurnActive()');
    expect(script).toContain('assertHelperTurnActive();');
    expect(script).toContain('function renewHelperTurn()');
    expect(script).toContain('renewHelperTurn();');
    expect(script).not.toContain('function ensureFreshHelperTurn()');
    expect(script).toContain('function isComputerUseStoppedError(error)');
    expect(script).toContain("error.message.includes('physical Escape key')");
    expect(script).toContain('STOPPED_BY_USER_MESSAGE');
    expect(script).not.toContain('turn_id: String(Date.now())');
    expect(script).not.toContain("client.transport?.request?.('end_turn'");
  });
});

describe('deriveComputerUseActivityUrl', () => {
  test('replaces the ask-user path with the activity bridge path', () => {
    expect(deriveComputerUseActivityUrl('http://127.0.0.1:4242/askuser')).toBe(
      `http://127.0.0.1:4242${ComputerUseBridgePath.Activity}`,
    );
  });
});

describe('ComputerUseActivityController', () => {
  test('stays visible through tool idle and only hides on stopped (Esc)', () => {
    const visibleChanges: boolean[] = [];
    const controller = new ComputerUseActivityController({
      onVisibleChange: (visible) => visibleChanges.push(visible),
    });

    controller.setActivity(ComputerUseActivityState.Active);
    expect(controller.isVisible).toBe(true);

    controller.setActivity(ComputerUseActivityState.Idle);
    expect(controller.isVisible).toBe(true);

    controller.setActivity(ComputerUseActivityState.Active);
    expect(controller.isVisible).toBe(true);

    controller.setActivity(ComputerUseActivityState.Stopped);
    expect(controller.isVisible).toBe(false);
    expect(visibleChanges).toEqual([true, false]);

    controller.destroy();
  });

  test('destroy hides the overlay', () => {
    const controller = new ComputerUseActivityController({
      onVisibleChange: () => {},
    });
    controller.setActivity(ComputerUseActivityState.Active);
    expect(controller.isVisible).toBe(true);
    controller.destroy();
    expect(controller.isVisible).toBe(false);
  });
});
