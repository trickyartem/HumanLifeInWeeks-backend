import {Request, Response} from "express-serve-static-core";
import {model} from "../data_base";
import {check_user_send_res} from "../util";
import {added, no_match_users, removed} from "../messages";

export const add_event = (req: Request, res: Response) => {
    const {email, title, timestamp, description} = req.body;
    const events = {title, timestamp, description};

    model.findOneAndUpdate({email},
        {$push: {events}},
        (err: Error, docs: any) => {
            if (err) return res.status(200).json({result: false, Error: err.message})
        }).then((user: any) => {
        const last_event = user.events.length - 1;
        check_user_send_res(user, res, no_match_users, added, user.events[last_event]._id);
    }).catch((err: Error) => res.status(200).json({result: false, Error: err.message}))
}

export const remove_event = (req: Request, res: Response) => {
    const {id} = req.body;

    model.findOneAndUpdate(
        {"events._id": {$in: id}},
        {$pull: {events: {_id: id}}}, (err: Error, docs: any) => {
        if (err) return res.status(200).json({result: false, Error: err.message});
        res.status(200).json({result: true, status: removed});
    })
}

export const get_events = (req: Request, res: Response) => {
    const {email} = req.body;

    model.findOne({email}, (err: Error, docs: any) => {
        if (err) return res.status(200).json({result: false, Error: err.message});
    }).then((user: any) => {
        if (user !== null) {
            res.status(200).json({result: true, events: user.events})
        }
    })
}
