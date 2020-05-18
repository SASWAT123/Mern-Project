const User = require("../models/user");
const { validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");
require("dotenv").config();

//Signup controller
exports.signup = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }
  const user = new User(req.body);
  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        err: "Not able to save user in DB",
      });
    }
    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      id: user._id,
    });
  });
};

//Signin controller
exports.signin = (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "Email does not exist",
      });
    }

    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Email and password does not match",
      });
    }

    //Crete JWT token
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);

    //Insert token in cookie
    res.cookie("token", token, { expire: new Date() + 100 });

    //Send response to frontend
    const { _id, firstName, lastName, email, role } = user;
    return res.json({ token, user: { _id, firstName, lastName, email, role } });
  });
};

//Signout controller
exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "User Signed Out !!!",
  });
};

//Protected Routes
exports.isSignedIn = expressJwt({
  secret: process.env.SECRET,
  userProperty: "auth",
});

//Custom middleware
exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!checker) {
    return res.status(403).json({
      error: "ACCESS DENIED",
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    res.status(403).json({
      error: "NOT ADMIN",
    });
  }
  next();
};
