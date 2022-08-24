const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const db = require("./dbconfig");

module.exports = function (passport) {
    passport.use(
      new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
        db.searchByValue({
          table: "user",
          searchAttribute: "email",
          searchValue: email,
          attributes: ["*"],
        })
          .then((result) => {
            // console.log(result);
            const users = result.data;
            if (users.length === 0) {
              return done(null, false, { message: "No user found" });
            }
            else{
              const foundUser = users[0];
              bcrypt.compare(password, foundUser.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                  return done(null, foundUser);
                } else {
                  return done(null, false, { message: "Password incorrect" });
                }
              })
            }
          })
          .catch((err) => {
            console.log(err);
            return done(err);
          });
      })
    );
    passport.serializeUser(function (user, done) {
        // console.log("serializeUser");
        done(null, user.id);
      });
    
      passport.deserializeUser(function (id, done) {
        // console.log("deserializeUser");
        db.searchByHash(
          {
            table: "user",
            hashValues: [id],
            attributes: ["*"],
          },
          function (err, user) {
            done(err, user);
          }
        );
      });
    };