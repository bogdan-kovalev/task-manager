/**
 * @author Bogdan Kovalev
 */

angular.module('tasklist-front', ['tasklist-back', 'utils'])
    .controller('widgetController', ['$scope', 'Tasks', 'Utils', function ($scope, Tasks, Utils) {
        $scope.description = "";
        $scope.assignee = "";

        $scope.items = Tasks.getTasksAndAccesses();

        $scope.addTask = function () {
            Tasks.addTask($scope.description, currentUser, $scope.assignee);
            $scope.description = "";
            $scope.items = Tasks.getTasksAndAccesses();
        };

        $scope.checkDescription = function () {
            return Utils.isValidDescription($scope.description);
        };

        $scope.deleteTask = function (id) {
            Tasks.deleteTask(id);
            $scope.items = Tasks.getTasksAndAccesses();
        };

        $scope.finishTask = function (id) {
            Tasks.changeTaskStatus(id, Status.FINISHED);
            $scope.items = Tasks.getTasksAndAccesses();
        };

        $scope.reopenTask = function (id) {
            Tasks.changeTaskStatus(id, Status.REOPENED);
            $scope.items = Tasks.getTasksAndAccesses();
        };
    }]);