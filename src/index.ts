import {Request, Response} from "express-serve-static-core";
import {
    validate_email,
    validate_password,
    check_token,
} from "./util";
import express from 'express';
import Bodyparser from 'body-parser';
import {me, login, register, remove_user, reset_password} from './auth_path/auth';
import {add_event, get_events, remove_event} from "./event_path/events";

const PORT = 3000;
const app = express();

app.use(Bodyparser.json());
app.use(Bodyparser.urlencoded({extended: true}));
app.use((req: any, res: any, next: any) => {
    res.set({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
      });
    next();
});


app.get('/auth/me', ((req: Request, res: Response) => {
    me(req, res);
}));

app.post('/auth/register', validate_email, validate_password, (req: Request, res: Response) => {
    register(req, res);
});

app.get('/auth/login', validate_email, validate_password, (req: Request, res: Response) => {
    login(req, res);
});

app.put('/auth/reset-password', validate_email, (req: Request, res: Response) => {
    reset_password(req, res);
});

app.delete('/auth/remove-user', check_token, validate_email, validate_password, (req: Request, res: Response) => {
    remove_user(req, res);
});

app.post('/add-event', check_token, ((req: Request, res: Response) => {
    add_event(req, res);
}));

app.delete('/remove-event', check_token, ((req: Request, res: Response) => {
    remove_event(req, res);
}));

app.get('/get-events', check_token, ((req: Request, res: Response) => {
    get_events(req, res);
}));

app.listen(PORT, () => {
    console.log(`Listening on localhost:${PORT}`)
});
