import {Schema} from "mongoose";

const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

mongoose.connect(process.env.DATABASE_URL,
    {useNewUrlParser: true}
);

const db = mongoose.connection;
db.on('error', (error: Error) => console.log(error));
db.once('open', () => console.log('Connected to Mongoose'));

const subSchema: Schema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
        unique: true
    },

    events: [{
        title: String,
        timestamp: String,
        description: String
    }]
});

export const model = mongoose.model('Users', subSchema);