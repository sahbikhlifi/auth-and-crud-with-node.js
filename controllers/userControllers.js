const User = require("../models/user")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const mail = require('../utils/mailer')
const crypto = require('crypto');
const { getToken, getRefreshToken } = require("../authenticate")

exports.signupController = async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        res.statusCode = 500
        res.send({ message: "All the input are required" })
    } else {
        if (await User.findOne({ email })) {
            return res.status(409).send({ success: false, message: "This email is already used" })
        }
        const user = new User({ firstName, lastName, email, password });
        user.password = await bcrypt.hash(user.password, 10)
        user.save().then((savedUser) => {
            const refreshToken = getRefreshToken({ _id: savedUser._id })
            crypto.randomBytes(20, function (err, buf) {
                savedUser.activeToken = buf.toString('hex');
                savedUser.activeExpires = Date.now() + 24 * 3600 * 1000;
                savedUser.save();
                var link = 'http://locolhost:5001/users/active/' + user.activeToken;
                // Sending activation email
                mail({
                    to: req.body.email,
                    html: 'Please click <a href="' + link + '"> here </a> to activate your account.'
                });

                res.status(201).send({ success: true, message: "User was registered successfully!", savedUser, refreshToken })
            })
        }).catch(e => {
            return res.status(400).send({ success: false, message: e })
        })
    }
}

exports.loginController = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
    if (user && user.active === true) {
        const validPassword = await bcrypt.compare(password, user.password);
        if (validPassword) {
            const refreshToken = getRefreshToken({ _id: user._id })
            res.status(200).send({ success: true, message: "Valid password", user, refreshToken });
        }
        else {
            res.status(400).send({ success: false, message: "Invalid Password" });
        }
    } else {
        res.status(401).send({ success: false, message: "User does not exist or account not activate" });
    }
}

exports.activeAccount = (req, res, next) => {
    User.findOne({
        activeToken: req.params.activeToken,
    }, function (err, user) {
        if (err) return next(err);
        if (!user) {
            return res.status(401).send({ success: false, message: "Account not activated" })
        }
        user.active = true;
        user.save(function (err, user) {
            console.log(user.active)
            if (err) return next(err);
            return res.status(201).send({ success: true, message: "Account activated" })
        });
    });
}

exports.refreshToken = (req, res, next) => {
    if (refreshToken) {
        try {
            const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
            const userId = payload._id
            User.findOne({ _id: userId }).then(
                user => {
                    if (user) {
                        const tokenIndex = user.refreshToken.findIndex(
                            item => item.refreshToken === refreshToken
                        )
                        if (tokenIndex === -1) {
                            res.statusCode = 401
                            res.send("Unauthorized")
                        } else {
                            const token = getToken({ _id: userId })
                            const newRefreshToken = getRefreshToken({ _id: userId })
                            user.refreshToken[tokenIndex] = { refreshToken: newRefreshToken }
                            user.save((err, user) => {
                                if (err) {
                                    res.statusCode = 500
                                    res.send(err)
                                } else {
                                    res.send({ success: true, token, user })
                                }
                            })
                        }
                    } else {
                        res.statusCode = 401
                        res.send("Unauthorized")
                    }
                },
                err => next(err)
            )
        } catch (err) {
            res.statusCode = 401
            res.send("Unauthorized")
        }
    } else {
        res.statusCode = 401
        res.send("Unauthorized")
    }
}