/**
 * @author Bogdan Kovalev
 */

angular.module('tasklist-front', ['tasklist-back', 'users-back', 'utils'])

    .controller('widgetController', function ($scope, $state, TaskItem, Tasks, Users, Utils) {

        $scope.description = "";
        $scope.assignee = "";
        $scope.assignedByMe = $state.is('tasks.assignedByMe');

        $scope.items = Tasks.getItems();

        $scope.updateItem = function (item) {

            var index = $scope.items.lastIndexOf(item);
            $scope.items[index] = Tasks.getItem(item.task.id);
            console.log($scope.items);
        };

        $scope.updateItemAssignee = function (item) {
            var index = $scope.items.lastIndexOf(item);
            var validItem = Tasks.getItem(item.task.id);
            $scope.items[index].task.assignee = validItem.task.assignee;
            $scope.items[index].access = validItem.access;
        };

        $scope.updateItemDescription = function (item) {
            var index = $scope.items.lastIndexOf(item);
            $scope.items[index].task.description = Tasks.getItem(item.task.id).task.description;
        };

        $scope.addTask = function () {
            var task = new TaskItem($scope.description, Users.getCurrentUser(), $scope.assignee);
            Tasks.addTask(task);
            $scope.description = "";
            $scope.items = Tasks.getItems();
        };

        $scope.deleteTask = function (item) {
            Tasks.deleteTask(item.task.id);
            Utils.remove($scope.items, item);
        };

        $scope.finishTask = function (item) {
            Tasks.changeTaskStatus(item.task.id, Status.FINISHED);
            $scope.updateItem(item);
        };

        $scope.reopenTask = function (item) {
            Tasks.changeTaskStatus(item.task.id, Status.REOPENED);
            $scope.updateItem(item);
        };

        $scope.saveDescription = function (item) {
            Tasks.changeTaskDescription(item.task.id, item.task.description);
            $scope.updateItemDescription(item);
        };

        $scope.restoreDescription = function (item) {
            item.task.description = item.descriptionBkp;
        };

        $scope.reassignTask = function (item) {
            Tasks.assignTask(item.task.id, item.task.assignee);
            $scope.updateItemAssignee(item);
        };

        $scope.onFocus = function (item) {
            if (!item.focused) {
                item.descriptionBkp = item.task.description;
                item.focused = true;
            }
        };

        $scope.onBlur = function (item) {
            if (item.descriptionBkp == item.task.description) {
                item.focused = false;
            }
        };

        $scope.$watch('assignedByMe', function () {
            if ($scope.assignedByMe) {
                $state.transitionTo('tasks.assignedByMe');
            } else {
                $state.transitionTo('tasks.all');
            }
        });

    })

    .controller('itemsController', function ($scope, $state, Users) {
        if ($state.is('tasks.assignedByMe')) {
            $scope.tasksFilter = function (value) {
                var currentUser = Users.getCurrentUser();
                return value.task.author == currentUser && value.task.assignee != currentUser;
            };
        } else if ($state.is('tasks.all')) {
            $scope.tasksFilter = function () {
                return true;
            };
        }
    })

    .filter('datetime', function ($filter) {
        return function (date) {
            return date == null ? "" : $filter('date')(date, 'MMM dd yyyy - HH:mm:ss');
        };
    })

    .filter('tasksOrder', function () {
        return function (items) {
            items.sort(function (a, b) {
                var aS = a.task.status;
                var bS = b.task.status;

                if (aS == Status.FINISHED && bS != Status.FINISHED) {
                    return 1;
                }
                if (aS != Status.FINISHED && bS == Status.FINISHED) {
                    return -1;
                }

                if (aS == Status.REOPENED && bS != Status.REOPENED) {
                    return -1;
                }
                if (aS != Status.REOPENED && bS == Status.REOPENED) {
                    return 1;
                }

                return a.task.id - b.task.id; // id is timestamp
            });

            return items;
        }
    })

    .directive('tdUserExist', function (Users) {
        return {
            require: '?ngModel',
            link: function (scope, elem, attrs, ctrl) {
                scope.$watch(elem.attr('ng-model'), function (user) {
                    ctrl.$setValidity('tdUserExist', Users.isExistent(user));
                });
            }
        }
    })

    .directive('tdAutoRows', function () {
        function autoRows(textarea) {
            textarea.attr('rows', textarea.val().split(/\r\n|\r|\n/).length);
            while (textarea.height() < textarea.get(0).scrollHeight - 10) {
                textarea.attr('rows', +textarea.attr('rows') + 1);
            }
        }

        return {
            link: function (scope, elem) {
                scope.$watch(elem.attr('ng-model'), function () {
                    autoRows(elem);
                });
            }
        }
    })

    .directive('tdGoogleCalendar', function (GoogleCalendarService, TaskItem, Tasks) {
        /* TODO use google account as current user */
        return {
            link: function (scope) {

                function addToModel(tasks) {
                    tasks.forEach(function (task) {
                        var t = new TaskItem();
                        t.restoreFrom(task);
                        Tasks.addTask(t);
                    });
                    scope.items = Tasks.getItems();
                }

                /* TODO google-clent.js onload*/
                setTimeout(function () {
                    GoogleCalendarService.auth().then(function () {
                        GoogleCalendarService.fetchTasks().then(addToModel);
                    });
                }, 300);

            }
        }
    });