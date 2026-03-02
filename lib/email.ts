
import nodemailer from 'nodemailer';

/**
 * Check if SMTP is properly configured
 */
export const isEmailConfigured = (): boolean => {
    return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
};

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
    if (!isEmailConfigured()) {
        console.warn('SMTP not configured — skipping email to:', to, 'Subject:', subject);
        return null;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: process.env.SMTP_USER, // sender address
        to,
        subject,
        text,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

