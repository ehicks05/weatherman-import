import { existsSync, statSync, writeFile } from 'fs';
import axios from 'axios';
import { getLocalPath } from './utils';

const getUrl = (year: number) =>
  `https://www.ncei.noaa.gov/data/global-summary-of-the-day/archive/${year}.tar.gz`;

export const downloadIfNotExists = async (year: number) => {
  const localPath = getLocalPath(year);
  if (!existsSync(localPath) || statSync(localPath).size === 0) {
    try {
      await axios
        .get(getUrl(year), { responseType: 'arraybuffer' })
        .then(response => {
          writeFile(localPath, response.data, e => console.log(e));
        });
    } catch (e) {
      console.log(e);
    }
  }
};
