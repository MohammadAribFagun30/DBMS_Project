import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT || 5050,
  app_url: process.env.APP_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS!,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN!,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN!,
  // Email Configuration (Resend or Nodemailer SMTP)
  email: {
    from: process.env.EMAIL_FROM || "ClubVerse <no-reply@clubverse.edu>",
    resendApiKey: process.env.RESEND_API_KEY,
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      secure: process.env.SMTP_SECURE === "true",
    },
  },
};
