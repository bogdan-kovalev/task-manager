/**
 * @author Bogdan Kovalev
 */

angular.module('tasklist-front', ['tasklist-back', 'users-back', 'utils'])

    .controller('widgetController', function ($scope, $state, TaskItem, Tasks, Users, Utils, GoogleCalendarService) {

        $scope.description = "";
        $scope.assignee = "";
        $scope.properties = {
            list: $state.current.name
        };

        $scope.items = Tasks.getItems();

        /* TODO refactor */
        if (!Users.isLocalUser()) {
            GoogleCalendarService.fetchTasks().then(function (DTOs) {
                DTOs.forEach(function (DTO) {
                    var task = new TaskItem(DTO);

                    if (!Users.exists(task.getAuthor())) {
                        Users.add(task.getAuthor());
                    }

                    Tasks.addTask(task);
                });
                $scope.items = Tasks.getItems();
            });
        }
        /**/

        $scope.usersMap = Users.getUsersMap();

        $scope.updateItem = function (item) {
            var index = $scope.items.lastIndexOf(item);
            $scope.items[index] = Tasks.getItem(item.task.id);
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
            var task = createTaskItem();
            Tasks.addTask(task);

            if (!Users.isLocalUser()) {
                GoogleCalendarService.addTask(task.createDTO());
            }

            $scope.description = "";
            $scope.items = Tasks.getItems();
        };

        function createTaskItem() {
            return new TaskItem($scope.description, Users.getCurrentUser(), $scope.assignee);
        }

        $scope.deleteTask = function (item) {
            Tasks.deleteTask(item.task.id);
            Utils.remove($scope.items, item);

            if (!Users.isLocalUser()) {
                GoogleCalendarService.deleteTask(item.task.id);
            }
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

        $scope.$watch('properties.list', function () {
            $state.go($scope.properties.list);
        });

    })

    .controller('itemsController', function ($scope, $state, Users) {
        /* TODO refactor */
        var currentUser = Users.getCurrentUser();
        if ($state.is('tasks.all')) {
            $scope.tasksFilter = function () {
                return true;
            };
        } else if ($state.is('tasks.my')) {
            $scope.tasksFilter = function (value) {
                return value.task.author == currentUser;
            };
        } else if ($state.is('tasks.assignedByMe')) {
            $scope.tasksFilter = function (value) {
                return value.task.author == currentUser && value.task.assignee != currentUser;
            };
        }
        /**/
    })

    .filter('datetime', function ($filter) {
        return function (timestamp) {
            return timestamp == null ? "" : $filter('date')(new Date(timestamp), 'MMM dd yyyy - HH:mm:ss');
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

    .directive('tdExistentUser', function (Users) {
        return {
            require: '?ngModel',
            link: function (scope, elem, attrs, ctrl) {
                scope.$watch(elem.attr('ng-model'), function (user) {
                    ctrl.$setValidity('tdExistentUser', Users.exists(user));
                });
            }
        }
    })

    .directive('tdAutoRows', function () {
        function autoRows(textarea) {
            textarea.css('height', 'auto');
            textarea.css('height', textarea.get(0).scrollHeight + 'px');
        }

        return {
            link: function (scope, elem) {
                scope.$watch(elem.attr('ng-model'), function () {
                    autoRows(elem);
                });
            }
        }
    })

    .directive('tdGoogleAccount', function ($state, Users) {
        return {
            link: function () {
                Users.loginToGoogle().then(function () {
                    $state.go('tasks.my');
                })
            }
        }
    });