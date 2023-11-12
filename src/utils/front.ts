import { VALID_URL_REGEX } from "constants/url";

export function IsValidURL(url: string): boolean {
  const regex = new RegExp(VALID_URL_REGEX);
  return !!url.match(regex);
}
