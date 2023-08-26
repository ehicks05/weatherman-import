import { existsSync, mkdir, statSync, writeFile } from 'fs';
import axios from 'axios';
import { DATA_PATH, getLocalPath } from './utils';
import logger from '../services/logger';

const getUrl = (year: number) =>
  `https://www.ncei.noaa.gov/data/global-summary-of-the-day/archive/${year}.tar.gz`;

export const downloadIfNotExists = async (year: number) => {
  const localPath = getLocalPath(year);
  const exists = existsSync(localPath) && statSync(localPath).size !== 0;

  if (exists) {
    logger.info(`found non-empty file ${localPath}, skipping download`);
  } else {
    logger.info(`failed to find non-empty file ${localPath}, downloading...`);
    mkdir(DATA_PATH, { recursive: true }, e => {
      if (e) {
        logger.error(e);
      }
    });
    try {
      await axios
        .get(getUrl(year), { responseType: 'arraybuffer' })
        .then(response => {
          writeFile(localPath, response.data, e => logger.info(e));
        });
    } catch (e) {
      logger.error(e);
    }

    logger.info(`finished downloading ${localPath}`);
  }
};
