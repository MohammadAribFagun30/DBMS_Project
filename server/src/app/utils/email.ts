import nodemailer from "nodemailer";
import { Resend } from "resend";
import config from "../config";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Lazy-initialized clients
let resendClient: Resend | null = null;
let nodemailerTransporter: nodemailer.Transporter | null = null;

const getResendClient = (): Resend | null => {
  if (!resendClient && config.email.resendApiKey) {
    resendClient = new Resend(config.email.resendApiKey);
  }
  return resendClient;
};

const getNodemailerTransporter = (): nodemailer.Transporter | null => {
  if (!nodemailerTransporter && config.email.smtp.host && config.email.smtp.user) {
    nodemailerTransporter = nodemailer.createTransport({
      host: config.email.smtp.host,
      port: config.email.smtp.port,
      secure: config.email.smtp.secure,
      auth: {
        user: config.email.smtp.user,
        pass: config.email.smtp.pass,
      },
    });
  }
  return nodemailerTransporter;
};

/**
 * Universal email sender:
 * 1. Uses Resend if RESEND_API_KEY is configured.
 * 2. Uses Nodemailer SMTP if SMTP_HOST and SMTP_USER are configured.
 * 3. Fallback: Logs clearly to terminal for development/testing without crashing.
 */
export const sendEmail = async ({ to, subject, html, text }: SendEmailOptions): Promise<boolean> => {
  const from = config.email.from;

  try {
    // 1. Try Resend
    const resend = getResendClient();
    if (resend) {
      const response = await resend.emails.send({
        from,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>?/gm, ""),
      });
      console.log(`[Email via Resend] Sent to ${to}. ID: ${response.data?.id ?? "ok"}`);
      return true;
    }

    // 2. Try Nodemailer SMTP
    const transporter = getNodemailerTransporter();
    if (transporter) {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>?/gm, ""),
      });
      console.log(`[Email via Nodemailer] Sent to ${to}. MessageId: ${info.messageId}`);
      return true;
    }

    // 3. Fallback dev simulation
    console.log("------------------------------------------------------------");
    console.log(`[EMAIL SIMULATOR - NO SMTP/RESEND CREDENTIALS CONFIGURED]`);
    console.log(`To: ${to}`);
    console.log(`From: ${from}`);
    console.log(`Subject: ${subject}`);
    console.log(`Summary: ${text || subject}`);
    console.log("------------------------------------------------------------");
    return true;
  } catch (error: any) {
    console.error(`[Email Error] Failed to send email to ${to}:`, error?.message || error);
    return false;
  }
};

/**
 * 1. Registration Confirmation Email Template
 */
export const sendRegistrationConfirmedEmail = async (
  to: string,
  data: {
    studentName: string;
    eventTitle: string;
    passNumber: string;
    startTime: Date | string;
    venueName?: string;
    clubName?: string;
  }
) => {
  const formattedDate = new Date(data.startTime).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Registration Confirmed</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
    .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
    .body { padding: 32px 24px; }
    .pass-box { background: #f0fdf4; border: 2px dashed #22c55e; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .pass-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #15803d; font-weight: 700; margin-bottom: 6px; }
    .pass-num { font-size: 28px; font-weight: 800; color: #166534; letter-spacing: 2px; }
    .details { background: #f8fafc; border-radius: 12px; padding: 16px 20px; margin: 20px 0; font-size: 14px; line-height: 1.6; }
    .detail-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #edf2f7; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #64748b; font-weight: 500; }
    .detail-value { color: #0f172a; font-weight: 600; text-align: right; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Registration Confirmed! 🎉</h1>
      <p>You have secured your spot for the campus event.</p>
    </div>
    <div class="body">
      <p>Hello <strong>${data.studentName}</strong>,</p>
      <p>Your registration for <strong>"${data.eventTitle}"</strong> is confirmed. Please keep this pass number ready during event check-in.</p>
      
      <div class="pass-box">
        <div class="pass-label">Official Event Pass Number</div>
        <div class="pass-num">${data.passNumber}</div>
      </div>

      <div class="details">
        <div class="detail-row">
          <span class="detail-label">Event:</span>
          <span class="detail-value">${data.eventTitle}</span>
        </div>
        ${data.clubName ? `
        <div class="detail-row">
          <span class="detail-label">Organizing Club:</span>
          <span class="detail-value">${data.clubName}</span>
        </div>` : ""}
        <div class="detail-row">
          <span class="detail-label">Date & Time:</span>
          <span class="detail-value">${formattedDate}</span>
        </div>
        ${data.venueName ? `
        <div class="detail-row">
          <span class="detail-label">Venue:</span>
          <span class="detail-value">${data.venueName}</span>
        </div>` : ""}
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="detail-value" style="color: #16a34a;">Confirmed ✅</span>
        </div>
      </div>

      <p style="font-size: 13px; color: #64748b; text-align: center; margin-top: 24px;">
        After attending, your digital certificate and attendance score will be automatically updated on ClubVerse.
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ClubVerse Management System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

  return sendEmail({
    to,
    subject: `Registration Confirmed: ${data.eventTitle} (${data.passNumber})`,
    html,
    text: `Hello ${data.studentName}, your registration for "${data.eventTitle}" is confirmed! Pass Number: ${data.passNumber}. Date: ${formattedDate}. Venue: ${data.venueName || "Campus Venue"}.`,
  });
};

/**
 * 2. Event Approved Email Template
 */
export const sendEventApprovedEmail = async (
  to: string,
  data: {
    organizerName: string;
    eventTitle: string;
    startTime: Date | string;
    venueName?: string;
    clubName?: string;
  }
) => {
  const formattedDate = new Date(data.startTime).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Event Approved</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
    .header p { margin: 8px 0 0; opacity: 0.95; font-size: 14px; }
    .body { padding: 32px 24px; }
    .badge-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
    .badge-title { font-size: 18px; font-weight: 700; color: #065f46; }
    .details { background: #f8fafc; border-radius: 12px; padding: 16px 20px; margin: 20px 0; font-size: 14px; line-height: 1.6; }
    .detail-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #edf2f7; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #64748b; font-weight: 500; }
    .detail-value { color: #0f172a; font-weight: 600; text-align: right; }
    .action-btn { display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 10px; margin-top: 16px; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Event Approved! 🚀</h1>
      <p>Your event proposal has been reviewed and approved by Admin.</p>
    </div>
    <div class="body">
      <p>Hello <strong>${data.organizerName}</strong>,</p>
      <p>Great news! Your event proposal for <strong>"${data.eventTitle}"</strong> has been approved and is now officially published on the campus portal.</p>
      
      <div class="badge-box">
        <div class="badge-title">Status: APPROVED & LIVE</div>
        <p style="margin: 4px 0 0; font-size: 13px; color: #047857;">Students can now browse and register for this event.</p>
      </div>

      <div class="details">
        <div class="detail-row">
          <span class="detail-label">Event:</span>
          <span class="detail-value">${data.eventTitle}</span>
        </div>
        ${data.clubName ? `
        <div class="detail-row">
          <span class="detail-label">Club:</span>
          <span class="detail-value">${data.clubName}</span>
        </div>` : ""}
        <div class="detail-row">
          <span class="detail-label">Scheduled Date:</span>
          <span class="detail-value">${formattedDate}</span>
        </div>
        ${data.venueName ? `
        <div class="detail-row">
          <span class="detail-label">Allocated Venue:</span>
          <span class="detail-value">${data.venueName}</span>
        </div>` : ""}
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <p style="font-size: 13px; color: #64748b;">
          You can track real-time attendee registrations, manage workshops, and record sponsorships from your Club Workspace.
        </p>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ClubVerse Management System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

  return sendEmail({
    to,
    subject: `Event Approved: "${data.eventTitle}" is now live!`,
    html,
    text: `Hello ${data.organizerName}, your event "${data.eventTitle}" has been approved by the Admin and is now live for registration! Scheduled for ${formattedDate} at ${data.venueName || "Campus Venue"}.`,
  });
};
