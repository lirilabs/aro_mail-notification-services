import nodemailer from "nodemailer";

/* ─────────────────────────────────────────
   CONFIG
───────────────────────────────────────── */
const LOGO_URL   = "https://yourdomain.com/images/logo.jpg";
const BRAND_NAME = "Aro";

/* ─────────────────────────────────────────
   SMTP TRANSPORT  (lazy singleton)
───────────────────────────────────────── */
let _transporter = null;

const getTransporter = () => {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    pool: true,          // reuse connections
    maxConnections: 5,
  });

  return _transporter;
};

/* ─────────────────────────────────────────
   BASE SHELL  (shared wrapper for all mails)
───────────────────────────────────────── */
const shell = (body) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${BRAND_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:16px;border:1px solid #1f1f1f;overflow:hidden;">

          <!-- HEADER -->
          <tr>
            <td style="padding:32px 40px 0;text-align:center;">
              <img src="${LOGO_URL}" width="48" height="48"
                   style="border-radius:12px;display:block;margin:0 auto 24px;" alt="${BRAND_NAME}" />
            </td>
          </tr>

          <!-- BODY -->
          ${body}

          <!-- FOOTER -->
          <tr>
            <td style="padding:24px 40px 32px;text-align:center;border-top:1px solid #1f1f1f;">
              <p style="margin:0;font-size:12px;color:#3a3a3a;letter-spacing:0.04em;">
                © ${new Date().getFullYear()} ${BRAND_NAME} · All rights reserved
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

/* ─────────────────────────────────────────
   TEMPLATE REGISTRY
───────────────────────────────────────── */
const TEMPLATES = {

  /* ── 1 · SELLER WELCOME ─────────────── */
  "1": ({ username }) => ({
    subject: `Welcome to ${BRAND_NAME} Seller`,
    html: shell(`
      <tr>
        <td style="padding:32px 40px 40px;text-align:center;">

          <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">
            You're in, ${escHtml(username)} 🚀
          </h1>

          <p style="margin:12px 0 32px;font-size:15px;color:#6b6b6b;line-height:1.65;">
            Your seller account is live and ready to go.<br/>
            Start listing products and managing orders right now.
          </p>

          <a href="https://yourdomain.com/seller/dashboard"
             style="display:inline-block;padding:13px 32px;background:#ffffff;color:#0a0a0a;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;letter-spacing:0.01em;">
            Open Dashboard
          </a>

          <div style="margin-top:36px;padding:20px;background:#161616;border-radius:10px;border:1px solid #1f1f1f;text-align:left;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#3d3d3d;letter-spacing:0.08em;text-transform:uppercase;">
              What's next
            </p>
            <p style="margin:0;font-size:14px;color:#8a8a8a;line-height:1.6;">
              Add your first product, set up payouts, and explore analytics — everything is waiting for you in the seller dashboard.
            </p>
          </div>

        </td>
      </tr>
    `),
  }),

  /* ── 2 · LOGIN ALERT ────────────────── */
  "2": ({ username }) => ({
    subject: "New login to your account",
    html: shell(`
      <tr>
        <td style="padding:32px 40px 40px;text-align:center;">

          <div style="display:inline-block;width:48px;height:48px;background:#161616;border:1px solid #1f1f1f;border-radius:12px;line-height:48px;font-size:22px;margin-bottom:24px;">
            ⚡
          </div>

          <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">
            Login detected
          </h1>

          <p style="margin:12px 0 32px;font-size:15px;color:#6b6b6b;line-height:1.65;">
            Hey ${escHtml(username)}, your ${BRAND_NAME} account was just accessed successfully.
          </p>

          <div style="margin-bottom:28px;padding:20px;background:#161616;border-radius:10px;border:1px solid #1f1f1f;text-align:left;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#3d3d3d;letter-spacing:0.08em;text-transform:uppercase;">
              Not you?
            </p>
            <p style="margin:0;font-size:14px;color:#8a8a8a;line-height:1.6;">
              If you didn't sign in, reset your password immediately and contact our support team.
            </p>
          </div>

          <a href="https://yourdomain.com/account/security"
             style="display:inline-block;padding:13px 32px;background:#1f1f1f;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;letter-spacing:0.01em;border:1px solid #2a2a2a;">
            Secure My Account
          </a>

        </td>
      </tr>
    `),
  }),

};

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const escHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/* ─────────────────────────────────────────
   SEND MAIL  (reusable utility)
───────────────────────────────────────── */
export const sendMail = async ({ to, template, username = "User" }) => {
  const builder = TEMPLATES[template];
  if (!builder) throw new Error(`Unknown template: ${template}`);

  const { subject, html } = builder({ username });
  const transporter = getTransporter();

  const info = await transporter.sendMail({
    from: `"${BRAND_NAME}" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html,
  });

  return info;
};

/* ─────────────────────────────────────────
   API HANDLER  (Vercel / Next.js)
───────────────────────────────────────── */
export default async function handler(req, res) {

  /* CORS */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")
    return res.status(405).json({ success: false, error: "Method not allowed" });

  /* Auth */
  if (req.query.key !== process.env.API_SECRET)
    return res.status(401).json({ success: false, error: "Unauthorized" });

  const { to, template, username } = req.query;

  if (!to || !template)
    return res.status(400).json({ success: false, error: "Required: to, template" });

  if (!isValidEmail(to))
    return res.status(400).json({ success: false, error: "Invalid email address" });

  if (!TEMPLATES[template])
    return res.status(400).json({ success: false, error: `Unknown template. Valid: ${Object.keys(TEMPLATES).join(", ")}` });

  try {
    const info = await sendMail({ to, template, username });

    return res.status(200).json({
      success: true,
      message: "Email sent",
      template,
      messageId: info.messageId,
    });

  } catch (err) {
    console.error("[MAIL ERROR]", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
