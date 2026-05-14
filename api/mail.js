import nodemailer from "nodemailer";

/* ======================================================
   SMTP Transport
====================================================== */
const getTransporter = () => {

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

/* ======================================================
   API Handler
====================================================== */
export default async function handler(req, res) {

  /* ---------------- CORS ---------------- */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  /* --------------- OPTIONS -------------- */
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  /* ---------------- ONLY GET ------------ */
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Only GET method allowed",
    });
  }

  try {

    /* ------------ QUERY PARAMS ----------- */
    const {
      to,
      subject,
      text,
      html
    } = req.query;

    /* ------------ VALIDATION ------------- */
    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({
        success: false,
        error: "Required params: to, subject, text/html",
      });
    }

    /* ------------ SEND MAIL -------------- */
    const transporter = getTransporter();

    const info = await transporter.sendMail({
      from: `"Aro Business" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      text,
      html,
    });

    /* ------------ SUCCESS ---------------- */
    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    });

  } catch (error) {

    console.error("MAIL API ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
