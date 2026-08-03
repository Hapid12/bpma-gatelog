require('dotenv').config();
const mongoose = require('mongoose');
const Visitor = require('./models/Visitor');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB connected');
        const latestVisitor = await Visitor.findOne().sort({ date: -1 });
        if (latestVisitor) {
            console.log('LATEST_VISITOR_ID:', latestVisitor._id);
            console.log('Name:', latestVisitor.name);
            console.log('Target:', latestVisitor.targetEmployee);
            console.log('Status:', latestVisitor.status);
        } else {
            console.log('No visitors found.');
        }
        mongoose.connection.close();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
