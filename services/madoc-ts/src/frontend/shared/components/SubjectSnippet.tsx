import React, { useMemo } from 'react';
import { CollectionSnippet } from './CollectionSnippet';
import { ManifestSnippet } from './ManifestSnippet';
import { CanvasSnippet } from './CanvasSnippet';

export const SubjectSnippet: React.FC<{ subject: string }> = ({ subject }) => {
  const sub = useMemo(() => {
    const regex = /urn:madoc:(.*):(.*)/g;
    const result = regex.exec(subject);
    if (!result) {
      return { type: undefined, id: undefined };
    }

    const [, type, id] = result;

    return { type, id: Number(id) };
  }, [subject]);

  if (sub.type === 'collection') {
    return <CollectionSnippet id={sub.id} />;
  }

  if (sub.type === 'manifest') {
    return <ManifestSnippet id={sub.id} />;
  }

  if (sub.type === 'canvas') {
    return <CanvasSnippet id={sub.id} />;
  }

  return null;
};
