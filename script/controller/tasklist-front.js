/**
 * @author Bogdan Kovalev
 */

angular.module('tasklist-front', ['tasklist-back', 'utils'])

    .controller('widgetController', ['$scope', 'Tasks', 'Utils', function ($scope, Tasks, Utils) {

        $scope.description = "";
        $scope.assignee = "";

        $scope.items = Tasks.getItems();
        $scope.items.forEach(function (item) {
            item.hovered = false;
            item.focused = false;
        });

        function updateItem(item) {
            var index = $scope.items.lastIndexOf(item);
            $scope.items[index] = Tasks.getItem(item.task.id);
        }

        $scope.addTask = function () {
            Tasks.addTask($scope.description, currentUser, $scope.assignee);
            $scope.description = "";
            $scope.items = Tasks.getItems();
        };

        $scope.deleteTask = function (item) {
            Tasks.deleteTask(item.task.id);
            Utils.remove($scope.items, item);
        };

        $scope.finishTask = function (item) {
            Tasks.changeTaskStatus(item.task.id, Status.FINISHED);
            updateItem(item);
        };

        $scope.reopenTask = function (item) {
            Tasks.changeTaskStatus(item.task.id, Status.REOPENED);
            updateItem(item);
        };

        $scope.saveDescription = function (item) {
            Tasks.changeTaskDescription(item.task.id, item.task.description);
        };

        $scope.restoreDescription = function (item) {
            item.task.description = item.descriptionBkp;
        };

        $scope.reassignTask = function (item) {
            Tasks.assignTask(item.task.id, item.task.assignee);
            updateItem(item);
        };

        $scope.onFocus = function (item) {
            if (!item.focused) {
                item.descriptionBkp = item.task.description;
                item.focused = true;
            }
        };

    }])

    .filter('datetime', function ($filter) {
        return function (date) {
            if (date == null) {
                return "";
            }

            var _date = $filter('date')(date,
                'MMM dd yyyy - HH:mm:ss');

            return _date;

        };
    });