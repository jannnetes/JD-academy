import sgMail from "@sendgrid/mail";

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// SendGrid sends over HTTPS (443) — unlike raw SMTP (25/465/587), this
// isn't blocked by hosts (e.g. Railway) that firewall outbound mail ports.
export async function sendMail({ to, subject, html }) {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SendGrid is not configured");
  }
  await sgMail.send({
    to,
    from: { email: process.env.DEFAULT_FROM_EMAIL, name: process.env.FROM_NAME || "JD Academy" },
    subject,
    html,
  });
}

const SUBJECTS = {
  uk: "Підтвердіть реєстрацію — JD Academy",
  ru: "Подтвердите регистрацию — JD Academy",
  de: "Bestätigen Sie Ihre Registrierung — JD Academy",
  en: "Confirm your registration — JD Academy",
};

const RESET_SUBJECTS = {
  uk: "Скидання пароля — JD Academy",
  ru: "Сброс пароля — JD Academy",
  de: "Passwort zurücksetzen — JD Academy",
  en: "Reset your password — JD Academy",
};

const RESET_TEXT = {
  uk: { title1: "СКИНУТИ", title2: "ПАРОЛЬ", sub: (name) => `Привіт, ${name}. Натисніть, щоб задати новий пароль.`, btn: "СКИНУТИ ПАРОЛЬ →", note: "Посилання дійсне 1 годину.<br>Якщо це були не ви — просто ігноруйте цей лист." },
  ru: { title1: "СБРОСИТЬ", title2: "ПАРОЛЬ", sub: (name) => `Привет, ${name}. Нажмите, чтобы задать новый пароль.`, btn: "СБРОСИТЬ ПАРОЛЬ →", note: "Ссылка действительна 1 час.<br>Если это были не вы — просто проигнорируйте это письмо." },
  de: { title1: "PASSWORT", title2: "ZURÜCKSETZEN", sub: (name) => `Hallo ${name}, klicke hier, um ein neues Passwort zu setzen.`, btn: "PASSWORT ZURÜCKSETZEN →", note: "Der Link ist 1 Stunde gültig.<br>Wenn das nicht du warst, ignoriere diese E-Mail." },
  en: { title1: "RESET", title2: "PASSWORD", sub: (name) => `Hi ${name}, click below to set a new password.`, btn: "RESET PASSWORD →", note: "Link expires in 1 hour.<br>If this wasn't you, just ignore this email." },
};

function emailShell({ title1, title2, subText, btnText, btnUrl, noteHtml }) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
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
      <div class="header"><span class="logo"><span class="jd">JD</span> <span class="ln">ACADEMY</span></span></div>
      <div class="body">
        <h1 class="title">${title1}<br><span class="outline">${title2}</span></h1>
        <p class="sub">${subText}</p>
        <a href="${btnUrl}" class="btn">${btnText}</a>
        <p class="sub" style="margin-top:30px;font-size:13px;">${noteHtml}</p>
      </div>
      <div class="footer">
        <div>© 2024 JD Academy · ${process.env.DEFAULT_FROM_EMAIL}</div>
        <div style="margin-top:12px;">
          <a href="https://t.me/jd_learn_school">Telegram Channel</a>
          <a href="https://www.instagram.com/jd.learn">Instagram</a>
        </div>
      </div>
    </div>
  </body></html>`;
}

// Branded JD Academy confirmation email (Swiss editorial).
export function buildConfirmationEmail(name, token, locale = "en") {
  const confirmUrl = `${process.env.API_URL}/api/auth/verify?token=${token}`;
  const html = emailShell({
    title1: "CONFIRM", title2: "EMAIL",
    subText: `Hi ${name}, one click to start your learning journey.`,
    btnText: "CONFIRM REGISTRATION →", btnUrl: confirmUrl,
    noteHtml: "Link expires in 24 hours.<br>If you didn't register, ignore this email.",
  });
  return { subject: SUBJECTS[locale] || SUBJECTS.en, html };
}

// Password reset email — link points to the frontend reset page, not the API.
export function buildPasswordResetEmail(name, token, locale = "en") {
  const t = RESET_TEXT[locale] || RESET_TEXT.en;
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetUrl = `${clientUrl}/reset-password?token=${token}`;
  const html = emailShell({
    title1: t.title1, title2: t.title2,
    subText: t.sub(name),
    btnText: t.btn, btnUrl: resetUrl,
    noteHtml: t.note,
  });
  return { subject: RESET_SUBJECTS[locale] || RESET_SUBJECTS.en, html };
}
