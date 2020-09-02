import { generateId, traverseDocument, traverseStructure } from '@capture-models/helpers';
import { BaseField, CaptureModel } from '@capture-models/types';
import { NestedModelFields } from '@capture-models/types/src/capture-model';
import { ApiClient } from '../../../gateway/api';
import { CaptureModelExtension } from '../extension';

/**
 * Paragraphs extension
 *
 * Profile: http://madoc.io/profiles/capture-model-fields/paragraphs
 *
 * The paragraphs extension will use the target of the capture model to find
 * any linking properties that match the paragraphs model format. If these exist
 * it will replace the placeholder field (in this director) with the full model.
 */
export class Paragraphs implements CaptureModelExtension {
  api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  async onCloneCaptureModel(captureModel: CaptureModel) {
    // 1. Check if model contains our paragraph.
    const state: {
      modelFound: undefined | BaseField;
      parent: undefined | CaptureModel['document'];
      key: undefined | string;
    } = { modelFound: undefined, parent: undefined, key: undefined };

    traverseDocument(captureModel.document, {
      visitField: (field, key, parent) => {
        if (field.type === 'madoc-paragraphs' && state.modelFound === undefined) {
          state.modelFound = field;
          state.parent = parent;
          state.key = key;
        }
      },
    });

    if (!state.parent || !state.key || !state.modelFound || !captureModel.id) {
      // Nothing found.
      return captureModel;
    }

    // 2. If it does - then extract the target
    const { canvas } = this.api.parseModelTarget(captureModel.target);

    if (!canvas) {
      // No valid target.
      return captureModel;
    }

    // 3. Does the target have an available model field?
    const linking = await this.api.getCanvasLinking(canvas.id);

    const matchingCaptureModel = linking.linking.find(singleLink => {
      // @todo this could be extended to be configured from the field.
      return singleLink.property === 'seeAlso' && singleLink.link.type === 'CaptureModelDocument';
    });

    if (!matchingCaptureModel) {
      // No valid model.
      return captureModel;
    }

    // 4. If it does - swap out the field with the JSON
    //   4.1 - Load the linking property - using the storage api parameters if internal
    const data = matchingCaptureModel.file
      ? await this.api.getStorageJsonData(matchingCaptureModel.file.bucket, matchingCaptureModel.file.path)
      : await fetch(matchingCaptureModel.link.id).then(r => r.json());

    //   4.2 - Make wrapper document and traverse the fields, minting new IDs
    const documentWrapper: CaptureModel['document'] = {
      id: '',
      type: 'entity',
      properties: data,
      label: 'Document wrapper',
    };
    traverseDocument(documentWrapper, {
      visitEntity(entity) {
        entity.id = generateId();
      },
      visitField(field) {
        field.id = generateId();
      },
      visitSelector(selector) {
        selector.id = generateId();
        if (selector.state) {
          if (typeof selector.state.x === 'string') {
            selector.state.x = Number(selector.state.x);
          }
          if (typeof selector.state.y === 'string') {
            selector.state.y = Number(selector.state.y);
          }
          if (typeof selector.state.width === 'string') {
            selector.state.width = Number(selector.state.width);
          }
          if (typeof selector.state.height === 'string') {
            selector.state.height = Number(selector.state.height);
          }
        }
      },
    });

    //   4.4 - Replace field on model with new field
    state.parent.properties[state.key] = documentWrapper.properties.paragraph;

    // 5. Update the structure with the paragraph structure.
    //   5.1 - Extract path to all fields from document
    const structureTarget: NestedModelFields = [state.key, [['lines', ['text']]]];
    const structureCurrent = state.key;

    //   5.2 - Find leaf nodes in the structures that reference the placeholder
    traverseStructure(captureModel.structure, structure => {
      // Only support top level
      if (structure.type === 'model') {
        const idx = structure.fields.indexOf(structureCurrent);
        if (idx !== -1) {
          //   5.3 - Replace these with one from 5.1
          structure.fields[idx] = structureTarget;
        }
      }
    });

    try {
      // 6. Save the model and return it.
      return await this.api.updateCaptureModel(captureModel.id, captureModel);
      ///  6.1 - Any errors - add to the placeholder field in the future
    } catch (err) {
      return captureModel;
    }
  }
}