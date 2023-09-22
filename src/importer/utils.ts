import { existsSync, statSync } from 'fs';
import { mkdir } from 'fs/promises';

export const DATA_PATH = `./noaa-data`;
export const getLocalPath = (year: number) => `${DATA_PATH}/${year}.tar.gz`;

export const isNonEmptyFile = (path: string) =>
  existsSync(path) && statSync(path).size !== 0;

export const initDataDir = async (subPath?: string) =>
  mkdir(`${DATA_PATH}${subPath ? `/${subPath}` : ''}`, { recursive: true });
