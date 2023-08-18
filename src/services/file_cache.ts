import { existsSync, mkdirSync, realpathSync } from 'fs';
import { readdir, readFile, unlink, writeFile } from 'fs/promises';
import logger from './logger';

const DIR = './file-cache';

const getPath = (file: string) => `${DIR}/${file}`;

if (!existsSync(DIR)) mkdirSync(DIR);
logger.info(`file cache: ${realpathSync(DIR)}`);

const set = async (name: string, data: any) => {
  await writeFile(`${DIR}/${name}`, data, { flag: 'w' });
};

const get = async (name: string) => {
  const path = getPath(name);
  if (existsSync(path)) return (await readFile(path)).toString();
};

const clear = async (except: string) => {
  const dir = await readdir(DIR);
  await Promise.all(
    dir
      .filter(file => !file.includes(except))
      .map(file => {
        logger.info(`cleaning up file cache: ${realpathSync(getPath(file))}`);
        unlink(realpathSync(getPath(file)));
        return undefined;
      }),
  );
};

const fileCache = {
  clear,
  get,
  set,
  DIR,
};

export default fileCache;
