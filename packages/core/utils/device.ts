export function trimHostname(name?: string | null): string {
  if (!name) return '';
  return name.split('.')[0] || name;
}
