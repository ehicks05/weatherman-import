import { formatDuration, intervalToDuration } from 'date-fns';
import P from 'bluebird';
import { range } from 'lodash';
import logger from '../services/logger';
import { importYear } from './import_year';

const runImport = async () => {
  try {
    const years = range(2000, 2023).reverse();
    logger.info({ years });

    await P.each(years, async year => importYear(year));
  } catch (err) {
    logger.error(err);
  }
};

// mostly housekeeping
const wrapper = async () => {
  try {
    logger.info('starting import script');
    const start = new Date();

    await runImport();

    const duration = intervalToDuration({ start, end: new Date() });
    logger.info(`finished import script in ${formatDuration(duration)}`);
  } catch (err) {
    logger.error(err);
  }
};

export default wrapper;
