export function calcResponseTime(begin: Date, end: Date): string {
  return end?.getMilliseconds() - begin?.getMilliseconds() + 'ms';
}
