import { format, formatDuration, intervalToDuration } from 'date-fns';
import P from 'bluebird';
import { groupBy, mean, range, round } from 'lodash';
import logger from '../services/logger';
import { importYear } from './import_year';
import prisma from '../services/prisma';
import { calcUtci } from './feels_like/utci';

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
        ([partialDate, values]) => ({
          stationId: values[0].stationId,
          date: partialDate,
          yearsIncluded: values.length,
          temp: round(mean(values.map(o => o.temp)), 1),
          dewp: round(mean(values.map(o => o.dewp)), 1),
          wdsp: round(mean(values.map(o => o.wdsp)), 1),
          max: round(mean(values.map(o => o.max)), 1),
          min: round(mean(values.map(o => o.min)), 1),
          prcp: round(mean(values.map(o => o.prcp)), 4),
        }),
      );
      await prisma.daySummaryAverage.createMany({ data: daySummaryAverages });
    },
    { concurrency: 8 },
  );
};

const applyUtci = async () => {
  const take = 100_000;
  let skip = 0;
  let daySummaryAverages = await prisma.daySummaryAverage.findMany({
    where: { utci: { equals: null } },
    skip,
    take,
  });

  while (daySummaryAverages.length !== 0) {
    await P.map(
      daySummaryAverages,
      async daySummaryAverage => {
        const { stationId, date, temp, dewp, wdsp } = daySummaryAverage;
        const utci = round(calcUtci(temp, dewp, wdsp), 1);
        await prisma.daySummaryAverage.update({
          data: { utci },
          where: { stationId_date: { stationId, date } },
        });
      },
      { concurrency: 32 },
    );

    skip += daySummaryAverages.length;
    daySummaryAverages = await prisma.daySummaryAverage.findMany({
      where: { utci: { equals: null } },
      skip,
      take,
    });
  }
};

const runImport = async () => {
  try {
    const [start, end] = [2000, 2023];
    const years = range(start, end).reverse();
    logger.info(`years: [${start}, ${end})`);

    await P.each(years, async year => importYear(year));

    logger.info('calculating multi-year averages');
    await calculateDaySummaryAverages();
    logger.info('finished calculating multi-year averages');
    logger.info('applying utci to daySummaryAverages');
    await applyUtci();
    logger.info('finished applying utci to daySummaryAverages');
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
