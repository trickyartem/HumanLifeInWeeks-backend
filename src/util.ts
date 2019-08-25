import {Response} from "express-serve-static-core";
import {html_text} from "./email_text";
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

const dotenv = require('dotenv').config({path: '.' + '/.env'});

type InputType = "email" | "password";

function inputValidate(input: string, type: InputType) {
    switch (type) {
        case "email":
            return /^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,10}$/g.test(input);
        case "password":
            return /\w{6,24}/g.test(input);
    }
    return false;
}

export async function check_password(user: any, res: Response, password: string) {
    if (!user) {
        return res.status(200).json({
            result: false,
            Error: 'Cannot find user in our data base'
        });
    }

    try {
        if (await bcrypt.compare(password, user.password)) {
            return true;
        } else {
            return res.status(200).json({result: false, Error: 'Incorrect password'})
        }
    } catch (err) {
        console.log(err);
        res.status(200).json({result: false, Error: err.message});
    }
}


export function send_password(email: string, res: Response, new_password: string) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: true,
        auth: {
            user: process.env.MY_EMAIL,
            pass: process.env.APP_PASSWORD
        }
    });

    const mailOptions = {
        from: 'HumanLifeInWeeks',
        to: email,
        subject: 'Reset password to your account in HumanLifeInWeeks',
        text: 'This is your new password for account ' + new_password,
        html: html_text(new_password)
    };
    // console.log(html_text())

    transporter.sendMail(mailOptions, (error: Error | null, info: any) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            return res.status(200).json({
                result: true,
                status: 'Your new password has been sent to your email'
            });
        }
    });
}

export function validate_email(email: string, res: Response) {
    if (!inputValidate(email, "email")) {
        return res.json({result: false, Error: 'Invalid email'})
    }
}

export function validate_password(password: string, res: Response) {
    if (!inputValidate(password, "password")) {
        return res.json({result: false, Error: 'Invalid password'})
    }
}
