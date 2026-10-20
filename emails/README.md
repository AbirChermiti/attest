# Attest credential emails (EmailJS setup)

Attest sends each recipient an email when a credential is issued: the credential and its credit, a **View and verify** button, an **Add to LinkedIn** button and a **Claim on Attest** link. Because the site is static (GitHub Pages), it sends through [EmailJS](https://www.emailjs.com/), which works straight from the browser. The free plan covers 200 emails a month.

## Setup (about 10 minutes)

1. **Create an EmailJS account** at emailjs.com.
2. **Add an email service** (Email Services → Add New Service). Gmail or Outlook works for a pilot; for volume, use your organization's SMTP or a sending service. Copy the **Service ID**.
3. **Create a template** (Email Templates → Create New Template):
   - **To Email:** `{{to_email}}`
   - **From Name:** `{{from_name}}`
   - **Reply To:** `{{reply_to}}`
   - **Subject:** `{{subject}}`
   - **Content:** switch the editor to code view and paste exactly:

     ```
     {{{message_html}}}
     ```

     The triple braces let Attest's designed email through as HTML. Save, and copy the **Template ID**.
4. **Copy your Public key** (Account → General).
5. **Lock it to your site** (Account → Security): add your site's domain, for example `abirchermiti.github.io`, so nobody can send with your key from elsewhere.
6. In the Attest issuer app, open **Settings → Email delivery**, paste the Service ID, Template ID and Public key, add a reply-to address, click **Save email settings**, then **Send a test email**.

## Variables Attest sends

If you'd rather design the email inside EmailJS, these are available in the template:

| Variable | Example |
| --- | --- |
| `to_name`, `to_email` | Amina Diallo, amina@example.org |
| `from_name`, `reply_to`, `issuer_name` | Example Institute |
| `subject` | Amina, you've earned Applied Machine Learning from Example Institute |
| `credential_name`, `credential_title`, `credential_id` | Applied Machine Learning · Professional Certificate · CRT-7KQ3-9XPM |
| `credits`, `issued_on` | 12 PDH · 1.2 CEU · Sep 30, 2026 |
| `verify_url`, `linkedin_url`, `claim_url` | Links for the three buttons |
| `message` | Plain-text version of the whole email |
| `message_html` | The designed HTML email (use with triple braces) |

## Without EmailJS

Every credential window has **Open draft in my mail app**, which opens a pre-filled email to the recipient in your own mail program.

## Moving to the backend

When Attest moves to its own servers, this switches to a transactional email service (Postmark or Resend) sending from your own domain, with the same content and variables.
