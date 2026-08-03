require('dotenv').config();
const mongoose = require('mongoose');
const Visitor = require('./models/Visitor');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const newVisitor = await Visitor.create({
            name: 'Tester Antigravity D',
            email: 'buttertiger022@gmail.com',
            phone: '08123456789',
            institution: 'Deepmind LABS',
            targetEmployee: 'Hafizh - IT Dept',
            hasAppointment: 'ya',
            purpose: 'Verifikasi Modifikasi Fitur Reschedule / Reject D Drive',
            companions: 1,
            schedule: new Date(Date.now() + 86400000), // Tomorrow
            status: 'pending'
        });
        console.log('TEST_VISITOR_ID:', newVisitor._id.toString());
        mongoose.connection.close();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
