import { Prisma } from '@prisma/client';
import z from 'zod';
import { DaySummaryRow } from './types';
import logger from '../services/logger';

const daySummaryRowToDaySummarySchema = z
  .object({
    STATION: z.string(),
    DATE: z.coerce.date(),
    TEMP: z.coerce.number(),
    DEWP: z.coerce.number(),
    WDSP: z.coerce.number(),
    MAX: z.coerce.number(),
    MIN: z.coerce.number(),
    PRCP: z.coerce.number(),
    FRSHTT: z.string(),
  })
  .transform(o => ({
    stationId: o.STATION,
    date: o.DATE,
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
): Prisma.DaySummaryCreateManyInput | undefined => {
  const parsed = daySummaryRowToDaySummarySchema.safeParse(data);
  if (!parsed.success) {
    logger.info(parsed.error);
    return undefined;
  }
  return parsed.data;
};
