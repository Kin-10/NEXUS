import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Cube, Plug, Sparkle } from '@/components/icons/iconParkCompat';

import { i18nService } from '../../services/i18n';
import ManagementPageShell from '../management/ManagementPageShell';
import McpManager from '../mcp/McpManager';
import PluginsSettings, {
  type PluginPendingChanges,
  type PluginsSettingsHandle,
} from '../plugins/PluginsSettings';
import { SkillsPluginsHubTab } from './constants';
import SkillsManager from './SkillsManager';

interface SkillsViewProps {
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onNewChat?: () => void;
  onCreateSkillByChat?: () => void;
  updateBadge?: React.ReactNode;
  readOnly?: boolean;
  initialTab?: SkillsPluginsHubTab;
  onTabChange?: (tab: SkillsPluginsHubTab) => void;
}

const HUB_TABS: Array<{
  id: SkillsPluginsHubTab;
  labelKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
}> = [
  {
    id: SkillsPluginsHubTab.Skills,
    labelKey: 'skills',
    descriptionKey: 'skillsDescription',
    icon: <Sparkle className="h-3.5 w-3.5" />,
  },
  {
    id: SkillsPluginsHubTab.Plugins,
    labelKey: 'pluginsTab',
    descriptionKey: 'pluginsDesc',
    icon: <Plug className="h-3.5 w-3.5" />,
  },
  {
    id: SkillsPluginsHubTab.Mcp,
    labelKey: 'mcpServers',
    descriptionKey: 'mcpDescription',
    icon: <Cube className="h-3.5 w-3.5" />,
  },
];

const SkillsView: React.FC<SkillsViewProps> = ({
  isSidebarCollapsed,
  onToggleSidebar,
  onNewChat,
  onCreateSkillByChat,
  updateBadge,
  readOnly,
  initialTab = SkillsPluginsHubTab.Skills,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState<SkillsPluginsHubTab>(initialTab);
  const [pluginsDirty, setPluginsDirty] = useState(false);
  const [isSavingPlugins, setIsSavingPlugins] = useState(false);
  const [pluginsSaveError, setPluginsSaveError] = useState('');
  const pluginsSettingsRef = useRef<PluginsSettingsHandle>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const activeTabMeta = useMemo(
    () => HUB_TABS.find((tab) => tab.id === activeTab) ?? HUB_TABS[0],
    [activeTab],
  );

  const applyTabChange = useCallback((nextTab: SkillsPluginsHubTab) => {
    setActiveTab(nextTab);
    onTabChange?.(nextTab);
  }, [onTabChange]);

  const refreshPluginsDirty = useCallback(() => {
    const pending = pluginsSettingsRef.current?.getPendingChanges() ?? null;
    setPluginsDirty(Boolean(pending));
  }, []);

  useEffect(() => {
    if (activeTab !== SkillsPluginsHubTab.Plugins) {
      setPluginsDirty(false);
      setPluginsSaveError('');
      return undefined;
    }
    refreshPluginsDirty();
    const timer = window.setInterval(refreshPluginsDirty, 400);
    return () => window.clearInterval(timer);
  }, [activeTab, refreshPluginsDirty]);

  const handleSelectTab = useCallback((nextTab: SkillsPluginsHubTab) => {
    if (nextTab === activeTab) return;
    if (activeTab === SkillsPluginsHubTab.Plugins) {
      const blocked = pluginsSettingsRef.current?.guardLeave(() => {
        applyTabChange(nextTab);
      });
      if (blocked) return;
    }
    applyTabChange(nextTab);
  }, [activeTab, applyTabChange]);

  const handleSavePlugins = useCallback(async () => {
    const pendingChanges: PluginPendingChanges | null =
      pluginsSettingsRef.current?.getPendingChanges() ?? null;
    if (!pendingChanges) {
      setPluginsDirty(false);
      return;
    }
    setIsSavingPlugins(true);
    setPluginsSaveError('');
    try {
      await window.electron?.plugins.batchSave(pendingChanges);
      pluginsSettingsRef.current?.resetDirty();
      setPluginsDirty(false);
    } catch (error) {
      console.error('[SkillsView] Failed to save plugin changes', error);
      setPluginsSaveError(i18nService.t('pluginsSaveFailed'));
    } finally {
      setIsSavingPlugins(false);
    }
  }, []);

  const hubHeader = (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center rounded-full border border-border bg-surface p-1 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
          {HUB_TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-secondary hover:text-foreground'
                }`}
                aria-pressed={isActive}
              >
                {tab.icon}
                <span>{i18nService.t(tab.labelKey)}</span>
              </button>
            );
          })}
        </div>
        {activeTab === SkillsPluginsHubTab.Plugins && pluginsDirty && (
          <button
            type="button"
            onClick={() => void handleSavePlugins()}
            disabled={isSavingPlugins}
            className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-[13px] font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingPlugins ? i18nService.t('saving') : i18nService.t('save')}
          </button>
        )}
      </div>
      <p className="text-[12px] leading-5 text-secondary">
        {i18nService.t(activeTabMeta.descriptionKey)}
      </p>
      {pluginsSaveError && activeTab === SkillsPluginsHubTab.Plugins && (
        <p className="text-[12px] text-red-500">{pluginsSaveError}</p>
      )}
    </div>
  );

  return (
    <ManagementPageShell
      title={i18nService.t('sidebarNavSkillsPlugins')}
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleSidebar={onToggleSidebar}
      onNewChat={onNewChat}
      updateBadge={updateBadge}
    >
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-5 px-6 py-6">
        {hubHeader}
        <div className={activeTab === SkillsPluginsHubTab.Skills ? 'block' : 'hidden'}>
          <SkillsManager readOnly={readOnly} onCreateByChat={onCreateSkillByChat} />
        </div>
        <div className={activeTab === SkillsPluginsHubTab.Plugins ? 'block' : 'hidden'}>
          <PluginsSettings handleRef={pluginsSettingsRef} hideTitle />
        </div>
        <div className={activeTab === SkillsPluginsHubTab.Mcp ? 'block' : 'hidden'}>
          <McpManager />
        </div>
      </div>
    </ManagementPageShell>
  );
};

export default SkillsView;
