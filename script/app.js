/**
 * @author Bogdan Kovalev
 */

var currentUser = "Bogdan";
var users = [currentUser, "Patric", "Bob", "Salvador"];

Status = {
    NEW: "new",
    FINISHED: "finished",
    REOPENED: "reopened"
};

angular.module('app', ['ui.router', 'tasklist-front', 'tasklist-back', 'utils'])
    .config(function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise("/all-tasks");

        $stateProvider
            .state('allTasks', {
                url: "/all-tasks",
                templateUrl: "views/tasks-widget.html"
            })
    });