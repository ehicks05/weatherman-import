import { Prisma } from '@prisma/client';
import z from 'zod';
import { DaySummaryRow } from './types';
import logger from '../services/logger';

const daySummaryRowToStationSchema = z
  .object({
    STATION: z.string(),
    LATITUDE: z.coerce.number(),
    LONGITUDE: z.coerce.number(),
    ELEVATION: z.coerce.number(),
    NAME: z.string(),
  })
  .transform(o => ({
    id: o.STATION,
    latitude: o.LATITUDE,
    longitude: o.LONGITUDE,
    elevation: o.ELEVATION,
    name: o.NAME,
  }));

export const parseStation = (
  data: DaySummaryRow,
): Prisma.StationCreateInput | undefined => {
  const parsed = daySummaryRowToStationSchema.safeParse(data);
  if (!parsed.success) {
    logger.info(parsed.error);
    return undefined;
  }
  return parsed.data;
};
