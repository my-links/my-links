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
      errorText = responseError || "Une erreur est survenue";
    } else if (error.request) {
      errorText = "Aucune donnée renvoyée par le serveur";
    } else {
      errorText = "Une erreur inconnue est survenue";
    }
  } else {
    errorText = "Une erreur est survenue";
  }

  console.error(error);
  return errorText;
}
