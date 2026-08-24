import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationToken: string,
) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const verificationUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(
    verificationToken,
  )}`;

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "TableGo <onboarding@resend.dev>",
    to: email,
    subject: "Verifikasi Email TableGo",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #111827;">
          Selamat datang di <span style="color: #22c55e;">TableGo</span>
        </h1>

        <p>
          Halo ${escapeHtml(name)},
        </p>

        <p>
          Terima kasih sudah membuat akun TableGo.
          Silakan verifikasi alamat email kamu untuk mengaktifkan akun.
        </p>

        <div style="margin: 30px 0;">
          <a
            href="${verificationUrl}"
            style="
              display: inline-block;
              background: #22c55e;
              color: white;
              padding: 14px 24px;
              border-radius: 10px;
              text-decoration: none;
              font-weight: bold;
            "
          >
            Verifikasi Email
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px;">
          Link verifikasi ini berlaku selama 24 jam.
        </p>

        <p style="color: #6b7280; font-size: 14px;">
          Jika kamu tidak membuat akun TableGo, abaikan email ini.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend email error:", error);
    throw new Error("Gagal mengirim email verifikasi.");
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}