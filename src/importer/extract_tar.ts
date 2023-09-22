import { createReadStream } from 'fs';
import { readdir, writeFile } from 'fs/promises';
import { createGunzip } from 'zlib';
import internal from 'stream';
import tarStream from 'tar-stream';
import Papa from 'papaparse';
import { keyBy } from 'lodash';
import logger from '../services/logger';
import { getLocalPath, isNonEmptyFile } from './utils';
import { DaySummaryRow } from './types';

const toBuffer = async (stream: internal.PassThrough) => {
  let buffer: Buffer = Buffer.from([]);
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }
  return buffer;
};

const saveFile = async (year: number, entry: Buffer) => {
  const { data } = Papa.parse<DaySummaryRow>(entry.toString(), {
    header: true,
    skipEmptyLines: true,
  });
  const { STATION } = data[0];
  const path = `./noaa-data/${year}/${STATION}`;

  if (!isNonEmptyFile(path)) {
    await writeFile(path, entry);
  }
};

export const extractTar = async (year: number) => {
  logger.info(`extracting tar: ${year}`);
  logger.info('looking for existing extracted files...');
  const existingFiles = keyBy(await readdir(`./noaa-data/${year}`), o => o);
  if (Object.keys(existingFiles).length !== 0) {
    return Promise.resolve(true);
  }
  logger.info('reading tar file');

  return new Promise((resolve, reject) => {
    const extract = tarStream.extract();

    extract.on('entry', async (header, stream, next) => {
      const { name } = header;
      if (!existingFiles[name]) {
        const entry = await toBuffer(stream);
        await saveFile(year, entry);
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
