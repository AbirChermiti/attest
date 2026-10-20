# Attest

Credentials that carry their credit value — PDH, PDU, CEU and academic credit — with one learner record that counts toward licenses, schools and certifications.

This repository is the public preview site, built as plain static files so it runs on GitHub Pages with no build step.

| Page | What it is |
| --- | --- |
| `index.html` | Landing page: how it works, issuers/learners/receivers, features, pricing |
| `signup.html` | Sign up (issuer, learner or school/board) and log in |
| `app/` | Issuer app: programs, credit translator, issuing (single and CSV), certificates, badges, LinkedIn sharing, learner records, license tracking, the AI agent |
| `learner/` | Learner record: claim issued credentials, add outside certificates and credits, Attest verification checks, points and micro-credentials, career advice and courses (PMI, LinkedIn Learning, Coursera), AI career coach |
| `review.html` | Internal Attest verification queue: approve or reject submissions the automatic checks couldn't confirm |
| `verify.html` | Public verification by credential ID (`verify.html#CRT-XXXX-XXXX`) |
| `assets/` | Shared styles, icon and the browser data store |

## Preview limits

This is a front-end preview; the backend in the technical design is not built yet.

- **Accounts and data live in the visitor's browser** (localStorage). Nothing is shared between devices, and clearing site data removes it.
- **Verification** finds the example credentials and anything issued from the same browser. Public cross-device verification needs the backend.
- **Learner verification** runs Attest's automatic checks in the browser (issuer, link on the issuer's own site, dates, credit, duplicates). With the backend, links are fetched and confirmed with the issuer.
- **Email delivery** sends through EmailJS from the browser once it's connected in the issuer app's Settings (setup: [`emails/README.md`](emails/README.md)). Without it, each credential offers a pre-filled draft in your own mail app.
- **The agent** and the **career coach** work only after you paste your own Claude API key in **Settings**. The key stays in your browser and requests go directly to Anthropic, billed to that key. Don't use a shared or production key on a public computer.
- Credit rules follow the common NCEES-style PDH model and PMI's CCR categories. Boards differ; confirm before advertising credits.

## Deploy on GitHub Pages

1. Push these files to the `main` branch of a public repository.
2. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`, **Save**.
3. After a minute the site is live at `https://<your-username>.github.io/<repo-name>/`.

The empty `.nojekyll` file tells Pages to serve the files as they are.

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Placeholders to fill in

`$[PRICE]`, `[NUMBER]` and `[CONTACT EMAIL]` in `index.html`.
