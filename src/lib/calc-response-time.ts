export function calcResponseTime(begin: Date, end: Date): string {
  return begin.getMilliseconds() - end.getMilliseconds() + 'ms';
}
