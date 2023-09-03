/**
 * Online Calculator: https://www.weather.gov/epz/wxcalc_heatindex
 * Formula: https://www.weather.gov/media/epz/wxcalc/heatIndex.pdf
 * @param t temperature in fahrenheit >= 80
 * @param rh relative humidity 0-100%
 * @returns heat index in fahrenheit
 */
export const getHeatIndex = (t: number, rh: number) => {
  if (t < 80) {
    throw new Error('t must be >= 80');
  }
  if (rh < 0 || rh > 100) {
    throw new Error('rh must be 0-100');
  }
  return (
    -42.379 +
    2.04901523 * t +
    10.14333127 * rh -
    0.22475541 * t * rh -
    6.83783 * 10 ** -3 * t ** 2 -
    5.481717 * 10 ** -2 * rh ** 2 +
    1.22874 * 10 ** -3 * t ** 2 * rh +
    8.5282 * 10 ** -4 * t * rh ** 2 -
    1.99 * 10 ** -6 * t ** 2 * rh ** 2
  );
};
