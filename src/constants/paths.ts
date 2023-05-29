const PATHS = {
  LOGIN: "/signin",
  LOGOUT: "/signout",
  HOME: "/",
  CATEGORY: {
    CREATE: "/category/create",
    EDIT: "/category/edit",
    REMOVE: "/category/remove",
  },
  LINK: {
    CREATE: "/link/create",
    EDIT: "/link/edit",
    REMOVE: "/link/remove",
  },
  API: {
    CATEGORY: {
      CREATE: "/api/category/create",
      EDIT: "/api/category/edit",
      REMOVE: "/api/category/remove",
    },
    LINK: {
      CREATE: "/api/link/create",
      EDIT: "/api/link/edit",
      REMOVE: "/api/link/remove",
    },
  },
  NOT_FOUND: "/404",
  SERVER_ERROR: "/505",
};

export default PATHS;
