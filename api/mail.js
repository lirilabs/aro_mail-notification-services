import admin from "firebase-admin";
import nodemailer from "nodemailer";

/* ======================================================
   Firebase Admin Initialization
   ====================================================== */
const initializeFirebase = () => {
  if (admin.apps.length > 0) return;
  
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) {
    console.error("FIREBASE_PRIVATE_KEY is missing from environment variables");
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
};

/* ======================================================
   SMTP Transport Helper
   ====================================================== */
const getTransporter = () => {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    throw new Error("SMTP credentials missing");
  }
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

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
    initializeFirebase();
    if (admin.apps.length === 0) {
      throw new Error("Firebase Admin failed to initialize");
    }
    /* -------------------- AUTH -------------------- */
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Missing or invalid Authorization header",
      });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    /* -------------------- INPUT -------------------- */
    const { to, subject, text, html } = req.body || {};

    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({
        error: "Required fields: to, subject, text or html",
      });
    }

    /* -------------------- SEND EMAIL -------------------- */
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Aro Business" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      text,
      html,
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
