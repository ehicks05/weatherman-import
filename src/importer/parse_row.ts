import { Prisma } from '@prisma/client';
import z from 'zod';
import { DaySummaryRow } from './types';
import logger from '../services/logger';

const daySummaryRowSchema = z
  .object({
    STATION: z.string(),
    DATE: z.coerce.date(),
    LATITUDE: z.coerce.number(),
    LONGITUDE: z.coerce.number(),
    ELEVATION: z.coerce.number(),
    NAME: z.string(),
    TEMP: z.coerce.number(),
    DEWP: z.coerce.number(),
    WDSP: z.coerce.number(),
    MAX: z.coerce.number(),
    MIN: z.coerce.number(),
    PRCP: z.coerce.number(),
    FRSHTT: z.string(),
  })
  .transform(o => ({
    station: o.STATION,
    date: o.DATE,
    latitude: o.LATITUDE,
    longitude: o.LONGITUDE,
    elevation: o.ELEVATION,
    name: o.NAME,
    temp: o.TEMP === 9999.9 ? undefined : o.TEMP,
    dewp: o.DEWP === 9999.9 ? undefined : o.DEWP,
    wdsp: o.WDSP === 999.9 ? undefined : o.WDSP,
    max: o.MAX === 9999.9 ? undefined : o.MAX,
    min: o.MIN === 9999.9 ? undefined : o.MIN,
    prcp: o.PRCP === 99.99 ? undefined : o.PRCP,
    frshtt: o.FRSHTT,
  }));

export const parseDayRow = (
  data: DaySummaryRow,
): Prisma.DaySummaryCreateInput | undefined => {
  const parsed = daySummaryRowSchema.safeParse(data);
  if (!parsed.success) {
    logger.info(parsed.error);
    return undefined;
  }
  return parsed.data;
};
