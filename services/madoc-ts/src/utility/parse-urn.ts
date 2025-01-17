const urnRegex = /urn:madoc:(collection|manifest|canvas|user|site):([0-9]+)/;

export function parseUrn(urn: string) {
  const [, type, id] = urn.match(urnRegex) || [];

  if (type && id) {
    return { id: Number(id), type: `${type}` };
  }

  return undefined;
}

export function extractIdFromUrn(urn: string) {
  const parsed = parseUrn(urn);

  return parsed?.id;
}
