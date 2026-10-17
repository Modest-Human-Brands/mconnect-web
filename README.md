# MConnect Web

Vue 3 + TypeScript + Tailwind CSS v4 web app for MConnect: a client board, a unified inbox, and wizards for sending template emails, adding clients and planning meetings. The UI follows the **Desktop - MConnect** page of the Figma file.

## Getting started

```bash
bun install
cp .env.example .env   # then fill in VITE_DEFAULT_ORGANIZATION_ID
bun run dev            # http://localhost:5173, proxies /api -> VITE_MCONNECT_API_URL
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

| Variable                       | Purpose                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `VITE_PUBLIC_SITE_URL`         | Public URL of this app. Docker build arg `SITE_URL`.                                                                |
| `VITE_MCONNECT_API_URL`        | MConnect API origin. In development it is the target of the `/api` proxy; in production the API origin (`API_URL`). |
| `VITE_DEFAULT_ORGANIZATION_ID` | Sent as the `x-org-id` header. Required to list and send emails.                                                    |
| `VITE_MCONNECT_USER_ID`        | Notion id of the sending team member (optional).                                                                    |

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