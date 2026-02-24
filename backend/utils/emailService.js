const nodemailer = require('nodemailer');

// Configure transporter (Using Ethereal for testing if no env vars provided)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER || 'educonnect.test@ethereal.email',
        pass: process.env.EMAIL_PASS || 'password_here',
    },
});

exports.sendSessionEmail = async (to, subject, sessionData) => {
    const { title, date, startTime, meetingLink, instructorName } = sessionData;

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded: 10px;">
            <h2 style="color: #1e3a8a; text-align: center;">EduConnect - New Class Scheduled</h2>
            <p>Hello,</p>
            <p>A new class session has been scheduled for your course: <strong>${title}</strong></p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Time:</strong> ${startTime}</p>
                <p><strong>Instructor:</strong> ${instructorName}</p>
                <p><strong>Platform Link:</strong> <a href="${meetingLink}" style="color: #2563eb; font-weight: bold;">Join Class</a></p>
            </div>

            <p>Please make sure to set a reminder and join on time.</p>
            <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 30px;">
                This is an automated message from EduConnect. Please do not reply.
            </p>
        </div>
    `;

    try {
        const info = await transporter.sendMail({
            from: '"EduConnect Notifications" <no-reply@educonnect.com>',
            to,
            subject,
            html: htmlContent,
        });

        console.log('Message sent: %s', info.messageId);
        // If using ethereal.email
        if (transporter.options.host === 'smtp.ethereal.email') {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
        return true;
    } catch (error) {
        console.error('Email Error:', error);
        return false;
    }
};
