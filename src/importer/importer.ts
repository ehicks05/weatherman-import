import { formatDuration, intervalToDuration } from 'date-fns';
import P from 'bluebird';
import { range } from 'lodash';
import logger from '../services/logger';
import { importYear } from './import_year';

const runImport = async () => {
  try {
    const years = range(2022, 2023);
    console.log({ years });

    await P.each(years, async year => {
      await importYear(year);
    });
  } catch (err) {
    logger.error(err);
  }
};

// mostly housekeeping
const wrapper = async () => {
  try {
    logger.info('starting tmdb_loader script');
    const startedAt = new Date();

    await runImport();

    const endedAt = new Date();
    const duration = intervalToDuration({ start: startedAt, end: endedAt });
    logger.info(`finished tmdb_loader script in ${formatDuration(duration)}`);
  } catch (err) {
    logger.error(err);
  }
};

export default wrapper;
