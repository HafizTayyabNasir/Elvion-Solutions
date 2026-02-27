
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Don't reveal if user exists or not for security, but for now we'll just return success
            // Or return 404 if we want to be explicit.
            // Standard practice: "If that email exists, we sent a link."
            return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        // Save token to DB
        await prisma.user.update({
            where: { email },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        // Send email
        // Check if we are in dev/prod to form the URL properly
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const resetLink = `${appUrl}/reset-password?token=${resetToken}`;

        const message = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Please go to this link to reset your password:</p>
      <a href="${resetLink}" clicktracking=off>${resetLink}</a>
      <p>This link expires in 1 hour.</p>
    `;

        try {
            await sendEmail(email, "Password Reset Request", `Reset Link: ${resetLink}`, message);
        } catch (emailError) {
            console.error("Failed to send email", emailError);
            return NextResponse.json({ message: "Failed to send email" }, { status: 500 });
        }

        return NextResponse.json({ message: "Reset link sent" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
