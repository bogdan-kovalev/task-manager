/**
 * @author Bogdan Kovalev
 */

Status = {
    NEW: "new",
    FINISHED: "finished",
    REOPENED: "reopened"
};

angular.module('app', ['ui.router', 'tasklist-front', 'tasklist-back', 'users-back', 'utils'])
    .config(function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise("/all");

        $stateProvider
            .state('tasks', {
                url: "/",
                templateUrl: "views/tasks-widget.html"
            })
            .state('tasks.all', {
                url: "all",
                templateUrl: "views/task-items.html"
            })
            .state('tasks.assigned', {
                url: "assigned",
                templateUrl: "views/task-items.html"
            })
    });