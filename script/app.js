/**
 * @author Bogdan Kovalev
 */

Status = {
    NEW: "new",
    FINISHED: "finished",
    REOPENED: "reopened"
};

angular.module('app', ['ui.router', 'tasklist-front', 'tasklist-back', 'users-back', 'utils'])
    .config(function ($stateProvider) {
        $stateProvider
            .state('login', {
                url: "/",
                templateUrl: "views/login.html"
            })
            .state('tasks', {
                url: "tasks",
                templateUrl: "views/tasks-widget.html"
            })
            .state('tasks.my', {
                url: "/my",
                templateUrl: "views/task-items.html"
            })
            .state('tasks.all', {
                url: "/all",
                templateUrl: "views/task-items.html"
            })
            .state('tasks.assignedByMe', {
                url: "/assigned-by-me",
                templateUrl: "views/task-items.html"
            })
    })
    .run(function ($state) {
        jQuery(window).load(function () {
            $state.go('login');
        })
    });