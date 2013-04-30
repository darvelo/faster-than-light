module.exports = function(grunt) {
  var _ = grunt.util._;

  var options = {
    host: grunt.config(['connect']).options.hostname,
    port: grunt.config(['connect']).options.port,
    livereloadPort: _.defaults(grunt.config('livereload') || {}, { port: 35729 }).port,
  };

  process.env.NODE_ENV = 'dev';

  var zero = require('./zero');
  var app = zero.app;
  var server = zero.server;

  app.set('env', process.env.NODE_ENV);
  app.set('livereload', options.livereloadPort);

  grunt.log.writeln('Starting web server on port ' + options.port + '.');
  server.listen(options.port, options.host).on('error', function(err) {
    if (err.code === 'EADDRINUSE') {
      grunt.fatal('Port ' + options.port + ' is already in use by another process.');
    } else {
      grunt.fatal(err);
    }
  });
};
