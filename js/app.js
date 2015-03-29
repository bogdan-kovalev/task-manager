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
    MODEL_ADD_TASK: "model-add-task",
    MODEL_TASK_ADDED: "model-task-added",
    MODEL_TASK_RESTORED: "model-task-restored",
    MODEL_DELETE_TASK: "model-delete-task",
    MODEL_TASK_DELETED: "model-task-deleted"
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
    this.addTaskTxtFieldClass = 'new-task-txt-' + id;
    this.addTaskBtnClass = 'add-task-btn-' + id;

    $('#widgetTmpl').tmpl([this]).appendTo('body');

    $('.' + this.addTaskBtnClass).on('click', function (event) {
        var textField = $('.' + that.addTaskTxtFieldClass);
        var description = textField.val();
        var newTask = new TaskItem(description, "Bogdan");

        $(eventBus).trigger(Event.UI_NEW_TASK, {task: newTask});
        textField.val('');
    });

    $(eventBus).on(Event.UI_ADD_TASK, function (event, data) {
        $('#taskItemTmpl').tmpl([data]).appendTo('.' + that.widgetClass);

        // place were task item content appends (buttons etc.)
        var needDeleteButton = true;
        if (needDeleteButton) {
            $('#deleteTaskBtnTmpl').tmpl([{}]).appendTo('#' + data.task.id);

            var deleteBtnSelector = $('#' + data.task.id + " .delete-btn");

            deleteBtnSelector.on("click", function (event) {
                //var taskID = +event.currentTarget.parentElement.id;
                var taskID = data.task.id;
                $(eventBus).trigger(Event.UI_DELETE_TASK, {taskID: taskID});
            });
        }
        // end of place were task item content appends (buttons etc.)
    });

    $(eventBus).on(Event.UI_TASK_DELETED, function (event, data) {
        $("#" + data.taskID).remove();
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