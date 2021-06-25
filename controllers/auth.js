const User = require("../models/user");
const jwt = require("jsonwebtoken"); //use to generate signed token
const expressJwt = require("express-jwt"); // for authorization check
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.signup = (req, res) => {
    const user = new User(req.body);
    user.save((err, user) => {
        if (err) {
            return res.status(400).json({
                err: errorHandler(err)
            });
        }
        user.salt = undefined;
        user.hashed_password = undefined;
        res.json({ user });
    });
};
exports.signin = (req, res) => {
    // fimd user based on email
    const { email, password } = req.body;
    User.findOne({ email }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                // error: "User with that email does not exist. Please signup",
                error: "Error signing in",
            });
        }
        //if user is found, make sure the email and password match.
        //create authenticate method in user model

        if (!user.authenticate(password)) {
            return res.status(401).json({
                // error: "Email and password don't match",
                error: "Error signing in",
            });
        }

        // generate a signed token with user id and secret
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        res.cookie("t", token, { expire: new Date() + 9999 });
        // return response with user and token to frontend client

        const { _id, name, email, role } = user;
        return res.json({ token, user: { _id, name, email, role } });
    });
};

exports.signout = (req, res) => {
    res.clearCookie("t");
    res.json({ message: "Signed out successfully" });
};

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"], // added later
    userProperty: "auth",
});

exports.isAuth = (req, res, next) => {
    const user = req.profile && req.auth && req.profile._id == req.auth._id;

    if (!user) {
        return res.status(403).json({
            error: "Access denied",
        });
    }
    next();
};

exports.isAdmin = (req, res, next) => {
    if (req.profile.role === 0) {
        return res.status(403).json({
            error: "Admin resources! Access denied",
        });
    }
    next();
};