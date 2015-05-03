/**
 * @author Bogdan Kovalev
 */

angular.module('tasklist-front', ['tasklist-back', 'utils'])
    .controller('newTask', ['$scope', 'Model', 'Utils', function ($scope, Model, Utils) {
        $scope.description = "";
        $scope.assignee = "";

        $scope.addTask = function () {
            if (Utils.isValidDescription($scope.description)) {
                var newTask = Model.newTaskItem($scope.description, currentUser, $scope.assignee);
                Model.addTask(newTask);
            }
        };

        $scope.checkDescription = function () {
            return Utils.isValidDescription($scope.description);
        }
    }]);