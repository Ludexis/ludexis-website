---
title: Domains, TLS and proxies
description: Serve Ludexis over HTTPS with its own Caddy proxy, or behind another reverse proxy or a tunnel.
---

Every request reaches Ludexis through the `proxy` service, a Caddy server configured by `deploy/Caddyfile`. It serves the whole app on one address:

| Path | Goes to |
| --- | --- |
| `/api/metrics` | Nowhere: answered with 404, so the metrics stay inside the stack |
| `/api/*`, `/media/*`, `/healthz` | The backend |
| Everything else | The web app |

The web app calls the API at the relative paths `/api` and `/media`, so it works under any host name without being rebuilt. It does expect to be served at the root of that host name, so give Ludexis its own domain or subdomain rather than a sub-path.

## Plain HTTP on a home network

By default `LUDEXIS_DOMAIN` is empty and the proxy serves plain HTTP on `LUDEXIS_PORT`, `8420` unless changed. On a home network, `http://<host>:8420` is fine.

## HTTPS with the built-in proxy

Before exposing Ludexis to the internet, give it a domain name and let Caddy handle the certificate.

1. Point a DNS record for the domain, such as `ludexis.example.com`, at the host.
2. Make ports 80 and 443 of the host reachable from the internet, so the certificate authority can reach Caddy.
3. Set in `.env`:

   ```env title=".env"
   LUDEXIS_DOMAIN=ludexis.example.com
   LUDEXIS_PORT=80
   LUDEXIS_HTTPS_PORT=443
   ```

4. Run `docker compose up -d`.

Caddy obtains a certificate, renews it on its own, and redirects HTTP to HTTPS. The certificates are kept in the `caddy_data` volume, so they survive restarts and updates. Over HTTPS, the session cookies are marked `Secure`.

## Behind another reverse proxy

If the host already runs a reverse proxy that handles TLS, leave `LUDEXIS_DOMAIN` empty and point that proxy at Ludexis's plain HTTP port:

```env title=".env"
LUDEXIS_DOMAIN=
LUDEXIS_PORT=8420
```

Then forward the whole host name, every path, to `http://<host>:8420`. Pick another `LUDEXIS_PORT` if 8420 is taken.

:::note
`LUDEXIS_HTTPS_PORT` is published even when it is unused. If port 8443 is taken on the host, set it to a free port.
:::

## Behind a tunnel

A tunnel service that forwards a public host name to a service on your network works the same way: leave `LUDEXIS_DOMAIN` empty and point the tunnel at `http://<host>:8420`, or at `http://proxy:80` if the tunnel's connector runs in the same Docker network as the stack. The host needs no open ports.

## Edge devices and the server address

An [edge device](/docs/edge/overview/) reports to the address in `LUDEXIS_SERVER_URL` in its `.env`. The install files take it from the address you had open in the browser when you downloaded them. Download them from the address the device should use, such as `https://ludexis.example.com`, or correct `LUDEXIS_SERVER_URL` on the device afterwards and run `ludexis-edge restart`.

## Serving the web app from another origin

The API accepts browser requests from other origins only when they are listed in `CORS_ORIGINS`. With the bundled proxy the web app and the API share one origin, so this is only needed for a custom setup that serves them separately. See [Configuration](/docs/start/configuration/#sign-in-and-security).
