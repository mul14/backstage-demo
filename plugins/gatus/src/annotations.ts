import { Entity } from '@backstage/catalog-model';

export const GATUS_URL_ANNOTATION = 'twin.sh/gatus-url';

export const isGatusAvailable = (entity: Entity): boolean =>
  Boolean(entity.metadata.annotations?.[GATUS_URL_ANNOTATION]);
