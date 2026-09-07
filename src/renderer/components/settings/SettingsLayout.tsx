import { XMarkIcon } from '@heroicons/react/24/outline';
import React from 'react';

import { MagnifyingGlass } from '../icons/iconParkCompat';
import { iconParkOutlineProps } from '../icons/iconStyle';

export type SettingsLayoutTab<T extends string = string> = {
  key: T;
  label: string;
  icon: React.ReactNode;
};

export type SettingsLayoutGroup<T extends string = string> = {
  id: string;
  label: string;
  items: Array<SettingsLayoutTab<T>>;
};

type SettingsLayoutProps<T extends string> = {
  title: string;
  groups: Array<SettingsLayoutGroup<T>>;
  activeTab: T;
  activeTabLabel: string;
  searchQuery: string;
  searchPlaceholder: string;
  searchEmptyLabel: string;
  closeLabel: string;
  contentWide?: boolean;
  footerFadeVisible: boolean;
  contentRef: React.RefObject<HTMLDivElement>;
  noticeSlot?: React.ReactNode;
  errorSlot?: React.ReactNode;
  footer: React.ReactNode;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  onSearchQueryChange: (value: string) => void;
  onTabChange: (tab: T) => void;
  onClose: () => void;
  children: React.ReactNode;
};

/**
 * Settings chrome: grouped sidebar + searchable nav + content pane.
 * Flat / Swiss-minimal hierarchy using existing theme tokens.
 *
 * Close control stays outside the <form> so it cannot be swallowed by submit
 * handling, and the header stays above content stacking contexts.
 */
function SettingsLayout<T extends string>({
  title,
  groups,
  activeTab,
  activeTabLabel,
  searchQuery,
  searchPlaceholder,
  searchEmptyLabel,
  closeLabel,
  contentWide = false,
  footerFadeVisible,
  contentRef,
  noticeSlot,
  errorSlot,
  footer,
  onSubmit,
  onSearchQueryChange,
  onTabChange,
  onClose,
  children,
}: SettingsLayoutProps<T>) {
  const hasVisibleTabs = groups.some((group) => group.items.length > 0);

  const handleCloseClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onClose();
  };

  return (
    <>
      {/* Left sidebar */}
      <aside className="flex w-[200px] shrink-0 flex-col border-r border-border bg-surface-raised sm:w-[240px]">
        <div className="shrink-0 space-y-3 px-4 pb-3 pt-5">
          <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            {title}
          </h2>
          <label className="relative block">
            <span className="sr-only">{searchPlaceholder}</span>
            <MagnifyingGlass
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-secondary"
              {...iconParkOutlineProps}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.currentTarget.value)}
              placeholder={searchPlaceholder}
              className="h-9 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-sm text-foreground outline-none transition-colors duration-200 placeholder:text-secondary/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </div>

        <nav
          aria-label={title}
          className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-4"
          style={{ scrollbarGutter: 'stable' }}
        >
          {!hasVisibleTabs ? (
            <p className="px-2.5 py-6 text-center text-xs text-secondary">
              {searchEmptyLabel}
            </p>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group.id} className="space-y-1">
                  <h3 className="px-2.5 pb-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">
                    {group.label}
                  </h3>
                  <ul className="space-y-0.5">
                    {group.items.map((tab) => {
                      const isActive = activeTab === tab.key;
                      return (
                        <li key={tab.key}>
                          <button
                            type="button"
                            onClick={() => onTabChange(tab.key)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`group relative flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm font-medium transition-colors duration-200 ${
                              isActive
                                ? 'bg-primary-muted text-primary'
                                : 'text-secondary hover:bg-background hover:text-foreground'
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`absolute inset-y-1.5 left-0 w-0.5 rounded-full transition-opacity duration-200 ${
                                isActive ? 'bg-primary opacity-100' : 'opacity-0'
                              }`}
                            />
                            <span
                              className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors duration-200 ${
                                isActive
                                  ? 'bg-primary/12 text-primary'
                                  : 'text-secondary/80 group-hover:bg-background group-hover:text-foreground'
                              }`}
                            >
                              {tab.icon}
                            </span>
                            <span className="min-w-0 truncate">{tab.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </nav>
      </aside>

      {/* Right content — header stays outside <form>, matching the previous working shell */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
        <header className="relative z-20 flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-7">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold tracking-tight text-foreground">
              {activeTabLabel}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleCloseClick}
            onMouseDown={(event) => event.stopPropagation()}
            aria-label={closeLabel}
            className="non-draggable relative z-30 inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-secondary transition-colors duration-200 hover:bg-surface-raised hover:text-foreground"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </header>

        {noticeSlot ? <div className="relative z-20 px-5 pt-3 sm:px-7">{noticeSlot}</div> : null}
        {errorSlot ? <div className="relative z-20 px-5 pt-3 sm:px-7">{errorSlot}</div> : null}

        <form
          onSubmit={onSubmit}
          className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div
            ref={contentRef}
            className="relative min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7"
            style={{ scrollbarGutter: 'stable' }}
          >
            <div className={contentWide ? 'min-h-full w-full' : 'mx-auto min-h-full w-full max-w-3xl'}>
              {children}
            </div>
          </div>

          <div className="relative z-10 shrink-0 border-t border-border bg-background">
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-0 bottom-full h-8 bg-gradient-to-t from-background to-transparent transition-opacity duration-200 ${
                footerFadeVisible ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <div className="flex justify-end gap-3 px-5 py-4 sm:px-7">
              {footer}
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export default SettingsLayout;
