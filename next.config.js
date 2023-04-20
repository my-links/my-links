/** @type {import('next').NextConfig} */
const config = {
	webpack(config) {
		config.module.rules.push({
			test: /\.svg$/,
			use: ["@svgr/webpack"],
		});

		return config;
	},
	images: {
		domains: ["localhost", "t3.gstatic.com", "lh3.googleusercontent.com"],
		formats: ["image/webp"],
	},
};

module.exports = config;
