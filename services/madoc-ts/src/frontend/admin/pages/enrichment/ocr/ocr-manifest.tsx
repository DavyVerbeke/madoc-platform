import { useMutation } from 'react-query';
import { ResourceLinkResponse } from '../../../../../database/queries/linking-queries';
import { ItemStructureList } from '../../../../../types/schemas/item-structure-list';
import { ManifestFull } from '../../../../../types/schemas/manifest-full';
import { iiifGetLabel } from '../../../../../utility/iiif-get-label';
import { Button } from '../../../../shared/atoms/Button';
import { NotStartedIcon } from '../../../../shared/atoms/NotStartedIcon';
import { TableActions, TableContainer, TableRow, TableRowLabel } from '../../../../shared/atoms/Table';
import { TickIcon } from '../../../../shared/atoms/TickIcon';
import { WidePage } from '../../../../shared/atoms/WidePage';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { useApi } from '../../../../shared/hooks/use-api';
import { useData } from '../../../../shared/hooks/use-data';
import { createLink } from '../../../../shared/utility/create-link';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { HrefLink } from '../../../../shared/utility/href-link';
import { UniversalComponent } from '../../../../types';
import React, { useMemo } from 'react';
import { AdminHeader } from '../../../molecules/AdminHeader';

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

    return (
      <>
        <AdminHeader
          breadcrumbs={[
            { label: 'Site admin', link: '/' },
            { label: 'OCR', link: `/enrichment/ocr` },
            {
              label: <LocaleString>{data?.manifest.manifest.label || { none: ['...'] }}</LocaleString>,
              link: `/enrichment/ocr/${data?.manifest.manifest.id}`,
            },
          ]}
          title="Prepare your manifest for OCR corrections"
        />
        <WidePage>
          <h1>Prepare your manifest for OCR corrections</h1>
          {queueManifestQuery.data ? (
            <div>
              OCR is importing
              <Button as={HrefLink} href={createLink({ taskId: queueManifestQuery.data.id })}>
                View progress
              </Button>
            </div>
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
                    canvasLinkingMap[item.id].find(m => m.link && m.link.type === 'CaptureModelDocument') ? (
                      <TickIcon />
                    ) : (
                      <NotStartedIcon accepted />
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
                          return <div>ALTO</div>;
                        }

                        return <div key={link.id}>{link.link.profile}</div>;
                      })
                    ) : (
                      <div>No OCR Data found</div>
                    )}
                  </TableActions>
                </TableRow>
              );
            })}
          </TableContainer>
        </WidePage>
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