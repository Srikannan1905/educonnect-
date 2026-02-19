const { User } = require('./models');

const checkUsers = async () => {
    try {
        const users = await User.findAll();
        console.log('--- USERS IN DB ---');
        users.forEach(u => console.log(`${u.id} | ${u.email} | ${u.role} | ${u.name}`));
        console.log('-------------------');
    } catch (error) {
        console.error('Error:', error);
    }
};

checkUsers();
