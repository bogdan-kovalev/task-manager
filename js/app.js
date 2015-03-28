Status = {
    NEW: "new",
    FINISHED: "finished",
    CANCELED: "canceled"
};

Event = {
    UI_NEW_TASK: "ui-new-task",
    UI_ADD_TASK: "ui-add-task",
    MODEL_ADD_TASK: "model-add-task",
    MODEL_TASK_ADDED: "model-task-added",
    MODEL_TASK_RESTORED: "model-task-restored"
};

var eventBus = {};

$(function () {
    var storageKey = 'task-list-local-storage';
    if (window.localStorage[storageKey] == undefined) {
        alert("no storage");
        window.localStorage[storageKey] = "";
    }

    new Widget();

    var controller = new Controller();

    var model = new Model(storageKey);

});

function Widget() {
    var that = this;

    var id = Math.floor(Math.random() * 1000);

    this.widgetClass = 'widget-' + id;
    this.addTaskTxtFieldClass = 'new-task-txt-' + id;
    this.addTaskBtnClass = 'add-task-btn-' + id;

    $('#widgetTmpl').tmpl([this]).appendTo('body');

    $('.' + this.addTaskBtnClass).on('click', function () {
        var textField = $('.' + that.addTaskTxtFieldClass);
        var description = textField.val();
        var newTask = new TaskItem(description, "Bogdan");

        $(eventBus).trigger(Event.UI_NEW_TASK, {task: newTask});
        textField.val('');
    });

    $(eventBus).on(Event.UI_ADD_TASK, function (event, data) {
        $('#taskItemTmpl').tmpl([data.task]).appendTo('.' + that.widgetClass);
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
}

function Model(storageKey) {
    var storage = [];
    var that = this;

    try {
        this._tasksIDs = JSON.parse(window.localStorage.getItem(storageKey));
    } catch (e) {
        this._tasksIDs = [];
    }

    this._tasksIDs.forEach(function (entry) {
        var task = new TaskItem();
        task.restoreFrom(JSON.parse(window.localStorage.getItem(entry)));
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

    var __proto__ = Model.prototype;

    __proto__.addTask = function (task) {
        var description = task.getDescription();
        var author = task.getAuthor();
        checkTask(task); // throws InvalidTaskException

        this._tasksIDs.push(task.getID());

        window.localStorage.setItem(storageKey, JSON.stringify(this._tasksIDs));
        window.localStorage.setItem(task.getID(), JSON.stringify(task));
    }

    __proto__.fetchTasks = function () {

    }

    __proto__.deleteTask = function (taskID) {
        var task = this.getTaskByID(taskID);
        if (task) {
            this._tasksIDs.pop(task.getID());
            window.localStorage.setItem(storageKey, JSON.stringify(this._tasksIDs));
            window.localStorage.removeItem(task.getID());
        }
    }

    __proto__.getTaskByID = function (id) {
        return window.localStorage.getItem(id);
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