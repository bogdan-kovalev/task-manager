/**
 * @author Bogdan Kovalev
 */

angular.module('tasklist-front', ['tasklist-back', 'utils'])

    .controller('widgetController', ['$scope', '$state', 'Tasks', 'Utils', function ($scope, $state, Tasks, Utils) {

        $scope.description = "";
        $scope.assignee = "";
        $scope.onlyAssigned = $state.is('tasks.assigned');

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

        $scope.$watch('onlyAssigned', function () {
            if ($scope.onlyAssigned) {
                $state.transitionTo('tasks.assigned');
            } else {
                $state.transitionTo('tasks.all');
            }
        });

    }])

    .controller('itemsController', ['$scope', '$state', function ($scope, $state) {
        if ($state.is('tasks.assigned')) {
            $scope.tasksFilter = function (value) {
                return value.task.author == currentUser && value.task.assignee != currentUser;
            };
        } else if ($state.is('tasks.all')) {
            $scope.tasksFilter = function (value) {
                return true;
            };
        }
    }])

    .filter('datetime', function ($filter) {
        return function (date) {
            return date == null ? "" : $filter('date')(date, 'MMM dd yyyy - HH:mm:ss');
        };
    })

    .directive('userExist', ['Utils', function (Utils) {
        var existent = function (user) {
            return Utils._.contains(users, user);
        };

        return {
            require: '?ngModel',
            link: function (scope, elem, attrs, ctrl) {
                scope.$watch(elem.attr('ng-model'), function (user) {
                    ctrl.$setValidity('userExist', existent(user));
                });
            }
        }
    }]);