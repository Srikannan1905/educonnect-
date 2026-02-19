const sequelize = require('../config/database');
const User = require('./User');
const Center = require('./Center');
const Course = require('./Course');
const Booking = require('./Booking');
const Company = require('./Company');
const Gallery = require('./Gallery');
const Payment = require('./Payment');
const Notification = require('./Notification');

// Associations

// Center <-> Course
Center.hasMany(Course, { foreignKey: 'centerId', onDelete: 'CASCADE' });
Course.belongsTo(Center, { foreignKey: 'centerId' });

// User <-> Booking
User.hasMany(Booking, { foreignKey: 'userId', onDelete: 'CASCADE' });
Booking.belongsTo(User, { foreignKey: 'userId' });

// Course <-> Booking
Course.hasMany(Booking, { foreignKey: 'courseId', onDelete: 'CASCADE' });
Booking.belongsTo(Course, { foreignKey: 'courseId' });

// User <-> Payment
User.hasMany(Payment, { foreignKey: 'userId' });
Payment.belongsTo(User, { foreignKey: 'userId' });

// Course <-> Payment
Course.hasMany(Payment, { foreignKey: 'courseId' });
Payment.belongsTo(Course, { foreignKey: 'courseId' });

module.exports = {
    sequelize,
    User,
    Center,
    Course,
    Booking,
    Company,
    Gallery,
    Payment,
    Notification
};
