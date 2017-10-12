const path = require('path')
const express = require('express')
const passport = require('passport');
const passport_cas = require('passport-cas').Strategy
// const CASAuthentication = require('cas-authentication');
const session = require("express-session")
const memory_store = require('session-memory-store')(session);
const bodyParser = require('body-parser')
const morgan = require('morgan');
const config = require( path.join( process.cwd(), 'lib/configuration') );

const app = express()

// Log all requests
app.use(morgan('combined'));

// Setup session requirements for Passport
// app.use(cookieParser(config.get('app:session_secret')));
// app.use(bodyParser.json());       // to support JSON-encoded bodies
// app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
//   extended: true
// }))
app.use(session({
  secret: config.get('app:session_secret'),
  store: new memory_store(),
  resave: false,
  saveUninitialized: false
}));


// Setup Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passport_cas({
  ssoBaseURL: config.get('cas:base_url'),
  serverBaseURL: config.get('app:base_url')
  }, function(login, done) {
    return done(null, login);
  })
);
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});

// Setup required authentication routes
app.get('/login', function(req, res, next) {
  passport.authenticate('cas', { loginParams: { renew: config.get('cas:renew') || false } }, function (err, username, info) {
    if (err) {
      return next(err);
    }
    if (!username) {
      return res.redirect('/login');
    }
    req.logIn(username, function (err) {
      console.log("Login recorded for user: " + username);
      if (err) {
        return next(err);
      }
      return res.redirect(req.query['nextUrl']);
    });
  })(req, res, next);
});

app.get('/logout', function(req, res, next) {
  console.log("Logout recorded for user: " + req.user);
  console.log("Redirecting to " + config.get('cas:base_url') + '/logout');
  req.logout();
  res.redirect( config.get('cas:base_url') + '/logout' );
})

app.use( require( './routes.js' ) );

const port = config.get('app:port')
app.listen(port, function () {
  console.log('CAS Authentication proxy service running on port ' + port)
})
