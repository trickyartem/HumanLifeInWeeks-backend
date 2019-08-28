import {Request, Response} from "express-serve-static-core";
import {check_password, send_password, validate_email, validate_password, check_token, create_token} from "./util";
import express from 'express';
import bcrypt from 'bcrypt';
import Bodyparser from 'body-parser';
import gen_password from 'generate-password';
import {model} from "./data_base";

const PORT = 3000;
const app = express();

app.use(Bodyparser.json());
app.use(Bodyparser.urlencoded({extended: true}));

app.post('/auth/register', validate_email, validate_password, (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    const {email, password} = req.body;

    const salt = bcrypt.genSaltSync(10);
    const hashedPass = bcrypt.hashSync(password, salt);

    const users = new model({
        email,
        password: hashedPass
    });

    model.findOne({email}, (err: Error) => {
        if (err) return res.status(200).json({result: false, Error: err.message})
    })
        .then((response: Array<any>) => {
            if (response === null) {
                return users.save()
                    .then((respon: Array<any>) => {
                        const token = create_token(email);
                        return res.status(200).json({
                            result: true,
                            status: `You have been registered ${token}`
                        })
                    })
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

app.post('/auth/login', check_token, validate_email, validate_password, (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    const {email, password} = req.body;

    let token: string | string[] | undefined = 'hi';
    if (!(req.headers['x-access-token'] || req.headers['authorization'])) {
        token = create_token(email);
    } else {
        token = req.headers['x-access-token'] || req.headers['authorization'];
    }

    model.findOne({email}, (err: Error, docs: Array<any>) => {
        if (err) return res.status(200).json({result: false, Error: err.message})
    })
        .then(async (response: Array<any>) => {
            if (response === null) {
                return res.status(200).json({
                    result: false,
                    Error: 'There is no users with this email in out data base'
                })
            }
            try {
                if (await check_password(response, res, password)) {
                    return res.status(200).json({
                        result: true,
                        data: {name: email, status: 'You successfully have been submitted', token}
                    });
                } else {
                    return res.status(200).json({result: false, Error: 'Incorrect password'})
                }
            } catch (err) {
                return res.status(200).json({result: false, Error: err.message})
            }
        })
        .catch((err: Error) => res.status(200).json({result: false, Error: err.message}))
});

app.post('/auth/resetPassword', validate_email, (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    const {email} = req.body;

    model.findOne({email}, (err: Error, docs: any[]) => {
        if (err) return res.status(200).json({result: false, Error: err.message})
    })
        .then((response: Array<Object>) => {
            if (response === null) {
                return res.status(200).json({
                    result: false,
                    Error: 'We do not have this email in our data base'
                })
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

app.post('/auth/removeUser', check_token, validate_email, validate_password, (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    const {email} = req.body;

    model.findOne({email}, (err: Error, docs: Array<Object>) => {
        if (err) return res.status(200).json({result: false, Error: err.message})
    }).then((response: Array<Object>) => {
        if (response === null) {
            return res.status(200).json({
                result: false,
                Error: 'There is no users with this email in out data base'
            })
        } else {
            model.deleteOne({email}, (err: Error) => {
                if (err) res.status(200).json({result: false, Error: err.message})
            }).then((response: Response) => {
                return res.status(200).json({
                    result: true,
                    status: 'You successfully have been removed from our data base'
                })
            })
        }
    }).catch((err: Error) => res.status(200).json({result: false, Error: err.message}))
});

app.listen(PORT, () => {
    console.log(`Listening on localhost:${PORT}`)
});
