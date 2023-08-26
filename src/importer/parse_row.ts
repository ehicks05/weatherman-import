import { Prisma } from '@prisma/client';
import z from 'zod';
import { DaySummaryRow } from './types';

const daySummaryRowSchema = z
  .object({
    STATION: z.string(),
    DATE: z.coerce.date(),
    LATITUDE: z.coerce.number(),
    LONGITUDE: z.coerce.number(),
    ELEVATION: z.coerce.number(),
    NAME: z.string(),
    TEMP: z.coerce.number().lt(9999.9),
    DEWP: z.coerce.number().lt(9999.9),
    VISIB: z.coerce.number().lt(999.9),
    WDSP: z.coerce.number().lt(999.9),
    MXSPD: z.coerce.number().lt(999.9),
    GUST: z.coerce.number().lt(999.9),
    MAX: z.coerce.number().lt(9999.9),
    MIN: z.coerce.number().lt(9999.9),
    PRCP: z.coerce.number().lt(99.99),
    SNDP: z.coerce.number().lt(999.9),
    FRSHTT: z.string(),
  })
  .transform(o => ({
    station: o.STATION,
    date: o.DATE,
    latitude: o.LATITUDE,
    longitude: o.LONGITUDE,
    elevation: o.ELEVATION,
    name: o.NAME,
    temp: o.TEMP,
    dewp: o.DEWP,
    visib: o.VISIB,
    wdsp: o.WDSP,
    mxspd: o.MXSPD,
    gust: o.GUST,
    max: o.MAX,
    min: o.MIN,
    prcp: o.PRCP,
    sndp: o.SNDP,
    frshtt: o.FRSHTT,
  }));

export const parseDayRow = (data: DaySummaryRow): Prisma.DaySummaryCreateInput => {
  const parsed = daySummaryRowSchema.parse(data);
  console.log({ data, parsed });
  return parsed;
};
