import { existsSync, statSync, writeFile } from 'fs';
import axios from 'axios';
import { getLocalPath } from './utils';

const getUrl = (year: number) =>
  `https://www.ncei.noaa.gov/data/global-summary-of-the-day/archive/${year}.tar.gz`;

export const downloadIfNotExists = async (year: number) => {
  const localPath = getLocalPath(year);
  const exists = existsSync(localPath) && statSync(localPath).size !== 0;

  if (exists) {
    console.log(`found non-empty file ${localPath}, skipping download`);
  } else {
    console.log(`failed to find non-empty file ${localPath}, downloading...`);

    try {
      await axios
        .get(getUrl(year), { responseType: 'arraybuffer' })
        .then(response => {
          writeFile(localPath, response.data, e => console.log(e));
        });
    } catch (e) {
      console.log(e);
    }

    console.log(`finished downloading ${localPath}`);
  }
};
