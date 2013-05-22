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

    this.models.user.app = this;

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

    /*
     * Error handling:
     *   If data returned from server isn't in the proper format,
     *   log the error and set the temp variable to an empty array or object.
     *   When the final calls set the global collections/models, they'll be a noop.
     */

    if (!resetObjects.user) {
      err = new Error('User object in data reset did not exist');
      errlog(2, err);
      user = {};
    }

    if (!resetObjects.contexts) {
      err = new Error('Contexts array in data reset did not exist');
      errlog(3, err);
      contexts = [];
    }

    if (!resetObjects.projects) {
      err = new Error('Projects array in data reset did not exist');
      errlog(3, err);
      projects = [];
    }

    // auxProjects isn't strictly necessary, so no error sent
    if (!resetObjects.auxProjects) {
      auxProjects = [];
    }

    if (!resetObjects.tasks) {
      err = new Error('Tasks array in data reset did not exist');
      errlog(3, err);
      tasks = [];
    }

    if (resetObjects.user && ! _.isObject(resetObjects.user)) {
      err = new Error('User object in data reset was not in the proper form');
      err.user = resetObjects.user;

      errlog(2, err);
      user = {};
    } else if (resetObjects.user) {
      // deep clone user and remove properties of visual
      // settings that may have been set by another client
      user = util.deleteUserProps(resetObjects.user);
    }

    if (resetObjects.contexts && ! _.isArray(resetObjects.contexts)) {
      err = new Error('Contexts array in data reset was not in the proper form');
      err.contexts = resetObjects.contexts;

      errlog(3, err);
      contexts = [];
    } else if (resetObjects.contexts) {
      contexts = resetObjects.contexts;
    }

    if (resetObjects.projects && ! _.isArray(resetObjects.projects)) {
      err = new Error('Projects array in data reset was not in the proper form');
      err.projects = resetObjects.projects;

      errlog(3, err);
      projects = [];
    } else if (resetObjects.projects) {
      projects = resetObjects.projects;
    }

    if (resetObjects.tasks && ! _.isArray(resetObjects.tasks)) {
      err = new Error('Tasks array in data reset was not in the proper form');
      err.tasks = resetObjects.tasks;

      errlog(3, err);
      tasks = [];
    } else if (resetObjects.tasks) {
      tasks = resetObjects.tasks;
    }

    if (resetObjects.auxProjects && ! _.isArray(resetObjects.auxProjects)) {
      err = new Error('auxProjects array in data reset was not in the proper form');
      err.auxProjects = resetObjects.auxProjects;

      errlog(3, err);
      auxProjects = [];
    } else if (resetObjects.auxProjects) {
      auxProjects = resetObjects.auxProjects;
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
