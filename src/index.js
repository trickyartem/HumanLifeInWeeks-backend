const express = require('express');
const bcrypt = require('bcrypt');
const Bodyparser = require('body-parser');
const Database = require('nedb');

const app = express();
const db = new Database('database.db');

app.use(Bodyparser.json());
app.use(Bodyparser.urlencoded({ extended: true }));
db.loadDatabase();

app.post('/auth/register', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    const { name, password } = req.body;

    const salt = bcrypt.genSaltSync(10);
    const hashedPass = bcrypt.hashSync(password, salt);

    db.find({ name: name }, (err, docs) => {
        if (docs.name === undefined) {
            res.status(200).send(JSON.stringify({result: false, data: {name: 'This name already exists in our database'}}))
        } else {
            db.insert(({name: name, password: hashedPass}));
            res.status(200).send(JSON.stringify({result: true, data: {name: name}}));
        }
    });

});


app.post('/auth/login', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const { name, password } = req.body;

    db.findOne({ name: name },(err, docs) => {
        if(!err) check_pass(docs);
        else {
            console.log(err);
            return res.status(200).send(JSON.stringify(( { result: false, data: { name: 'We dont have this name in our data base' } } )))
        }
    });

    async function check_pass(user) {
         if (!user) {
             return res.status(200).send(JSON.stringify({ result: false, data: { name: 'Cannot find user in our data base' } }));
         }

        try {
             if (await bcrypt.compare(password, user.password)) {
                 res.status(200).send(JSON.stringify({ result: true, data: { name: user.name, status: 'You successfully have been submitted' } }));
             } else {
                 res.status(200).send(JSON.stringify({ result: true, data: { status: 'Incorrect password' } }))
             }
        } catch(err) {
             console.log(err);
             res.status(200).send(JSON.stringify({ result: false }))
        }
    }
});

app.listen(3000, () => {
    console.log('Listening on localhost:5000')
});
