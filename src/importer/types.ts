/**
 * Row format from noaa
 */
export interface DaySummaryRow {
  STATION: string;
  DATE: string;
  LATITUDE: string;
  LONGITUDE: string;
  ELEVATION: string;
  NAME: string;
  TEMP: string;
  TEMP_ATTRIBUTES: string;
  DEWP: string;
  DEWP_ATTRIBUTES: string;
  SLP: string;
  SLP_ATTRIBUTES: string;
  STP: string;
  STP_ATTRIBUTES: string;
  VISIB: string;
  VISIB_ATTRIBUTES: string;
  WDSP: string;
  WDSP_ATTRIBUTES: string;
  MXSPD: string;
  GUST: string;
  MAX: string;
  MAX_ATTRIBUTES: string;
  MIN: string;
  MIN_ATTRIBUTES: string;
  PRCP: string;
  PRCP_ATTRIBUTES: string;
  SNDP: string;
  FRSHTT: string;
}
