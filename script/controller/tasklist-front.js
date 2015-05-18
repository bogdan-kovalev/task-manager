/**
 * @author Bogdan Kovalev
 */

angular.module('tasklist-front', ['tasklist-back', 'users-back', 'utils'])

    .controller('widgetController', ['$scope', '$state', 'Tasks', 'Users', 'Utils', function ($scope, $state, Tasks, Users, Utils) {

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

        function updateItemAssignee(item) {
            var index = $scope.items.lastIndexOf(item);
            var validItem = Tasks.getItem(item.task.id);
            $scope.items[index].task.assignee = validItem.task.assignee;
            $scope.items[index].access = validItem.access;
        }

        function updateItemDescription(item) {
            var index = $scope.items.lastIndexOf(item);
            $scope.items[index].task.description = Tasks.getItem(item.task.id).task.description;
        }

        $scope.addTask = function () {
            Tasks.addTask($scope.description, Users.getCurrentUser(), $scope.assignee);
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
            updateItemDescription(item);
        };

        $scope.restoreDescription = function (item) {
            item.task.description = item.descriptionBkp;
        };

        $scope.reassignTask = function (item) {
            Tasks.assignTask(item.task.id, item.task.assignee);
            updateItemAssignee(item);
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

    .controller('itemsController', ['$scope', '$state', 'Users', function ($scope, $state, Users) {
        if ($state.is('tasks.assigned')) {
            $scope.tasksFilter = function (value) {
                var currentUser = Users.getCurrentUser();
                return value.task.author == currentUser && value.task.assignee != currentUser;
            };
        } else if ($state.is('tasks.all')) {
            $scope.tasksFilter = function () {
                return true;
            };
        }
    }])

    .filter('datetime', function ($filter) {
        return function (date) {
            return date == null ? "" : $filter('date')(date, 'MMM dd yyyy - HH:mm:ss');
        };
    })

    .directive('userExist', ['Users', function (Users) {
        return {
            require: '?ngModel',
            link: function (scope, elem, attrs, ctrl) {
                scope.$watch(elem.attr('ng-model'), function (user) {
                    ctrl.$setValidity('userExist', Users.isExistent(user));
                });
            }
        }
    }])

    .directive('autoRows', ['jQuery', function (jQuery) {
        function autoRows(textarea) {
            textarea.attr('rows', textarea.val().split(/\r\n|\r|\n/).length);
            while (textarea.height() < textarea.get(0).scrollHeight - 10) {
                textarea.attr('rows', +textarea.attr('rows') + 1);
            }
        }

        return {
            link: function (scope, elem, attrs, ctrl) {
                scope.$watch(elem.attr('ng-model'), function (user) {
                    autoRows(elem);
                });
            }
        }
    }]);