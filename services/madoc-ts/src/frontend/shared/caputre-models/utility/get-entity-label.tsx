import { isEntity } from '@capture-models/helpers';
import { CaptureModel } from '@capture-models/types';
import React from 'react';

export function getEntityLabel(document: CaptureModel['document'], defaultLabel?: string | any) {
  if (
    document.labelledBy &&
    document.properties[document.labelledBy] &&
    document.properties[document.labelledBy].length > 0
  ) {
    const field = document.properties[document.labelledBy][0];
    if (!isEntity(field) && field.value) {
      return field.value;
    }
  }

  const props = Object.keys(document.properties);
  for (const prop of props) {
    const item = document.properties[prop];
    if (item[0] && !isEntity(item[0]) && typeof item[0].value === 'string' && item[0].value) {
      return item[0].value;
    }
  }

  if (defaultLabel) {
    return defaultLabel;
  }

  return `${document.label} (type: ${document.type})`;
}
