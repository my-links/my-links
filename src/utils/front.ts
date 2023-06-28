import axios from "axios";
import { VALID_URL_REGEX } from "constants/url";

export function IsValidURL(url: string): boolean {
  const regex = new RegExp(VALID_URL_REGEX);
  return url.match(regex) ? true : false;
}

export function HandleAxiosError(error): string {
  let errorText: string;

  if (axios.isAxiosError(error)) {
    if (error.response) {
      const responseError =
        error.response.data?.["error"] || error.response.data;
      errorText = responseError || "An error has occured";
    } else if (error.request) {
      errorText = "No data returned from the server";
    } else {
      errorText = "Something went wrong";
    }
  } else {
    errorText = "An error has occured";
  }

  console.error(error);
  return errorText;
}
