import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import fs from 'fs';
import http from 'http';
import type { AddressInfo } from 'net';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, test } from 'vitest';

import {
  BrowserCredentialLoginTool,
  BrowserCredentialMcpServer,
} from '../../shared/browserCredentials/constants';
import {
  resolvebaiyingBrowserMcpCommand,
  resolvebaiyingBrowserMcpStdioLaunch,
} from './baiyingBrowserMcpServer';

const createdDirectories: string[] = [];

const createTempDirectory = (): string => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'baiying-browser-mcp-'));
  createdDirectories.push(directory);
  return directory;
};

afterEach(() => {
  for (const directory of createdDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe('resolvebaiyingBrowserMcpCommand', () => {
  test('generates a self-contained Windows launcher and private runtime descriptor', () => {
    const baseDir = createTempDirectory();
    const bridgeSecret = 'runtime-only-secret';
    const electronNodeRuntimePath = 'D:\\龙虾\\baiyingAI 100%\\baiyingAI.exe';
    const command = resolvebaiyingBrowserMcpCommand(baseDir, {
      electronNodeRuntimePath,
      bridgeUrl: 'http://127.0.0.1:61234/browser/tool',
      bridgeSecret,
      platform: 'win32',
    });

    const launcher = fs.readFileSync(command, 'utf8');
    const serverDir = path.dirname(command);
    const runtimeConfig = JSON.parse(fs.readFileSync(
      path.join(serverDir, 'baiying-browser-mcp-runtime.json'),
      'utf8',
    ));

    expect(path.extname(command)).toBe('.cmd');
    expect(launcher).toContain('"D:\\龙虾\\baiyingAI 100%%\\baiyingAI.exe"');
    expect(launcher).toMatch(/^@echo off\r\nchcp 65001 >nul 2>&1\r\n/);
    expect(launcher.indexOf('chcp 65001')).toBeLessThan(launcher.indexOf(electronNodeRuntimePath.replaceAll('%', '%%')));
    expect(launcher).toContain('set "ELECTRON_RUN_AS_NODE=1"');
    expect(launcher).not.toContain('baiyingAI_ELECTRON_PATH');
    expect(launcher).not.toContain(bridgeSecret);
    expect(runtimeConfig).toEqual({
      version: 1,
      bridgeUrl: 'http://127.0.0.1:61234/browser/tool',
      bridgeSecret,
    });
  });

  test.skipIf(process.platform !== 'win32')(
    'starts the generated Windows launcher when the Electron path contains Chinese characters',
    async () => {
      const baseDir = createTempDirectory();
      const unicodeRuntimeDir = path.join(baseDir, '中文安装目录');
      const electronNodeRuntimePath = path.join(unicodeRuntimeDir, path.basename(process.execPath));
      fs.mkdirSync(unicodeRuntimeDir, { recursive: true });
      try {
        fs.linkSync(process.execPath, electronNodeRuntimePath);
      } catch {
        fs.copyFileSync(process.execPath, electronNodeRuntimePath);
      }

      const bridgeSecret = 'unicode-runtime-secret';
      const bridgeServer = http.createServer((request, response) => {
        request.resume();
        request.on('end', () => {
          response.writeHead(200, { 'content-type': 'application/json' });
          response.end(JSON.stringify({
            content: [{ type: 'text', text: 'Unicode launcher is ready.' }],
            structuredContent: { pages: [] },
          }));
        });
      });
      await new Promise<void>((resolve, reject) => {
        bridgeServer.once('error', reject);
        bridgeServer.listen(0, '127.0.0.1', resolve);
      });
      const address = bridgeServer.address() as AddressInfo;
      const bridgeUrl = `http://127.0.0.1:${address.port}/browser/tool`;
      const command = resolvebaiyingBrowserMcpCommand(baseDir, {
        electronNodeRuntimePath,
        bridgeUrl,
        bridgeSecret,
        platform: 'win32',
      });
      const transport = new StdioClientTransport({
        command,
        args: [
          '--autoConnect',
          '--no-usage-statistics',
          '--experimentalStructuredContent',
          '--experimental-page-id-routing',
          `--baiying-bridge-url=${bridgeUrl}`,
        ],
        stderr: 'pipe',
      });
      const stderr: string[] = [];
      transport.stderr?.on('data', chunk => stderr.push(String(chunk)));
      const client = new Client({ name: 'baiying-browser-unicode-launcher-test', version: '1.0.0' }, {});

      try {
        await client.connect(transport);
        const tools = await client.listTools();
        expect(tools.tools.map(tool => tool.name)).toContain('list_pages');
        const result = await client.callTool({ name: 'list_pages', arguments: {} });
        expect(result.isError).not.toBe(true);
        expect(result.structuredContent).toEqual({ pages: [] });
      } finally {
        await client.close().catch(() => {});
        await new Promise<void>(resolve => bridgeServer.close(() => resolve()));
      }

      const stderrText = stderr.join('');
      expect(stderrText).toContain('[baiyingBrowserMcp] startup');
      expect(stderrText).toContain('runtimeConfig=loaded');
      expect(stderrText).not.toContain(bridgeSecret);
    },
    15_000,
  );

  test.each(['darwin', 'linux'] as const)(
    'generates a self-contained %s launcher with safely quoted app paths',
    platform => {
      const baseDir = createTempDirectory();
      const runtimePath = "/Applications/baiying AI/O'Brien Helper.app/Contents/MacOS/O'Brien Helper";
      const command = resolvebaiyingBrowserMcpCommand(baseDir, {
        electronNodeRuntimePath: runtimePath,
        bridgeUrl: 'http://127.0.0.1:61234/browser/tool',
        bridgeSecret: 'runtime-only-secret',
        platform,
      });

      const launcher = fs.readFileSync(command, 'utf8');

      expect(path.basename(command)).toBe('baiying-browser-mcp');
      expect(launcher).toContain("'/Applications/baiying AI/O'\"'\"'Brien Helper.app/Contents/MacOS/O'\"'\"'Brien Helper'");
      expect(launcher).toContain('ELECTRON_RUN_AS_NODE=1');
      expect(launcher).not.toContain('baiyingAI_ELECTRON_PATH');
    },
  );

  test('builds a shell-free stdio launch using Electron as Node', () => {
    const baseDir = createTempDirectory();
    const electronNodeRuntimePath = 'C:\\Program Files\\baiyingAI\\baiyingAI.exe';
    const launch = resolvebaiyingBrowserMcpStdioLaunch(baseDir, {
      electronNodeRuntimePath,
      bridgeUrl: 'http://127.0.0.1:61234/browser/tool',
      bridgeSecret: 'runtime-only-secret',
      platform: 'win32',
    });

    expect(launch).toEqual({
      command: electronNodeRuntimePath,
      args: [path.join(baseDir, 'baiying-browser-mcp', 'baiying-browser-mcp-server.mjs')],
      env: { ELECTRON_RUN_AS_NODE: '1' },
    });
    expect(path.extname(launch.command)).toBe('.exe');
    expect(fs.existsSync(launch.args[0])).toBe(true);
  });

  test('starts with the MCP SDK restricted environment without baiyingAI variables', async () => {
    const baseDir = createTempDirectory();
    const bridgeSecret = 'runtime-only-secret';
    const receivedSecrets: string[] = [];
    const bridgeServer = http.createServer((request, response) => {
      receivedSecrets.push(String(request.headers['x-mcp-bridge-secret'] || ''));
      request.resume();
      request.on('end', () => {
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(JSON.stringify({
          content: [{ type: 'text', text: 'No pages are open.' }],
          structuredContent: { pages: [] },
        }));
      });
    });
    await new Promise<void>((resolve, reject) => {
      bridgeServer.once('error', reject);
      bridgeServer.listen(0, '127.0.0.1', resolve);
    });
    const address = bridgeServer.address() as AddressInfo;
    const bridgeUrl = `http://127.0.0.1:${address.port}/browser/tool`;
    const launch = resolvebaiyingBrowserMcpStdioLaunch(baseDir, {
      electronNodeRuntimePath: process.execPath,
      bridgeUrl,
      bridgeSecret,
    });
    const transport = new StdioClientTransport({
      command: launch.command,
      args: [
        ...launch.args,
        '--autoConnect',
        '--no-usage-statistics',
        '--experimentalStructuredContent',
        '--experimental-page-id-routing',
        `--baiying-bridge-url=${bridgeUrl}`,
      ],
      env: launch.env,
      stderr: 'pipe',
    });
    const stderr: string[] = [];
    transport.stderr?.on('data', chunk => stderr.push(String(chunk)));
    const client = new Client({ name: 'baiying-browser-test', version: '1.0.0' }, {});

    try {
      await client.connect(transport);
      const tools = await client.listTools();
      expect(tools.tools.map(tool => tool.name)).toContain('list_pages');
      expect(tools.tools.map(tool => tool.name)).toContain('click');
      const savedLoginTool = tools.tools.find(tool => tool.name === BrowserCredentialLoginTool.Name);
      expect(savedLoginTool?.description).toContain('password is never returned to the Agent');
      const result = await client.callTool({ name: 'list_pages', arguments: {} });
      expect(result.isError).not.toBe(true);
      expect(result.structuredContent).toEqual({ pages: [] });
    } finally {
      await client.close().catch(() => {});
      await new Promise<void>(resolve => bridgeServer.close(() => resolve()));
    }

    expect(receivedSecrets).toEqual([bridgeSecret]);
    const stderrText = stderr.join('');
    expect(stderrText).toContain('[baiyingBrowserMcp] startup');
    expect(stderrText).toContain('runtimeConfig=loaded');
    expect(stderrText).toContain('bridgeUrlArg=true');
    expect(stderrText).toContain('bridgeSecretConfigured=true');
    expect(stderrText).not.toContain(bridgeSecret);
    expect(stderrText).not.toContain('baiyingAI_ELECTRON_PATH is not set');
  }, 15_000);

  test('writes bridge failures to stderr without exposing the bridge secret', async () => {
    const baseDir = createTempDirectory();
    const bridgeSecret = 'diagnostic-secret-must-not-leak';
    const bridgeServer = http.createServer((request, response) => {
      request.resume();
      request.on('end', () => {
        response.writeHead(503, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ error: 'Browser host is not ready.' }));
      });
    });
    await new Promise<void>((resolve, reject) => {
      bridgeServer.once('error', reject);
      bridgeServer.listen(0, '127.0.0.1', resolve);
    });
    const address = bridgeServer.address() as AddressInfo;
    const bridgeUrl = `http://127.0.0.1:${address.port}/browser/tool?private=ignored`;
    const launch = resolvebaiyingBrowserMcpStdioLaunch(baseDir, {
      electronNodeRuntimePath: process.execPath,
      bridgeUrl,
      bridgeSecret,
    });
    const transport = new StdioClientTransport({
      command: launch.command,
      args: launch.args,
      env: launch.env,
      stderr: 'pipe',
    });
    const stderr: string[] = [];
    transport.stderr?.on('data', chunk => stderr.push(String(chunk)));
    const client = new Client({ name: 'baiying-browser-diagnostic-test', version: '1.0.0' }, {});

    try {
      await client.connect(transport);
      const result = await client.callTool({ name: 'list_pages', arguments: {} });
      expect(result.isError).toBe(true);
      expect(result.content).toEqual([
        { type: 'text', text: 'Browser host is not ready.' },
      ]);
    } finally {
      await client.close().catch(() => {});
      await new Promise<void>(resolve => bridgeServer.close(() => resolve()));
    }

    const stderrText = stderr.join('');
    expect(stderrText).toContain('bridge-http-error tool="list_pages"');
    expect(stderrText).toContain(`bridge=http://127.0.0.1:${address.port}/browser/tool`);
    expect(stderrText).toContain('status=503');
    expect(stderrText).not.toContain('?private=ignored');
    expect(stderrText).not.toContain(bridgeSecret);
  }, 15_000);

  test('can expose only the saved-credential login tool to the Agent runtime', async () => {
    const baseDir = createTempDirectory();
    const launch = resolvebaiyingBrowserMcpStdioLaunch(baseDir, {
      electronNodeRuntimePath: process.execPath,
      bridgeUrl: 'http://127.0.0.1:61234/browser/tool',
      bridgeSecret: 'runtime-only-secret',
    });
    const transport = new StdioClientTransport({
      command: launch.command,
      args: [...launch.args, BrowserCredentialMcpServer.ToolSetArgument],
      env: launch.env,
      stderr: 'pipe',
    });
    const client = new Client({ name: 'baiying-browser-credential-test', version: '1.0.0' }, {});

    try {
      await client.connect(transport);
      const tools = await client.listTools();
      expect(tools.tools.map(tool => tool.name)).toEqual([BrowserCredentialLoginTool.Name]);
    } finally {
      await client.close().catch(() => {});
    }
  }, 15_000);

  test('rejects incomplete runtime configuration', () => {
    const baseDir = createTempDirectory();

    expect(() => resolvebaiyingBrowserMcpCommand(baseDir, {
      electronNodeRuntimePath: '',
      bridgeUrl: 'http://127.0.0.1:61234/browser/tool',
      bridgeSecret: 'secret',
    })).toThrow('Electron Node runtime path');
    expect(() => resolvebaiyingBrowserMcpCommand(baseDir, {
      electronNodeRuntimePath: process.execPath,
      bridgeUrl: '',
      bridgeSecret: 'secret',
    })).toThrow('active browser bridge');
  });
});
