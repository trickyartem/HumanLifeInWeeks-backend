const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL,
    {useNewUrlParser: true}
);

const db = mongoose.connection;
db.on('error', (error: Error) => console.log(error));
db.once('open', () => console.log('Connected to Mongoose'));

const subSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    title: {
        type: String,
        required: false
    },

    timestamp: {
        type: String,
        required: false
    },

    description: {
        type: String,
        required: false
    },

    id: {
        type: String,
        required: false
    }
});

export const model = mongoose.model('Users', subSchema);