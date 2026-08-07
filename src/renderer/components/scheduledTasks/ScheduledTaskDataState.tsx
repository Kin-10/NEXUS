
import React from 'react';

import {
  ArrowsClockwise,
  Warning,
} from '@/components/icons/iconParkCompat';

import {
  ScheduledTaskDataStatus,
  type ScheduledTaskDataStatus as ScheduledTaskDataStatusValue,
} from '../../../scheduledTask/constants';
import { i18nService } from '../../services/i18n';

interface ScheduledTaskDataStateProps {
  status: ScheduledTaskDataStatusValue;
  error?: string | null;
  onRetry: () => void;
}

const ScheduledTaskDataState: React.FC<ScheduledTaskDataStateProps> = ({
  status,
  error,
  onRetry,
}) => {
  if (status === ScheduledTaskDataStatus.Ready) return null;

  if (status === ScheduledTaskDataStatus.Error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Warning className="mb-3 h-8 w-8 text-red-500" />
        <p className="text-sm font-medium text-foreground">
          {i18nService.t('scheduledTasksLoadFailed')}
        </p>
        {error && <p className="mt-1 max-w-md text-xs text-secondary">{error}</p>}
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary transition-colors hover:text-primary-hover"
        >
          <ArrowsClockwise className="h-4 w-4" />
          {i18nService.t('scheduledTasksRetry')}
        </button>
      </div>
    );
  }

  const label =
    status === ScheduledTaskDataStatus.Starting
      ? i18nService.t('scheduledTasksServiceStarting')
      : i18nService.t('scheduledTasksLoading');

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <ArrowsClockwise className="mb-3 h-6 w-6 animate-spin text-primary" />
      <p className="text-sm text-secondary">{label}</p>
    </div>
  );
};

export default ScheduledTaskDataState;
