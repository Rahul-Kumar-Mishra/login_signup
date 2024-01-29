const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initialize(passport, getUserByEmail, getUserByid) {
    //function to autenticate use
    const autenticateUsers = async (email, password, done) => {
        const user = await getUserByEmail(email);

        if(!user){
            return done(null, false, {message: "No user found with this email"})
        }
        try {
            if(await bcrypt.compare(password, user.password)){
                return done(null, user);
            }
            else{
                return done(null, false, {message: "Password Incorrect"});
            }
        }
        catch ( err ){
            console.log(err);
            return done(err);
        }
    }
    
    passport.use(new localStrategy({ usernameField: 'email'}, autenticateUsers));

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        return done(null, getUserByid(id));
    })

}

module.exports = initialize;