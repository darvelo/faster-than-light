define([
  'core/errorlog',
  'core/errorTypes',
  'core/util',
  'backbone',
  'jquery',
  'underscore',
],

function (errlog, errTypes, util, Backbone, $, _) {
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
    app.collections.contexts.fetch({ reset: true });
    return app;
  }

  function validate (data) {
    var err;

    if (!data) {
      err = new Error('data did not exist in app validation method. App may be in an inconsistent state');
      errlog(1, err);

      // alert calling method that data didn't exist
      return null;
    }

    /*
     * Validation mechanisms
     */

    var usersValidated, tmpUsers;
    var groupedUsers = {};
    // put user(s) into array if they're not already
    if (_.isArray(data.user)) {
      tmpUsers = data.user;
    } else if (_.isObject(data.user)) {
      tmpUsers = [data.user];
    }

    // if we have no array, it's invalid by default
    if (_.isArray(tmpUsers)) {
      // return a group of validation errors to send to the server
      groupedUsers = _.groupBy(tmpUsers, function (user) {
        var result = app.validators.user(user);

        return result ? 'invalid' : 'valid';
      }, app);

      if (_.isEmpty(groupedUsers.invalid)) {
        usersValidated = true;
      }
    }

    var contextsValidated;
    var groupedContexts = {};
    if (_.isArray(data.contexts)) {
      // return a group of validation errors to send to the server
      groupedContexts = _.groupBy(data.contexts, function (context) {
        var result = app.validators.context(context);

        return result ? 'invalid' : 'valid';
      }, app);

      if (_.isEmpty(groupedContexts.invalid)) {
        contextsValidated = true;
      }
    }

    var projectsValidated;
    var groupedProjects = {};
    if (_.isArray(data.projects)) {
      // return a group of validation errors to send to the server
      groupedProjects = _.groupBy(data.projects, function (project) {
        var result = app.validators.project(project);

        return result ? 'invalid' : 'valid';
      }, app);

      if (_.isEmpty(groupedProjects.invalid)) {
        projectsValidated = true;
      }
    }

    var auxProjectsValidated;
    var groupedAuxProjects = {};
    // auxProjects may be empty, which is fine
    if (!data.auxProjects || (_.isArray(data.auxProjects) && _.isEmpty(data.auxProjects))) {
      auxProjectsValidated = true;
    } else if (_.isArray(data.auxProjects)) {
      // return a group of validation errors to send to the server
      groupedAuxProjects = _.groupBy(data.auxProjects, function (auxProject) {
        var result = app.validators.project(auxProject);

        return result ? 'invalid' : 'valid';
      }, app);

      if (_.isEmpty(groupedAuxProjects.invalid)) {
        auxProjectsValidated = true;
      }
    }

    var tasksValidated;
    var groupedTasks = {};
    if (_.isArray(data.tasks)) {
      // return a group of validation errors to send to the server
      groupedTasks = _.groupBy(data.tasks, function (task) {
        var result = app.validators.task(task);

        return result ? 'invalid' : 'valid';
      }, app);

      if (_.isEmpty(groupedTasks.invalid)) {
        tasksValidated = true;
      }
    }

    return {
      users: usersValidated,
      usersErrors: groupedUsers.invalid,

      contexts: contextsValidated,
      contextsErrors: groupedContexts.invalid,

      projects: projectsValidated,
      projectsErrors: groupedProjects.invalid,

      auxProjects: auxProjectsValidated,
      auxProjectsErrors: groupedAuxProjects.invalid,

      tasks: tasksValidated,
      tasksErrors: groupedTasks.invalid,
    };
  }

  function merge (data) {
    var valid = validate(data);

    // there was no data, an error was sent to the server
    if (valid === null) {
      return;
    }

    var scrubbedData = {};

    // merge this new data with the app's global collections.
    // this will not remove data already in the collection, only add and update.
    //
    // only the data that was brought in gets merged.
    // user data is not expected to be merged.
    // contexts gets set last since other methods do the same. being consistent :)
    if (data.tasks) {
      scrubbedData.tasks = handleTasksErrors(data, valid, 'merge'),
      app.collections.tasks.set(scrubbedData.tasks, { remove: false });
    }

    if (data.auxProjects) {
      scrubbedData.auxProjects = handleAuxProjectsErrors(data, valid, 'merge'),
    // projects and auxProjects go in the same global projects collection
      app.collections.projects.set(scrubbedData.auxProjects, { remove: false });
    }

    if (data.projects) {
      scrubbedData.projects = handleProjectsErrors(data, valid, 'merge'),
      app.collections.projects.set(scrubbedData.projects, { remove: false });
    }

    if (data.contexts) {
      scrubbedData.contexts = handleContextsErrors(data, valid, 'merge'),
      app.collections.contexts.set(scrubbedData.contexts, { remove: false });
    }

    return app;
  }

  function bootstrap (data) {
    var valid;
    var noBootstrap;
    var scrubbedData;

    if (!data || _.isArray(data) || ! _.isObject(data) || _.isEmpty(data)) {
      noBootstrap = true;
    } else {
      valid = validate(data);
      // there was no data, an error was sent to the server
      if (valid === null) {
        return;
      }
    }

    /*
     * Set up user model
     */
    // only triggers if bootstrap exists -- returns and prevents app from continuing
    if (!noBootstrap && !valid.users) {
      handleUserErrors({ user: data.user }, valid, 'bootstrap');
      return;
    }

    if (noBootstrap) {
      // need user info before moving on
      app.user.fetch({ async: false });
    } else {
      // user is validated at this point
      app.models.user.set(data.user);
    }

    app.models.user.app = app;

    // initialize todos layout since user settings should be populated
    // they're needed for setting up layout sizes and state
    app.trigger('todos:init');

    if (noBootstrap) {
      return app.data.empty();
    }

    scrubbedData = handleAllErrors(data, valid, 'bootstrap');

    // projects and auxProjects go in the same global projects collection
    scrubbedData.projects = scrubbedData.projects.concat(scrubbedData.auxProjects);

    // reset the app's global collections with the fresh data.
    // this will trigger the 'reset' event which other components may act upon.
    //
    // contexts gets reset last since that's the top-level dataset signifying completion
    app.collections.tasks.reset(scrubbedData.tasks);
    app.collections.projects.reset(scrubbedData.projects);
    app.collections.contexts.reset(scrubbedData.contexts);

    return app;
  }

  function reset (data) {
    var valid = validate(data);

    // there was no data, an error was sent to the server
    if (valid === null) {
      return;
    }

    var scrubbedData = handleAllErrors(data, valid, 'reset');

    // projects and auxProjects go in the same global projects collection
    scrubbedData.projects = scrubbedData.projects.concat(scrubbedData.auxProjects);

    // reset the app's global collections with the fresh data.
    // this will trigger the 'reset' event which other components may act upon.
    //
    // contexts gets reset last since that's the top-level dataset signifying completion
    app.user.set(scrubbedData.user);
    app.collections.tasks.reset(scrubbedData.tasks);
    app.collections.projects.reset(scrubbedData.projects);
    app.collections.contexts.reset(scrubbedData.contexts);

    return app;
  }

  /*
   * Error handling:
   *   If data returned from server isn't in the proper format,
   *   log the error and set the temp variable to an empty array or object.
   *   When the final calls set the global collections/models, they'll be a noop.
   */
  function handleAllErrors (data, valid, caller) {
    var user, contexts, projects, auxProjects, tasks;

    user = handleUserErrors({ user: data.user }, valid, caller);
    contexts = handleContextsErrors({ contexts: data.contexts }, valid, caller);
    projects = handleProjectsErrors({ projects: data.projects }, valid, caller);
    auxProjects = handleAuxProjectsErrors({ auxProjects: data.auxProjects }, valid, caller);
    tasks = handleTasksErrors({ tasks: data.tasks }, valid, caller);

    return {
      user: user,
      contexts: contexts,
      projects: projects,
      auxProjects: auxProjects,
      tasks: tasks,
    };
  }

  function handleUserErrors (data, valid, caller) {
    var err;
    var user;

    if (data.user && valid.users) {
      // deep clone user and remove properties of visual
      // settings that may have been set by another client
      user = util.deleteUserProps(data.user);
    } else if (!data.user) {
      err = new Error('User object in data ' + caller + ' did not exist');
      errlog(2, err);

      user = {};
    } else {
      err = valid.usersErrors;
      err.callerMessage = 'User object in data ' + caller + ' was not in the proper form';
      errlog(2, err);

      user = {};
    }

    return user;
  }


  function handleContextsErrors (data, valid, caller) {
    var err;
    var contexts;

    if (data.contexts && _.isArray(data.contexts) && valid.contexts) {
      contexts = data.contexts;
    } else if (!data.contexts) {
      err = new Error('Contexts array in data ' + caller + ' did not exist');
      errlog(3, err);

      contexts = [];
    } else {
      err = valid.contextsErrors;
      err.callerMessage = 'Projects array in data ' + caller + ' was not in the proper form';
      errlog(3, err);

      contexts = [];
    }

    return contexts;
  }

  function handleProjectsErrors (data, valid, caller) {
    var err;
    var projects;

    if (data.projects && _.isArray(data.projects) && valid.projects) {
      projects = data.projects;
    } else if (!data.projects) {
      err = new Error('Projects array in data ' + caller + ' did not exist');
      errlog(3, err);

      projects = [];
    } else {
      err = valid.projectsErrors;
      err.callerMessage = 'Projects array in data ' + caller + ' was not in the proper form';
      errlog(3, err);

      projects = [];
    }

    return projects;
  }

  function handleAuxProjectsErrors (data, valid, caller) {
    var err;
    var auxProjects;

    // auxProjects isn't strictly necessary, so no error sent
    if (!data.auxProjects || (_.isArray(data.auxProjects) && _.isEmpty(data.auxProjects))) {
      auxProjects = [];
    } else if (data.auxProjects && _.isArray(data.auxProjects) && valid.auxProjects) {
      auxProjects = data.auxProjects;
    } else {
      err = valid.auxProjectsErrors;
      err.callerMessage = 'auxProjects array in data ' + caller + ' was not in the proper form';
      errlog(3, err);

      auxProjects = [];
    }

    return auxProjects;
  }

  function handleTasksErrors (data, valid, caller) {
    var err;
    var tasks;

    if (data.tasks && _.isArray(data.tasks) && valid.tasks) {
      tasks = data.tasks;
    } else if (!data.tasks) {
      err = new Error('Tasks array in data ' + caller + ' did not exist');
      errlog(3, err);

      tasks = [];
    } else {
      err = valid.tasksErrors;
      err.callerMessage = 'Tasks array in data ' + caller + ' was not in the proper form';
      errlog(3, err);

      tasks = [];
    }

    return tasks;
  }

  return function init (_app) {
    app = _app;

    return {
      empty: empty,
      fetch: fetch,
      merge: merge,
      bootstrap: bootstrap,
      reset: reset,
    };
  };
});
