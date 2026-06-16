# CMS authentication setup (GitHub OAuth + Cloudflare Worker)

How to stand up login for the Sveltia CMS admin at `/admin/`. Sveltia uses the
GitHub backend with OAuth, brokered by a small self-hosted Cloudflare Worker
(`sveltia-cms-auth`, free tier). There is no email/password path.

These steps are done once, out of band, by the owner/developer. They are
recorded here so the setup is repeatable.

Key facts for this project:

- Repo: `by-maria-delia/by-maria-delia.github.io`
- Live site host: `by-maria-delia.github.io`
- Admin URL: `https://by-maria-delia.github.io/admin/`
- Staging branch (where CMS commits land and what auto-deploys to the
  Netlify preview URL): `preview`
- Production branch (what triggers the live GitHub Pages deploy when promoted
  from `preview`): `main`

---

## Step 1: Create a GitHub OAuth App

1. Go to <https://github.com/settings/applications/new> (or an org-owned OAuth
   App under the `by-maria-delia` org settings if you prefer org ownership).
2. Fill in:
   - **Application name:** `Maria Delia CMS`
   - **Homepage URL:** `https://by-maria-delia.github.io/`
   - **Authorization callback URL:** `https://<WORKER_URL>/callback`
     (you get `<WORKER_URL>` in Step 2; you can edit it back in afterwards).
3. Register, then copy the **Client ID** and generate a **Client Secret**.
   Keep the secret safe; it is shown only once.

## Step 2: Deploy the sveltia-cms-auth Cloudflare Worker

The Worker source and deploy button live at
<https://github.com/sveltia/sveltia-cms-auth>.

- **Easiest:** click the "Deploy to Cloudflare" button on that page and follow
  the dashboard flow. A free Cloudflare account is enough.
- **Or via CLI:** clone the repo and run `wrangler deploy`.

After deploying, note the Worker URL from the Cloudflare dashboard. It looks like
`https://sveltia-cms-auth.<your-subdomain>.workers.dev`. Go back to the GitHub
OAuth App (Step 1) and set the **Authorization callback URL** to
`https://sveltia-cms-auth.<your-subdomain>.workers.dev/callback`.

## Step 3: Configure the Worker's environment variables

In the Cloudflare dashboard, open the Worker, then **Settings > Variables**, and
add:

| Variable | Value |
|---|---|
| `GITHUB_CLIENT_ID` | Client ID from Step 1 |
| `GITHUB_CLIENT_SECRET` | Client Secret from Step 1 (click **Encrypt**) |
| `ALLOWED_DOMAINS` | `by-maria-delia.github.io` |

`ALLOWED_DOMAINS` restricts which sites may use this Worker to authenticate.
Add a comma-separated entry (e.g. `localhost`) only if you also want to test the
CMS from a local dev server.

## Step 4: Wire the CMS config to the Worker

In `public/admin/config.yml`, set the backend `base_url` to the Worker origin
(no trailing slash, no `/callback`):

```yaml
backend:
  name: github
  repo: by-maria-delia/by-maria-delia.github.io
  branch: preview
  base_url: https://sveltia-cms-auth.<your-subdomain>.workers.dev
```

Commit and push to `main` so the change deploys to the live `/admin/`.

## Step 5: Grant the Editor write access

The Editor logs in with her own GitHub account, so it needs write access to the
repo (Sveltia commits content on her behalf).

1. Repo **Settings > Collaborators and teams**.
2. Invite the Editor's GitHub account with the **Write** role.
3. The Editor accepts the invite from her GitHub notifications/email.

## Step 6: Verify the end-to-end loop

1. The Editor opens `https://by-maria-delia.github.io/admin/`.
2. Click **Sign in with GitHub** and authorize. The Worker brokers the OAuth
   handshake and returns to the admin, now logged in.
3. Make a small content edit (e.g. toggle a guardapolvo's **Disponible**, or fix
   a caption) and **Publish**.
4. Confirm a commit appears on the `preview` branch (NOT `main`). Netlify
   redeploys the staging URL within roughly 1 minute. The in-admin banner
   shows "Cambios guardados en vista previa" with a link to the preview.
5. Review the change on the staging URL. When satisfied, click
   **Publicar a produccion** in the admin. That triggers the `promote.yml`
   workflow, which fast-forwards `main` to `preview`. The standard production
   deploy workflow then runs on `main` and updates the live site.

## Como publicar (resumen para la editora, en espanol)

1. Entra a `https://by-maria-delia.github.io/admin/` con tu cuenta de GitHub.
2. Edita y guarda como siempre. Tus cambios NO van directo al sitio en vivo;
   primero van a una **vista previa** en
   `https://maria-delia-preview.netlify.app/`.
3. El banner amarillo te avisa cuando la vista previa esta lista (suele tardar
   un minuto). Revisala con calma.
4. Cuando este todo bien, pulsa **Publicar a produccion** (boton verde, arriba
   a la derecha). El boton muestra cuantos cambios faltan publicar.
5. Confirma. El banner pasa a "Publicando a produccion..." y, cuando termina,
   te avisa "Publicado en produccion" con el enlace al sitio en vivo.

Si algo falla, el banner avisa con un mensaje en rojo. En ese caso, vuelve a
intentar; si persiste, avisa al equipo.

---

## Testing locally before pushing to `main`

You do not need the migration merged into `main` to try the CMS. Sveltia can edit
your **local** working copy directly (on whatever branch is checked out), with no
OAuth and no commits to GitHub. This uses the browser's File System Access API.

1. Use a Chromium browser (Chrome, Edge, or Brave). Firefox and Safari are not
   supported. On Brave, first enable
   `brave://flags/#file-system-access-api`.
2. Run `yarn dev` and open `http://localhost:5173/admin/`.
3. Click **Work with Local Repository** and select the project root folder
   (`maria-delia`). Grant read/write access.
4. Edit collections normally. Changes are written to your local
   `src/content/*` and `public/media/*` files on the current branch.
5. Commit and push with your normal Git client when you are happy. The CMS does
   not commit in this mode.

This is local-only, so the GitHub OAuth login and the Worker are not exercised
here. The full login + auto-deploy loop (Step 6) is verified once the admin is
live at `https://by-maria-delia.github.io/admin/`.

---

## Troubleshooting

- **Login popup closes with an error / "origin not allowed":** the site host is
  not in the Worker's `ALLOWED_DOMAINS`. Re-check Step 3 (exact host, no scheme,
  no path).
- **Callback 404 / redirect mismatch:** the OAuth App's Authorization callback
  URL must be exactly `https://<WORKER_URL>/callback`. Re-check Step 1/2.
- **Logged in but saves fail:** the GitHub account lacks **Write** access to the
  repo (Step 5), or `base_url`/`repo`/`branch` in `config.yml` is wrong (Step 4).
- **Saves fail with "Could not resolve to a Repository with the name ...":**
  `repo` in `config.yml` must be the repo's **current** name. Sveltia writes via
  the GitHub GraphQL API, which (unlike `git` clone/push and the REST API) does
  not follow a repository rename redirect. If the repo was renamed, update `repo`
  to the canonical `owner/name`.
- **Edit committed but site not updated:** check the deploy workflow run in the
  repo's Actions tab; the push to `main` triggers build + deploy.
