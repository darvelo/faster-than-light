define([
  'core/errorlog',
  'core/util',
  'backbone',
  'jquery',
  'underscore',
],

function (errlog, util, Backbone, $, _) {
  'use strict';

  function empty () {
    this.collections.tasks.reset();
    this.collections.projects.reset();
    // kick off the app again with a fresh pull of contexts data for
    // things like lists that the user can click on to trigger AJAX events
    this.collections.contexts.fetch({ reset: true });
    return this;
  }

  function fetch () {
    this.collections.tasks.fetch();
    this.collections.projects.fetch();
    this.collections.contexts.fetch();
    this.collections.contexts.trigger('reset');
    return this;
  }

  function bootstrap (bootstrapObject) {
    var err;

    /*
     * Set up user model
     */
    if (!bootstrapObject || !bootstrapObject.user) {
      // need user info before moving on
      this.user.fetch({ async: false });
    }

    if (bootstrapObject.user && _.isObject(bootstrapObject.user) &&
        // if validation passes
        this.validators.user(bootstrapObject.user) === null) {

      this.models.user.set(bootstrapObject.user);
    }

    this.models.user.app = this;

    // initialize todos layout since user settings should be populated
    this.trigger('todos:init');

    if (!bootstrapObject || _.isArray(bootstrapObject) || ! _.isObject(bootstrapObject) || _.isEmpty(bootstrapObject)) {
      err = new Error('Bootstrap does not exist!');
      errlog(2, err);
      return this.data.empty();
    }

    return this.data.reset(bootstrapObject);
  }

  function reset (resetObjects) {
    var err;
    var user, contexts, projects, auxProjects, tasks;

    if (!resetObjects) {
      err = new Error('resetObjects did not exist in app reset method. App may be in an inconsistent state');
      errlog(1, err);

      return false;
    }

    /*
     * Validation mechanisms
     */
    var userValidated = resetObjects.user && this.validators.user(resetObjects.user) === null;

    var contextsValidated, invalidContexts;
    if (_.isArray(resetObjects.contexts)) {
      invalidContexts = _.filter(resetObjects.contexts, function (context) {
        // if valid, will return null, and not trigger the filter
        return this.validators.context(context);
      });

      if (_.isEmpty(invalidContexts)) {
        contextsValidated = true;
      }
    }

    var projectsValidated, invalidProjects;
    if (_.isArray(resetObjects.projects)) {
      invalidProjects = _.filter(resetObjects.projects, function (project) {
        // if valid, will return null, and not trigger the filter
        return this.validators.project(project);
      });

      if (_.isEmpty(invalidProjects)) {
        projectsValidated = true;
      }
    }

    var auxProjectsValidated, invalidAuxProjects;
    // auxProjects may be empty, which is fine
    if (!resetObjects.auxProjects || (_.isArray(resetObjects.auxProjects) && _.isEmpty(resetObjects.auxProjects))) {
      auxProjectsValidated = true;
    } else if (_.isArray(resetObjects.auxProjects)) {
      invalidAuxProjects = _.filter(resetObjects.auxProjects, function (auxProject) {
        // if valid, will return null, and not trigger the filter
        return this.validators.project(auxProject);
      });

      if (_.isEmpty(invalidAuxProjects)) {
        auxProjectsValidated = true;
      }
    }

    var tasksValidated, invalidTasks;
    if (_.isArray(resetObjects.tasks)) {
      invalidTasks = _.filter(resetObjects.tasks, function (task) {
        // if valid, will return null, and not trigger the filter
        return this.validators.task(task);
      });

      if (_.isEmpty(invalidTasks)) {
        tasksValidated = true;
      }
    }


    /*
     * Error handling:
     *   If data returned from server isn't in the proper format,
     *   log the error and set the temp variable to an empty array or object.
     *   When the final calls set the global collections/models, they'll be a noop.
     */
    if (resetObjects.user && _.isObject(resetObjects.user) && userValidated) {
      // deep clone user and remove properties of visual
      // settings that may have been set by another client
      user = util.deleteUserProps(resetObjects.user);
    } else if (!resetObjects.user) {
      err = new Error('User object in data reset did not exist');
      errlog(2, err);

      user = {};
    } else {
      err = new Error('User object in data reset was not in the proper form');
      err.user = resetObjects.user;
      errlog(2, err);

      user = {};
    }

    if (resetObjects.contexts && _.isArray(resetObjects.contexts) && contextsValidated) {
      contexts = resetObjects.contexts;
    } else if (!resetObjects.contexts) {
      err = new Error('Contexts array in data reset did not exist');
      errlog(3, err);

      contexts = [];
    } else {
      err = new Error('Contexts array in data reset was not in the proper form');
      err.contexts = invalidContexts;
      errlog(3, err);

      contexts = [];
    }

    if (resetObjects.projects && _.isArray(resetObjects.projects) && projectsValidated) {
      projects = resetObjects.projects;
    } else if (!resetObjects.projects) {
      err = new Error('Projects array in data reset did not exist');
      errlog(3, err);

      projects = [];
    } else {
      err = new Error('Projects array in data reset was not in the proper form');
      err.projects = invalidProjects;
      errlog(3, err);

      projects = [];
    }

    // auxProjects isn't strictly necessary, so no error sent
    if (!resetObjects.auxProjects || (_.isArray(resetObjects.auxProjects) && _.isEmpty(resetObjects.auxProjects))) {
      auxProjects = [];
    } else if (resetObjects.auxProjects && _.isArray(resetObjects.auxProjects) && auxProjectsValidated) {
      auxProjects = resetObjects.auxProjects;
    } else {
      err = new Error('auxProjects array in data reset was not in the proper form');
      err.auxProjects = invalidAuxProjects;
      errlog(3, err);

      auxProjects = [];
    }

    if (resetObjects.tasks && _.isArray(resetObjects.tasks) && tasksValidated) {
      tasks = resetObjects.tasks;
    } else if (!resetObjects.tasks) {
      err = new Error('Tasks array in data reset did not exist');
      errlog(3, err);

      tasks = [];
    } else {
      err = new Error('Tasks array in data reset was not in the proper form');
      err.tasks = invalidTasks;
      errlog(3, err);

      tasks = [];
    }

    // projects and auxProjects go in the same global projects collection
    projects = projects.concat(auxProjects);

    // reset the app's global collections with the fresh data.
    // this will trigger the 'reset' event which other components may act upon.
    //
    // contexts gets reset last since that's the top-level dataset signifying completion
    this.user.set(user);
    this.collections.tasks.reset(tasks);
    this.collections.projects.reset(projects);
    this.collections.contexts.reset(contexts);

    return this;
  }

  return function init (_app) {
    return {
      empty: $.proxy(empty, _app),
      fetch: $.proxy(fetch, _app),
      bootstrap: $.proxy(bootstrap, _app),
      reset: $.proxy(reset, _app),
    };
  }
});
