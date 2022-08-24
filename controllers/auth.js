const passport = require("passport");
const bcrypt = require("bcrypt");
const db = require("../config/dbconfig");

module.exports.signUp = (req, res) => {
  console.log(req.body);
    const { name, email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      res.redirect("/login");
    }
    db.searchByValue({
      table: "user",
      searchAttribute: "email",
      searchValue: email,
      attributes: ["*"],
    })
      .then((result) => {
        const users = result.data;
        if (users.length > 0) {
          res.redirect("/login");
        } else {
          bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
              console.log(err);
            } else {
              db.insert({
                table: "user",
                records: [
                  {
                    name: name,
                    email: email,
                    password: hash
                  },
                ],
              })
                .then((result) => {
                  console.log(result);
                  passport.authenticate("local")(req, res, () => {
                    res.redirect("/home");
                  });
                })
                .catch((err) => {
                  console.log(err);
                  res.redirect("/login");
                });
            }
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/login");
      });
  };
  
  module.exports.login = (req, res) =>
    passport.authenticate("local", { failureRedirect: "/login" })(req, res, () => {
      res.redirect("/home");
    });