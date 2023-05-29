import PATHS from "constants/paths";

export { default } from "next-auth/middleware";

// WAIT: for fix - Next.js@13.4.4 seems to be broken
// cf: https://github.com/nextauthjs/next-auth/issues/7650
// (this file must renamed "middleware.ts")

export const config = {
  matcher: [
    PATHS.HOME,

    PATHS.LINK.CREATE,
    PATHS.LINK.EDIT,
    PATHS.LINK.REMOVE,

    PATHS.CATEGORY.CREATE,
    PATHS.CATEGORY.EDIT,
    PATHS.CATEGORY.REMOVE,

    PATHS.API.CATEGORY.CREATE,
    PATHS.API.CATEGORY.EDIT,
    PATHS.API.CATEGORY.REMOVE,

    PATHS.API.LINK.CREATE,
    PATHS.API.LINK.EDIT,
    PATHS.API.LINK.REMOVE,
  ],
};
