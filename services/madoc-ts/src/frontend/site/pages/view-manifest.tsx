import React from 'react';
import { CrowdsourcingManifestTask } from '../../../gateway/tasks/crowdsourcing-manifest-task';
import { CrowdsourcingReview } from '../../../gateway/tasks/crowdsourcing-review';
import { CrowdsourcingTask } from '../../../gateway/tasks/crowdsourcing-task';
import { LocaleString } from '../../shared/components/LocaleString';
import { CollectionFull } from '../../../types/schemas/collection-full';
import { ManifestFull } from '../../../types/schemas/manifest-full';
import { Link } from 'react-router-dom';
import { Pagination } from '../../shared/components/Pagination';
import { ProjectFull } from '../../../types/schemas/project-full';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { ImageStripBox } from '../../shared/atoms/ImageStrip';
import { CroppedImage } from '../../shared/atoms/Images';
import { Heading5 } from '../../shared/atoms/Heading5';
import { ImageGrid } from '../../shared/atoms/ImageGrid';
import { useTranslation } from 'react-i18next';
import { useSubjectMap } from '../../shared/hooks/use-subject-map';
import { CanvasStatus } from '../../shared/atoms/CanvasStatus';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { Heading3 } from '../../shared/atoms/Heading3';
import { LockIcon } from '../../shared/atoms/LockIcon';
import { Heading1 } from '../../shared/atoms/Heading1';
import { ManifestActions } from '../features/ManifestActions';
import { ManifestMetadata } from '../features/ManifestMetadata';
import { ManifestUserTasks } from '../features/ManifestUserTasks';
import { usePreventCanvasNavigation } from '../features/PreventUsersNavigatingCanvases';
import { RandomlyAssignCanvas } from '../features/RandomlyAssignCanvas';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { Redirect } from 'react-router-dom';

export const ViewManifest: React.FC<{
  project?: ProjectFull;
  collection?: CollectionFull['collection'];
  manifest?: ManifestFull['manifest'];
  pagination?: ManifestFull['pagination'];
  manifestSubjects?: ManifestFull['subjects'];
  manifestTask?: CrowdsourcingManifestTask | CrowdsourcingTask;
  manifestUserTasks?: Array<CrowdsourcingTask | CrowdsourcingReview>;
  canUserSubmit?: boolean;
  refetch: () => Promise<any>;
}> = ({ manifest, pagination, manifestSubjects }) => {
  const { t } = useTranslation();
  const createLink = useRelativeLinks();
  const { filter, listing } = useLocationQuery();
  const { showWarning, showNavigationContent } = usePreventCanvasNavigation();
  const config = useSiteConfiguration();

  const [subjectMap] = useSubjectMap(manifestSubjects);

  if (!manifest) {
    return <DisplayBreadcrumbs />;
  }

  if (!listing && config.project.skipManifestListingPage && manifest.items.length) {
    return <Redirect to={createLink({ canvasId: manifest.items[0].id })} />;
  }

  return (
    <>
      <DisplayBreadcrumbs />

      <Heading1>
        <LocaleString>{manifest.label}</LocaleString>
      </Heading1>

      <ManifestUserTasks />

      {showNavigationContent ? <ManifestActions /> : null}

      {showWarning ? (
        <div style={{ textAlign: 'center', padding: '2em', background: '#eee' }}>
          <LockIcon style={{ fontSize: '3em' }} />
          <Heading3>{t('This manifest is not available to browse')}</Heading3>
          <RandomlyAssignCanvas />
        </div>
      ) : null}

      {showNavigationContent ? (
        <>
          <Pagination
            pageParam={'m'}
            page={pagination ? pagination.page : 1}
            totalPages={pagination ? pagination.totalPages : 1}
            stale={!pagination}
            extraQuery={{ filter, listing }}
          />
          <div style={{ display: 'flex' }}>
            <ImageGrid>
              {manifest.items.map((canvas, idx) => (
                <Link
                  key={`${canvas.id}_${idx}`}
                  to={createLink({
                    canvasId: canvas.id,
                  })}
                >
                  <ImageStripBox>
                    <CroppedImage>
                      {canvas.thumbnail ? <img alt={t('First image in manifest')} src={canvas.thumbnail} /> : null}
                    </CroppedImage>
                    {manifestSubjects && subjectMap ? <CanvasStatus status={subjectMap[canvas.id]} /> : null}
                    <LocaleString as={Heading5}>{canvas.label}</LocaleString>
                  </ImageStripBox>
                </Link>
              ))}
            </ImageGrid>
            <div style={{ maxWidth: 300 }}>
              <ManifestMetadata compact />
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};
