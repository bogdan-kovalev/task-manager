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
    MODEL_ADD_TASK: "model-add-task",
    MODEL_TASK_ADDED: "model-task-added",
    MODEL_TASK_RESTORED: "model-task-restored",
    MODEL_DELETE_TASK: "model-delete-task",
    MODEL_TASK_DELETED: "model-task-deleted",
    MODEL_CHANGE_DESCRIPTION: "model-change-description",
    MODEL_DESCRIPTION_CHANGED: "model-description-changed"
};

var eventBus = {};
var storageKey = 'task-list-local-storage';

$(function () {

    new Widget();

    new Controller();

    var data = tryRestoreFromLocal(storageKey);
    console.log(data);
    new TaskService(data);

});

function Widget() {
    var that = this;

    var id = Math.floor(Math.random() * 1000);

    this.widgetClass = 'widget-' + id;
    this.newTaskInputClass = 'new-task-txt-' + id;
    this.newTaskBtnClass = 'new-task-btn-' + id;

    $('#widgetTmpl').tmpl([this]).appendTo('body');

    this.newTaskInputSelector = $('.' + this.newTaskInputClass);
    this.newTaskBtnSelector = $('.' + this.newTaskBtnClass);

    this.newTaskBtnSelector.on('click', function (event) {
        if (that.newTaskBtnSelector.hasClass("disabled")) {
            return false;
        }

        var description = that.newTaskInputSelector.val();
        var newTask = new TaskItem(description, "Bogdan");

        that.newTaskInputSelector.val('');
        that.newTaskBtnSelector.addClass("disabled");

        $(eventBus).trigger(Event.UI_NEW_TASK, {task: newTask});
    });

    this.newTaskInputSelector.keypress(function () {
        if (isValidDescription(that.newTaskInputSelector.val())) {
            that.newTaskBtnSelector.removeClass("disabled");
        } else if (!that.newTaskBtnSelector.hasClass("disabled")) {
            that.newTaskBtnSelector.addClass("disabled");
        }
    });

    var cur;
    $(eventBus).on(Event.UI_ADD_TASK, function (event, data) {
        var item = $('#taskItemTmpl').tmpl([data]);
        item.fadeIn(300);
        item.appendTo('.' + that.widgetClass + ' .task-items-wrapper');

        // place were task item content appends (buttons etc.)
        var needDeleteButton = true;
        if (needDeleteButton) {
            $('#deleteTaskBtnTmpl').tmpl([{}]).appendTo(item);

            var deleteBtnSelector = item.find(".delete-btn");

            deleteBtnSelector.on("click", function (event) {
                //var taskID = +event.currentTarget.parentElement.id;
                var taskID = data.task.id;
                $(eventBus).trigger(Event.UI_DELETE_TASK, {taskID: taskID});
            });
        }

        item.find(".inline-edit").mouseenter(function () {
            cur = this;
            this.style.width = ((this.value.length + 1) * 7) + 'px';
            item.mouseleave(function () {
                cur.style.width = '0px'; //reset to min-width in css
                $(this).unbind("mouseleave");
            });
        });

        var needSaveButton = true;
        if (needSaveButton) {
            var saveBtn = $('#saveTaskBtnTmpl').tmpl([{}]);

            item.find(".inline-edit").focus(function () {
                item.unbind('mouseleave');
                saveBtn.appendTo('#' + data.task.id);
                item.find(".save-btn").on("click", function (event) {
                    cur.style.width = '0px'; //reset to min-width in css
                    var description = item.find(".inline-edit").val();
                    $(eventBus).trigger(Event.UI_SAVE_DESCRIPTION, {taskID: data.task.id, description: description});
                });
                item.find(".save-btn").hover(
                    function () {
                        item.find(".inline-edit").unbind('blur');
                    },
                    function () {
                        item.find(".inline-edit").blur(function () {
                            item.find(".save-btn").remove();
                        });
                    }
                );
                $(this).blur(function () {
                    cur.style.width = '0px'; //reset to min-width in css
                    item.find(".save-btn").remove();
                    $(this).unbind('blur');
                });
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
}

function Controller() {
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
}

function TaskService(data) {
    this._tasksIDs = data.tasksIDs;
    this._tasks = data.tasks;
    var that = this;

    //restoring
    this._tasks.forEach(function (task) {
        var taskDTO = task.getDTO();
        $(eventBus).trigger(Event.MODEL_TASK_RESTORED, {task: taskDTO});
    });

    $(eventBus).on(Event.MODEL_ADD_TASK, function (event, data) {
        try {
            that.addTask(data.task);
            var taskDTO = data.task.getDTO();
            $(eventBus).trigger(Event.MODEL_TASK_ADDED, {task: taskDTO});
        } catch (e) {
            alert(e.message);
        }
    });

    $(eventBus).on(Event.MODEL_DELETE_TASK, function (event, data) {
        that.deleteTask(data.taskID);
        $(eventBus).trigger(Event.MODEL_TASK_DELETED, data);
    });

    $(eventBus).on(Event.MODEL_CHANGE_DESCRIPTION, function (event, data) {
        that.changeTaskDescription(data.taskID, data.description);
        $(eventBus).trigger(Event.MODEL_DESCRIPTION_CHANGED, data);
    });

    var __proto__ = TaskService.prototype;

    __proto__.addTask = function (task) {
        var id = task.getID();
        checkTask(task); // throws InvalidTaskException

        this._tasksIDs.push(id);
        this._tasks.push(task);

        window.localStorage.setItem(storageKey, JSON.stringify(this._tasksIDs));
        window.localStorage.setItem(id, JSON.stringify(task));
    }

    __proto__.fetchTasks = function () {
        return this._tasks;
    }

    __proto__.deleteTask = function (taskID) {
        var task = this.getTaskByID(taskID);
        if (task) {
            remove(this._tasksIDs, taskID);
            remove(this._tasks, task);

            window.localStorage.setItem(storageKey, JSON.stringify(this._tasksIDs));
            window.localStorage.removeItem(taskID);
        }
    }

    __proto__.getTaskByID = function (id) {
        return binarySearch(this._tasks, id, 0, this._tasks.length);
    }

    __proto__.assignTask = function (taskID, user) {
        var task = this.getTaskByID(taskID);

        if (task) {
            task.assignTo(user);
        }
    }

    __proto__.changeTaskDescription = function (taskID, newDescription) {
        var task = this.getTaskByID(taskID);

        if (task && isValidDescription(newDescription)) {
            task.setDescription(newDescription);
            window.localStorage.setItem(task.getID(), JSON.stringify(task));
        }
    }

    __proto__.changeTaskStatus = function (taskID, newStatus) {
        var task = this.getTaskByID(taskID);

        if (task) {
            task.setStatus(newStatus);
        }
    }
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
    }

    __proto__.setDescription = function (description) {
        this._description = clone(description);
    }

    __proto__.getAuthor = function () {
        return clone(this._author);
    }

    __proto__.assignTo = function (user) {
        this._assignee = clone(user);
    }

    __proto__.getAssignee = function () {
        return clone(this._assignee);
    }

    __proto__.getCreationDate = function () {
        return new Date(this._timestamp);
    }

    __proto__.getID = function () {
        return clone(this._timestamp);
    }

    __proto__.getStatus = function () {
        return clone(this._status);
    }

    __proto__.setStatus = function (status) {
        this._status = clone(status);
    }

    __proto__.getDTO = function () {
        var data = {
            id: this.getID(),
            description: this.getDescription(),
            author: this.getAuthor(),
            assignee: this.getAssignee(),
            creationDate: this.getCreationDate(),
            status: this.getStatus()
        };
        return data;
    }

    __proto__.restoreFrom = function (data) {
        this._description = data._description;
        this._author = data._author;
        this._assignee = data._assignee;
        this._timestamp = data._timestamp;
        this._status = data._status;
    }
}