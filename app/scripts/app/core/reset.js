define([
  'core/errorlog',
  'backbone',
  'underscore',
],

function (errlog, Backbone, _) {
  'use strict';

  return function reset (resetObjects) {
    var err;

    if (this === window) {
      return;
    }

    if (resetObjects === 'empty') {
      this.collections.tasks.reset();
      this.collections.projects.reset();
      // kick off the app again with a fresh pull of contexts data for
      // things like lists that the user can click on to trigger AJAX events
      this.collections.contexts.fetch({ reset: true });
      return;
    }

    if (resetObjects === 'fetch') {
      this.collections.tasks.fetch();
      this.collections.projects.fetch();
      this.collections.contexts.fetch();
      this.collections.contexts.trigger('reset');
      return;
    }

    /*
     * Error handling:
     *   If data returned from server isn't in the proper format,
     *   log the error and set the data object to an empty array.
     */
    if (!resetObjects.user) {
      err = new Error('user array in data reset did not exist');
      errlog(2, err);
      resetObjects.user = {};
    }

    if (!resetObjects.contexts) {
      err = new Error('Contexts array in data reset did not exist');
      errlog(3, err);
      resetObjects.contexts = [];
    }

    if (!resetObjects.projects) {
      err = new Error('Projects array in data reset did not exist');
      errlog(3, err);
      resetObjects.projects = [];
    }

    // auxProjects isn't strictly necessary, so no error sent
    if (!resetObjects.auxProjects) {
      resetObjects.auxProjects = [];
    }

    if (!resetObjects.tasks) {
      err = new Error('Tasks array in data reset did not exist');
      errlog(3, err);
      resetObjects.tasks = [];
    }

    if (resetObjects.user && ! _.isObject(resetObjects.user)) {
      err = new Error('user array in data reset was not in the proper form');
      err.user = resetObjects.user;

      errlog(2, err);
      resetObjects.user = {};
    } else if (resetObjects.user) {
      // this prevents other clients from overwriting this client's view state
      delete resetObjects.user.lastContexts;
      delete resetObjects.user.paneSizes;
      delete resetObjects.user.menu;
    }

    if (resetObjects.contexts && ! _.isArray(resetObjects.contexts)) {
      err = new Error('Contexts array in data reset was not in the proper form');
      err.contexts = resetObjects.contexts;

      errlog(3, err);
      resetObjects.contexts = [];
    }

    if (resetObjects.projects && ! _.isArray(resetObjects.projects)) {
      err = new Error('Projects array in data reset was not in the proper form');
      err.projects = resetObjects.projects;

      errlog(3, err);
      resetObjects.projects = [];
    }

    if (resetObjects.tasks && ! _.isArray(resetObjects.tasks)) {
      err = new Error('Tasks array in data reset was not in the proper form');
      err.tasks = resetObjects.tasks;

      errlog(3, err);
      resetObjects.tasks = [];
    }

    if (resetObjects.auxProjects && ! _.isArray(resetObjects.auxProjects)) {
      err = new Error('auxProjects array in data reset was not in the proper form');
      err.auxProjects = resetObjects.auxProjects;

      errlog(3, err);
      resetObjects.auxProjects = [];
    } else {
      // projects and auxProjects go in the same global projects collection
      resetObjects.projects = resetObjects.projects.concat(resetObjects.auxProjects);
    }

    // reset the app's global collections with the fresh data.
    // this will trigger the 'reset' event which other components may act upon.
    //
    // contexts gets reset last since that's the top-level dataset signifying completion
    this.user.set(resetObjects.user);
    this.collections.tasks.reset(resetObjects.tasks);
    this.collections.projects.reset(resetObjects.projects);
    this.collections.contexts.reset(resetObjects.contexts);
  };
});
