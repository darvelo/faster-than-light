'use strict';

/*
 * Module Dependencies
 */

var express = require('express'),
    expressValidator = require('express-validator'),
    app = express(),
    silent = 'test' === process.env.NODE_ENV,
    devMode = process.env.NODE_ENV === 'dev';

var server = require('http').createServer(app),
    io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
  socket.on('yaya', function (data) {
    socket.emit('yoyo', { yoyo: 'son' });
  });
});

/*
 * Passport-related requires
 */
var passport = require('passport'),
    MongoStore = require('connect-mongo')(express),
    LocalStrategy = require('passport-local').Strategy,
    ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn,
    flash = require('connect-flash');

app.api = require('./api');
app.authentication = require('./lib/authentication');
app.db = require('./lib/database/mongoose');
app.errors = require('./lib/errorTypes');
app.pages = require('./routes');
app.reservedSlugs = require('./lib/slugs');


// Pass Express app instance.
// Has handles to:
// * db          (one unified database connection)
// * routes      (html response, defers to api for json)
// * api routes  (json response, also used internally)
app.api.use(app);
app.authentication.use(app);
app.db.use(app);
app.pages.use(app);

/*
 * Passport Strategy and Authentication Methods
 */
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
  },
  function(username, password, done) {
    app.db.getUserByName(username, function (err, user) {
      if (err) {
        console.error('There\'s been an error in the Passport user authentication check.', err);
        return done(null, false, { message: 'Incorrect credentials. Please try again.' });
      }

      console.log(password, user.salt, user.hash);
      app.authentication.checkPassword(password, user.salt, user.hash, function (err, isValid) {
        if (err) {
          return done(err);
        }

        if (!isValid) {
          return done(null, false, { message: 'Incorrect credentials.' }); // don't specify which credentials
        }

        return done(null, user);
      });
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  app.db.getUserById(id, function(err, user) {
    done(err, user);
  });
});



/*
 * Config
 */

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

if (process.env.SUBLIME) {
  app.use(express.logger('short'));
} else if (silent) {
  app.use(express.logger('dev'));
}

app.use(express.favicon());
app.use(express.cookieParser(/* 'some secret key to sign cookies' */ 'secretkey' ));
app.use(express.bodyParser());


app.use(express.session({
  key: 'mysession',
  secret: 'SECRET',
  cookie: {
    maxAge: null, //new Date(Date.now() + 1209600), // two weeks, in seconds
  },
  store: new MongoStore({
    mongoose_connection: app.db.mainDB.connections[0],
  }),
}));
app.use(flash());


// Session-persisted message middleware
/*app.use(function(req, res, next){
  var err = req.session.error
    , msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = '';
  if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
  if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
  next();
});*/

// set CSRF token into res.locals to be used in Jade templates
app.use(function(req, res, next){
  res.locals.token = req.session._csrf;
  next();
});


app.use(passport.initialize());
app.use(passport.session());
app.use(express.compress());
app.use(express.methodOverride());
app.use(express.csrf()); // dependent on session support
// app.use(expressValidator);


app.use('/api', app.authentication.checkCredentials);


// SANITIZE AND/OR ENCODE ALL URLS, DATABASE QUERIES,
// INPUT, and ANYTHING THAT WILL MAKE ITS WAY INTO HTML TAGS


  /*  DocBlockr  */




// our custom "verbose errors" setting
// which we can use in the templates
// via settings['verbose errors']
app.enable('verbose errors');

// disable them in production
// use $ NODE_ENV=production node examples/error-pages
if ('production' === app.settings.env) {
  app.disable('verbose errors');
}


// "app.router" positions our routes
// above the middleware defined below,
// this means that Express will attempt
// to match & call routes _before_ continuing
// on, at which point we assume it's a 404 because
// no route has handled the request.

app.use(app.router);

if (devMode) {
  app.use(express.static('.tmp'));
  app.use(express.static('app'));
} else {
  app.use(express.static('dist'));
}

// Since this is the last non-error-handling
// middleware use()d, we assume 404, as nothing else
// responded.

// $ curl http://localhost:3000/notfound
// $ curl http://localhost:3000/notfound -H "Accept: application/json"
// $ curl http://localhost:3000/notfound -H "Accept: text/plain"

app.use(function(req, res, next){
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});

// error-handling middleware, take the same form
// as regular middleware, however they require an
// arity of 4, aka the signature (err, req, res, next).
// when connect has an error, it will invoke ONLY error-handling
// middleware.

// If we were to next() here any remaining non-error-handling
// middleware would then be executed, or if we next(err) to
// continue passing the error, only error-handling middleware
// would remain being executed, however here
// we simply respond with an error page.

app.use(function(err, req, res, next){
  // we may use properties of the error object
  // here and next(err) appropriately, or if
  // we possibly recovered from the error, simply next().
  console.error('Server error catch-all says: ', err);

  res.status(err.status || (err.status = 500));

  if (req.accepts('html')) {
    res.render('errors', { status: err.status, error: devMode ? err : false });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Error' + err.status });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Error' + err.status);
});

/*
 * Routes
 */

app.get('/', function(req, res) {
  if (req.user) {
    app.pages.home.get(req, res);
  } else {
    res.render('index', { dev: devMode });
  }
});
// app.get('/api', function(req, res, next) { res.redirect('/404'); /*next(new Error('no API page'));*/ });
//app.get('/api/contexts', app.api.contexts.getAll);
app.get('/api/contexts', /* validation middleware */ /* app.validator.contexts, */ app.api.contexts.getAll);
app.get('/api/contexts/:id', /* validation middleware */ /* app.validator.contexts, */ app.api.contexts.oneById);
app.get('/api/batch/context/:id', app.api.contexts.getAssociatedData);
app.post('/api/contexts/:id', app.api.contexts.postContext);

app.put('/api/users/:id', app.api.users.putUser);

app.get('/api/testjson', function (req, res) { console.log('json received?'); console.log(req.body); res.send(req.body); });
app.post('/api/testjson', function (req, res) { console.log('json received?'); console.log(typeof req.body, req.body, req.body.title); res.send(req.body); });

app.get('/scripts/*', function(req, res, next) { return next(); res.send("yo son!")});


app.get('/signup', app.pages.signup.get);
app.post('/signup', app.pages.signup.post);

app.get('/login', app.pages.login.get);
app.post('/login',
  passport.authenticate('local', {
    // returns to page that required login, or if none, redirects home.
    // depends on connect-ensure-login and the ensureLoggedIn() middleware on other routes.
    successReturnToOrRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  })
);

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});

app.get(':id', app.pages.userProfile.get);

/*
 * App-specific routes handled by Backbone Router but require login
 */
app.get('/settings', ensureLoggedIn('/login'), app.pages.home.get);
app.get('/blog', ensureLoggedIn('/login'), app.pages.home.get);
app.get('/calendar', ensureLoggedIn('/login'), app.pages.home.get);
app.get('/calendar/events', ensureLoggedIn('/login'), app.pages.home.get);
app.get('/calendar/recurring', ensureLoggedIn('/login'), app.pages.home.get);
app.get('/statistics', ensureLoggedIn('/login'), app.pages.home.get);
app.get('/timeline', ensureLoggedIn('/login'), app.pages.home.get);
app.get('/timeline/milestones', ensureLoggedIn('/login'), app.pages.home.get);
app.get('/timeline/failures', ensureLoggedIn('/login'), app.pages.home.get);
app.get('/timeline/successes', ensureLoggedIn('/login'), app.pages.home.get);
app.get('/timeline/achievements', ensureLoggedIn('/login'), app.pages.home.get);
app.get('/achievements', ensureLoggedIn('/login'), app.pages.home.get);
app.get('/reminders', ensureLoggedIn('/login'), app.pages.home.get);
app.get('/timer', ensureLoggedIn('/login'), app.pages.home.get);
app.get('/timer/:year/day/:day', ensureLoggedIn('/login'), app.pages.home.get);
app.get('/timer/:year/week/:week', ensureLoggedIn('/login'), app.pages.home.get);
app.get('/timer/:year/month/:month', ensureLoggedIn('/login'), app.pages.home.get);
app.get('/task/:taskId/edit', ensureLoggedIn('/login'), app.pages.home.get);


/*
 * Status Code pages
 */
app.get('/404', function(req, res, next){
  // trigger a 404 since no other middleware
  // will match /404 after this one, and we're not
  // responding here
  next();
});

app.get('/403', function(req, res, next){
  // trigger a 403 error
  var err = new Error('not allowed!');
  err.status = 403;
  next(err);
});

app.get('/500', function(req, res, next){
  // trigger a generic (500) error
  next(new Error('keyboard cat!'));
});


/*
 * Check for Grunt. If no parent, we're live. Run the socket.io server (contains express app).
 * If we've got a parent, module.exports will give it what it needs to work.
 */
if (!module.parent) {
  server.listen(9000);
  silent || console.log('Express started on port 9000');
}

module.exports = {
  server: server,
  app: app,
};
