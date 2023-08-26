import { createReadStream } from 'fs';
import { createGunzip } from 'zlib';
import tarStream from 'tar-stream';
import Papa from 'papaparse';
import { keyBy } from 'lodash';
import logger from '../services/logger';
import { parseDayRow } from './parse_row';
import prisma from '../services/prisma';
import { downloadIfNotExists } from './download';
import { getLocalPath } from './utils';
import { DaySummaryRow } from './types';

const extract = tarStream.extract();

export const importYear = async (year: number) => {
  logger.info(`importing ${year}`);
  await downloadIfNotExists(year);

  const existingStations = keyBy(
    await prisma.daySummary.findMany({
      where: { date: { gte: new Date(`${year}`), lt: new Date(`${year + 1}`) } },
      select: { station: true },
      distinct: ['station'],
    }),
    o => o.station,
  );
  logger.info(`found ${Object.keys(existingStations).length} stations in db`);

  extract.on('entry', async (_header, stream, next) => {
    let temp: Buffer = Buffer.from([]);

    for await (const chunk of stream) {
      temp = Buffer.concat([temp, chunk]);
    }

    const csv = Buffer.from(temp).toString();
    const data = Papa.parse<DaySummaryRow>(csv, {
      header: true,
      skipEmptyLines: true,
    });

    if (!existingStations[data.data[0].STATION]) {
      const createInputs = data.data.map(row => parseDayRow(row));
      await prisma.daySummary.createMany({ data: createInputs });
    }

    next();
  });

  extract.on('finish', () => logger.info('onfinish'));

  createReadStream(getLocalPath(year)).pipe(createGunzip()).pipe(extract);
};
