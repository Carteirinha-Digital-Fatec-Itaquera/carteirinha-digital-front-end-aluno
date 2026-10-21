import type { Series } from './visitor';

export function availableVisitorSeries(series: Series[]): Series[] {
  return series
    .map(item => ({ ...item, events: item.events.filter(event => event.status !== 'CANCELLED') }))
    .filter(item => item.events.length > 0);
}
