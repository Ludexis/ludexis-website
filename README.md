<p align="center">
  <img src="public/brand/shield.png" width="96" alt="Ludexis">
</p>

<h1 align="center">Ludexis website</h1>

<p align="center">The homepage and documentation for <a href="https://github.com/Ludexis/Ludexis">Ludexis</a>, the self-hosted catalogue for game archives.</p>

Built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build). The homepage is `src/pages/index.astro`; every documentation page is a Markdown file under `src/content/docs/docs/`, and the sidebar is set in `astro.config.mjs`.

## Working on it

Requires Node.js 22.

```bash
npm install
npm run dev        # http://localhost:4321
npx astro check    # type check
npm run build      # static site in dist/
```

Diagrams are written as ` ```mermaid ` code blocks and drawn in the browser, in the current theme.

## Image

Every push to `main` publishes `ghcr.io/ludexis/ludexis-website` for amd64 and arm64: the built site served by Caddy on port 80.

```yaml
services:
  website:
    image: ghcr.io/ludexis/ludexis-website:latest
    restart: unless-stopped
    ports:
      - "127.0.0.1:8421:80"
    environment:
      # Optional: links to app pages (/library, /admin, /api, ...) are redirected here.
      APP_URL: https://ludexis.example.com
```

## Licence

MIT, as Ludexis itself.
