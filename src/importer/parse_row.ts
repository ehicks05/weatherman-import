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
    TEMP_ATTRIBUTES: z.coerce.number().int(),
    DEWP: z.coerce.number().lt(9999.9),
    DEWP_ATTRIBUTES: z.coerce.number().int(),
    SLP: z.coerce.number().lt(9999.9),
    SLP_ATTRIBUTES: z.coerce.number().int(),
    STP: z.coerce.number().lt(9999.9),
    STP_ATTRIBUTES: z.coerce.number().int(),
    VISIB: z.coerce.number().lt(999.9),
    VISIB_ATTRIBUTES: z.coerce.number().int(),
    WDSP: z.coerce.number().lt(999.9),
    WDSP_ATTRIBUTES: z.coerce.number().int(),
    MXSPD: z.coerce.number().lt(999.9),
    GUST: z.coerce.number().lt(999.9),
    MAX: z.coerce.number().lt(9999.9),
    MAX_ATTRIBUTES: z.string(),
    MIN: z.coerce.number().lt(9999.9),
    MIN_ATTRIBUTES: z.string(),
    PRCP: z.coerce.number().lt(99.99),
    PRCP_ATTRIBUTES: z.string(),
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
    tempAttributes: o.TEMP_ATTRIBUTES,
    dewp: o.DEWP,
    dewpAttributes: o.DEWP_ATTRIBUTES,
    slp: o.SLP,
    slpAttributes: o.SLP_ATTRIBUTES,
    stp: o.STP,
    stpAttributes: o.STP_ATTRIBUTES,
    visib: o.VISIB,
    visibAttributes: o.VISIB_ATTRIBUTES,
    wdsp: o.WDSP,
    wdspAttributes: o.WDSP_ATTRIBUTES,
    mxspd: o.MXSPD,
    gust: o.GUST,
    max: o.MAX,
    maxAttributes: o.MAX_ATTRIBUTES,
    min: o.MIN,
    minAttributes: o.MIN_ATTRIBUTES,
    prcp: o.PRCP,
    prcpAttributes: o.PRCP_ATTRIBUTES,
    sndp: o.SNDP,
    frshtt: o.FRSHTT,
  }));

export const parseDayRow = (data: DaySummaryRow): Prisma.DaySummaryCreateInput => {
  const parsed = daySummaryRowSchema.parse(data);
  console.log({ data, parsed });
  return parsed;
};
