import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  ArrowRight,
} from '@/components/icons/iconParkCompat';

import { i18nService } from '../../services/i18n';
import { RootState } from '../../store';
import { selectPrompt } from '../../store/slices/quickActionSlice';
import type { LocalizedPrompt, LocalizedQuickAction } from '../../types/quickAction';
import { iconParkOutlineProps } from '../icons/iconStyle';
import XMarkIcon from '../icons/XMarkIcon';

interface PromptPanelProps {
  action: LocalizedQuickAction;
  onPromptSelect: (prompt: string, promptId: string) => void;
  onClose?: () => void;
}

const PromptPanel: React.FC<PromptPanelProps> = ({ action, onPromptSelect, onClose }) => {
  const dispatch = useDispatch();
  const selectedPromptId = useSelector(
    (state: RootState) => state.quickAction.selectedPromptId
  );

  const handlePromptClick = (prompt: LocalizedPrompt) => {
    dispatch(selectPrompt(prompt.id));
    onPromptSelect(prompt.prompt, prompt.id);
  };

  if (!action.prompts || action.prompts.length === 0) {
    return null;
  }

  return (
    <div data-skin-prompt-panel="true" className="w-full animate-fade-in-up">
      <div className="mb-2.5 flex items-center justify-between px-0.5">
        <span className="text-xs font-medium tracking-wide text-secondary">
          {action.label}
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={i18nService.t('coworkQuickActionCollapse')}
            title={i18nService.t('coworkQuickActionCollapse')}
            className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-secondary transition-colors duration-200 hover:bg-surface-raised hover:text-foreground"
          >
            <XMarkIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {action.prompts.map((prompt) => {
          const isPromptSelected = selectedPromptId === prompt.id;

          return (
            <button
              key={prompt.id}
              type="button"
              onClick={() => handlePromptClick(prompt)}
              className={`group relative flex cursor-pointer flex-col items-start gap-1.5 rounded-xl border px-3.5 py-3 text-left transition-colors duration-200 ${
                isPromptSelected
                  ? 'border-[color-mix(in_srgb,var(--lobster-primary)_50%,transparent)] bg-primary-muted'
                  : 'border-border bg-surface hover:border-primary/25 hover:bg-surface-raised'
              }`}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className={`text-sm font-medium ${isPromptSelected ? 'text-primary' : 'text-foreground'}`}>
                  {prompt.label}
                </span>
                <span
                  className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors duration-200 ${
                    isPromptSelected
                      ? 'bg-primary/10 text-primary opacity-100'
                      : 'text-secondary opacity-0 group-hover:bg-surface group-hover:opacity-100'
                  }`}
                >
                  <ArrowRight
                    className="h-3 w-3"
                    {...iconParkOutlineProps}
                  />
                </span>
              </div>

              {prompt.description && (
                <p className="line-clamp-2 text-xs leading-4 text-secondary">
                  {prompt.description}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PromptPanel;
