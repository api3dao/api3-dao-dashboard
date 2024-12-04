import { BigNumber } from 'ethers';

export const blockTimestampToDate = (timestamp: BigNumber) => new Date(timestamp.mul(1000).toNumber());

const ONE_MINUTE_AS_MS = 1000 * 60;
const ONE_HOUR_AS_MS = ONE_MINUTE_AS_MS * 60;
const ONE_DAY_AS_MS = ONE_HOUR_AS_MS * 24;

export const getDays = (distance: number) => {
  return Math.floor(distance / ONE_DAY_AS_MS)
    .toString()
    .padStart(2, '0');
};

export const getHours = (distance: number) => {
  return Math.floor((distance % ONE_DAY_AS_MS) / ONE_HOUR_AS_MS)
    .toString()
    .padStart(2, '0');
};

export const getMinutes = (distance: number) => {
  return Math.floor((distance % ONE_HOUR_AS_MS) / ONE_MINUTE_AS_MS)
    .toString()
    .padStart(2, '0');
};

export const getSeconds = (distance: number) => {
  return Math.floor((distance % ONE_MINUTE_AS_MS) / 1000)
    .toString()
    .padStart(2, '0');
};

// If the user is not logged in, we want to display dash in the number fields
export const UNKNOWN_NUMBER = '-';

export const filterAlphanumerical = (value: string) => value.replace(/[^0-9a-zA-Z]/g, '');
