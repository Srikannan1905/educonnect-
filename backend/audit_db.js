const { Course, User, Center, CourseRequest } = require('./models');

(async () => {
    try {
        const courses = await Course.findAll();
        console.log(`Courses count: ${courses.length}`);

        const centers = await Center.findAll();
        console.log(`Centers count: ${centers.length}`);

        const requests = await CourseRequest.findAll();
        console.log(`CourseRequests count: ${requests.length}`);

        const users = await User.findAll({ attributes: ['id', 'name', 'role'] });
        console.log('Users:', JSON.stringify(users, null, 2));

        if (courses.length === 0 && users.length > 0) {
            console.log('No courses found. Creating a dummy course for testing...');
            const staff = users.find(u => u.role === 'staff' || u.role === 'admin');
            if (staff) {
                await Course.create({
                    title: 'General Mathematics',
                    subject: 'Mathematics',
                    board: 'CBSE',
                    mode: 'online',
                    description: 'Basic mathematics module for assessments.',
                    staffId: staff.id
                });
                console.log('Dummy course created.');
            }
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
})();
