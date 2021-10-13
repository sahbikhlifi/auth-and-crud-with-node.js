const passport = require("passport")
const BearerStrategy = require("passport-http-bearer")
const User = require("../models/user")
const jwt = require("jsonwebtoken")

const secretOrKey = process.env.JWT_SECRET

passport.use(
  new BearerStrategy(function (token, done) {
    jwt.verify(token, secretOrKey, function (err, decoded) {
      User.findOne({ _id: decoded._id }, function (err, user) {
        if (err) {
          return done(err, false)
        }
        if (user) {
          return done(null, user)
        } else {
          return done(null, false)
        }
      })
    })
  })
)