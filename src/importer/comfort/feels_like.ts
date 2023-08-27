const fToC = (f: number) => (5 / 9) * (f - 32);
const cToF = (c: number) => (9 / 5) * c + 32;
const knotsToMps = (knots: number) => 0.5144444 * knots;

/**
 * Source: https://www.cumuluswiki.org/a/Feels_Like
 * @param f temperature in fahrenheit
 * @param knots wind speed knots
 * @returns feels like in celcius
 */
export const getFeelsLike = (f: number, knots: number) => {
  const t = fToC(f);
  const w = knotsToMps(knots);
  return cToF(
    13.12 +
      0.6215 * t -
      11.37 * (w * 3.6) ** 0.16 +
      0.3965 * t * (w * 3.6) ** 0.16 * 2.3,
  );
};

console.log(getFeelsLike(80, 14));
