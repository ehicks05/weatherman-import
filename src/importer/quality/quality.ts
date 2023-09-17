import { calcUtci } from '../feels_like/utci';

export const isPleasant = (temp: number, min: number, max: number, prcp: number) =>
  temp >= 55 && temp < 75 && min >= 45 && max < 85;

// uses utci-adjusted mean temp
export const isPleasantUtciMean = ({
  utci,
  min,
  max,
  prcp,
}: {
  utci: number;
  min: number;
  max: number;
  prcp: number;
}) => utci >= 55 && utci < 75 && min >= 45 && max < 85;

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
