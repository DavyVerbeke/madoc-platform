import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { Button } from '../../shared/atoms/Button';
import { ModalButton } from '../../shared/components/Modal';
import { AutocompleteUser } from '../../shared/components/UserAutocomplete';
import { useApi } from '../../shared/hooks/use-api';
import { useUserDetails } from '../../shared/hooks/use-user-details';
import { isReviewer } from '../../shared/utility/user-roles';
import { useProjectCanvasTasks } from '../hooks/use-project-canvas-tasks';
import { useRouteContext } from '../hooks/use-route-context';
import { AssignTaskToUser } from './AssignUserToTask';

export const AssignCanvasToUser: React.FC = () => {
  const { t } = useTranslation();
  const { projectId, canvasId, manifestId, collectionId } = useRouteContext();
  const { data: projectTasks, refetch } = useProjectCanvasTasks();
  const api = useApi();

  const canvasTask = projectTasks?.canvasTask;
  const details = useUserDetails();

  const [assignUser] = useMutation(async (user: AutocompleteUser) => {
    if (projectId) {
      await api.createResourceClaim(projectId, {
        revisionId: undefined,
        manifestId,
        canvasId,
        collectionId,
        status: 0,
        userId: user.id,
      });
    }
  });

  if (!details || !details.user || !isReviewer(details, true) || !projectId) {
    return null;
  }

  return (
    <ModalButton
      as={Button}
      disabled={!canvasTask}
      title={t('Assign to user')}
      render={() =>
        canvasTask && canvasTask.id ? (
          <AssignTaskToUser
            taskId={canvasTask.id}
            taskType="crowdsourcing-task"
            onAssignUser={async user => {
              await assignUser(user);
              await refetch();
            }}
          />
        ) : null
      }
    >
      {t('Assign')}
    </ModalButton>
  );
};
