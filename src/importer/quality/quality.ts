import { calcUtci } from '../feels_like/utci';

export const isPleasant = (t: number, min: number, max: number, precip: number) =>
  t >= 55 && t < 75 && min >= 45 && max < 85;

export const isPleasantUtci = (
  t: number,
  min: number,
  max: number,
  dewp: number,
  wdsp: number,
  precip: number,
) => {
  const adjustedT = calcUtci(t, dewp, wdsp);
  const adjustedMin = calcUtci(min, dewp, wdsp);
  const adjustedMax = calcUtci(max, dewp, wdsp);
  return adjustedT >= 55 && adjustedT < 75 && adjustedMin >= 45 && adjustedMax < 85;
};
