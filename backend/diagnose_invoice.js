const { Payment, User, Course, Company } = require('./models');

async function diagnose() {
    const paymentId = 'bae81f1b-c0d6-472b-992a-7f1a1f55eddc';
    console.log('--- Checking Payment ---');
    try {
        const payment = await Payment.findByPk(paymentId, {
            include: [
                { model: User },
                { model: Course }
            ]
        });
        if (!payment) {
            console.log('Payment NOT FOUND');
        } else {
            console.log('Payment Found:', payment.id);
            console.log('User Found:', payment.User ? payment.User.name : 'NO USER ATTACHED');
            console.log('Course Found:', payment.Course ? payment.Course.title : 'NO COURSE ATTACHED');
        }
    } catch (err) {
        console.error('Payment Fetch Error:', err.message);
    }

    console.log('\n--- Checking Company ---');
    try {
        const company = await Company.findOne();
        console.log('Company found:', company ? company.name : 'NULL (Default fallback will be used)');
    } catch (err) {
        console.error('Company Fetch Error:', err.message);
    }
    process.exit(0);
}

diagnose();
