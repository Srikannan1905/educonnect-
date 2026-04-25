const { Course, Quiz } = require('./models');
async function dump() {
    try {
        const c = await Course.findAll();
        const q = await Quiz.findAll();
        console.log('--- COURSES ---');
        c.forEach(x => {
            console.log(`ID: ${x.id} | Title: ${x.title}`);
        });
        console.log('\n--- QUIZZES ---');
        q.forEach(x => {
            console.log(`ID: ${x.id} | Title: ${x.title} | CourseID: ${x.courseId}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
dump();
