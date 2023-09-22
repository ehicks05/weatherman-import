import { readFile, readdir } from 'fs/promises';
import P from 'bluebird';
import Papa from 'papaparse';
import { Dictionary, groupBy, keyBy } from 'lodash';
import { Prisma } from '@prisma/client';
import logger from '../services/logger';
import { parseDayRow } from './parse_day_summary';
import prisma from '../services/prisma';
import { DaySummaryRow } from './types';
import { parseStation } from './parse_station';

const handleData = async (file: Buffer, existingStationIds: Dictionary<string>) => {
  const { data } = Papa.parse<DaySummaryRow>(file.toString(), {
    header: true,
    skipEmptyLines: true,
  });

  const { NAME, STATION } = data[0];
  if (!NAME.endsWith(' US')) {
    return { skipped: true, reason: 'not_usa' };
  }

  // ignore stations with less than a full year's worth of records
  if (data.length < 365) {
    return { skipped: true, reason: 'too_few_rows' };
  }

  if (!existingStationIds[STATION]) {
    const createInput = parseStation(data[0]);
    if (createInput) {
      await prisma.station.create({ data: createInput });
    }
  }

  const existingDaySummary = await prisma.daySummary.findFirst({
    where: { stationId: STATION, date: parseDayRow(data[0])?.date },
  });
  if (existingDaySummary) {
    return { skipped: true, reason: 'already_exists' };
  }

  const createInputs = data
    .map(row => parseDayRow(row))
    .filter((o): o is Prisma.DaySummaryCreateManyInput => !!o);

  // ignore stations with less than a full year's worth of records
  if (createInputs.length < 365) {
    return { skipped: true, reason: 'too_few_parsed_rows' };
  }

  await prisma.daySummary.createMany({ data: createInputs });
  return { skipped: false };
};

export const importYear = async (year: number) => {
  logger.info(`importing ${year}`);
  const existingStationIds = keyBy(
    (await prisma.station.findMany()).map(o => o.id),
    o => o,
  );

  const base = `./noaa-data/${year}`;
  const files = await readdir(base);

  const results = await P.map(
    files,
    async file => {
      const data = await readFile(`${base}/${file}`);
      return handleData(data, existingStationIds);
    },
    { concurrency: 64 },
  );

  const grouped = groupBy(
    results,
    o => `skipped: ${o.skipped}${o.reason ? `: ${o.reason}` : ''}`,
  );
  const asEntry = Object.fromEntries(
    Object.entries(grouped).map(([key, values]) => [key, values.length]),
  );

  logger.info(asEntry);
};
