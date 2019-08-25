import {Request, Response} from "express-serve-static-core";
import {check_password, send_password, validate_email, validate_password} from "./util";
import express from 'express';
import bcrypt from 'bcrypt';
import Bodyparser from 'body-parser';
import gen_password from 'generate-password';
import {model} from "./data_base";

const PORT = 3000;

const app = express();

app.use(Bodyparser.json());
app.use(Bodyparser.urlencoded({extended: true}));

app.post('/auth/register', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    const {email, password} = req.body;

    validate_email(email, res);
    validate_password(password, res);

    const salt = bcrypt.genSaltSync(10);
    const hashedPass = bcrypt.hashSync(password, salt);

    const user = new model({
        email,
        password: hashedPass
    });

    model.findOne({email}, (err: Error) => {
        if (err) return res.status(200).json({result: false, Error: err.message})
    })
        .then((response: Array<any>) => {
            if (response === null) {
                return user.save()
                    .then((respon: Array<any>) =>
                        res.status(200).json({result: true, status: 'You have been registered'}))
                    .catch((err: Error) =>
                        res.status(200).json({result: false, Error: err.message}))
            } else {
                return res.status(200).json({
                    status: false,
                    Error: 'We already have user with this email in our data base'
                })
            }
        }).catch((err: Error) => res.status(200).json({result: false, Error: err.message}));
});

app.post('/auth/login', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    const {email, password} = req.body;

    validate_email(email, res);
    validate_password(password, res);

    model.findOne({email}, (err: Error, docs: Array<any>) => {
        if (err) return res.status(200).json({result: false, Error: err.message})
    })
        .then(async (response: Array<any>) => {
            try {
                if (await check_password(response, res, password)) {
                    return res.status(200).json({
                        result: true,
                        data: {name: email, status: 'You successfully have been submitted'}
                    });
                }
            } catch (err) {
                return res.status(200).json({result: false, Error: err.message})
            }
        })
        .catch((err: Error) => res.status(200).json({result: false, Error: err.message}))
});

app.post('/auth/resetPassword', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    const {email} = req.body;

    validate_email(email, res);

    model.findOne({email}, (err: Error, docs: any[]) => {
        if (err) return res.status(200).json({result: false, Error: err.message})
    })
        .then((response: Array<any>) => {
            if (response.length === 0) {
                return res.status(200).json({result: false, Error: 'We do not have this email in our data base'})
            } else {
                const new_password = gen_password.generate({
                    length: 8,
                    numbers: true,
                    uppercase: true
                });
                const salt = bcrypt.genSaltSync(10);
                const hashedPass = bcrypt.hashSync(new_password, salt);

                model.updateOne({email}, {password: hashedPass})
                    .then((response: Response) => console.log('Successfully updated the password', response))
                    .catch((err: Error) => res.status(200).json({result: false, Error: err.message}));

                send_password(email, res, new_password);
                return res.status(200).json({result: true, status: 'Your password has been reset successfully'})
            }
        })
        .catch((err: Error) => res.status(200).json({result: false, Error: err.message}));
});

app.listen(PORT, () => {
    console.log(`Listening on localhost:${PORT}`)
});
