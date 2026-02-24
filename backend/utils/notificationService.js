/**
 * Notification Service (Simulation)
 * This utility simulates sending external messages via WhatsApp and Email.
 * In a production environment, this would integrate with Twilio, SendGrid, etc.
 */

const sendWhatsApp = async (to, message) => {
    console.log(`\n--- [SIMULATED WHATSAPP] ---`);
    console.log(`TO: ${to}`);
    console.log(`MESSAGE: ${message}`);
    console.log(`---------------------------\n`);
    return { success: true, provider: 'Twilio (Simulated)' };
};

const sendEmail = async (to, subject, body) => {
    console.log(`\n--- [SIMULATED EMAIL] ---`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`BODY: ${body}`);
    console.log(`------------------------\n`);
    return { success: true, provider: 'SendGrid (Simulated)' };
};

exports.notifyStaffApproval = async (user) => {
    const contact = user.phone || 'N/A';
    const email = user.email;
    const name = user.name;

    const message = `Halo ${name}, Your staff account has been approved by EduConnect! You can now log in and access your faculty portal at http://localhost:3000/login. Welcome to the team!`;

    // Simulate WhatsApp
    await sendWhatsApp(contact, message);

    // Simulate Email
    await sendEmail(email, 'EduConnect: Staff Account Approved', message);
};

exports.notifyStaffRejection = async (user) => {
    const contact = user.phone || 'N/A';
    const email = user.email;
    const name = user.name;

    const message = `Hello ${name}, We regret to inform you that your staff application for EduConnect has been declined at this time. Please contact our HR department for more details.`;

    // Simulate WhatsApp
    await sendWhatsApp(contact, message);

    // Simulate Email
    await sendEmail(email, 'EduConnect: Application Status Update', message);
};
