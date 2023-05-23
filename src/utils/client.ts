import { NextRouter } from "next/router";

export function redirectWithoutClientCache(router: NextRouter, url: string) {
  router.push(url, undefined, {
    unstable_skipClientCache: true,
  });
  // FIXME: invalidate catch instead of weird hack
}
