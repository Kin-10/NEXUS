import { AgentId } from '@shared/agent';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { useSkin } from '../providers/SkinProvider';
import { agentService } from '../services/agent';
import { coworkService } from '../services/cowork';
import { i18nService } from '../services/i18n';
import { LogReporterAction, reportYdAnalyzer } from '../services/logReporter';
import {
  type ThemeDefaultChangedDetail,
  themeService,
  ThemeServiceEvent,
} from '../services/theme';
import { RootState } from '../store';
import {
  selectCoworkSessions,
  selectCurrentSessionId,
} from '../store/selectors/coworkSelectors';
import type { CoworkSessionSummary } from '../types/cowork';
import { getAgentDisplayNameById } from '../utils/agentDisplay';
import {
  type AgentSidebarBatchItem,
  AgentSidebarBatchItemKind,
  createSessionBatchKey,
} from './agentSidebar/batchSelection';
import MyAgentSidebarTree from './agentSidebar/MyAgentSidebarTree';
import Modal from './common/Modal';
import { CoworkUiEvent } from './cowork/constants';
import CoworkSearchModal from './cowork/CoworkSearchModal';
import Cog6ToothIcon from './icons/Cog6ToothIcon';
import { Caution, ListChecks, Message, Moon, Sun } from './icons/iconParkCompat';
import { iconParkOutlineProps } from './icons/iconStyle';
import SidebarAutomationIcon from './icons/SidebarAutomationIcon';
import SidebarKitsIcon from './icons/SidebarKitsIcon';
import SidebarMcpIcon from './icons/SidebarMcpIcon';
import SidebarSearchIcon from './icons/SidebarSearchIcon';
import SidebarSitesIcon from './icons/SidebarSitesIcon';
import SidebarToggleIcon from './icons/SidebarToggleIcon';
import SkillIcon from './icons/SkillIcon';
import TrashIcon from './icons/TrashIcon';
import LoginButton from './LoginButton';
import SidebarExperienceSlot from './SidebarExperienceSlot';

interface SidebarProps {
  onShowSettings: () => void;
  onShowLogin?: () => void;
  activeView: 'cowork' | 'skills' | 'scheduledTasks' | 'kits' | 'mcp' | 'sites';
  onShowSkills: () => void;
  onShowCowork: () => void;
  onShowScheduledTasks: () => void;
  onShowKits: () => void;
  onShowMcp: () => void;
  onShowSites: () => void;
  onNewChat: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onWidthChange?: (width: number) => void;
  updateNotice?: React.ReactNode;
  /** The expanded update card owns the sidebar bottom; temporarily hide the
   * promo banner while preserving it for a smooth return after collapse. */
  hideAdBanner?: boolean;
  hideLogin?: boolean;
  hideSites?: boolean;
}

const SIDEBAR_RAIL_WIDTH = 56;
const DEFAULT_CONTEXT_PANEL_WIDTH = 184;
const MIN_CONTEXT_PANEL_WIDTH = 172;
const MAX_CONTEXT_PANEL_WIDTH = 260;
const SIDEBAR_COLLAPSE_TRANSITION_MS = 200;
const normalizeAgentId = (agentId?: string | null) => agentId?.trim() || AgentId.Main;
const SidebarNewFeatureBadge = {
  KitsDismissedVersionKey: 'sidebar.kitsNewFeatureBadge.dismissedVersion',
  // Bump this value in a release when the kits entry should show the badge again.
  KitsVersion: '2026-06-05',
} as const;
const railButtonClassName =
  'non-draggable relative inline-flex h-[56px] w-[50px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-foreground transition-colors hover:bg-surface-raised';
const activeRailButtonClassName =
  `${railButtonClassName} bg-surface-raised text-foreground shadow-none hover:bg-surface-raised`;
const railIconClassName = 'h-5 w-5 shrink-0';
const railLabelClassName = 'line-clamp-2 w-full text-center text-[11px] font-semibold leading-[13px]';

type SidebarAnalyticsSource = 'home_sidebar' | 'home_agent_sidebar';

interface SidebarAnalyticsOptions {
  activeView?: SidebarProps['activeView'];
  agentType?: 'main' | 'custom';
  hasActiveSubagent?: boolean;
  isCollapsed?: boolean;
  isCurrentSession?: boolean;
  isCurrentSubagent?: boolean;
  isExpanded?: boolean;
  isPinned?: boolean;
  isSelectAllChecked?: boolean;
  result?: 'success' | 'failed';
  selectedCount?: number;
  selectedSessionCount?: number;
  selectedSubagentCount?: number;
  selectableCount?: number;
  source?: SidebarAnalyticsSource;
  subagentStatus?: string;
  targetPinned?: boolean;
  targetSelected?: boolean;
  taskStatus?: string;
  visibleTaskCount?: number;
}

const reportSidebarAction = (
  actionType: string,
  options: SidebarAnalyticsOptions = {},
): void => {
  console.debug('[Sidebar] reporting sidebar action analytics');
  void reportYdAnalyzer({
    action: LogReporterAction.SidebarAction,
    source: options.source ?? 'home_sidebar',
    actionType,
    activeView: options.activeView,
    agentType: options.agentType,
    hasActiveSubagent: options.hasActiveSubagent,
    isCollapsed: options.isCollapsed,
    isCurrentSession: options.isCurrentSession,
    isCurrentSubagent: options.isCurrentSubagent,
    isExpanded: options.isExpanded,
    isPinned: options.isPinned,
    isSelectAllChecked: options.isSelectAllChecked,
    result: options.result,
    selectedCount: options.selectedCount,
    selectedSessionCount: options.selectedSessionCount,
    selectedSubagentCount: options.selectedSubagentCount,
    selectableCount: options.selectableCount,
    subagentStatus: options.subagentStatus,
    targetPinned: options.targetPinned,
    targetSelected: options.targetSelected,
    taskStatus: options.taskStatus,
    visibleTaskCount: options.visibleTaskCount,
  });
};

const Sidebar: React.FC<SidebarProps> = ({
  onShowSettings,
  activeView,
  onShowSkills,
  onShowCowork,
  onShowScheduledTasks,
  onShowKits,
  onShowMcp,
  onShowSites,
  onNewChat,
  isCollapsed,
  onToggleCollapse,
  onWidthChange,
  updateNotice,
  hideAdBanner,
  hideLogin,
  hideSites,
}) => {
  const { isAppearanceChanging, selectThemeById } = useSkin();
  const currentAgentId = useSelector((state: RootState) => state.agent.currentAgentId);
  const agents = useSelector((state: RootState) => state.agent.agents);
  const sessions = useSelector(selectCoworkSessions);
  const currentSessionId = useSelector(selectCurrentSessionId);
  const [appearanceMode, setAppearanceMode] = useState<'light' | 'dark'>(
    () => themeService.getEffectiveTheme(),
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchAgentId, setBatchAgentId] = useState<string | null>(null);
  const [batchSelectableItems, setBatchSelectableItems] = useState<AgentSidebarBatchItem[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [deletedSessionIds, setDeletedSessionIds] = useState<string[]>([]);
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_CONTEXT_PANEL_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [agentScrollEdges, setAgentScrollEdges] = useState({ top: false, bottom: false });
  const [isSidebarBannerVisible, setIsSidebarBannerVisible] = useState(false);
  const [showKitsNewBadge, setShowKitsNewBadge] = useState(false);
  const isResizingRef = useRef(false);
  const resizeStartXRef = useRef(0);
  const resizeStartWidthRef = useRef(DEFAULT_CONTEXT_PANEL_WIDTH);
  const agentScrollContainerRef = useRef<HTMLDivElement>(null);
  const sidebarShellWidth = SIDEBAR_RAIL_WIDTH + (isCollapsed ? 0 : sidebarWidth);
  const batchSelectableKeySet = useMemo(
    () => new Set(batchSelectableItems.map((item) => item.key)),
    [batchSelectableItems],
  );
  const batchSelectableItemByKey = useMemo(() => {
    const itemByKey = new Map<string, AgentSidebarBatchItem>();
    batchSelectableItems.forEach((item) => itemByKey.set(item.key, item));
    return itemByKey;
  }, [batchSelectableItems]);
  const selectedBatchSelectableCount = useMemo(() => {
    return batchSelectableItems.filter((item) => selectedKeys.has(item.key)).length;
  }, [batchSelectableItems, selectedKeys]);
  const isBatchSelectAllChecked =
    batchSelectableItems.length > 0 && selectedBatchSelectableCount === batchSelectableItems.length;
  const batchAgentName = batchAgentId ? getAgentDisplayNameById(batchAgentId, agents) : null;
  const getBatchSelectionSummary = useCallback(() => {
    const selectedItems = Array.from(selectedKeys)
      .filter((key) => batchSelectableKeySet.size === 0 || batchSelectableKeySet.has(key))
      .map((key) => batchSelectableItemByKey.get(key))
      .filter((item): item is AgentSidebarBatchItem => Boolean(item));
    const selectedSessionCount = selectedItems.filter(
      (item) => item.kind === AgentSidebarBatchItemKind.Session,
    ).length;
    return {
      selectedCount: selectedItems.length,
      selectedSessionCount,
      selectedSubagentCount: 0,
      selectableCount: batchSelectableItems.length,
    };
  }, [batchSelectableItemByKey, batchSelectableItems.length, batchSelectableKeySet, selectedKeys]);

  useEffect(() => {
    let isCurrent = true;

    const loadKitsNewBadgeState = async () => {
      try {
        const dismissedVersion = await window.electron.store.get(
          SidebarNewFeatureBadge.KitsDismissedVersionKey,
        );
        if (!isCurrent) return;
        setShowKitsNewBadge(dismissedVersion !== SidebarNewFeatureBadge.KitsVersion);
      } catch (error) {
        console.warn('[Sidebar] failed to load kits new feature badge state:', error);
      }
    };

    void loadKitsNewBadgeState();

    return () => {
      isCurrent = false;
    };
  }, []);

  const dismissKitsNewBadge = useCallback(() => {
    if (!showKitsNewBadge) return;
    setShowKitsNewBadge(false);
    void window.electron.store
      .set(
        SidebarNewFeatureBadge.KitsDismissedVersionKey,
        SidebarNewFeatureBadge.KitsVersion,
      )
      .catch((error) => {
        console.warn('[Sidebar] failed to save kits new feature badge state:', error);
      });
  }, [showKitsNewBadge]);

  useEffect(() => {
    const syncAppearanceMode = (event?: Event) => {
      const detail = (event as CustomEvent<ThemeDefaultChangedDetail> | undefined)?.detail;
      if (detail?.mode === 'light' || detail?.mode === 'dark') {
        setAppearanceMode(detail.mode);
        return;
      }
      setAppearanceMode(themeService.getEffectiveTheme());
    };

    syncAppearanceMode();
    window.addEventListener(ThemeServiceEvent.DefaultChanged, syncAppearanceMode);
    return () => {
      window.removeEventListener(ThemeServiceEvent.DefaultChanged, syncAppearanceMode);
    };
  }, []);

  const handleToggleAppearance = useCallback(() => {
    if (isAppearanceChanging) return;
    const nextThemeId = appearanceMode === 'dark' ? 'classic-light' : 'classic-dark';
    void selectThemeById(nextThemeId).then(() => {
      reportSidebarAction('toggle_appearance', {
        activeView,
        isCollapsed,
        result: 'success',
      });
    }).catch((error) => {
      console.error('[Sidebar] Failed to toggle appearance', error);
      reportSidebarAction('toggle_appearance', {
        activeView,
        isCollapsed,
        result: 'failed',
      });
    });
  }, [activeView, appearanceMode, isAppearanceChanging, isCollapsed, selectThemeById]);

  useEffect(() => {
    const handleExternalToggle = () => {
      handleToggleAppearance();
    };
    window.addEventListener(CoworkUiEvent.ToggleAppearance, handleExternalToggle);
    return () => {
      window.removeEventListener(CoworkUiEvent.ToggleAppearance, handleExternalToggle);
    };
  }, [handleToggleAppearance]);

  useEffect(() => {
    const handleSearch = () => {
      onShowCowork();
      setIsSearchOpen(true);
    };
    window.addEventListener(CoworkUiEvent.ShortcutSearch, handleSearch);
    return () => {
      window.removeEventListener(CoworkUiEvent.ShortcutSearch, handleSearch);
    };
  }, [onShowCowork]);

  useEffect(() => {
    if (!isCollapsed) return;
    setIsSearchOpen(false);
    setIsBatchMode(false);
    setBatchAgentId(null);
    setBatchSelectableItems([]);
    setSelectedKeys(new Set());
    setShowBatchDeleteConfirm(false);
  }, [isCollapsed]);

  useEffect(() => {
    setSidebarWidth((previous) => {
      if (previous > MAX_CONTEXT_PANEL_WIDTH) return DEFAULT_CONTEXT_PANEL_WIDTH;
      if (previous < MIN_CONTEXT_PANEL_WIDTH) return MIN_CONTEXT_PANEL_WIDTH;
      return previous;
    });
  }, []);

  useEffect(() => {
    onWidthChange?.(sidebarShellWidth);
  }, [onWidthChange, sidebarShellWidth]);

  const handleSelectSession = async (session: CoworkSessionSummary) => {
    const agentId = session.agentId?.trim() || AgentId.Main;
    try {
      if (agentId !== currentAgentId) {
        agentService.switchAgent(agentId, { targetSessionId: session.id });
        await coworkService.loadSessions(agentId);
      }
      onShowCowork();
      await coworkService.loadSession(session.id);
    } finally {
      coworkService.finishSessionNavigation(session.id);
    }
  };

  const handleEnterBatchMode = useCallback((sessionId: string, agentId: string) => {
    reportSidebarAction('batch_mode_enter', {
      source: 'home_agent_sidebar',
      agentType: normalizeAgentId(agentId) === AgentId.Main ? 'main' : 'custom',
      selectedCount: 1,
    });
    setIsBatchMode(true);
    setBatchAgentId(agentId);
    setBatchSelectableItems([]);
    setSelectedKeys(new Set([createSessionBatchKey(sessionId)]));
  }, []);

  const handleExitBatchMode = useCallback(() => {
    reportSidebarAction('batch_mode_exit', {
      source: 'home_agent_sidebar',
      agentType: batchAgentId === AgentId.Main ? 'main' : 'custom',
      ...getBatchSelectionSummary(),
    });
    setIsBatchMode(false);
    setBatchAgentId(null);
    setBatchSelectableItems([]);
    setSelectedKeys(new Set());
    setShowBatchDeleteConfirm(false);
  }, [batchAgentId, getBatchSelectionSummary]);

  const handleBatchSelectableItemsChange = useCallback((items: AgentSidebarBatchItem[]) => {
    setBatchSelectableItems(items);
    setSelectedKeys((previous) => {
      if (!batchAgentId || items.length === 0) return previous;
      const itemKeySet = new Set(items.map((item) => item.key));
      const next = new Set(Array.from(previous).filter((key) => itemKeySet.has(key)));
      return next.size === previous.size ? previous : next;
    });
  }, [batchAgentId]);

  const updateAgentScrollEdges = useCallback((element: HTMLDivElement | null) => {
    if (!element) {
      setAgentScrollEdges((previousEdges) => (
        previousEdges.top || previousEdges.bottom ? { top: false, bottom: false } : previousEdges
      ));
      return;
    }

    const maxScrollTop = Math.max(0, element.scrollHeight - element.clientHeight);
    const nextEdges = {
      top: element.scrollTop > 1,
      bottom: maxScrollTop - element.scrollTop > 1,
    };

    setAgentScrollEdges((previousEdges) => {
      if (previousEdges.top === nextEdges.top && previousEdges.bottom === nextEdges.bottom) {
        return previousEdges;
      }
      return nextEdges;
    });
  }, []);

  const handleAgentScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    updateAgentScrollEdges(event.currentTarget);
  }, [updateAgentScrollEdges]);

  const handleToggleSelection = useCallback((selectionKey: string, agentId: string) => {
    if (batchAgentId && normalizeAgentId(agentId) !== batchAgentId) return;
    setSelectedKeys(prev => {
      const next = new Set(prev);
      const targetSelected = !next.has(selectionKey);
      if (next.has(selectionKey)) {
        next.delete(selectionKey);
      } else {
        next.add(selectionKey);
      }
      reportSidebarAction('batch_item_toggle', {
        source: 'home_agent_sidebar',
        agentType: normalizeAgentId(agentId) === AgentId.Main ? 'main' : 'custom',
        selectedCount: next.size,
        selectableCount: batchSelectableItems.length,
        targetSelected,
      });
      return next;
    });
  }, [batchAgentId, batchSelectableItems.length]);

  const handleSelectAll = useCallback(() => {
    if (batchSelectableItems.length === 0) return;
    setSelectedKeys(prev => {
      const selectedVisibleCount = batchSelectableItems.filter((item) => prev.has(item.key)).length;
      if (selectedVisibleCount === batchSelectableItems.length) {
        reportSidebarAction('batch_select_all_toggle', {
          source: 'home_agent_sidebar',
          agentType: batchAgentId === AgentId.Main ? 'main' : 'custom',
          selectedCount: 0,
          selectableCount: batchSelectableItems.length,
          isSelectAllChecked: false,
        });
        return new Set();
      }
      reportSidebarAction('batch_select_all_toggle', {
        source: 'home_agent_sidebar',
        agentType: batchAgentId === AgentId.Main ? 'main' : 'custom',
        selectedCount: batchSelectableItems.length,
        selectableCount: batchSelectableItems.length,
        isSelectAllChecked: true,
      });
      return new Set(batchSelectableItems.map((item) => item.key));
    });
  }, [batchAgentId, batchSelectableItems]);

  const handleBatchDeleteClick = useCallback(() => {
    if (selectedKeys.size === 0) return;
    reportSidebarAction('batch_delete_confirm_open', {
      source: 'home_agent_sidebar',
      agentType: batchAgentId === AgentId.Main ? 'main' : 'custom',
      ...getBatchSelectionSummary(),
    });
    setShowBatchDeleteConfirm(true);
  }, [batchAgentId, getBatchSelectionSummary, selectedKeys.size]);

  const handleBatchDelete = useCallback(async () => {
    if (selectedKeys.size === 0) return;
    const items = Array.from(selectedKeys)
      .filter((key) => batchSelectableKeySet.size === 0 || batchSelectableKeySet.has(key))
      .map((key) => batchSelectableItemByKey.get(key))
      .filter((item): item is AgentSidebarBatchItem => Boolean(item));
    if (items.length === 0) return;

    const sessionIds = items
      .filter((item) => item.kind === AgentSidebarBatchItemKind.Session)
      .map((item) => item.sessionId);
    const selectedSessionCount = sessionIds.length;

    reportSidebarAction('batch_delete_submit', {
      source: 'home_agent_sidebar',
      agentType: batchAgentId === AgentId.Main ? 'main' : 'custom',
      selectedCount: items.length,
      selectedSessionCount,
      selectedSubagentCount: 0,
      selectableCount: batchSelectableItems.length,
    });

    let deletedSessions = false;
    if (sessionIds.length > 0) {
      deletedSessions = await coworkService.deleteSessions(sessionIds);
    }

    if (!deletedSessions) {
      reportSidebarAction('batch_delete_failed', {
        source: 'home_agent_sidebar',
        agentType: batchAgentId === AgentId.Main ? 'main' : 'custom',
        result: 'failed',
        selectedCount: items.length,
        selectedSessionCount,
        selectedSubagentCount: 0,
        selectableCount: batchSelectableItems.length,
      });
      return;
    }
    reportSidebarAction('batch_delete_success', {
      source: 'home_agent_sidebar',
      agentType: batchAgentId === AgentId.Main ? 'main' : 'custom',
      result: 'success',
      selectedCount: items.length,
      selectedSessionCount,
      selectedSubagentCount: 0,
      selectableCount: batchSelectableItems.length,
    });
    if (deletedSessions) {
      setDeletedSessionIds(sessionIds);
    }
    handleExitBatchMode();
  }, [
    batchAgentId,
    batchSelectableItemByKey,
    batchSelectableItems.length,
    batchSelectableKeySet,
    selectedKeys,
    handleExitBatchMode,
  ]);

  const handleResizeStart = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (isCollapsed) return;
    event.preventDefault();
    isResizingRef.current = true;
    setIsResizing(true);
    resizeStartXRef.current = event.clientX;
    resizeStartWidthRef.current = sidebarWidth;
    document.body.classList.add('select-none');

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingRef.current) return;
      const nextWidth = resizeStartWidthRef.current + moveEvent.clientX - resizeStartXRef.current;
      if (nextWidth < MIN_CONTEXT_PANEL_WIDTH) {
        isResizingRef.current = false;
        setIsResizing(false);
        document.body.classList.remove('select-none');
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        onToggleCollapse();
        return;
      }
      const clampedWidth = Math.min(MAX_CONTEXT_PANEL_WIDTH, nextWidth);
      setSidebarWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      setIsResizing(false);
      document.body.classList.remove('select-none');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [isCollapsed, onToggleCollapse, sidebarWidth]);

  useEffect(() => {
    return () => {
      document.body.classList.remove('select-none');
    };
  }, []);

  useEffect(() => {
    const element = agentScrollContainerRef.current;
    if (!element) return;

    updateAgentScrollEdges(element);

    const resizeObserver = new ResizeObserver(() => updateAgentScrollEdges(element));
    resizeObserver.observe(element);
    if (element.firstElementChild) {
      resizeObserver.observe(element.firstElementChild);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateAgentScrollEdges]);

  const renderRailButton = (
    label: string,
    icon: React.ReactNode,
    onClick: () => void,
    options: { active?: boolean; badge?: React.ReactNode } = {},
  ) => (
    <button
      type="button"
      onClick={onClick}
      className={options.active ? activeRailButtonClassName : railButtonClassName}
      aria-label={label}
      aria-current={options.active ? 'page' : undefined}
      title={label}
    >
      {icon}
      <span className={railLabelClassName}>{label}</span>
      {options.badge}
    </button>
  );

  return (
    <aside
      data-skin-sidebar="true"
      className={`relative shrink-0 overflow-hidden border-r border-border bg-background ${
        isResizing ? '' : 'sidebar-transition'
      }`}
      style={{ width: sidebarShellWidth }}
    >
      <div className="flex h-full min-h-0">
        <div
          className="flex h-full shrink-0 flex-col items-center bg-surface-raised"
          style={{ width: SIDEBAR_RAIL_WIDTH }}
        >
          <div className="draggable sidebar-header-drag flex h-[76px] shrink-0 flex-col items-center justify-center gap-1">
            <img
              src="logo.png"
              alt="LobsterAI"
              draggable={false}
              className="h-8 w-8 rounded-xl object-contain"
            />
            <span className="max-w-[52px] truncate text-center text-[9px] font-semibold leading-3 text-foreground">
              LobsterAI
            </span>
          </div>
          <div className="non-draggable flex min-h-0 flex-1 flex-col items-center gap-2 py-2">
            <div className="flex flex-col items-center gap-1.5">
              {renderRailButton(
                i18nService.t('sidebarNavConversation'),
                <Message className={railIconClassName} {...iconParkOutlineProps} />,
                () => {
                  reportSidebarAction('open_cowork', { activeView, isCollapsed });
                  setIsSearchOpen(false);
                  onShowCowork();
                },
                { active: activeView === 'cowork' },
              )}
              {renderRailButton(
                i18nService.t('sidebarNavSkillsPlugins'),
                <SkillIcon className={railIconClassName} />,
                () => {
                  reportSidebarAction('open_skills', { activeView, isCollapsed });
                  setIsSearchOpen(false);
                  onShowSkills();
                },
                { active: activeView === 'skills' },
              )}
              {renderRailButton(
                i18nService.t('sidebarNavExperts'),
                <SidebarKitsIcon className={railIconClassName} />,
                () => {
                  reportSidebarAction('open_kits', { activeView, isCollapsed });
                  setIsSearchOpen(false);
                  dismissKitsNewBadge();
                  onShowKits();
                },
                {
                  active: activeView === 'kits',
                  badge: showKitsNewBadge ? (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ff4f6d]" />
                  ) : null,
                },
              )}
              {renderRailButton(
                i18nService.t('sidebarNavAutomation'),
                <SidebarMcpIcon className={railIconClassName} />,
                () => {
                  reportSidebarAction('open_mcp', { activeView, isCollapsed });
                  setIsSearchOpen(false);
                  onShowMcp();
                },
                {
                  active: activeView === 'mcp',
                  badge: (
                    <span className="absolute right-0 top-1.5 rounded-full bg-[#ff6a4d] px-1 py-0.5 text-[8px] font-semibold leading-[10px] text-white">
                      RPA
                    </span>
                  ),
                },
              )}
              {renderRailButton(
                i18nService.t('sidebarNavScheduled'),
                <SidebarAutomationIcon className={railIconClassName} />,
                () => {
                  reportSidebarAction('open_scheduled_tasks', { activeView, isCollapsed });
                  setIsSearchOpen(false);
                  onShowScheduledTasks();
                },
                { active: activeView === 'scheduledTasks' },
              )}
            </div>
            {!hideSites && (
              <div className="scrollbar-hidden flex min-h-0 flex-1 flex-col items-center gap-1.5 overflow-y-auto pt-1">
                {renderRailButton(
                  i18nService.t('sitesTitle'),
                  <SidebarSitesIcon className={railIconClassName} />,
                  () => {
                    reportSidebarAction('open_sites', { activeView, isCollapsed });
                    setIsSearchOpen(false);
                    onShowSites();
                  },
                  { active: activeView === 'sites' },
                )}
              </div>
            )}
          </div>
          <div className="non-draggable flex shrink-0 flex-col items-center gap-1.5 pb-2">
            {renderRailButton(
              i18nService.t(appearanceMode),
              appearanceMode === 'dark' ? (
                <Moon className={railIconClassName} {...iconParkOutlineProps} />
              ) : (
                <Sun className={railIconClassName} {...iconParkOutlineProps} />
              ),
              handleToggleAppearance,
            )}
            {renderRailButton(
              i18nService.t('settings'),
              <Cog6ToothIcon className={railIconClassName} />,
              () => onShowSettings(),
            )}
          </div>
        </div>
        <div
          className={`relative flex h-full min-h-0 flex-col overflow-hidden border-r border-border bg-background transition-[width,opacity] ease-out ${
            isCollapsed ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
          style={{
            width: isCollapsed ? 0 : sidebarWidth,
            transitionDuration: `${SIDEBAR_COLLAPSE_TRANSITION_MS}ms`,
          }}
        >
          <div className="draggable flex h-[48px] shrink-0 items-center justify-end gap-2 px-3">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="non-draggable inline-flex h-7 w-7 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-surface-raised"
              aria-label={isCollapsed ? i18nService.t('expand') : i18nService.t('collapse')}
              title={isCollapsed ? i18nService.t('expand') : i18nService.t('collapse')}
            >
              <SidebarToggleIcon className="h-[18px] w-[18px]" isCollapsed={isCollapsed} />
            </button>
            <button
              type="button"
              onClick={() => {
                reportSidebarAction('open_search', { activeView, isCollapsed });
                onShowCowork();
                setIsSearchOpen(true);
              }}
              className="non-draggable inline-flex h-7 w-7 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-surface-raised"
              aria-label={i18nService.t('search')}
              title={i18nService.t('search')}
            >
              <SidebarSearchIcon className="h-[18px] w-[18px]" />
            </button>
            <button
              type="button"
              onClick={() => {
                reportSidebarAction('new_task', { activeView, isCollapsed });
                onNewChat();
              }}
              className="non-draggable inline-flex h-7 w-7 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-surface-raised"
              aria-label={i18nService.t('newChat')}
              title={i18nService.t('newChat')}
            >
              <ListChecks className="h-[18px] w-[18px]" {...iconParkOutlineProps} />
            </button>
          </div>
          <div className="relative min-h-0 flex-1">
            <div
              ref={agentScrollContainerRef}
              className={`scrollbar-hidden h-full overflow-y-auto px-2.5 ${
                isSidebarBannerVisible && !isBatchMode ? 'pb-[128px]' : 'pb-10'
              }`}
              onScroll={handleAgentScroll}
            >
              <MyAgentSidebarTree
                isBatchMode={isBatchMode}
                batchAgentId={batchAgentId}
                deletedSessionIds={deletedSessionIds}
                selectedKeys={selectedKeys}
                onShowCowork={onShowCowork}
                onTaskSelected={(params) => {
                  console.debug('[Sidebar] reporting agent sidebar task selection analytics');
                  void reportYdAnalyzer({
                    action: LogReporterAction.SidebarAction,
                    source: 'home_agent_sidebar',
                    actionType: 'select_task',
                    activeView,
                    ...params,
                  });
                }}
                onSidebarAction={(actionType, params) => {
                  reportSidebarAction(actionType, {
                    source: 'home_agent_sidebar',
                    ...params,
                  });
                }}
                onToggleSelection={handleToggleSelection}
                onEnterBatchMode={handleEnterBatchMode}
                onBatchSelectableItemsChange={handleBatchSelectableItemsChange}
              />
            </div>
            {!isBatchMode && (
              <SidebarExperienceSlot
                hidden={hideAdBanner}
                onVisibleChange={setIsSidebarBannerVisible}
              />
            )}
            <div
              className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-background to-transparent transition-opacity duration-150 ${
                agentScrollEdges.top ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <div
              className={`pointer-events-none absolute inset-x-0 top-[60px] z-10 h-3 bg-gradient-to-b from-background to-transparent transition-opacity duration-150 ${
                agentScrollEdges.top ? 'opacity-40' : 'opacity-0'
              }`}
            />
          </div>
          {!isBatchMode && updateNotice && (
            <div className="non-draggable px-3 pt-1.5">{updateNotice}</div>
          )}
          {isBatchMode ? (
            <div className="border-t border-border/60 px-3 pb-3 pt-2">
              <div className="mb-2 flex min-w-0 items-center justify-between gap-2">
                <span className="min-w-0 truncate text-xs text-secondary">
                  {i18nService
                    .t('batchSelectionScope')
                    .replace('{agent}', batchAgentName ?? '')
                    .replace('{count}', String(selectedKeys.size))}
                </span>
                <button
                  type="button"
                  onClick={handleExitBatchMode}
                  className="shrink-0 rounded-md px-1.5 py-1 text-xs font-medium text-secondary transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                >
                  {i18nService.t('batchCancel')}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex h-7 min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md px-1.5 text-[length:var(--lobster-text-sidebarCompact)] font-normal text-foreground transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]">
                  <input
                    type="checkbox"
                    checked={isBatchSelectAllChecked}
                    onChange={handleSelectAll}
                    disabled={batchSelectableItems.length === 0}
                    className="h-3.5 w-3.5 shrink-0 rounded border-gray-300 accent-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600"
                  />
                  <span className="truncate">{i18nService.t('batchSelectAll')}</span>
                </label>
                <button
                  type="button"
                  onClick={handleBatchDeleteClick}
                  disabled={selectedKeys.size === 0}
                  className={`inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium transition-colors ${
                    selectedKeys.size > 0
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                  }`}
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  {i18nService.t('batchDelete')} ({selectedKeys.size})
                </button>
              </div>
            </div>
          ) : (
            !hideLogin && (
              <div className="non-draggable border-t border-border/60 px-3 pb-3 pt-2">
                <LoginButton contentLeftOffset={sidebarShellWidth} />
              </div>
            )
          )}
        </div>
      </div>
      {!isCollapsed && (
        <div
          className="non-draggable absolute right-0 top-0 h-full w-1 cursor-col-resize transition-colors hover:bg-primary/30 active:bg-primary/50"
          onMouseDown={handleResizeStart}
        />
      )}
      <CoworkSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
      />
      {/* Batch Delete Confirmation Modal */}
      {showBatchDeleteConfirm && (
        <Modal
          onClose={() => {
            reportSidebarAction('batch_delete_cancel', {
              source: 'home_agent_sidebar',
              agentType: batchAgentId === AgentId.Main ? 'main' : 'custom',
              ...getBatchSelectionSummary(),
            });
            setShowBatchDeleteConfirm(false);
          }}
          className="w-full max-w-sm mx-4 bg-surface rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
              <Caution className="h-5 w-5 text-red-600 dark:text-red-500" {...iconParkOutlineProps} />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              {i18nService.t('batchDeleteConfirmTitle')}
            </h2>
          </div>
          <div className="px-5 pb-4">
            <p className="text-sm text-secondary">
              {i18nService
                .t('batchDeleteConfirmMessage')
                .replace('{count}', String(selectedKeys.size))}
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border">
            <button
              onClick={() => {
                reportSidebarAction('batch_delete_cancel', {
                  source: 'home_agent_sidebar',
                  agentType: batchAgentId === AgentId.Main ? 'main' : 'custom',
                  ...getBatchSelectionSummary(),
                });
                setShowBatchDeleteConfirm(false);
              }}
              className="px-4 py-2 text-sm font-medium rounded-lg text-secondary hover:bg-surface-raised transition-colors"
            >
              {i18nService.t('cancel')}
            </button>
            <button
              onClick={handleBatchDelete}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
              {i18nService.t('batchDelete')} ({selectedKeys.size})
            </button>
          </div>
        </Modal>
      )}
    </aside>
  );
};

export default Sidebar;
