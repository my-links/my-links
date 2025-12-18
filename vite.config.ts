import {
	PRIMARY_COLOR,
	PROJECT_DESCRIPTION,
	PROJECT_NAME,
} from '#config/project';
import { getDirname } from '@adonisjs/core/helpers';
import inertia from '@adonisjs/inertia/client';
import adonisjs from '@adonisjs/vite/client';
import { lingui } from '@lingui/vite-plugin';
import react from '@vitejs/plugin-react';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		react({
			babel: {
				plugins: ['@lingui/babel-plugin-lingui-macro'],
			},
		}),
		lingui(),
		UnoCSS(),
		inertia({ ssr: { enabled: true, entrypoint: 'inertia/app/ssr.tsx' } }),
		adonisjs({
			entrypoints: [`${getDirname(import.meta.url)}/inertia/app/app.tsx`],
			reload: ['resources/views/**/*.edge'],
		}),
		VitePWA({
			registerType: 'autoUpdate',
			injectRegister: false,
			strategies: 'generateSW',
			devOptions: {
				enabled: true,
			},
			manifest: {
				name: PROJECT_NAME,
				short_name: PROJECT_NAME,
				description: PROJECT_DESCRIPTION,
				theme_color: PRIMARY_COLOR,
				background_color: PRIMARY_COLOR,
				scope: '/',
				display: 'standalone',
				orientation: 'portrait',
				icons: [
					{
						src: '/pwa-64x64.png',
						sizes: '64x64',
						type: 'image/png',
					},
					{
						src: '/pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: '/pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any',
					},
					{
						src: '/maskable-icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable',
					},
				],
				launch_handler: {
					client_mode: ['focus-existing', 'auto'],
				},
			},
			workbox: {
				clientsClaim: true,
				skipWaiting: true,
				globPatterns: ['**/*.{js,css,html,png,svg,ico,json,woff2}'],
				globIgnores: ['sw*.js', '**/manifest.webmanifest*'],
				// undefined is required for solving the following error :
				// Uncaught (in promise) non-precached-url: non-precached-url :: [{"url":"/index.html"}]
				// Source : https://github.com/vite-pwa/nuxt/issues/53#issuecomment-1615266204
				navigateFallback: undefined,
				runtimeCaching: [
					{
						urlPattern: /\.(?:js|css|woff2|woff|ttf|eot|otf)$/,
						handler: 'CacheFirst',
						options: {
							cacheName: 'static-assets-cache',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24 * 30,
							},
						},
					},
					{
						urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
						handler: 'CacheFirst',
						options: {
							cacheName: 'images-cache',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24 * 30,
							},
						},
					},
					{
						urlPattern: /\/.*$/,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'html-cache',
							expiration: {
								maxEntries: 20,
								maxAgeSeconds: 60 * 60 * 24 * 7,
							},
						},
					},
				],
			},
		}),
	],

	resolve: {
		alias: {
			'~/': `${getDirname(import.meta.url)}/inertia/`,
			'config-ssr': `${getDirname(import.meta.url)}/config/ssr.ts`,
		},
	},
});
