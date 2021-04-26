import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { Button } from '../../shared/atoms/Button';
import { InfoMessage } from '../../shared/atoms/InfoMessage';
import { SuccessMessage } from '../../shared/atoms/SuccessMessage';
import { WarningMessage } from '../../shared/atoms/WarningMessage';
import { useApi } from '../../shared/hooks/use-api';
import { useData } from '../../shared/hooks/use-data';
import { useManifestTask } from '../hooks/use-manifest-task';
import { useManifestUserTasks } from '../hooks/use-manifest-user-tasks';
import { useRouteContext } from '../hooks/use-route-context';
import { ManifestLoader } from '../pages/loaders/manifest-loader';
import { useSiteConfiguration } from './SiteConfigurationContext';

export const ManifestUserNotification: React.FC = () => {
  const { projectId, manifestId } = useRouteContext();
  const { refetch: refetchManifest } = useData(ManifestLoader);
  const { inProgress, doneTasks, inReview, refetch } = useManifestUserTasks();
  const config = useSiteConfiguration();
  const { isManifestComplete, canClaimManifest, userManifestTask, isFetched } = useManifestTask();
  const { t } = useTranslation();
  const api = useApi();

  const [onSubmitForReview] = useMutation(async (tid: string) => {
    await api.updateTask(tid, {
      status: 2,
      status_text: 'in review',
    });
    await Promise.all([refetch(), refetchManifest()]);
  });

  if (!projectId || !manifestId || !isFetched) {
    return null;
  }

  if (isManifestComplete) {
    return <InfoMessage>{t('This manifest is complete')}</InfoMessage>;
  }

  if (config.project.claimGranularity === 'manifest' && !canClaimManifest && !userManifestTask) {
    return <InfoMessage>{t('Maximum number of contributors reached')}</InfoMessage>;
  }

  if (inReview.length) {
    return <WarningMessage>{t('This manifest is currently in review')}</WarningMessage>;
  }

  if (inProgress.length) {
    const inProgressTask = inProgress[0];

    return (
      <InfoMessage>
        {t('You are currently working on this manifest')}{' '}
        {config.project.contributionMode !== 'transcription' ? (
          <Button onClick={() => onSubmitForReview(inProgressTask.id as string)} style={{ marginLeft: 10 }}>
            {t('Submit for review')}
          </Button>
        ) : null}
      </InfoMessage>
    );
  }

  if (doneTasks.length) {
    return <SuccessMessage>{t('You have already completed this manifest')}</SuccessMessage>;
  }

  return null;
};