const passport = require('passport')
var session = require('express-session')
var sessionstore = require('sessionstore');
const OAuth2Strategy = require('passport-oauth2')
const express = require('express');
const app = express();
app.use(session({
    store: sessionstore.createSessionStore(),
    secret: '1'
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

const config = require('./.secret.json');

const callbackURL = "http://localhost:9876/auth/example/callback"; // replace with your callbackurl, e.g. http://localhost:9876/auth/example/callback
const clientID = config.clientID; // replace with your clientID
const clientSecret = config.clientSecret; // replace with your clientSecret

let data = {};

passport.use(new OAuth2Strategy({
        authorizationURL: 'https://safir.com/oauth/authorize',
        tokenURL: 'https://safir.com/oauth/token',
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: callbackURL
    },
    async function (accessToken, refreshToken, profile, cb) {
        const response = await fetch('https://safir.com/oauth/userinfo', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken,
            },
        })
        const user = await response.json();
        data = {user, accessToken}
        console.log(accessToken, user)
        return cb(null, user)
    }
));
app.get('/', (req, res) => {
    return res.end(`<div>${JSON.stringify(data)}</div><div><a href="/auth/example/callback">login with SAFIR</a></div>`)
});

app.get('/auth/example/callback',
    passport.authenticate('oauth2', {failureRedirect: '/failure'}), (req, res) => {
        return res.redirect('/')
    });
app.get('/failure', (req, res) => {
    return res.end(`<div>fail</div>`)
})

app.listen(9876, () => console.log('port 9876'))
