require('dotenv').config();
const mongoose = require('mongoose');
const Visitor = require('./models/Visitor');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const visitor = await Visitor.findById('6a4bbda7630ae13cda90363c');
        if (visitor) {
            console.log('STATUS:', visitor.status);
            console.log('EMPLOYEE_NOTES:', visitor.employeeNotes);
        } else {
            console.log('Visitor not found');
        }
        mongoose.connection.close();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
