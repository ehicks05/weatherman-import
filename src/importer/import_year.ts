import { createReadStream } from 'fs';
import { createGunzip } from 'zlib';
import internal from 'stream';
import tarStream from 'tar-stream';
import Papa from 'papaparse';
import { keyBy } from 'lodash';
import { Prisma } from '@prisma/client';
import logger from '../services/logger';
import { parseDayRow } from './parse_day_summary';
import prisma from '../services/prisma';
import { downloadIfNotExists } from './download';
import { getLocalPath } from './utils';
import { DaySummaryRow } from './types';
import { parseStation } from './parse_station';

const bufferEntry = async (stream: internal.PassThrough) => {
  let buffer: Buffer = Buffer.from([]);
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }
  return buffer;
};

export const importYear = async (year: number) => {
  logger.info(`importing ${year}`);
  await downloadIfNotExists(year);

  const existingStationIds = keyBy(await prisma.station.findMany(), o => o.id);
  logger.info(`found ${Object.keys(existingStationIds).length} stations in db`);
  logger.info(`starting parsing...`);

  return new Promise((resolve, reject) => {
    const extract = tarStream.extract();

    extract.on('entry', async (_header, stream, next) => {
      const entry = await bufferEntry(stream);
      const data = Papa.parse<DaySummaryRow>(entry.toString(), {
        header: true,
        skipEmptyLines: true,
      });

      const { NAME, STATION } = data.data[0];
      const isUS = NAME.endsWith(' US');

      if (isUS) {
        if (!existingStationIds[STATION]) {
          const createInput = parseStation(data.data[0]);
          if (createInput) {
            await prisma.station.create({ data: createInput });
          }
        }

        const createInputs = data.data
          .map(row => parseDayRow(row))
          .filter((o): o is Prisma.DaySummaryCreateManyInput => !!o);
        await prisma.daySummary.createMany({ data: createInputs });
      }

      next();
    });

    extract.on('finish', async () => {
      logger.info(`finished ${year}`);
      return resolve(true);
    });
    extract.on('error', async e => {
      logger.error(`error while parsing ${year}`, e);
      return reject(e);
    });

    createReadStream(getLocalPath(year)).pipe(createGunzip()).pipe(extract);
  });
};
