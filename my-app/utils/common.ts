import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function chunks<T>(array: T[], size: number): T[][] {
  return Array.apply(0, new Array(Math.ceil(array.length / size))).map(
    (_, index) => array.slice(index * size, (index + 1) * size)
  );
}

export function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const isAlphanumeric = (value: string) => /^[a-zA-Z0-9_]*$/.test(value);

// export function getToken(slice: number) {
//   const pathName = usePathname();
//   const tok = JSON.stringify(pathName);
//   const mintToken = tok.slice(slice, tok.length - 1);
//   return mintToken
// }

export function convertMinutesToSeconds(minutes: number): number {
  return minutes * 60;
}

export function convertToDate(date: string) {
  const dateString = date;
  const reaDate = new Date(dateString);
  return reaDate;
}
