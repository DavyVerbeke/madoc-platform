import { useMutation } from 'react-query';
import { ResourceLinkResponse } from '../../../../../database/queries/linking-queries';
import { PARAGRAPHS_PROFILE } from '../../../../../extensions/capture-models/Paragraphs/Paragraphs.helpers';
import { ItemStructureList } from '../../../../../types/schemas/item-structure-list';
import { ManifestFull } from '../../../../../types/schemas/manifest-full';
import { iiifGetLabel } from '../../../../../utility/iiif-get-label';
import { Button } from '../../../../shared/atoms/Button';
import { InfoMessage } from '../../../../shared/atoms/InfoMessage';
import { NotStartedIcon } from '../../../../shared/atoms/NotStartedIcon';
import { TableActions, TableContainer, TableRow, TableRowLabel } from '../../../../shared/atoms/Table';
import { TaskItemTag, TaskItemTagSuccess } from '../../../../shared/atoms/TaskList';
import { TickIcon } from '../../../../shared/atoms/TickIcon';
import { WarningMessage } from '../../../../shared/atoms/WarningMessage';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { useApi } from '../../../../shared/hooks/use-api';
import { useData } from '../../../../shared/hooks/use-data';
import { createLink } from '../../../../shared/utility/create-link';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { HrefLink } from '../../../../shared/utility/href-link';
import { UniversalComponent } from '../../../../types';
import React, { useMemo } from 'react';

type OcrManifestType = {
  data: {
    manifest: ManifestFull;
    manifestStructure: ItemStructureList;
    canvasLinking: { linking: ResourceLinkResponse[] };
  };
  query: {};
  params: { id: string };
  variables: { id: number };
  context: {};
};

export const OcrManifest: UniversalComponent<OcrManifestType> = createUniversalComponent<OcrManifestType>(
  () => {
    const { data } = useData(OcrManifest);
    const api = useApi();

    const [queueManifest, queueManifestQuery] = useMutation(async () => {
      if (data) {
        return api.importManifestOcr(data.manifest.manifest.id, iiifGetLabel(data.manifest.manifest.label));
      }
    });

    const canvasLinkingMap = useMemo(() => {
      const map: { [id: number]: ResourceLinkResponse[] } = {};
      if (data) {
        for (const link of data.canvasLinking.linking) {
          map[link.resource_id] = map[link.resource_id] ? map[link.resource_id] : [];
          map[link.resource_id].push(link);
        }
      }
      return map;
    }, [data]);

    const isEmpty = Object.keys(canvasLinkingMap).length === 0;

    return (
      <>
        <h1>Prepare your manifest for OCR corrections</h1>
        {isEmpty ? (
          <WarningMessage>No OCR data found</WarningMessage>
        ) : queueManifestQuery.data ? (
          <InfoMessage>
            OCR is importing
            <Button
              as={HrefLink}
              href={createLink({ taskId: queueManifestQuery.data.id })}
              style={{ marginLeft: '10px' }}
            >
              View progress
            </Button>
          </InfoMessage>
        ) : (
          <Button disabled={queueManifestQuery.status === 'loading'} onClick={() => queueManifest()}>
            Import OCR
          </Button>
        )}
        <TableContainer>
          {data?.manifestStructure.items.map(item => {
            return (
              <TableRow>
                <TableRowLabel>
                  {canvasLinkingMap[item.id] &&
                  canvasLinkingMap[item.id].find(
                    m => m.link && (m.link.type === 'CaptureModelDocument' || m.link.format === 'text/plain')
                  ) ? (
                    <TickIcon />
                  ) : canvasLinkingMap[item.id] ? (
                    <NotStartedIcon accepted />
                  ) : (
                    <NotStartedIcon />
                  )}
                </TableRowLabel>
                <TableRowLabel>
                  <LocaleString>{item.label}</LocaleString>
                </TableRowLabel>
                <TableActions>
                  {canvasLinkingMap[item.id] ? (
                    canvasLinkingMap[item.id].map(link => {
                      if (
                        link.link.profile === 'http://www.loc.gov/standards/alto/v3/alto.xsd' ||
                        link.link.profile === 'http://www.loc.gov/standards/alto/v4/alto.xsd'
                      ) {
                        return <TaskItemTag>ALTO</TaskItemTag>;
                      }

                      if (link.link.format === 'text/plain') {
                        return <TaskItemTag>Plaintext</TaskItemTag>;
                      }

                      if (link.link.profile === PARAGRAPHS_PROFILE) {
                        return <TaskItemTagSuccess>Imported OCR</TaskItemTagSuccess>;
                      }

                      return <TaskItemTag key={link.id}>{link.link.profile}</TaskItemTag>;
                    })
                  ) : (
                    <TaskItemTag>No OCR Data found</TaskItemTag>
                  )}
                </TableActions>
              </TableRow>
            );
          })}
        </TableContainer>
      </>
    );
  },
  {
    getKey(params) {
      return ['OcrManifest', { id: Number(params.id) }];
    },
    async getData(key, vars, api) {
      return {
        manifest: await api.getManifestById(vars.id),
        manifestStructure: await api.getManifestStructure(vars.id),
        canvasLinking: await api.getManifestCanvasLinking(vars.id, {
          property: 'seeAlso',
        }),
      };
    },
  }
);
