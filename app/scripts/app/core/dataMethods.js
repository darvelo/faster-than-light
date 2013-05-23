define([
  'core/errorlog',
  'core/util',
  'backbone',
  'jquery',
  'underscore',
],

function (errlog, util, Backbone, $, _) {
  'use strict';

  var app;

  function empty () {
    app.collections.tasks.reset();
    app.collections.projects.reset();
    // kick off the app again with a fresh pull of contexts data for
    // things like lists that the user can click on to trigger AJAX events
    app.collections.contexts.fetch({ reset: true });
    return app;
  }

  function fetch () {
    app.collections.tasks.fetch();
    app.collections.projects.fetch();
    app.collections.contexts.fetch();
    app.collections.contexts.trigger('reset');
    return app;
  }

  function validate (data) {
    if (!data) {
      err = new Error('data did not exist in app validation method. App may be in an inconsistent state');
      errlog(1, err);

      return false;
    }

    /*
     * Validation mechanisms
     */
    var userValidated = data.user && app.validators.user(data.user) === null;

    var contextsValidated, invalidContexts;
    if (_.isArray(data.contexts)) {
      invalidContexts = _.filter(data.contexts, function (context) {
        // if valid, will return null, and not trigger the filter
        return app.validators.context(context);
      }, app);

      if (_.isEmpty(invalidContexts)) {
        contextsValidated = true;
      }
    }

    var projectsValidated, invalidProjects;
    if (_.isArray(data.projects)) {
      invalidProjects = _.filter(data.projects, function (project) {
        // if valid, will return null, and not trigger the filter
        return app.validators.project(project);
      }, app);

      if (_.isEmpty(invalidProjects)) {
        projectsValidated = true;
      }
    }

    var auxProjectsValidated, invalidAuxProjects;
    // auxProjects may be empty, which is fine
    if (!data.auxProjects || (_.isArray(data.auxProjects) && _.isEmpty(data.auxProjects))) {
      auxProjectsValidated = true;
    } else if (_.isArray(data.auxProjects)) {
      invalidAuxProjects = _.filter(data.auxProjects, function (auxProject) {
        // if valid, will return null, and not trigger the filter
        return app.validators.project(auxProject);
      }, app);

      if (_.isEmpty(invalidAuxProjects)) {
        auxProjectsValidated = true;
      }
    }

    var tasksValidated, invalidTasks;
    if (_.isArray(data.tasks)) {
      invalidTasks = _.filter(data.tasks, function (task) {
        // if valid, will return null, and not trigger the filter
        return app.validators.task(task);
      }, app);

      if (_.isEmpty(invalidTasks)) {
        tasksValidated = true;
      }
    }

    return {
      user: userValidated,
      invalidUser: data.user,

      contexts: contextsValidated,
      invalidContexts: invalidContexts,

      projects: projectsValidated,
      invalidProjects: invalidProjects,

      auxProjects: auxProjectsValidated,
      invalidAuxProjects: invalidAuxProjects,

      tasks: tasksValidated,
      invalidTasks: invalidTasks,
    };
  }

  function merge (data) {
    var valid = validate(data);

    // merge what's there ()

  }

  function bootstrap (bootstrapObject) {
    var err;

    /*
     * Set up user model
     */
    if (!bootstrapObject || !bootstrapObject.user) {
      // need user info before moving on
      app.user.fetch({ async: false });
    }

    if (bootstrapObject.user && _.isObject(bootstrapObject.user) &&
        // if validation passes
        app.validators.user(bootstrapObject.user) === null) {

      app.models.user.set(bootstrapObject.user);
    }

    app.models.user.app = app;

    // initialize todos layout since user settings should be populated
    // they're needed for setting up layout sizes and state
    app.trigger('todos:init');

    if (!bootstrapObject || _.isArray(bootstrapObject) || ! _.isObject(bootstrapObject) || _.isEmpty(bootstrapObject)) {
      err = new Error('Bootstrap does not exist!');
      errlog(2, err);
      return app.data.empty();
    }

    return app.data.reset(bootstrapObject);
  }

  function reset (data) {
    var err;
    var valid = validate(data);
    var user, contexts, projects, auxProjects, tasks;

    /*
     * Error handling:
     *   If data returned from server isn't in the proper format,
     *   log the error and set the temp variable to an empty array or object.
     *   When the final calls set the global collections/models, they'll be a noop.
     */
    if (data.user && _.isObject(data.user) && valid.user) {
      // deep clone user and remove properties of visual
      // settings that may have been set by another client
      user = util.deleteUserProps(data.user);
    } else if (!data.user) {
      err = new Error('User object in data reset did not exist');
      errlog(2, err);

      user = {};
    } else {
      err = new Error('User object in data reset was not in the proper form');
      err.user = valid.invalidUser;
      errlog(2, err);

      user = {};
    }

    if (data.contexts && _.isArray(data.contexts) && valid.contexts) {
      contexts = data.contexts;
    } else if (!data.contexts) {
      err = new Error('Contexts array in data reset did not exist');
      errlog(3, err);

      contexts = [];
    } else {
      err = new Error('Contexts array in data reset was not in the proper form');
      err.contexts = valid.invalidContexts;
      errlog(3, err);

      contexts = [];
    }

    if (data.projects && _.isArray(data.projects) && valid.projects) {
      projects = data.projects;
    } else if (!data.projects) {
      err = new Error('Projects array in data reset did not exist');
      errlog(3, err);

      projects = [];
    } else {
      err = new Error('Projects array in data reset was not in the proper form');
      err.projects = valid.invalidProjects;
      errlog(3, err);

      projects = [];
    }

    // auxProjects isn't strictly necessary, so no error sent
    if (!data.auxProjects || (_.isArray(data.auxProjects) && _.isEmpty(data.auxProjects))) {
      auxProjects = [];
    } else if (data.auxProjects && _.isArray(data.auxProjects) && valid.auxProjects) {
      auxProjects = data.auxProjects;
    } else {
      err = new Error('auxProjects array in data reset was not in the proper form');
      err.auxProjects = valid.invalidAuxProjects;
      errlog(3, err);

      auxProjects = [];
    }

    if (data.tasks && _.isArray(data.tasks) && valid.tasks) {
      tasks = data.tasks;
    } else if (!data.tasks) {
      err = new Error('Tasks array in data reset did not exist');
      errlog(3, err);

      tasks = [];
    } else {
      err = new Error('Tasks array in data reset was not in the proper form');
      err.tasks = valid.invalidTasks;
      errlog(3, err);

      tasks = [];
    }

    // projects and auxProjects go in the same global projects collection
    projects = projects.concat(auxProjects);

    // reset the app's global collections with the fresh data.
    // this will trigger the 'reset' event which other components may act upon.
    //
    // contexts gets reset last since that's the top-level dataset signifying completion
    app.user.set(user);
    app.collections.tasks.reset(tasks);
    app.collections.projects.reset(projects);
    app.collections.contexts.reset(contexts);

    return app;
  }

  return function init (_app) {
    app = _app;

    return {
      empty: empty,
      fetch: fetch,
      bootstrap: bootstrap,
      reset: reset,
    };
  }
});
