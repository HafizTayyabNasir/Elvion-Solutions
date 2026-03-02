
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

/**
 * Check if any email provider is configured.
 * Supports: Resend (preferred) or SMTP (fallback).
 */
export const isEmailConfigured = (): boolean => {
    return !!(process.env.RESEND_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS));
};

const FROM_EMAIL = process.env.EMAIL_FROM || 'Elvion Solutions <onboarding@resend.dev>';

/**
 * Send an email using Resend (if RESEND_API_KEY is set) or SMTP as fallback.
 */
export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
    // --- Resend (no SMTP needed, just an API key) ---
    if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        try {
            const { data, error } = await resend.emails.send({
                from: FROM_EMAIL,
                to,
                subject,
                text,
                html: html || undefined,
            });
            if (error) {
                console.error('Resend error:', error);
                throw new Error(error.message);
            }
            console.log('Email sent via Resend:', data?.id);
            return data;
        } catch (error) {
            console.error('Error sending email via Resend:', error);
            throw error;
        }
    }

    // --- SMTP fallback ---
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: process.env.SMTP_USER,
            to,
            subject,
            text,
            html,
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent via SMTP:', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending email via SMTP:', error);
            throw error;
        }
    }

    // --- No provider configured ---
    console.warn('No email provider configured — skipping email to:', to, 'Subject:', subject);
    return null;
};

