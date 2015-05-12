/**
 * @author Bogdan Kovalev
 */

angular.module('tasklist-back', ['utils']).
    factory('Tasks', function (Utils) {

        function Model(storage) {
            this._storage = storage;
            var model = this;

            Model.prototype.addTask = function (description, author, assignee) {
                var task = new TaskItem(description, author, assignee);
                model._storage.add(task);
            };

            Model.prototype.deleteTask = function (taskID) {
                model._storage.delete(taskID);
            };

            Model.prototype.assignTask = function (taskID, user) {
                var task = model._storage.getTaskByID(taskID);

                if (task) {
                    task.assignTo(user);
                    model._storage.update(task);
                }
            };

            Model.prototype.changeTaskDescription = function (taskID, newDescription) {
                var task = model._storage.getTaskByID(taskID);

                if (task) {
                    task.setDescription(newDescription);
                    model._storage.update(task);
                }
            };

            Model.prototype.changeTaskStatus = function (taskID, newStatus) {
                var task = model._storage.getTaskByID(taskID);

                if (task) {
                    task.setStatus(newStatus);
                    model._storage.update(task);
                }
            };

            Model.prototype.getTaskByID = function (id) {
                return model._storage.getTaskByID(id);
            };


            Model.prototype.getTasksAndAccesses = function () {
                var ret = [];
                this._storage.fetchTasks().forEach(function (task) {
                    ret.push({
                        task: task.getDTO(),
                        access: model.getAccessFor(task)
                    });
                });
                return ret;
            };

            Model.prototype.getAccessFor = function (task) {
                return {
                    delete: currentUser == task.getAuthor(),
                    edit: currentUser == task.getAuthor() && task.getStatus() != Status.FINISHED,
                    finish: currentUser == task.getAssignee() && task.getStatus() != Status.FINISHED,
                    reopen: currentUser == task.getAssignee() && task.getStatus() == Status.FINISHED,
                    reassign: currentUser == task.getAuthor() && task.getStatus() != Status.FINISHED
                };
            };
        }

        function TaskItem(description, author, assignee) {
            this._description = Utils.clone(description);
            this._author = Utils.clone(author);
            this._assignee = Utils.clone(assignee && assignee != '' ? assignee : author);
            this._timestamp = new Date().getTime();
            this._status = Status.NEW;

            TaskItem.prototype.getDescription = function () {
                return Utils.clone(this._description);
            };

            TaskItem.prototype.setDescription = function (description) {
                this._description = Utils.clone(description);
            };

            TaskItem.prototype.getAuthor = function () {
                return Utils.clone(this._author);
            };

            TaskItem.prototype.assignTo = function (user) {
                this._assignee = Utils.clone(user);
            };

            TaskItem.prototype.getAssignee = function () {
                return Utils.clone(this._assignee);
            };

            TaskItem.prototype.getCreationDate = function () {
                return new Date(this._timestamp);
            };

            TaskItem.prototype.getID = function () {
                return Utils.clone(this._timestamp);
            };

            TaskItem.prototype.getStatus = function () {
                return Utils.clone(this._status);
            };

            TaskItem.prototype.setStatus = function (status) {
                this._status = Utils.clone(status);
            };

            TaskItem.prototype.getDTO = function () {
                return {
                    id: this.getID(),
                    description: this.getDescription(),
                    author: this.getAuthor(),
                    assignee: this.getAssignee(),
                    creationDate: this.getCreationDate(),
                    status: this.getStatus()
                };
            };

            TaskItem.prototype.restoreFrom = function (data) {
                this._description = data._description;
                this._author = data._author;
                this._assignee = data._assignee;
                this._timestamp = data._timestamp;
                this._status = data._status;
            };
        }

        function TaskList(array) {
            var that = this;

            TaskList.prototype.appendFromArray = function (array) {
                if (array && array.constructor === Array) {
                    array.forEach(function (task) {
                        var id = task.getID();
                        that[id] = task;
                    });
                }
            };

            TaskList.prototype.getIDs = function () {
                var IDs = [];
                for (id in this) {
                    if (this.hasOwnProperty(id)) {
                        IDs.push(id);
                    }
                }
                return IDs;
            };

            TaskList.prototype.asArray = function () {
                var array = [];
                this.getIDs().forEach(function (id) {
                    array.push(that[id]);
                });
                return array;
            };

            this.appendFromArray(array);
        }

        function Storage(storageKey) {
            function tryRestoreFromLocal(localStorageKey) {
                var restoredTasks = [];
                var localTasksIDs = [];
                if (window.localStorage.getItem(localStorageKey) == undefined) {
                    window.localStorage.setItem(localStorageKey, "");
                } else {
                    try {
                        localTasksIDs = JSON.parse(window.localStorage.getItem(localStorageKey));
                        localTasksIDs.forEach(function (entry) {
                            var task = new TaskItem();
                            task.restoreFrom(JSON.parse(window.localStorage.getItem(entry)));
                            restoredTasks.push(task);
                        });
                    } catch (e) {
                        //ignored
                    }
                }
                return {tasksIDs: localTasksIDs, tasks: restoredTasks};
            }

            this._storageKey = storageKey ? storageKey : 'task-list-local-storage';
            var data = tryRestoreFromLocal(this._storageKey);
            this._taskList = new TaskList(data.tasks);

            Storage.prototype.add = function (task) {
                var id = task.getID();
                this._taskList[id] = task;

                window.localStorage.setItem(this._storageKey, JSON.stringify(this._taskList.getIDs()));
                window.localStorage.setItem(id, JSON.stringify(task));
            };

            Storage.prototype.delete = function (taskID) {
                delete this._taskList[taskID];

                window.localStorage.setItem(this._storageKey, JSON.stringify(this._taskList.getIDs()));
                window.localStorage.removeItem(taskID);
            };

            Storage.prototype.clear = function () {
                this._taskList.getIDs().forEach(function (key) {
                    window.localStorage.removeItem(key);
                });

                window.localStorage.removeItem(this._storageKey);

                this._taskList = new TaskList();
            };

            Storage.prototype.fetchTasks = function () {
                return this._taskList.asArray();
            };

            Storage.prototype.update = function (task) {
                window.localStorage.setItem(task.getID(), JSON.stringify(task));
            };

            Storage.prototype.getTaskByID = function (id) {
                return this._taskList[id];
            };
        }

        var model = new Model(new Storage());
        return model;
    });