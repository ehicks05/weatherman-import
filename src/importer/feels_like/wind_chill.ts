const knotsToMph = (knots: number) => 1.1507794 * knots;

/**
 * Online Calculator: https://www.weather.gov/epz/wxcalc_windchill
 * Formula: https://www.weather.gov/media/epz/wxcalc/windChill.pdf
 * @param t temperature in fahrenheit <= 50
 * @param knots wind speed in knots
 * @returns heat index in fahrenheit
 */
export const getWindChill = (t: number, knots: number) => {
  const mph = knotsToMph(knots);
  if (t > 50) {
    throw new Error('T must be <= 50');
  }
  if (mph < 3) {
    throw new Error('w must be >= 3');
  }
  return 35.74 + 0.6215 * t - 35.75 * mph ** 0.16 + 0.4275 * t * mph ** 0.16;
};

console.log(getWindChill(50, 3));
console.log(getWindChill(50, 6));
console.log(getWindChill(50, 9));
console.log(getWindChill(50, 12));
console.log(getWindChill(50, 15));

console.log(getWindChill(30, 3));
console.log(getWindChill(30, 6));
console.log(getWindChill(30, 9));
console.log(getWindChill(30, 12));
console.log(getWindChill(30, 15));
