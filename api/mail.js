import admin from "firebase-admin";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

/* ======================================================
   Firebase Admin Initialization
   ====================================================== */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

/* ======================================================
   SMTP Transport
   ====================================================== */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

/* ======================================================
   Serverless Handler
   ====================================================== */
export default async function handler(req, res) {

  /* -------------------- CORS (ALLOW ALL) -------------------- */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST method is allowed",
    });
  }

  try {
    /* -------------------- AUTH -------------------- */
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Missing or invalid Authorization header",
      });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    /* -------------------- RESOLVE RECIPIENT -------------------- */
    // Fetch user's email by uid
    const userRecord = await admin.auth().getUser(decodedToken.uid);
    const userEmail = userRecord.email;

    const { to, subject, text, html } = req.body || {};

    // Choose recipient: explicit 'to' takes precedence, otherwise use authenticated user's email
    const recipientEmail = to || userEmail;

    if (!recipientEmail) {
      return res.status(400).json({
        error: "No recipient email found: provide 'to' or ensure token user has an email",
      });
    }

    /* -------------------- DEFAULT HTML TEMPLATE -------------------- */
    // If no html provided in request, use default template at project root index.html
    let finalHtml = html;
    if (!finalHtml) {
      try {
        const templatePath = path.resolve(process.cwd(), "index.html");
        finalHtml = fs.readFileSync(templatePath, "utf8");
      } catch (e) {
        finalHtml = null;
      }
    }

    if (!text && !finalHtml) {
      return res.status(400).json({
        error: "Required fields: subject and (text or html). No html template found and no text provided.",
      });
    }

    /* -------------------- SEND EMAIL -------------------- */
    await transporter.sendMail({
      from: `"Hive SMTP" <${process.env.SMTP_EMAIL}>`,
      to: recipientEmail,
      subject,
      text,
      html: finalHtml,
    });

    /* -------------------- SUCCESS -------------------- */
    return res.status(200).json({
      success: true,
      uid: decodedToken.uid,
      message: "Email sent successfully",
    });

  } catch (error) {
    console.error("SMTP API Error:", error);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
}