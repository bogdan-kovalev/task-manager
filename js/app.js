var user = "Bogdan";

function Application() {
    Status = {
        NEW: "new",
        FINISHED: "finished",
        CANCELED: "canceled"
    };

    Event = {
        UI_NEW_TASK: "ui-new-task",
        UI_ADD_TASK: "ui-add-task",
        UI_DELETE_TASK: "ui-delete-task",
        UI_TASK_DELETED: "ui-task-deleted",
        UI_SAVE_DESCRIPTION: "ui-save-description",
        UI_DESCRIPTION_SAVED: "ui-description-saved",
        UI_FINISH_TASK: "ui-finish-task",
        UI_TASK_FINISHED: "ui-task-finished",
        MODEL_ADD_TASK: "model-add-task",
        MODEL_TASK_ADDED: "model-task-added",
        MODEL_TASK_RESTORED: "model-task-restored",
        MODEL_DELETE_TASK: "model-delete-task",
        MODEL_TASK_DELETED: "model-task-deleted",
        MODEL_CHANGE_DESCRIPTION: "model-change-description",
        MODEL_DESCRIPTION_CHANGED: "model-description-changed",
        MODEL_FINISH_TASK: "model-finish-task",
        MODEL_TASK_FINISHED: "model-task-finished"
    };

    function Widget(eventBus) {
        var that = this;
        var id = Math.floor(Math.random() * 1000);
        this.widgetClass = 'widget-' + id;
        this.newTaskInputClass = 'new-task-txt-' + id;
        this.newTaskBtnClass = 'new-task-btn-' + id;

        $('#widgetTmpl').tmpl([this]).appendTo('body');

        this.newTaskInputSelector = $('.' + this.newTaskInputClass);
        this.newTaskBtnSelector = $('.' + this.newTaskBtnClass);
        this.taskItemsWrapperSelector = $('.' + this.widgetClass + ' .task-items-wrapper');

        this.newTaskBtnSelector.on('click', function (event) {
            if (that.newTaskBtnSelector.hasClass("disabled")) {
                return false;
            }

            var description = that.newTaskInputSelector.val();
            var newTask = new TaskItem(description, user);

            that.newTaskInputSelector.val('');
            that.newTaskBtnSelector.addClass("disabled");
            $(eventBus).trigger(Event.UI_NEW_TASK, {task: newTask});
        });

        this.newTaskInputSelector.keypress(function (event) {
            if (event.keyCode == 13) {
                that.newTaskBtnSelector.click();
            }
            if (isValidDescription(that.newTaskInputSelector.val())) {
                that.newTaskBtnSelector.removeClass("disabled");
            } else if (!that.newTaskBtnSelector.hasClass("disabled")) {
                that.newTaskBtnSelector.addClass("disabled");
            }
        });

        $(eventBus).on(Event.UI_ADD_TASK, function (event, data) {
            var item = $('#taskItemTmpl').tmpl([data]);
            item.fadeIn(300);
            item.appendTo(that.taskItemsWrapperSelector);

            // place were task item content appends (buttons etc.)
            var ableToDelete = user == data.task.author;
            if (ableToDelete) {
                var deleteBtn = $('#deleteTaskBtnTmpl').tmpl([{}]);
                deleteBtn.appendTo(item);

                deleteBtn.on("click", function (event) {
                    var taskID = data.task.id;
                    $(eventBus).trigger(Event.UI_DELETE_TASK, {taskID: taskID});
                });
            }

            var ableToChange = user == data.task.author;
            if (ableToChange) {
                var saveBtn = $('#saveTaskBtnTmpl').tmpl([{}]);

                item.find(".inline-edit").keypress(function () {
                    saveBtn.appendTo('#' + data.task.id);
                    saveBtn.on("click", function (event) {
                        var description = item.find(".inline-edit").val();
                        $(eventBus).trigger(Event.UI_SAVE_DESCRIPTION, {
                            taskID: data.task.id,
                            description: description
                        });
                    });
                });
            }

            var ableToFinish = user == data.task.assignee;
            if (ableToFinish) {
                var finishBtn = $('#finishTaskBtnTmpl').tmpl([{}]);
                finishBtn.appendTo(item);

                finishBtn.on('click', function () {
                    var taskID = data.task.id;
                    $(eventBus).trigger(Event.UI_FINISH_TASK, {taskID: taskID, status: Status.FINISHED});
                });
            }
            // end of place were task item content appends (buttons etc.)
        });

        $(eventBus).on(Event.UI_TASK_DELETED, function (event, data) {
            $("#" + data.taskID).fadeOut(200, function () {
                $(this).remove();
            });
        });

        $(eventBus).on(Event.UI_DESCRIPTION_SAVED, function (event, data) {
            $("#" + data.taskID + " .save-btn").remove();
        });

        $(eventBus).on(Event.UI_TASK_FINISHED, function (event, data) {
            var taskItem = $("#" + data.taskID);
            taskItem.find(".finish-btn").remove();
            taskItem.appendTo(that.taskItemsWrapperSelector);
            taskItem.find("input").addClass("finished");
        });
    }

    function Controller(eventBus) {
        $(eventBus).on(Event.UI_NEW_TASK, function (event, data) {
            $(eventBus).trigger(Event.MODEL_ADD_TASK, data);
        });

        $(eventBus).on(Event.MODEL_TASK_ADDED, function (event, data) {
            $(eventBus).trigger(Event.UI_ADD_TASK, data);
        });

        $(eventBus).on(Event.MODEL_TASK_RESTORED, function (event, data) {
            $(eventBus).trigger(Event.UI_ADD_TASK, data);
        });

        $(eventBus).on(Event.UI_DELETE_TASK, function (event, data) {
            $(eventBus).trigger(Event.MODEL_DELETE_TASK, data);
        });

        $(eventBus).on(Event.MODEL_TASK_DELETED, function (event, data) {
            $(eventBus).trigger(Event.UI_TASK_DELETED, data);
        });

        $(eventBus).on(Event.UI_SAVE_DESCRIPTION, function (event, data) {
            $(eventBus).trigger(Event.MODEL_CHANGE_DESCRIPTION, data);
        });

        $(eventBus).on(Event.MODEL_DESCRIPTION_CHANGED, function (event, data) {
            $(eventBus).trigger(Event.UI_DESCRIPTION_SAVED, data);
        });

        $(eventBus).on(Event.UI_FINISH_TASK, function (event, data) {
            $(eventBus).trigger(Event.MODEL_FINISH_TASK, data);
        });

        $(eventBus).on(Event.MODEL_TASK_FINISHED, function (event, data) {
            $(eventBus).trigger(Event.UI_TASK_FINISHED, data);
        });
    }

    function Model(storage, eventBus) {
        this._storage = storage;
        var that = this;

        //restoring
        this._storage.fetchTasks().forEach(function (task) {
            var taskDTO = task.getDTO();
            $(eventBus).trigger(Event.MODEL_TASK_RESTORED, {task: taskDTO});
        });

        var __proto__ = Model.prototype;

        __proto__.addTask = function (task) {
            this._storage.add(task);
        };

        __proto__.deleteTask = function (taskID) {
            this._storage.delete(taskID);
        };

        __proto__.assignTask = function (taskID, user) {
            var task = this._storage.getTaskByID(taskID);

            if (task) {
                task.assignTo(user);
                this._storage.update(task);
            }
        };

        __proto__.changeTaskDescription = function (taskID, newDescription) {
            var task = this._storage.getTaskByID(taskID);

            if (task) {
                task.setDescription(newDescription);
                this._storage.update(task);
            }
        };

        __proto__.changeTaskStatus = function (taskID, newStatus) {
            var task = this._storage.getTaskByID(taskID);

            if (task) {
                task.setStatus(newStatus);
                this._storage.update(task);
            }
        };

        __proto__.getTaskByID = function (id) {
            return this._storage.getTaskByID(id);
        };

        $(eventBus).on(Event.MODEL_ADD_TASK, function (event, data) {
            that.addTask(data.task);
            var taskDTO = data.task.getDTO();
            $(eventBus).trigger(Event.MODEL_TASK_ADDED, {task: taskDTO});
        });

        $(eventBus).on(Event.MODEL_DELETE_TASK, function (event, data) {
            that.deleteTask(data.taskID);
            $(eventBus).trigger(Event.MODEL_TASK_DELETED, data);
        });

        $(eventBus).on(Event.MODEL_CHANGE_DESCRIPTION, function (event, data) {
            that.changeTaskDescription(data.taskID, data.description);
            $(eventBus).trigger(Event.MODEL_DESCRIPTION_CHANGED, data);
        });

        $(eventBus).on(Event.MODEL_FINISH_TASK, function (event, data) {
            that.changeTaskStatus(data.taskID, data.status);
            $(eventBus).trigger(Event.MODEL_TASK_FINISHED, data);
        });
    }

    function TaskItem(description, author) {
        this._description = description;
        this._author = author;
        this._assignee = author;
        this._timestamp = new Date().getTime();
        this._status = Status.NEW;

        var __proto__ = TaskItem.prototype;

        __proto__.getDescription = function () {
            return clone(this._description);
        };

        __proto__.setDescription = function (description) {
            this._description = clone(description);
        };

        __proto__.getAuthor = function () {
            return clone(this._author);
        };

        __proto__.assignTo = function (user) {
            this._assignee = clone(user);
        };

        __proto__.getAssignee = function () {
            return clone(this._assignee);
        };

        __proto__.getCreationDate = function () {
            return new Date(this._timestamp);
        };

        __proto__.getID = function () {
            return clone(this._timestamp);
        };

        __proto__.getStatus = function () {
            return clone(this._status);
        };

        __proto__.setStatus = function (status) {
            this._status = clone(status);
        };

        __proto__.getDTO = function () {
            return {
                id: this.getID(),
                description: this.getDescription(),
                author: this.getAuthor(),
                assignee: this.getAssignee(),
                creationDate: this.getCreationDate(),
                status: this.getStatus()
            };
        };

        __proto__.restoreFrom = function (data) {
            this._description = data._description;
            this._author = data._author;
            this._assignee = data._assignee;
            this._timestamp = data._timestamp;
            this._status = data._status;
        }
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

        Storage.prototype.fetchTasks = function (task) {
            return this._taskList.asArray();
        };

        Storage.prototype.update = function (task) {
            window.localStorage.setItem(task.getID(), JSON.stringify(task));
        };

        Storage.prototype.getTaskByID = function (id) {
            return this._taskList[id];
        };
    }

    return {
        createWidget: function (eventBus) {
            if (eventBus) {
                var widget = new Widget(eventBus);
            } else {
                console.error("Widget wasn't created [Event bus is undefined]");
            }
        },

        createController: function (eventBus) {
            if (eventBus) {
                var controller = new Controller(eventBus);
            } else {
                console.error("Controller wasn't created [Event bus is undefined]");
            }
        },

        createModel: function (eventBus) {
            if (eventBus) {
                var model = new Model(new Storage(), eventBus);
            } else {
                console.error("Model wasn't created [Event bus is undefined]");
            }
        },

        init: function (eventBus) {
            this.createWidget(eventBus);
            this.createController(eventBus);
            this.createModel(eventBus);
        }
    }
}