import { useTranslation } from 'react-i18next';
import { castBool } from '../../../utility/cast-bool';
import { Heading3 } from '../../shared/atoms/Heading3';
import { InfoMessage } from '../../shared/atoms/InfoMessage';
import { LockIcon } from '../../shared/atoms/LockIcon';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { CanvasNavigation } from '../../shared/components/CanvasNavigation';
import { LocaleString } from '../../shared/components/LocaleString';
import React from 'react';
import { useCurrentUser } from '../../shared/hooks/use-current-user';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { CanvasImageViewer } from '../features/CanvasImageViewer';
import { CanvasManifestNavigation } from '../features/CanvasManifestNavigation';
import { CanvasSimpleEditor } from '../features/CanvasSimpleEditor';
import { CanvasTaskWarningMessage } from '../features/CanvasTaskWarningMessage';
import { CanvasViewer } from '../features/CanvasViewer';
import { PrepareCaptureModel } from '../features/PrepareCaptureModel';
import { useCanvasNavigation } from '../hooks/use-canvas-navigation';
import { useCanvasUserTasks } from '../hooks/use-canvas-user-tasks';
import { useRouteContext } from '../hooks/use-route-context';
import { CanvasLoaderType } from './loaders/canvas-loader';
import { RedirectToNextCanvas } from '../features/RedirectToNextCanvas';

type ViewCanvasModelProps = Partial<CanvasLoaderType['data'] & CanvasLoaderType['context']>;

export const ViewCanvasModel: React.FC<ViewCanvasModelProps> = ({ canvas }) => {
  const { projectId, canvasId, manifestId, collectionId } = useRouteContext();
  const { showCanvasNavigation, showWarning } = useCanvasNavigation();
  const { canUserSubmit, isLoading: isLoadingTasks, completedAndHide } = useCanvasUserTasks();
  const { revision } = useLocationQuery();
  const { t } = useTranslation();
  const user = useCurrentUser(true);
  const { goToNext } = useLocationQuery<any>();
  const shouldGoToNext = castBool(goToNext);

  const canContribute =
    user &&
    user.scope &&
    (user.scope.indexOf('site.admin') !== -1 ||
      user.scope.indexOf('models.admin') !== -1 ||
      user.scope.indexOf('models.contribute') !== -1);

  if (!canvasId) {
    return null;
  }

  if (shouldGoToNext) {
    return <RedirectToNextCanvas subRoute="model" />;
  }

  if ((!canUserSubmit && !isLoadingTasks) || completedAndHide) {
    return (
      <div>
        <DisplayBreadcrumbs />

        <CanvasManifestNavigation subRoute="model" />

        {projectId && (
          <InfoMessage>
            {completedAndHide ? t('This image is complete') : t('Maximum number of contributors reached')}
          </InfoMessage>
        )}

        {showCanvasNavigation ? (
          <>
            <CanvasViewer>
              <CanvasImageViewer />
            </CanvasViewer>
            <CanvasNavigation
              subRoute="model"
              manifestId={manifestId}
              canvasId={canvasId}
              collectionId={collectionId}
              projectId={projectId}
            />
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <DisplayBreadcrumbs />

      <CanvasManifestNavigation subRoute="model" />

      <LocaleString as="h1">{canvas ? canvas.label : { none: ['...'] }}</LocaleString>

      {showCanvasNavigation && canContribute ? <PrepareCaptureModel /> : null}

      <CanvasTaskWarningMessage />

      {showWarning ? (
        <div style={{ textAlign: 'center', padding: '2em', marginTop: '1em', marginBottom: '1em', background: '#eee' }}>
          <LockIcon style={{ fontSize: '3em' }} />
          <Heading3>{t('This canvas is not available to browse')}</Heading3>
        </div>
      ) : null}

      {showCanvasNavigation ? (
        <CanvasViewer>
          <CanvasSimpleEditor revision={revision} />
        </CanvasViewer>
      ) : null}

      {showCanvasNavigation ? (
        <CanvasNavigation
          subRoute="model"
          manifestId={manifestId}
          canvasId={canvasId}
          collectionId={collectionId}
          projectId={projectId}
        />
      ) : null}
    </div>
  );
};
