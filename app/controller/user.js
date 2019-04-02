import  mongoose from 'mongoose';
import { Router } from 'express';
import User from '../model/user';
import bodyParser from 'body-parser';
import passport from 'passport';
import config from '../config';
import {generateAccessToken, respond, authenticate} from '../middleware/authMiddleware';



export default ({ config, db }) => {
    let api = Router();

    // '/v1/account/all'
    api.get('/',(req, res) => {
        User.find({}, (err, users) =>{
            if (err) {
                res.send(err);
            }
            res.json(users);
        });
        // res.status(200).send({ user: req.user });
    });

    // '/v1/account/me/:id'
    api.get('/me/:id',authenticate, (req, res) => {
        User.findById(req.params.id, (err, user) => {
            if (err) {
                return res.send(err);
            }
            res.json(user);
        });
    });

    // '/v1/account/:id'
    api.delete('/:id',authenticate, (req, res) => {
        User.remove({
            _id: req.params.id
        }, (err, user) => {
            if (err) {
                res.send(err);
            }
            res.json({ message: '\n' +
                'Account successfully deleted' });
        });
    });


    // '/v1/account/register'
    api.post('/register', (req, res) => {
        User.register(new User({ username: req.body.email,email: req.body.email,firstname :req.body.firstname,lastname :req.body.lastname }), req.body.password, function(err, account) {

            if (err) {
                if(err.name === "UserExistsError"){
                    return res.status(409).send(err);
                }else{
                    return res.status(500).send('An error occurred: ' + err);
                }
            }

            passport.authenticate(
                'local', {
                    session: false
                })(req, res, () => {
                // res.status(200).send('Successfully created new account');
                res.status(200).json({message:'New account was successfully created'});
            });
        });
    });

    api.post('/password/change', (req, res) =>{
        User.findById(req.body.id, (err, user) => {
            if (err) {
                return res.send(err);
            }
            if (req.body.newPassword){
                user.changePassword(req.body.oldPassword,req.body.newPassword,(err1, account) =>{
                    if (err1) {
                        return res.status(500).send(err1);
                    }

                    user.setPassword(req.body.newPassword, (e, state) =>{
                        if(e){
                            return res.status(500).send(e);
                        }

                        user.save(function(err2) {
                            if (err2) {
                                return res.send(err2);
                            }
                            res.json({ message: 'Password updated successfully'});
                        });

                    });


                });
            }
        });
    });

    // '/v1/account/:id' - PUT - update an existing record
    api.put('/:id', (req, res) => {
        User.findById(req.params.id, (err, user) => {
            if (err) {
                res.send(err);
            }
            user.username = req.body.email;
            user.email = req.body.email;
            user.firstname = req.body.firstname;
            user.lastname = req.body.lastname;
            user.role = req.body.role._id;

            user.save(function(err) {
                if (err) {
                    return res.send(err);
                }
                res.json({ message: 'Account updated with success' });
            });
        });


    });

    // '/v1/account/login'
    api.post('/login', passport.authenticate(
        'local', {
            session: false,
            scope: []
        }), generateAccessToken, respond);

    // '/v1/account/logout'
    api.get('/logout', authenticate, (req, res) => {
        req.logout();
        return res.status(200).send('Successfully logged out');
    });

    api.get('/me', authenticate, (req, res) => {
        res.status(200).json(req.user);
    });

    // '/v1/user/ping'
    api.get('/ping', (req, res) => {
        res.status(200).send("pong!");
    });

    return api;
}
