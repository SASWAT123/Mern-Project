const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

//imports from other files
const { signup, signin, signout } = require("../controllers/authentication");

router.post(
  "/signup",
  [
    check("firstName", "firstName should be atleast 3 characters").isLength({
      min: 3,
    }),
    check("lastName", "lastName should be atleast 3 characters").isLength({
      min: 3,
    }),
    check("email", "email is required").isEmail(),
    check("password", "password should be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  signup
);

router.post(
  "/signin",
  [
    check("email", "email is required").isEmail(),
    check("password", "password is required").isLength({
      min: 1,
    }),
  ],
  signin
);

router.get("/signout", signout);

module.exports = router;
