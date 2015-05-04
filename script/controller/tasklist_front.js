/**
 * @author Bogdan Kovalev
 */

angular.module('tasklist-front', ['tasklist-back', 'utils'])
    .controller('widgetController', ['$scope', 'Tasks', 'Utils', function ($scope, Tasks, Utils) {
        $scope.description = "";
        $scope.assignee = "";

        $scope.items = Tasks.getTasksAndAccesses();

        $scope.addTask = function () {
            if (Utils.isValidDescription($scope.description)) {
                Tasks.addTask($scope.description, currentUser, $scope.assignee);
                $scope.description = "";
                $scope.items = Tasks.getTasksAndAccesses();
            }
        };

        $scope.checkDescription = function () {
            return Utils.isValidDescription($scope.description);
        }
    }])