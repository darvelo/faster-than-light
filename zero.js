/*
 * Module Dependencies
 */

var express = require('express'),
    expressValidator = require('express-validator'),
    app = module.exports = express(),
    silent = 'test' === process.env.NODE_ENV,
    devMode = process.env.NODE_ENV === 'dev';

app.db = require('./lib/database');
app.passport = require('passport');
app.api = require('./api');
app.pages = require('./routes');

// Pass Express app instance.
// Has handles to:
// * db          (one unified database connection)
// * routes      (html response, defers to api for json)
// * api routes  (json response, also used internally)
app.api.use(app);
app.pages.use(app);


/*
 * Config
 */

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.favicon());
silent || app.use(express.logger('dev'));
app.use(express.cookieParser(/* 'some secret key to sign cookies' */));
//app.use(express.session());
app.use(express.compress());
app.use(express.methodOverride());
app.use(express.bodyParser());
//app.use(express.csrf());
app.use(expressValidator);


app.use('/api', app.api.fauxAuthenticate)



console.log(app.patch);

// SANITIZE AND/OR ENCODE ALL URLS, DATABASE QUERIES,
// INPUT, and ANYTHING THAT WILL MAKE ITS WAY INTO HTML TAGS


  /*  DocBlockr  */




// our custom "verbose errors" setting
// which we can use in the templates
// via settings['verbose errors']
app.enable('verbose errors');

// disable them in production
// use $ NODE_ENV=production node examples/error-pages
if ('production' == app.settings.env) {
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
  console.error(err);

  res.status(err.status || 500);

  if (req.accepts('html')) {
    res.render('500', { error: devMode ? err : false });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Server Error' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Server Error');
});

/*
 * Routes
 */

app.get('/', function(req, res) { res.render('index', { dev: devMode }); });
app.get('/api', function(req, res, next) { res.redirect('/404'); /*next(new Error('no API page'));*/ });
app.get('/api/contexts', app.api.contexts.getAll);

app.get('/user/:id', app.pages.home.get);
app.get('/scripts/*', function(req, res, next) { return next(); res.send("yo son!")});
app.get('/login', app.pages.login.get);
app.post('/login',
  app.passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);


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

if (!module.parent) {
  app.listen(9000);
  silent || console.log('Express started on port 9000');
} else {
  return app;
}

/*
  app.get('/user', function (req, res) {
      res.send(201, { name: 'tobi' });
  });

  app.get('/questions', function (req, res) {
      res.send(200, 'test');
  });
*/


