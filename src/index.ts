import {setHeaders} from "./middleware/setHeaders";
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
app.use(setHeaders);


app.get('/auth/me', me);
app.post('/auth/register', validate_email, validate_password, register);
app.get('/auth/login', validate_email, validate_password, login);
app.put('/auth/reset-password', validate_email, reset_password);
app.delete('/auth/remove-user', check_token, validate_email, validate_password, remove_user);
app.post('/add-event', check_token, add_event);
app.delete('/remove-event', check_token, remove_event);
app.get('/get-events', check_token, get_events);

app.listen(PORT, () => {
    console.log(`Listening on localhost:${PORT}`)
});
