export const CSR_ROUTES = ['dashboard', 'admin/dashboard'];
export const isSSREnableForPage = (page: string) => !CSR_ROUTES.includes(page);
