import { format, formatDuration, intervalToDuration } from 'date-fns';
import P from 'bluebird';
import { groupBy, mean, range, round } from 'lodash';
import logger from '../services/logger';
import { importYear } from './import_year';
import prisma from '../services/prisma';
import { calcUtci } from './feels_like/utci';
import { isPleasantUtciMean } from './quality/quality';

const calculateDaySummaryAverages = async () => {
  await prisma.daySummaryAverage.deleteMany();
  const stations = await prisma.station.findMany({ select: { id: true } });

  await P.map(
    stations,
    async (station: { id: string }) => {
      const stationRecords = await prisma.daySummary.findMany({
        where: { stationId: station.id },
      });
      const byPartialDate = groupBy(
        stationRecords.map(o => ({ ...o, partialDate: format(o.date, 'MM-dd') })),
        o => o.partialDate,
      );
      const daySummaryAverages = Object.entries(byPartialDate).map(
        ([partialDate, values]) => {
          const temp = round(mean(values.map(o => o.temp)), 1);
          const dewp = round(mean(values.map(o => o.dewp)), 1);
          const wdsp = round(mean(values.map(o => o.wdsp)), 1);
          const max = round(mean(values.map(o => o.max)), 1);
          const min = round(mean(values.map(o => o.min)), 1);
          const prcp = round(mean(values.map(o => o.prcp)), 4);

          const utci = round(calcUtci(temp, dewp, wdsp), 1);

          return {
            stationId: values[0].stationId,
            date: partialDate,
            yearsIncluded: values.length,
            temp,
            dewp,
            wdsp,
            max,
            min,
            prcp,
            utci,
          };
        },
      );
      await prisma.daySummaryAverage.createMany({ data: daySummaryAverages });
    },
    { concurrency: 8 },
  );
};

const calculateStationSummaries = async () => {
  const stations = await prisma.station.findMany({ select: { id: true } });

  await P.map(
    stations,
    async station => {
      const daySummaryAverages = await prisma.daySummaryAverage.findMany({
        where: { stationId: station.id },
      });
      const days = daySummaryAverages.length;
      if (days < 365) {
        return;
      }

      const pleasantDays = daySummaryAverages.filter(dsa =>
        isPleasantUtciMean(dsa),
      ).length;
      await prisma.stationSummary.upsert({
        where: { stationId: station.id },
        create: { stationId: station.id, pleasantDays, days },
        update: { stationId: station.id, pleasantDays, days },
      });
    },
    { concurrency: 16 },
  );
};

const runImport = async () => {
  try {
    const [start, end] = [2000, 2023];
    const years = range(start, end).reverse();
    logger.info(`years: [${start}, ${end})`);

    await P.each(years, async year => importYear(year));

    logger.info('calculating daySummaryAverages');
    await calculateDaySummaryAverages();
    logger.info('finished calculating daySummaryAverages');

    logger.info('calculating stationSummaries');
    await calculateStationSummaries();
    logger.info('finished calculating stationSummaries');
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

    const end = new Date();
    const duration =
      formatDuration(intervalToDuration({ start, end })) ||
      `${end.getTime() - start.getTime()} milliseconds`;
    logger.info(`finished import script in ${duration}`);
  } catch (err) {
    logger.error(err);
  }
};

export default wrapper;
