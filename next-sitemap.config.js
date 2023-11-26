/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXTAUTH_URL || 'https://www.mylinks.app',
  generateRobotsTxt: true,
  output: "standalone",
  exclude: ['/link/*', '/category/*']
};
