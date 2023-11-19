import nProgress from "nprogress";
import { i18n } from "next-i18next";

export async function makeRequest({
  method = "GET",
  url,
  body,
}: {
  method?: RequestInit["method"];
  url: string;
  body?: object | any[];
}): Promise<any> {
  nProgress.start();
  const request = await fetch(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      "Content-Type": "application/json",
    },
  });
  nProgress.done();

  const data = await request.json();
  return request.ok
    ? data
    : Promise.reject(data?.error || i18n.t("common:generic-error"));
}
