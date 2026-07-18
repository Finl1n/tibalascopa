export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function includesQuery(value: string, query: string) {
  const normalizedValue = normalizeText(value);
  const normalizedQuery = normalizeText(query);

  if (!normalizedValue || !normalizedQuery) {
    return false;
  }

  return normalizedValue.includes(normalizedQuery) || normalizedQuery.includes(normalizedValue);
}
