# Dynatrace Observability Footprint App

> Your entire observability footprint in one pane of glass.

A [Dynatrace App](https://developer.dynatrace.com/) that auto-discovers and visualizes the full scope of what Dynatrace is monitoring in an environment — entity counts, ingested data volumes, and reliability metrics — as a polished, executive-ready overview. Built with the Dynatrace App Toolkit (`dt-app`) on **AppEngine**, using **React**, **TypeScript**, and the **Strato Design System**.

## Features

- **Footprint overview (Home)** — live tiles for monitored entities (hosts, processes, containers, Kubernetes clusters/nodes/workloads/namespaces, services, web & mobile apps, databases, queues, Lambda functions, synthetic tests, custom devices, and more), data volumes (logs, traces, metrics), and reliability signals such as MTTR.
- **Architecture view** — a tiered breakdown of the observed technology stack across runtimes and cloud platforms.
- **Data view** — a closer look at ingested data sources and volumes.
- **Light & dark themes** with an animated, gradient-driven visual design.

All figures are queried live from **Grail** via **DQL** using the `useDql` React hook — no data is stored by the app.

## Security & configuration

This repository contains **no environment URLs, API keys, or tokens**. The app targets a Dynatrace environment through a local config file that is **git-ignored**.

1. Copy the example config:
   ```bash
   cp app.config.example.json app.config.json
   ```
2. Set your environment URL in `app.config.json`:
   ```json
   "environmentUrl": "https://your-environment.apps.dynatrace.com/"
   ```

> `app.config.json` is listed in `.gitignore` to prevent accidental exposure of environment URLs. Never commit it. When changing the environment, also update the `url` in `.vscode/launch.json` if you use the bundled debug configuration.

### Required scopes

The app requests read-only Grail scopes (declared in `app.config.example.json`):

| Scope | Purpose |
| --- | --- |
| `storage:entities:read` | Smartscape entity counts |
| `storage:spans:read` | Daily trace volume sampling |
| `storage:logs:read` | Log queries |
| `storage:metrics:read` | Self-monitoring log-ingest metrics |
| `storage:buckets:read` | Log retention bucket stats |
| `storage:events:read` | Davis problems for MTTR |
| `storage:system:read` | System buckets and data objects |

## Getting started

Requires [Node.js](https://nodejs.org/) and access to a Dynatrace environment.

```bash
npm install
cp app.config.example.json app.config.json   # then set your environmentUrl
npm run start
```

## Available scripts

| Command | Description |
| --- | --- |
| `npm run start` | Run the app in development mode with hot reload; opens a browser automatically. |
| `npm run build` | Build for production into `dist/`. |
| `npm run deploy` | Build and deploy to the environment in `app.config.json`. |
| `npm run uninstall` | Uninstall the app from the configured environment. |
| `npm run generate:function` | Scaffold a new serverless function in `api/`. |
| `npm run update` | Update `@dynatrace`-scoped packages and apply migrations. |
| `npm run info` | Print CLI and environment information. |
| `npm run help` | Print Dynatrace App Toolkit help. |

## Project structure

```
ui/
  app/
    App.tsx              Routes: Home, Architecture, Data
    pages/               Home, Architecture, Data views
    components/          Tiles, cards, icons, header, visual effects
    hooks/               useFootprintData, useArchitectureData (DQL queries)
    theme/               Palette, tier colors, theme provider
  assets/                Logos and imagery
app.config.example.json  Template app config (copy to app.config.json)
AGENTS.md                Architecture & conventions for AI coding agents
```

## Tech stack

- **React + TypeScript** UI
- **Strato Design System** (`@dynatrace/strato-components`, `-preview`, `-design-tokens`, `-icons`)
- **Dynatrace SDK** (`@dynatrace-sdk/react-hooks`, `@dynatrace-sdk/client-query`, `@dynatrace-sdk/app-environment`)
- **Dynatrace App Toolkit** (`dt-app`)

## Learn more

- [Dynatrace Developer](https://dt-url.net/developers)
- [Dynatrace Query Language (DQL)](https://docs.dynatrace.com/docs/discover-dynatrace/references/dynatrace-query-language)
- [React documentation](https://react.dev/)

## License

Licensed under the terms in [LICENSE](LICENSE).
