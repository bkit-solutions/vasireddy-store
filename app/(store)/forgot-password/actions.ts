"use server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetOtpEmail } from "@/lib/mailer";
import bcrypt from "bcryptjs";
import { randomInt } from "crypto";

/**
 * Generate a 6-digit OTP and send it via email
 */
export async function requestPasswordReset(email: string) {
  if (!email) {
    return { error: "Email is required" };
  }

  try {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security reasons, don't reveal if user exists
      return { success: true };
    }

    // Generate 6-digit OTP
    const otp = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store in DB (upsert if exists for same email)
    await prisma.passwordReset.create({
      data: {
        email,
        otp,
        expiresAt,
      },
    });

    // Send email
    await sendPasswordResetOtpEmail(email, otp);

    return { success: true };
  } catch (error) {
    console.error("Password reset request failed", error);
    return { error: error instanceof Error ? error.message : "Something went wrong. Please try again." };
  }
}

/**
 * Verify OTP and update password
 */
export async function resetPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const otp = String(formData.get("otp") ?? "").trim();
  const newPassword = String(formData.get("password") ?? "").trim();

  if (!email || !otp || !newPassword) {
    return { error: "All fields are required" };
  }

  if (newPassword.length < 6) {
    return { error: "Password must be at least 6 characters long" };
  }

  try {
    // Find the latest valid OTP
    const resetRequest = await prisma.passwordReset.findFirst({
      where: {
        email,
        otp,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!resetRequest) {
      return { error: "Invalid or expired OTP" };
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    // Clean up OTPs for this email
    await prisma.passwordReset.deleteMany({
      where: { email },
    });

    return { success: true };
  } catch (error) {
    console.error("Password reset failed", error);
    return { error: "Failed to reset password. Please try again." };
  }
}
