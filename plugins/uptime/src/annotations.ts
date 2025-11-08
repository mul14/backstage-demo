import { Entity } from '@backstage/catalog-model';

export const UPTIME_URL_ANNOTATION = 'demo.backstage.io/uptime-url';

export const hasUptimeAnnotation = (entity: Entity): boolean =>
  Boolean(entity.metadata.annotations?.[UPTIME_URL_ANNOTATION]);
