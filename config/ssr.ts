export const CSR_ROUTES = ['dashboard', 'new_dashboard'];
export const isSSREnableForPage = (page: string) => !CSR_ROUTES.includes(page);
