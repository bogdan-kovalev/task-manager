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
            .state('tasks', {
                url: "/",
                templateUrl: "views/tasks-widget.html"
            })
            .state('tasks.all', {
                url: "all",
                templateUrl: "views/task-items.html"
            })
            .state('tasks.assignedByMe', {
                url: "assigned-by-me",
                templateUrl: "views/task-items.html"
            })
    }).run(function ($state) {
        $state.go('tasks.all');
    });