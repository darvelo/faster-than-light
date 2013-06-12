require(['app', 'jquery', 'models/todo/contextTodo'], function (App, $, ct) {
  $(document).ready(function () {
    var app = new App();

    window.app = app;
    console.log('TODO: Unset window.app');
    console.log('TODO: Unset window.bootstrap');

    window.b = ct;
  });
});

