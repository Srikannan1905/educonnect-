const sequelize = require('../config/database');
const User = require('./User');
const Center = require('./Center');
const Course = require('./Course');
const Booking = require('./Booking');
const Company = require('./Company');
const Gallery = require('./Gallery');
const Payment = require('./Payment');
const Notification = require('./Notification');
const Session = require('./Session');
const CourseRequest = require('./CourseRequest');
const ActivityLog = require('./ActivityLog');
const Quiz = require('./Quiz');
const Question = require('./Question');
const Assessment = require('./Assessment');
const Syllabus = require('./Syllabus');

// Associations

// Center <-> Course
Center.hasMany(Course, { foreignKey: 'centerId', onDelete: 'CASCADE' });
Course.belongsTo(Center, { foreignKey: 'centerId' });

// User <-> Booking
User.hasMany(Booking, { foreignKey: 'userId', onDelete: 'CASCADE' });
Booking.belongsTo(User, { foreignKey: 'userId' });

// Staff <-> Booking (for demo sessions)
User.hasMany(Booking, { foreignKey: 'staffId', as: 'tutorBookings', onDelete: 'CASCADE' });
Booking.belongsTo(User, { foreignKey: 'staffId', as: 'instructor' });

// Course <-> Booking
Course.hasMany(Booking, { foreignKey: 'courseId', onDelete: 'CASCADE' });
Booking.belongsTo(Course, { foreignKey: 'courseId' });

// User <-> Payment
User.hasMany(Payment, { foreignKey: 'userId' });
Payment.belongsTo(User, { foreignKey: 'userId' });

// Course <-> Payment
Course.hasMany(Payment, { foreignKey: 'courseId' });
Payment.belongsTo(Course, { foreignKey: 'courseId' });

// Session Associations
Course.hasMany(Session, { foreignKey: 'courseId', onDelete: 'CASCADE' });
Session.belongsTo(Course, { foreignKey: 'courseId' });

User.hasMany(Session, { foreignKey: 'staffId', as: 'instructorSessions', onDelete: 'CASCADE' });
Session.belongsTo(User, { foreignKey: 'staffId', as: 'instructor' });

User.hasMany(Session, { foreignKey: 'studentId', as: 'studentSessions', onDelete: 'CASCADE' });
Session.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

User.hasMany(Course, { foreignKey: 'staffId', as: 'instructorCourses' });
Course.belongsTo(User, { foreignKey: 'staffId', as: 'instructor' });

// User <-> Notification
User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// User <-> CourseRequest
User.hasMany(CourseRequest, { foreignKey: 'staffId', as: 'requests' });
CourseRequest.belongsTo(User, { foreignKey: 'staffId', as: 'staff' });

User.hasMany(ActivityLog, { foreignKey: 'userId', as: 'activities' });
ActivityLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Quiz Associations
Course.hasMany(Quiz, { foreignKey: 'courseId', onDelete: 'CASCADE' });
Quiz.belongsTo(Course, { foreignKey: 'courseId' });

User.hasMany(Quiz, { foreignKey: 'staffId', as: 'instructorQuizzes' });
Quiz.belongsTo(User, { foreignKey: 'staffId', as: 'instructor' });

Quiz.hasMany(Question, { foreignKey: 'quizId', as: 'questions', onDelete: 'CASCADE' });
Question.belongsTo(Quiz, { foreignKey: 'quizId' });

Quiz.hasMany(Assessment, { foreignKey: 'quizId', onDelete: 'CASCADE' });
Assessment.belongsTo(Quiz, { foreignKey: 'quizId' });

User.hasMany(Assessment, { foreignKey: 'studentId', as: 'myAssessments', onDelete: 'CASCADE' });
Assessment.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

module.exports = {
    sequelize,
    User,
    Center,
    Course,
    Booking,
    Company,
    Gallery,
    Payment,
    Notification,
    Session,
    CourseRequest,
    ActivityLog,
    Quiz,
    Question,
    Assessment,
    Syllabus
};
