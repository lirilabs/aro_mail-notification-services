import nodemailer from "nodemailer";

/* ─────────────────────────────────────────
   CONFIG
───────────────────────────────────────── */
const LOGO_URL =
  "https://yourdomain.com/logo.jpg";

const BRAND_NAME = "Aro";

/* ─────────────────────────────────────────
   SMTP TRANSPORT
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
  });

  return _transporter;
};

/* ─────────────────────────────────────────
   SIMPLE WHITE UI SHELL
───────────────────────────────────────── */
const shell = (body) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
</head>

<body style="
  margin:0;
  padding:0;
  background:#f5f5f5;
  font-family:Arial,sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:40px 20px;">

  <table width="520" cellpadding="0" cellspacing="0" style="
    background:#ffffff;
    border-radius:18px;
    padding:40px;
  ">

    <!-- LOGO -->
    <tr>
      <td align="center">

        <img 
          src="${LOGO_URL}"
          width="90"
          style="
            display:block;
            margin-bottom:30px;
            border-radius:18px;
          "
        />

      </td>
    </tr>

    ${body}

    <!-- FOOTER -->
    <tr>
      <td align="center" style="padding-top:35px;">

        <p style="
          margin:0;
          color:#999999;
          font-size:12px;
        ">
          © ${new Date().getFullYear()} ${BRAND_NAME}
        </p>

      </td>
    </tr>

  </table>

</td>
</tr>
</table>

</body>
</html>
`;

/* ─────────────────────────────────────────
   TEMPLATES
───────────────────────────────────────── */
const TEMPLATES = {

  /* =====================================================
     1 · VERIFICATION SUCCESS
  ===================================================== */
  "1": ({ username }) => ({
    subject: "Verification Successful",
    html: shell(`
      <tr>
        <td align="center">

          <h1 style="
            margin:0;
            font-size:28px;
            color:#111111;
          ">
            Verification Successful ✅
          </h1>

          <p style="
            margin-top:18px;
            color:#666666;
            font-size:15px;
            line-height:1.7;
          ">
            Hey <b>${escHtml(username)}</b>,
            <br /><br />
            Your account has been verified successfully.
          </p>

        </td>
      </tr>
    `),
  }),

  /* =====================================================
     2 · REGISTRATION SUCCESS
  ===================================================== */
  "2": ({ username }) => ({
    subject: "Registration Successful",
    html: shell(`
      <tr>
        <td align="center">

          <h1 style="
            margin:0;
            font-size:28px;
            color:#111111;
          ">
            Welcome to ${BRAND_NAME} 🚀
          </h1>

          <p style="
            margin-top:18px;
            color:#666666;
            font-size:15px;
            line-height:1.7;
          ">
            Hey <b>${escHtml(username)}</b>,
            <br /><br />
            Your account has been created successfully.
          </p>

        </td>
      </tr>
    `),
  }),

  /* =====================================================
     3 · SELLER FIRST LOGIN
  ===================================================== */
  "3": ({ username }) => ({
    subject: "Seller Dashboard Activated",
    html: shell(`
      <tr>
        <td align="center">

          <h1 style="
            margin:0;
            font-size:28px;
            color:#111111;
          ">
            Seller Access Enabled ⚡
          </h1>

          <p style="
            margin-top:18px;
            color:#666666;
            font-size:15px;
            line-height:1.7;
          ">
            Hey <b>${escHtml(username)}</b>,
            <br /><br />
            Welcome to the seller dashboard.
            Your seller tools are now active.
          </p>

        </td>
      </tr>
    `),
  }),

  /* =====================================================
     4 · USER FIRST LOGIN
  ===================================================== */
  "4": ({ username }) => ({
    subject: "Welcome Back",
    html: shell(`
      <tr>
        <td align="center">

          <h1 style="
            margin:0;
            font-size:28px;
            color:#111111;
          ">
            First Login Successful 👋
          </h1>

          <p style="
            margin-top:18px;
            color:#666666;
            font-size:15px;
            line-height:1.7;
          ">
            Hey <b>${escHtml(username)}</b>,
            <br /><br />
            Thanks for logging into ${BRAND_NAME}.
            Your experience starts now.
          </p>

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
   SEND MAIL
───────────────────────────────────────── */
export const sendMail = async ({
  to,
  template,
  username = "User"
}) => {

  const builder = TEMPLATES[template];

  if (!builder)
    throw new Error("Unknown template");

  const { subject, html } = builder({
    username
  });

  const transporter = getTransporter();

  return await transporter.sendMail({
    from: `"${BRAND_NAME}" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html,
  });
};

/* ─────────────────────────────────────────
   API HANDLER
───────────────────────────────────────── */
export default async function handler(req, res) {

  /* CORS */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS")
    return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {

    const {
      to,
      template,
      username
    } = req.query;

    /* VALIDATION */
    if (!to || !template) {
      return res.status(400).json({
        success: false,
        error: "Required: to, template",
      });
    }

    if (!isValidEmail(to)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email",
      });
    }

    /* SEND */
    const info = await sendMail({
      to,
      template,
      username,
    });

    return res.status(200).json({
      success: true,
      template,
      messageId: info.messageId,
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
