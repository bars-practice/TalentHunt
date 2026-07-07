export function pluralize(count: number, forms: [string, string, string]): string {
  const cases = [2, 0, 1, 1, 1, 2];
  const mod = count % 100;
  const index = mod > 4 && mod < 20 ? 2 : cases[Math.min(mod % 10, 5)];
  return forms[index];
}
