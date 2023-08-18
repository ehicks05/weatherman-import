import axios from 'axios';
import { configureHttp } from '../../utils/configure-http';

configureHttp();

const BASE_URL =
  'https://https://www.ncei.noaa.gov/data/global-summary-of-the-day/archive/';
const PARAMS = {};
const noaa = axios.create({ baseURL: BASE_URL, params: PARAMS });

export default noaa;
