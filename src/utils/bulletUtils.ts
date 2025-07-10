export function pairItemsByLength(items: string[], pairs = 5): string[] {
  const arr = items.slice(0, pairs * 2);
  while (arr.length < pairs * 2) arr.push('');
  arr.sort((a, b) => b.length - a.length);
  const result: string[] = [];
  while (arr.length) {
    const first = arr.shift() as string;
    const second = arr.pop() ?? '';
    result.push(first, second);
  }
  return result;
}

