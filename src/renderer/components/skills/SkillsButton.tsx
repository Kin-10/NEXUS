import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { CaretDown } from '@/components/icons/iconParkCompat';

import { i18nService } from '../../services/i18n';
import { RootState } from '../../store';
import { Skill } from '../../types/skill';
import SkillIcon from '../icons/SkillIcon';
import SkillsPopover from './SkillsPopover';

interface SkillsButtonProps {
  onSelectSkill: (skill: Skill) => void;
  onManageSkills: () => void;
  className?: string;
  iconClassName?: string;
  /** Labeled “使用技能” trigger used on the Cowork home prompt bar. */
  variant?: 'icon' | 'labeled';
  /** Popover open direction. Labeled home control defaults to downward. */
  placement?: 'up' | 'down';
  onOpenChange?: (open: boolean) => void;
}

const SkillsButton: React.FC<SkillsButtonProps> = ({
  onSelectSkill,
  onManageSkills,
  className = '',
  iconClassName = 'h-4 w-4',
  variant = 'icon',
  placement,
  onOpenChange,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const activeSkillIds = useSelector((state: RootState) => state.skill.activeSkillIds);
  const activeSkillCount = activeSkillIds.length;
  const label = i18nService.t('useSkill');
  const isLabeled = variant === 'labeled';
  const resolvedPlacement = placement ?? (isLabeled ? 'down' : 'up');

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

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleButtonClick}
        aria-expanded={isPopoverOpen}
        aria-haspopup="menu"
        className={
          isLabeled
            ? `inline-flex h-[34px] items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium transition-colors ${
              isPopoverOpen || activeSkillCount > 0
                ? 'bg-primary-muted text-foreground'
                : 'text-secondary hover:bg-surface-raised hover:text-foreground'
            } ${className}`
            : `flex h-[34px] w-[34px] items-center justify-center rounded-lg text-secondary hover:bg-surface-raised hover:text-foreground transition-colors ${className}`
        }
        title={label}
        aria-label={label}
      >
        <SkillIcon className={`${iconClassName} shrink-0`} />
        {isLabeled && (
          <>
            <span className="shrink-0">{label}</span>
            {activeSkillCount > 0 && (
              <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary/15 px-1 text-[11px] font-semibold leading-none text-primary">
                {activeSkillCount}
              </span>
            )}
            <CaretDown
              className={`h-3 w-3 shrink-0 opacity-70 transition-transform ${
                isPopoverOpen ? 'rotate-180' : ''
              }`}
            />
          </>
        )}
      </button>
      <SkillsPopover
        isOpen={isPopoverOpen}
        onClose={handleClosePopover}
        onSelectSkill={onSelectSkill}
        onManageSkills={onManageSkills}
        anchorRef={buttonRef}
        placement={resolvedPlacement}
      />
    </div>
  );
};

export default SkillsButton;
