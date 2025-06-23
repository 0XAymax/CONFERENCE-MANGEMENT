
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API!);
export async function sendMail(dest: string, token: string) {
  const verificationURL = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email/${token}`;
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: dest,
      subject: "Verify your email address",
      html: `
        <p>Click the link below to verify your email address:</p>
        <a href="${verificationURL}" target="_blank" rel="noopener noreferrer">
          Verify Email
        </a>
        <p>If you did not request this, you can ignore this email.</p>
      `,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return error;
  }
}
