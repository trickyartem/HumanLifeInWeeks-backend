import {Request, Response} from "express-serve-static-core";
import {
    check_password,
    send_password,
    validate_email,
    validate_password,
    check_token,
    create_token,
    check_user_send_res
} from "./util";
import {
    existed_email,
    no_match_users,
    registered,
    submitted,
    wrong_pass,
    removed,
    added
} from "./messages";
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
    }).then((response: any) => {
        if (response === null) {
            return users.save()
                .then((respon: Array<any>) => {
                    console.log(respon)
                    const token = create_token(email);
                    return res.status(200).json({
                        result: true,
                        status: registered,
                        token
                    })
                })
                .catch((err: Error) =>
                    res.status(200).json({result: false, Error: err.message}))
        } else {
            return res.status(200).json({
                status: false,
                Error: existed_email
            })
        }
    }).catch((err: Error) => res.status(200).json({result: false, Error: err.message}));
});

app.post('/auth/login', validate_email, validate_password, check_token, (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    const {email, password} = req.body;

    let token = req.headers['x-access-token'] || req.headers['authorization'];
    if (token === undefined) {
        token = create_token(email);
    } else {
        token = req.headers['x-access-token'] || req.headers['authorization'];
    }

    model.findOne({email}, (err: Error, docs: Array<any>) => {
        if (err) return res.status(200).json({result: false, Error: err.message})
    })
        .then(async (response: any) => {
            if (response === null) {
                return res.status(200).json({
                    result: false,
                    Error: no_match_users
                })
            }
            try {
                if (await check_password(response, res, password)) {
                    return res.status(200).json({
                        result: true,
                        data: {name: email, status: submitted, token}
                    });
                } else {
                    return res.status(200).json({result: false, Error: wrong_pass})
                }
            } catch (err) {
                return res.status(200).json({result: false, Error: err.message})
            }
        })
        .catch((err: Error) => res.status(200).json({result: false, Error: err.message}))
});

app.post('/auth/reset-password', validate_email, (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    const {email} = req.body;

    model.findOne({email}, (err: Error, docs: any[]) => {
        if (err) return res.status(200).json({result: false, Error: err.message})
    })
        .then((response: any) => {
            if (response === null) {
                return res.status(200).json({
                    result: false,
                    Error: no_match_users
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

app.post('/auth/remove-user', check_token, validate_email, validate_password, (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    const {email} = req.body;

    model.findOne({email}, (err: Error, docs: Array<Object>) => {
        if (err) return res.status(200).json({result: false, Error: err.message})
    }).then((response: any) => {
        if (response === null) {
            return res.status(200).json({
                result: false,
                Error: no_match_users
            })
        } else {
            model.deleteOne({email}, (err: Error) => {
                if (err) res.status(200).json({result: false, Error: err.message})
            }).then((response: any) => {
                return res.status(200).json({
                    result: true,
                    status: removed
                })
            })
        }
    }).catch((err: Error) => res.status(200).json({result: false, Error: err.message}))
});

app.post('/add-event', check_token, ((req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    const {email, title, timestamp, description} = req.body;
    const events = {title, timestamp, description};

    model.findOneAndUpdate({email},
        {$push: {events}},
        (err: Error, docs: any) => {
            if (err) return res.status(200).json({result: false, Error: err.message})
        }).then((user: any) => {
        const last_event = user.events.length - 1;
        check_user_send_res(user, res, no_match_users, added, user.events[last_event]._id);
    })
}));

app.post('/remove-event', check_token, ((req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    const {id} = req.body;

    model.findOneAndUpdate({"events._id": {$in: id}}, {$pull: {events: {_id: id}}}, (err: Error, docs: any) => {
        if (err) return res.status(200).json({result: false, Error: err.message});
        res.status(200).json({result: true, data: removed});
    })
}));

app.post('/get-events', check_token, ((req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');

    const {email} = req.body;

    model.findOne({email}, (err: Error, docs: any) => {
        if (err) return res.status(200).json({result: false, Error: err.message});
    }).then((user: any) => {
        if (user !== null)
            res.status(200).json({result: true, events: user.events})
    })
}));

// app.post('/get-users', (req: Request, res: Response) => {
//     res.setHeader('Content-Type', 'application/json');
//     const {email, title, timestamp, id, description} = req.body;
//
//     model.find({}, (err: Error, docs: Array<Object>) => {
//         res.status(200).json({data: docs});
//         // check_user_send_res(docs, res, no_match_users, added, '')
//     })
// });

app.listen(PORT, () => {
    console.log(`Listening on localhost:${PORT}`)
});
