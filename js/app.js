var currentUser = "Bogdan";
var users = [currentUser, "Patric", "Bob", "Salvador"];

function Application() {
    Status = {
        NEW: "new",
        FINISHED: "finished",
        REOPENED: "reopened"
    };

    Event = {
        UI_NEW_TASK: "ui-new-task",
        UI_DELETE_TASK: "ui-delete-task",
        UI_TASK_DELETED: "ui-task-deleted",
        UI_SAVE_DESCRIPTION: "ui-save-description",
        UI_CHANGE_TASK_STATUS: "ui-change-task-status",
        UI_TASK_STATUS_CHANGED: "ui-task-status_changed",
        UI_RESTORE_TASK: "ui-restore-task",
        UI_TASK_ASSIGN: "ui-task-assign",
        UI_RENDER_TASK: "ui-render-task-item",
        MODEL_ADD_TASK: "model-add-task",
        MODEL_TASK_ADDED: "model-task-added",
        MODEL_TASK_RESTORED: "model-task-restored",
        MODEL_DELETE_TASK: "model-delete-task",
        MODEL_TASK_DELETED: "model-task-deleted",
        MODEL_CHANGE_DESCRIPTION: "model-change-description",
        MODEL_DESCRIPTION_CHANGED: "model-description-changed",
        MODEL_CHANGE_TASK_STATUS: "model-finish-task",
        MODEL_TASK_STATUS_CHANGED: "model-task-finished",
        MODEL_GET_TASK: "model-get-task-description",
        MODEL_TASK_RETURNED: "model-task-description-returned",
        MODEL_ASSIGN_TASK: "model-assign-task",
        MODEL_TASK_ASSIGNED: "model-task-assigned"
    };

    function Widget(eventBus) {
        var widget = this;

        function renderTaskItem(data) {
            $('.no-tasks').hide();
            var id = data.task.id;
            var status = data.task.status;
            var access = data.access;

            var taskItem = $('#taskItemTmpl').tmpl([data]);

            var deleteBtn = $('#deleteTaskBtnTmpl').tmpl([{}]);
            var saveBtn = $('#saveTaskBtnTmpl').tmpl([{}]);
            var cancelBtn = $('#cancelEditBtnTmpl').tmpl([{}]);
            var finishBtn = $('#finishTaskBtnTmpl').tmpl([{}]);
            var assignBtn = $('#assignBtnTmpl').tmpl([{}]);
            var reopenBtn = $('#reopenBtnTmpl').tmpl([{}]);

            var assignInput = $('#assignInputTmpl').tmpl([data]);


            taskItem.fadeIn(300);
            if ($('#' + id).length) {
                $('#' + id).replaceWith(taskItem);
            } else {
                var firstFinished = widget.taskItemsWrapper.find('.finished:first');
                if (firstFinished.length) {
                    taskItem.insertBefore(firstFinished);
                } else {
                    taskItem.appendTo(widget.taskItemsWrapper);
                }
            }

            var description = taskItem.find(".inline-edit");
            Util.autoRows(description);

            if (access.delete) {
                deleteBtn.appendTo(taskItem);

                taskItem.hover(function () {
                        deleteBtn.show();
                    },
                    function () {
                        deleteBtn.hide();
                    });

                deleteBtn.on("click", function () {
                    if (confirm("Are you sure you want to delete this item?")) {
                        $(eventBus).trigger(Event.UI_DELETE_TASK, {taskID: id});
                    }
                });
            }

            if (access.edit) {
                assignInput.appendTo(taskItem.find('.task-properties'));
                assignBtn.appendTo(taskItem.find('.task-properties'));
                assignInput.autocomplete({source: users});

                assignBtn.on("click", function () {
                    var assignee = assignInput.val();
                    if ($.inArray(assignee, users) > -1) {
                        $(eventBus).trigger(Event.UI_TASK_ASSIGN, {taskID: id, assignee: assignee})
                    }
                });

                description.keyup(function (event) {
                    Util.autoRows($(this));

                    if (event.keyCode == KeyCode.Esc) {
                        cancelBtn.click();
                        return;
                    }

                    if (Util.isValidDescription($(this).val())) {
                        if (taskItem.find(cancelBtn).length == 0) {
                            finishBtn.addClass('disabled');
                            cancelBtn.appendTo(taskItem);
                            cancelBtn.on('click', function (event) {
                                finishBtn.removeClass('disabled');
                                $(eventBus).trigger(Event.UI_RESTORE_TASK, {taskID: id});
                            });
                        }
                        if (taskItem.find(saveBtn).length == 0) {
                            saveBtn.appendTo(taskItem);
                            saveBtn.on("click", function (event) {
                                finishBtn.removeClass('disabled');
                                var description = taskItem.find("textarea.inline-edit").val();
                                $(eventBus).trigger(Event.UI_SAVE_DESCRIPTION, {
                                    taskID: data.task.id,
                                    description: description
                                });
                            });
                        }
                    } else {
                        saveBtn.remove();
                    }
                });
            }

            if (access.finish) {
                finishBtn.appendTo(taskItem);

                taskItem.hover(function () {
                        finishBtn.show();
                    },
                    function () {
                        finishBtn.hide();
                    });

                finishBtn.on('click', function () {
                    if (!finishBtn.hasClass('disabled')) {
                        var taskID = data.task.id;
                        $(eventBus).trigger(Event.UI_CHANGE_TASK_STATUS, {taskID: taskID, status: Status.FINISHED});
                    }
                });
            }

            if (access.reopen) {
                reopenBtn.appendTo(taskItem);

                taskItem.hover(function () {
                        reopenBtn.show();
                    },
                    function () {
                        reopenBtn.hide();
                    });

                reopenBtn.on('click', function () {
                    var taskID = data.task.id;
                    $(eventBus).trigger(Event.UI_CHANGE_TASK_STATUS, {taskID: taskID, status: Status.REOPENED});
                });
            }

        } // end renderTaskItem()

        widget._class = 'widget-' + Util.generateID();

        $('#widgetTmpl').tmpl([this]).appendTo('body');

        widget.newTaskTxt = $('.' + widget._class + ' .new-task-txt');
        widget.newTaskBtn = $('.' + widget._class + ' .new-task-btn');
        widget.taskItemsWrapper = $('.' + widget._class + ' .task-items-wrapper');
        widget.assignInput = $('.' + widget._class + ' .assign');

        widget.newTaskBtn.on('click', function () {
            var val = $(widget.assignInput).val();
            if (val != '' && $.inArray(val, users) < 0) {
                $(widget.assignInput).focus();
                return;
            }
            if (!$(this).hasClass("disabled")) {
                var description = widget.newTaskTxt.val();
                var assignee = widget.assignInput.val();
                var newTask = new TaskItem(description, currentUser, assignee);
                Util.resetTextarea(widget.newTaskTxt);
                $(eventBus).trigger(Event.UI_NEW_TASK, {task: newTask});
            }
        });

        widget.newTaskTxt.keydown(function (event) {
            if (event.keyCode == KeyCode.Enter && event.ctrlKey) {
                event.preventDefault();
                Util.trimTextareaValue($(this));
                widget.newTaskBtn.click();
            } else if (event.keyCode == KeyCode.Esc) {
                $(this).val('');
            }
        });

        widget.newTaskTxt.keyup(function () {
            Util.autoRows($(this));
            if (Util.isValidDescription($(this).val())) {
                widget.newTaskBtn.removeClass("disabled");
            } else {
                widget.newTaskBtn.addClass("disabled");
            }
        });

        widget.assignInput.autocomplete({source: users});


        /* ## EVENTS ## */

        $(eventBus).on(Event.UI_RENDER_TASK, function (event, data) {
            renderTaskItem(data);
        });

        $(eventBus).on(Event.UI_TASK_DELETED, function (event, data) {
            $("#" + data.taskID).fadeOut(200, function () {
                $(this).remove();
                if (widget.taskItemsWrapper.find('.task-item').length == 0) {
                    $('.no-tasks').show();
                }
            });
        });

        $(eventBus).on(Event.UI_TASK_STATUS_CHANGED, function (event, data) {
            var taskItem = $('#' + data.task.id);
            var status = data.task.status;
            if (status == Status.FINISHED) {
                taskItem.appendTo(widget.taskItemsWrapper);
            } else if (status == Status.REOPENED) {
                taskItem.prependTo(widget.taskItemsWrapper);
            }
            renderTaskItem(data);
        });
    }

    function Controller(eventBus) {
        $(eventBus).on(Event.UI_NEW_TASK, function (event, data) {
            $(eventBus).trigger(Event.MODEL_ADD_TASK, data);
        });

        $(eventBus).on(Event.MODEL_TASK_ADDED, function (event, data) {
            $(eventBus).trigger(Event.UI_RENDER_TASK, data);
        });

        $(eventBus).on(Event.MODEL_TASK_RESTORED, function (event, data) {
            $(eventBus).trigger(Event.UI_RENDER_TASK, data);
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
            $(eventBus).trigger(Event.UI_RENDER_TASK, data);
        });

        $(eventBus).on(Event.UI_CHANGE_TASK_STATUS, function (event, data) {
            $(eventBus).trigger(Event.MODEL_CHANGE_TASK_STATUS, data);
        });

        $(eventBus).on(Event.MODEL_TASK_STATUS_CHANGED, function (event, data) {
            $(eventBus).trigger(Event.UI_TASK_STATUS_CHANGED, data);
        });

        $(eventBus).on(Event.UI_RESTORE_TASK, function (event, data) {
            $(eventBus).trigger(Event.MODEL_GET_TASK, data);
        });

        $(eventBus).on(Event.MODEL_TASK_RETURNED, function (event, data) {
            $(eventBus).trigger(Event.UI_RENDER_TASK, data);
        });

        $(eventBus).on(Event.UI_TASK_ASSIGN, function (event, data) {
            $(eventBus).trigger(Event.MODEL_ASSIGN_TASK, data);
        });

        $(eventBus).on(Event.MODEL_TASK_ASSIGNED, function (event, data) {
            $(eventBus).trigger(Event.UI_RENDER_TASK, data);
        });
    }

    function Model(storage, eventBus) {
        this._storage = storage;
        var model = this;

        var __proto__ = Model.prototype;

        __proto__.addTask = function (task) {
            model._storage.add(task);
        };

        __proto__.deleteTask = function (taskID) {
            model._storage.delete(taskID);
        };

        __proto__.assignTask = function (taskID, user) {
            var task = model._storage.getTaskByID(taskID);

            if (task) {
                task.assignTo(user);
                model._storage.update(task);
            }
        };

        __proto__.changeTaskDescription = function (taskID, newDescription) {
            var task = model._storage.getTaskByID(taskID);

            if (task) {
                task.setDescription(newDescription);
                model._storage.update(task);
            }
        };

        __proto__.changeTaskStatus = function (taskID, newStatus) {
            var task = model._storage.getTaskByID(taskID);

            if (task) {
                task.setStatus(newStatus);
                model._storage.update(task);
            }
        };

        __proto__.getTaskByID = function (id) {
            return model._storage.getTaskByID(id);
        };

        __proto__.getAccessFor = function (task) {
            return {
                delete: currentUser == task.getAuthor(),
                edit: currentUser == task.getAuthor() && task.getStatus() != Status.FINISHED,
                finish: currentUser == task.getAssignee() && task.getStatus() != Status.FINISHED,
                reopen: currentUser == task.getAssignee() && task.getStatus() == Status.FINISHED,
                reassign: currentUser == task.getAuthor() && task.getStatus() != Status.FINISHED
            };
        };

        model._storage.fetchTasks().forEach(function (task) {
            var access = model.getAccessFor(task);
            var DTO = task.getDTO();
            $(eventBus).trigger(Event.MODEL_TASK_RESTORED, {task: DTO, access: access});
        });

        $(eventBus).on(Event.MODEL_ADD_TASK, function (event, data) {
            model.addTask(data.task);
            var access = model.getAccessFor(data.task);
            var DTO = data.task.getDTO();
            $(eventBus).trigger(Event.MODEL_TASK_ADDED, {task: DTO, access: access});
        });

        $(eventBus).on(Event.MODEL_DELETE_TASK, function (event, data) {
            model.deleteTask(data.taskID);
            $(eventBus).trigger(Event.MODEL_TASK_DELETED, data);
        });

        $(eventBus).on(Event.MODEL_CHANGE_DESCRIPTION, function (event, data) {
            model.changeTaskDescription(data.taskID, data.description);
            var task = model.getTaskByID(data.taskID);
            var access = model.getAccessFor(task);
            var DTO = task.getDTO();
            $(eventBus).trigger(Event.MODEL_DESCRIPTION_CHANGED, {task: DTO, access: access});
        });

        $(eventBus).on(Event.MODEL_CHANGE_TASK_STATUS, function (event, data) {
            model.changeTaskStatus(data.taskID, data.status);
            var task = model.getTaskByID(data.taskID);
            var access = model.getAccessFor(task);
            var DTO = task.getDTO();
            $(eventBus).trigger(Event.MODEL_TASK_STATUS_CHANGED, {task: DTO, access: access});
        });

        $(eventBus).on(Event.MODEL_GET_TASK, function (event, data) {
            var task = model.getTaskByID(data.taskID);
            var access = model.getAccessFor(task);
            var DTO = task.getDTO();
            $(eventBus).trigger(Event.MODEL_TASK_RETURNED, {task: DTO, access: access});
        });


        $(eventBus).on(Event.MODEL_ASSIGN_TASK, function (event, data) {
            model.assignTask(data.taskID, data.assignee);
            var task = model.getTaskByID(data.taskID);
            var access = model.getAccessFor(task);
            var DTO = task.getDTO();
            $(eventBus).trigger(Event.MODEL_TASK_ASSIGNED, {task: DTO, access: access});
        });
    }

    function TaskItem(description, author, assignee) {
        this._description = description;
        this._author = author;
        this._assignee = assignee ? assignee : author;
        this._timestamp = new Date().getTime();
        this._status = Status.NEW;

        var __proto__ = TaskItem.prototype;

        __proto__.getDescription = function () {
            return Util.clone(this._description);
        };

        __proto__.setDescription = function (description) {
            this._description = Util.clone(description);
        };

        __proto__.getAuthor = function () {
            return Util.clone(this._author);
        };

        __proto__.assignTo = function (user) {
            this._assignee = Util.clone(user);
        };

        __proto__.getAssignee = function () {
            return Util.clone(this._assignee);
        };

        __proto__.getCreationDate = function () {
            return new Date(this._timestamp);
        };

        __proto__.getID = function () {
            return Util.clone(this._timestamp);
        };

        __proto__.getStatus = function () {
            return Util.clone(this._status);
        };

        __proto__.setStatus = function (status) {
            this._status = Util.clone(status);
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
                return new Widget(eventBus);
            } else {
                console.error("Widget wasn't created [Event bus is undefined]");
            }
        },

        createController: function (eventBus) {
            if (eventBus) {
                return new Controller(eventBus);
            } else {
                console.error("Controller wasn't created [Event bus is undefined]");
            }
        },

        createModel: function (eventBus) {
            if (eventBus) {
                return new Model(new Storage(), eventBus);
            } else {
                console.error("Model wasn't created [Event bus is undefined]");
            }
        },

        createTaskItem: function (description, author, assignee) {
            return new TaskItem(description, author, assignee);
        },

        init: function () {
            var eventBus = {};
            this.createWidget(eventBus);
            this.createController(eventBus);
            this.createModel(eventBus);
        }
    }
}