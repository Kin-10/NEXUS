import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { i18nService } from '../../services/i18n';
import { kitService } from '../../services/kit';
import { resolveLocalizedText } from '../../services/skill';
import { RootState } from '../../store';
import { setInstalledKits, setMarketplaceKits } from '../../store/slices/kitSlice';
import type { MarketplaceKit } from '../../types/kit';
import SidebarKitsIcon from '../icons/SidebarKitsIcon';
import KitIcon from './KitIcon';
import KitsPopover from './KitsPopover';

const MAX_STACKED_KITS = 3;

interface KitsButtonProps {
  onSelectKit: (kitId: string) => void;
  onManageKits: () => void;
  className?: string;
  iconClassName?: string;
  /** Popover open direction. Home prompt defaults to downward. */
  placement?: 'up' | 'down';
  onOpenChange?: (open: boolean) => void;
}

/**
 * Cowork prompt control: shows installed experts as a stacked icon row (max 3).
 * Click expands the full installed-expert picker.
 */
const KitsButton: React.FC<KitsButtonProps> = ({
  onSelectKit,
  onManageKits,
  className = '',
  iconClassName = 'h-4 w-4',
  placement = 'up',
  onOpenChange,
}) => {
  const dispatch = useDispatch();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const activeKitIds = useSelector((state: RootState) => state.kit.activeKitIds);
  const installedKits = useSelector((state: RootState) => state.kit.installedKits);
  const marketplaceKits = useSelector((state: RootState) => state.kit.marketplaceKits);

  const installedKitList = useMemo((): MarketplaceKit[] => {
    const installedIds = Object.keys(installedKits);
    const byId = new Map(marketplaceKits.map(kit => [kit.id, kit]));
    // Active kits first so the stack reflects current selection, then the rest.
    const orderedIds = [
      ...activeKitIds.filter(id => installedIds.includes(id)),
      ...installedIds.filter(id => !activeKitIds.includes(id)),
    ];
    return orderedIds
      .map(id => {
        const market = byId.get(id);
        if (market) return market;
        // Installed but marketplace metadata missing — still show a fallback tile.
        return {
          id,
          name: id,
          description: '',
        } satisfies MarketplaceKit;
      });
  }, [activeKitIds, installedKits, marketplaceKits]);

  const hasOverflow = installedKitList.length > MAX_STACKED_KITS;
  const stackedKits = hasOverflow
    ? installedKitList.slice(0, MAX_STACKED_KITS - 1)
    : installedKitList.slice(0, MAX_STACKED_KITS);
  const overflowCount = hasOverflow
    ? installedKitList.length - (MAX_STACKED_KITS - 1)
    : 0;
  const hasInstalledKits = installedKitList.length > 0;
  const activeKitCount = activeKitIds.length;
  const stackTitle = installedKitList
    .map(kit => resolveLocalizedText(kit.name))
    .join(' · ');

  useEffect(() => {
    let cancelled = false;
    const preload = async () => {
      setIsLoading(true);
      try {
        const [mkKits, installed] = await Promise.all([
          kitService.fetchMarketplaceKits(),
          kitService.getInstalledKits(),
        ]);
        if (cancelled) return;
        dispatch(setMarketplaceKits(mkKits));
        dispatch(setInstalledKits(installed));
      } catch (error) {
        console.error('[KitsButton] Failed to preload kit data:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void preload();
    return () => { cancelled = true; };
  }, [dispatch]);

  const handleButtonClick = () => {
    setIsPopoverOpen(prev => {
      const next = !prev;
      onOpenChange?.(next);
      return next;
    });
  };

  const handleClosePopover = () => {
    onOpenChange?.(false);
    setIsPopoverOpen(false);
  };

  const expertsLabel = i18nService.t('sidebarNavExperts');

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleButtonClick}
        aria-expanded={isPopoverOpen}
        aria-haspopup="menu"
        className={`inline-flex h-[34px] items-center rounded-lg px-1.5 transition-colors ${
          isPopoverOpen || activeKitCount > 0
            ? 'bg-primary-muted text-foreground'
            : 'text-secondary hover:bg-surface-raised hover:text-foreground'
        } ${className}`}
        title={hasInstalledKits ? stackTitle || i18nService.t('kits') : i18nService.t('kits')}
        aria-label={expertsLabel}
      >
        {isLoading && !hasInstalledKits ? (
          <span className="inline-flex items-center gap-1.5 px-1 text-[13px] font-medium">
            <SidebarKitsIcon className={`${iconClassName} shrink-0`} />
            {expertsLabel}
          </span>
        ) : hasInstalledKits ? (
          <span className="inline-flex items-center pl-0.5 pr-1">
            <span className="flex items-center">
              {stackedKits.map((kit, index) => {
                const isActive = activeKitIds.includes(kit.id);
                return (
                  <span
                    key={kit.id}
                    className={`relative inline-flex h-7 w-7 items-center justify-center rounded-full border-2 bg-surface ${
                      isActive ? 'border-primary' : 'border-surface'
                    }`}
                    style={{
                      marginLeft: index === 0 ? 0 : -8,
                      zIndex: stackedKits.length - index,
                    }}
                  >
                    <KitIcon
                      icon={kit.icon}
                      className="h-5 w-5 rounded-full"
                      fallbackClassName="rounded-full bg-primary-muted text-primary"
                      fallbackIconClassName="h-3 w-3"
                    />
                  </span>
                );
              })}
              {overflowCount > 0 && (
                <span
                  className="relative inline-flex h-7 min-w-[28px] items-center justify-center rounded-full border-2 border-surface bg-surface-raised px-1 text-[11px] font-semibold text-secondary"
                  style={{ marginLeft: -8, zIndex: 0 }}
                >
                  +{overflowCount}
                </span>
              )}
            </span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-1 text-[13px] font-medium">
            <SidebarKitsIcon className={`${iconClassName} shrink-0`} />
            {expertsLabel}
          </span>
        )}
      </button>
      <KitsPopover
        isOpen={isPopoverOpen}
        onClose={handleClosePopover}
        onSelectKit={onSelectKit}
        onManageKits={onManageKits}
        anchorRef={buttonRef}
        placement={placement}
      />
    </div>
  );
};

export default KitsButton;
