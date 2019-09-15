import jwt from "jsonwebtoken";
import {config} from "../config";
import {Request, Response} from "express-serve-static-core";
import bcrypt from "bcrypt";
import {model} from "../data_base";
import {check_password, create_token, send_password} from "../util";
import {existed_email, no_match_users, registered, removed, submitted, wrong_pass} from "../messages";
// @ts-ignore
import gen_password from "generate-password";

export const me = (req: any, res: Response) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];

    if (!token) return res.json({result: false});

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    if (token) {
        jwt.verify(token, config.secret, (err: Error, decoded: any) => {
            if (err) {
                return res.json({
                    result: false,
                    message: 'Token is not valid',
                    token: null
                });
            } else {
                return res.json({
                    result: true,
                    message: 'Token is valid',
                    token
                })
            }
        })
    } else {
        return res.json({
            result: false,
            message: 'Token in not supplied'
        })
    }
}

export const register = (req: Request, res: Response) => {
    const {email, password, bornDate} = req.body;

    const salt = bcrypt.genSaltSync(10);
    const hashedPass = bcrypt.hashSync(password, salt);

    const users = new model({
        bornDate,
        email,
        password: hashedPass
    });

    model.findOne({email}, (err: Error) => {
        if (err) return res.status(200).json({result: false, Error: err.message})
    }).then((response: any) => {
        if (response === null) {
            return users.save()
                .then((user: any) => {
                    const token = create_token(email);
                    return res.status(200).json({
                        result: true,
                        status: registered,
                        token,
                        user_id: user._id
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
}

export const login = (req: Request, res: Response) => {
    const {email, password} = req.body;

    const token = create_token(email);

    model.findOne({email}, (err: Error, docs: Array<any>) => {
        if (err) return res.status(200).json({result: false, Error: err.message})
    })
        .then(async (user: any) => {
            if (user === null) {
                return res.status(200).json({
                    result: false,
                    Error: no_match_users
                })
            }
            try {
                if (await check_password(user, res, password)) {
                    return res.status(200).json({
                        result: true,
                        email,
                        status: submitted,
                        token,
                        user_id: user._id
                    });
                } else {
                    return res.status(200).json({result: false, Error: wrong_pass})
                }
            } catch (err) {
                return res.status(200).json({result: false, Error: err.message})
            }
        })
        .catch((err: Error) => res.status(200).json({result: false, Error: err.message}))
}

export const reset_password = (req: Request, res: Response) => {
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
}

export const remove_user = (req: Request, res: Response) => {
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
            }).catch((err: Error) => res.status(200).json({result: false, Error: err.message}))
        }
    }).catch((err: Error) => res.status(200).json({result: false, Error: err.message}))
}
