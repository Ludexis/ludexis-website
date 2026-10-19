// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

const repo = 'https://github.com/Ludexis/Ludexis';

export default defineConfig({
	site: 'https://ludexis.rupa.dev',
	integrations: [
		// Must come before Starlight so ```mermaid blocks are turned into diagrams first.
		mermaid({ autoTheme: true }),
		starlight({
			title: 'Ludexis',
			description: 'A self-hosted catalogue for your game archives.',
			logo: { src: './src/assets/shield.png', alt: 'Ludexis' },
			favicon: '/icon.png',
			head: [
				{ tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-icon.png' } },
				{ tag: 'meta', attrs: { property: 'og:image', content: 'https://ludexis.rupa.dev/brand/og.png' } },
			],
			social: [{ icon: 'github', label: 'GitHub', href: repo }],
			editLink: { baseUrl: 'https://github.com/Ludexis/ludexis-website/edit/main/' },
			customCss: [
				'@fontsource/cinzel/600.css',
				'@fontsource/cinzel/700.css',
				'@fontsource/hanken-grotesk/400.css',
				'@fontsource/hanken-grotesk/500.css',
				'@fontsource/hanken-grotesk/600.css',
				'@fontsource/jetbrains-mono/400.css',
				'./src/styles/tokens.css',
				'./src/styles/docs.css',
			],
			expressiveCode: {
				themes: ['github-dark-default', 'github-light-default'],
				styleOverrides: { borderRadius: '0.5rem', codeFontFamily: "'JetBrains Mono', ui-monospace, monospace" },
				shiki: { langAlias: { env: 'dotenv' } },
			},
			sidebar: [
				{ label: 'Introduction', slug: 'docs/introduction' },
				{
					label: 'Getting started',
					items: [
						{ label: 'Quick start', slug: 'docs/start/quick-start' },
						{ label: 'Configuration', slug: 'docs/start/configuration' },
						{ label: 'First sign-in and setup', slug: 'docs/start/first-run' },
						{ label: 'Updating and backups', slug: 'docs/start/updating' },
					],
				},
				{
					label: 'Using Ludexis',
					items: [
						{ label: 'Libraries and scans', slug: 'docs/using/libraries' },
						{ label: 'Metadata and Identify', slug: 'docs/using/metadata' },
						{ label: 'Artwork', slug: 'docs/using/artwork' },
						{ label: 'Versions, collections and franchises', slug: 'docs/using/organising' },
						{ label: 'Users, roles and access', slug: 'docs/using/users' },
						{ label: 'Jobs and schedules', slug: 'docs/using/jobs' },
						{ label: 'Monitoring', slug: 'docs/using/monitoring' },
					],
				},
				{
					label: 'Edge devices',
					items: [
						{ label: 'Overview', slug: 'docs/edge/overview' },
						{ label: 'Windows', slug: 'docs/edge/windows' },
						{ label: 'Linux', slug: 'docs/edge/linux' },
						{ label: 'The ludexis-edge command', slug: 'docs/edge/commands' },
						{ label: 'How edge scans work', slug: 'docs/edge/scans' },
						{ label: 'Troubleshooting', slug: 'docs/edge/troubleshooting' },
					],
				},
				{
					label: 'Advanced',
					items: [
						{ label: 'Domains, TLS and proxies', slug: 'docs/advanced/domains' },
						{ label: 'Extra metadata sources', slug: 'docs/advanced/providers' },
						{ label: 'API and integrations', slug: 'docs/advanced/api' },
						{ label: 'Command-line tools', slug: 'docs/advanced/cli' },
					],
				},
				{
					label: 'Architecture',
					items: [
						{ label: 'Overview', slug: 'docs/architecture/overview' },
						{ label: 'Data model', slug: 'docs/architecture/data-model' },
						{ label: 'Scan pipeline', slug: 'docs/architecture/scan-pipeline' },
						{ label: 'Metadata matching', slug: 'docs/architecture/metadata' },
						{ label: 'Edge scans', slug: 'docs/architecture/edge-scan' },
						{ label: 'Jobs and workers', slug: 'docs/architecture/jobs' },
					],
				},
				{
					label: 'Contributing',
					items: [
						{ label: 'Repositories and setup', slug: 'docs/contributing/setup' },
						{ label: 'Backend', slug: 'docs/contributing/backend' },
						{ label: 'Frontend', slug: 'docs/contributing/frontend' },
						{ label: 'Tests and CI', slug: 'docs/contributing/testing' },
						{ label: 'Commits and pull requests', slug: 'docs/contributing/commits' },
						{ label: 'Releases', slug: 'docs/contributing/releases' },
					],
				},
			],
		}),
	],
});
