import { app } from 'electron';
import fs from 'fs';
import path from 'path';

import {
  ComputerUseKitBundle,
  ComputerUseKitBundleIntegrity,
  ComputerUseKitId,
  ComputerUseKitMetadata,
  ComputerUseSkillId,
} from '../../shared/computerUse/constants';
import {
  type InstalledKitRecord,
  type InstalledKitSkills,
  type KitSkillMetadata,
  KitStoreKey,
} from '../../shared/kit/constants';
import type { SqliteStore } from '../sqliteStore';
import { ComputerUseRuntime } from './computerUseRuntime';

const SKILLS_DIR_NAME = 'SKILLs';
const SKILL_STATE_KEY = 'skills_state';
/** Built-in Computer Use kit icon (desktop monitor with checkmark). */
const COMPUTER_USE_KIT_ICON_SVG = [
  '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">',
  '<path d="M969.536 402.944a22.4 22.4 0 0 0-22.336 22.08V273.088a22.4 22.4 0 0 0 44.736-0.128h0.064V160a22.4 22.4 0 0 0-22.4-22.4H54.4a22.528 22.528 0 0 0-22.4 22.4v604.608c0 12.288 10.112 22.4 22.4 22.4h915.2a22.4 22.4 0 0 0 22.4-22.4V425.344a22.4 22.4 0 0 0-22.464-22.4z" fill="#1F1F1F"/>',
  '<path d="M969.6 328m-22.4 0a22.4 22.4 0 1 0 44.8 0 22.4 22.4 0 1 0-44.8 0Z" fill="#1F1F1F"/>',
  '<path d="M77.44 631.168a0.64 0.64 0 0 1-0.64-0.64V189.376a0.64 0.64 0 0 1 0.64-0.64h869.184c0.256 0 0.64 0.256 0.64 0.64v441.152c0 0.32-0.384 0.64-0.64 0.64H77.44z" fill="#545454"/>',
  '<path d="M77.44 740.032a0.64 0.64 0 0 1-0.64-0.64v-69.12a0.64 0.64 0 0 1 0.64-0.64h869.184c0.256 0 0.64 0.32 0.64 0.64v69.12c0 0.32-0.384 0.64-0.64 0.64H77.44z" fill="#E0E0E0"/>',
  '<path d="M76.8 631.168h870.464v44.8H76.8zM637.12 875.776H386.816l19.264-88.768h211.904z" fill="#1F1F1F"/>',
  '<path d="M431.68 875.776l19.2-88.768h122.368l19.136 88.768z" fill="#E0E0E0"/>',
  '<path d="M721.984 888a16 16 0 0 1-16 16H318.016a16 16 0 0 1 0-32h388.032a16 16 0 0 1 15.936 16z" fill="#1F1F1F"/>',
  '<path d="M512 706.688m-18.176 0a18.176 18.176 0 1 0 36.352 0 18.176 18.176 0 1 0-36.352 0Z" fill="#1F1F1F"/>',
  '<path d="M366.272 445.76a22.464 22.464 0 0 1-31.68 0 22.464 22.464 0 0 1 0-31.68l134.272-134.272a22.464 22.464 0 0 1 31.68 0 22.464 22.464 0 0 1 0 31.68L366.272 445.76z" fill="#FFFFFF"/>',
  '<path d="M407.424 540.16a22.464 22.464 0 0 1-31.68 0 22.528 22.528 0 0 1 0-31.744l67.328-67.264a22.464 22.464 0 0 1 31.68 0 22.464 22.464 0 0 1 0 31.68L407.424 540.16z" fill="#FFFFFF"/>',
  '</svg>',
].join('');
const COMPUTER_USE_KIT_ICON_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(COMPUTER_USE_KIT_ICON_SVG)}`;
const COMPUTER_USE_MCP_REF = {
  id: ComputerUseKitId.BuiltIn,
  name: 'Computer Use',
  description: 'Built-in local Windows desktop control MCP server.',
};

type InstalledKitsMap = Record<string, InstalledKitRecord>;
type SkillStateMap = Record<string, { enabled: boolean }>;

export function isComputerUseKitSupportedPlatform(): boolean {
  return process.platform === ComputerUseRuntime.Platform
    && process.arch === ComputerUseRuntime.Arch;
}

export function buildComputerUseMarketplaceKit(): Record<string, unknown> {
  return {
    id: ComputerUseKitId.BuiltIn,
    name: ComputerUseKitMetadata.Name,
    description: ComputerUseKitMetadata.Description,
    icon: COMPUTER_USE_KIT_ICON_URL,
    author: '百应',
    version: ComputerUseRuntime.Version,
    tryAsking: [
      {
        en: 'Open Notepad and type a short note',
        zh: '打开记事本并输入一段简短笔记',
      },
      {
        en: 'List the desktop applications I can control',
        zh: '列出可以操作的桌面应用',
      },
    ],
    skills: {
      bundle: ComputerUseKitBundle.BuiltIn,
      bundleSha256: ComputerUseKitBundleIntegrity.Sha256,
      bundleSizeBytes: ComputerUseKitBundleIntegrity.SizeBytes,
      list: [
        {
          id: ComputerUseSkillId.BuiltIn,
          name: ComputerUseKitMetadata.SkillName,
          description: ComputerUseKitMetadata.SkillDescription,
        },
      ],
    },
    mcpServers: [COMPUTER_USE_MCP_REF],
    connectors: [],
  };
}

export function getInstalledKitsMap(store: SqliteStore): InstalledKitsMap {
  return store.get<InstalledKitsMap>(KitStoreKey.Installed) ?? {};
}

export function isComputerUseKitInstalled(store: SqliteStore): boolean {
  return isComputerUseKitSupportedPlatform()
    && Boolean(getInstalledKitsMap(store)[ComputerUseKitId.BuiltIn]);
}

export function buildInstalledComputerUseKitRecord(
  skillIds: string[],
  metadata: Record<string, KitSkillMetadata>,
): InstalledKitRecord {
  const skills: InstalledKitSkills = {
    skillIds,
    ...(Object.keys(metadata).length > 0 ? { metadata } : {}),
  };
  return {
    id: ComputerUseKitId.BuiltIn,
    version: ComputerUseRuntime.Version,
    installedAt: Date.now(),
    skills,
    mcpServers: [COMPUTER_USE_MCP_REF],
    connectors: [],
  };
}

function getUserComputerUseSkillDir(): string {
  return path.join(app.getPath('userData'), SKILLS_DIR_NAME, ComputerUseSkillId.BuiltIn);
}

export function removeComputerUseSkillArtifacts(store: SqliteStore): void {
  fs.rmSync(getUserComputerUseSkillDir(), { recursive: true, force: true });
  const stateMap = store.get<SkillStateMap>(SKILL_STATE_KEY) ?? {};
  delete stateMap[ComputerUseSkillId.BuiltIn];
  store.set(SKILL_STATE_KEY, stateMap);
}
