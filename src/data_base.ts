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
    }
});

export const model = mongoose.model('Users', subSchema);