import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_HOST_PASSWORD,
  },
});

const SUBJECTS = {
  uk: "Підтвердіть реєстрацію — JD Learn",
  ru: "Подтвердите регистрацию — JD Learn",
  de: "Bestätigen Sie Ihre Registrierung — JD Learn",
  en: "Confirm your registration — JD Learn",
};

// Branded JD Learn confirmation email (Swiss editorial).
export function buildConfirmationEmail(name, token, locale = "en") {
  const confirmUrl = `${process.env.API_URL}/api/auth/verify?token=${token}`;
  const from = `"${process.env.FROM_NAME || "JD Learn"}" <${process.env.DEFAULT_FROM_EMAIL}>`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{background:#F7F4EE;font-family:Arial,sans-serif;margin:0;padding:0;}
    .wrapper{max-width:560px;margin:40px auto;background:#F7F4EE;border:1px solid #0D0D0D;}
    .header{padding:32px 40px;border-bottom:1px solid #0D0D0D;}
    .logo{font-size:30px;font-weight:900;letter-spacing:0.05em;}
    .jd{color:#F73B20;} .ln{color:#0D0D0D;}
    .body{padding:44px 40px;}
    .title{font-size:46px;font-weight:900;color:#0D0D0D;line-height:0.9;margin:0 0 6px;letter-spacing:0.02em;}
    .outline{color:#F7F4EE;-webkit-text-stroke:2px #F73B20;text-stroke:2px #F73B20;}
    .sub{font-size:16px;color:#0D0D0D;opacity:0.6;margin:22px 0;}
    .btn{display:inline-block;background:#0D0D0D;color:#F7F4EE !important;padding:16px 32px;border-radius:150px;font-size:14px;font-weight:700;letter-spacing:0.08em;text-decoration:none;}
    .footer{padding:22px 40px;border-top:1px solid rgba(13,13,13,0.1);font-size:11px;color:#0D0D0D;opacity:0.5;letter-spacing:0.08em;}
    .footer a{color:#F73B20;text-decoration:none;margin-right:14px;}
  </style></head><body>
    <div class="wrapper">
      <div class="header"><span class="logo"><span class="jd">JD</span> <span class="ln">LEARN</span></span></div>
      <div class="body">
        <h1 class="title">CONFIRM<br><span class="outline">EMAIL</span></h1>
        <p class="sub">Hi ${name}, one click to start your learning journey.</p>
        <a href="${confirmUrl}" class="btn">CONFIRM REGISTRATION →</a>
        <p class="sub" style="margin-top:30px;font-size:13px;">Link expires in 24 hours.<br>If you didn't register, ignore this email.</p>
      </div>
      <div class="footer">
        <div>© 2024 JD Learn · ${process.env.DEFAULT_FROM_EMAIL}</div>
        <div style="margin-top:12px;">
          <a href="https://t.me/jd_learn_school">Telegram Channel</a>
          <a href="https://www.instagram.com/jd.learn">Instagram</a>
        </div>
      </div>
    </div>
  </body></html>`;

  return { from, to: undefined, subject: SUBJECTS[locale] || SUBJECTS.en, html };
}
