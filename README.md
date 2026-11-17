# MConnect Web

Vue 3 + TypeScript + Tailwind CSS v4 web app for MConnect: a client board, a unified inbox, and wizards for sending template emails, adding clients and planning meetings. The UI follows the **Desktop - MConnect** page of the Figma file.

## Getting started

```bash
bun install
cp .env.example .env   # optional: the Setup screen collects the rest
bun run dev            # http://localhost:5173, proxies /api -> VITE_MCONNECT_WEB_API_URL
```

Run the MConnect API (`code-connect`, Nitro) first; it listens on port 3001 by default.

## Scripts

| Script              | What it does                     |
| ------------------- | -------------------------------- |
| `bun run dev`       | Vite+ dev server                 |
| `bun run build`     | Production build into `dist/`    |
| `bun run lint`      | oxlint (type-aware) with autofix |
| `bun run format`    | oxfmt on `src/`                  |
| `bun run test:unit` | vitest (jsdom)                   |

## Configuration

| Variable                     | Purpose                                                                                       |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| `VITE_MCONNECT_WEB_SITE_URL` | Public URL of this app. Docker build arg `SITE_URL`.                                          |
| `VITE_MCONNECT_WEB_API_URL`  | MConnect API origin. Dev: target of the `/api` proxy. Production: the API origin (`API_URL`). |
| `ORGANIZATION_ID`            | Organization slug, sent as `x-org-id`.                                                        |
| `VITE_MCONNECT_WEB_USER_ID`  | Acting user's Notion page id, sent as `x-user-id`.                                            |
| `VITE_MCONNECT_WEB_API_KEY`  | Sent as `x-api-key`. Dev reads it from `.env`; in production set it on the running container. |

The API needs all three of `x-api-key`, `x-org-id` and `x-user-id` on every request. If any is
missing, the app opens the **Setup** screen (`/setup`), checks the details against the API, and keeps
them in this browser's local storage. Values supplied by the container (`config.js`) win over saved
ones.

In Docker the same variables are written to `config.js` when the container starts.

## API usage

| Screen              | Endpoint                                                                                                                   |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| New email           | `GET /api/interaction/email/template`, `GET …/template/:id`, `POST …/template/preview`, `POST /api/interaction/email/send` |
| Inbox               | `GET /api/interaction`, `GET /api/interaction/email/:id/telemetry`                                                         |
| Onboarding          | `GET/POST /api/email/accounts[/imap]`, `GET …/oauth/:provider/start`, `DELETE …/accounts/:id`                              |
| Clients, New client | `GET /api/contacts`, `PUT /api/contacts`                                                                                   |

Not backed by the API yet: meetings and calls (the meeting wizard produces copyable invite text), the Meet and Calls inbox filters, onboarding connections, deal values, and CSV import.

The Notion `Status` of a contact decides its board column (see `src/domain/crm.ts`).

## License

Published under the [MIT](LICENSE) license.