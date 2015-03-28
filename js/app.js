$(function () {

    var bus = {};

    var model = new Model([]);

    var controller = new Controller();

    new Widget();

    function Widget() {
        var that = this;

        var id = Math.floor(Math.random() * 1000);

        this.widgetClass = 'widget-' + id;
        this.addTaskTxtFieldClass = 'add-task-txtfield-' + id;
        this.addTaskBtnClass = 'add-task-btn-' + id;

        $('#widgetTmpl').tmpl([this]).appendTo('body');

        $('.' + this.addTaskBtnClass).on('click', function () {
            var description = $('.' + that.addTaskTxtFieldClass).val();
            var task = new TaskItem(description, "Bogdan");

            $(bus).trigger("ui-task-added", {task: task});

            $('#taskItemTmpl').tmpl([task.getDTO()]).appendTo('.' + that.widgetClass);
        });
    }

    function Controller() {
        $(bus).on("ui-task-added", function (event, data) {
            // todo controller validation

            model.addTask(data.task);
        });
    }

    function Model(storage) {
        this._storage = storage;

        var __proto__ = Model.prototype;

        __proto__.addTask = function (task) {
            var description = task.getDescription();
            var author = task.getAuthor();

            checkTask(task); // throws InvalidTaskException
            this._storage.push(task);
            $(bus).trigger("model-task-added", data);
        }

        __proto__.fetchTasks = function () {
            return this._storage;
        }

        __proto__.deleteTask = function (taskID) {
            var task = this.getTaskByID(taskID);
            if (task) {
                this._storage.pop(task);
            }
        }

        __proto__.getTaskByID = function (id) {
            var task = binarySearch(this._storage, id, 0, this._storage.length - 1);
            return task;
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
            return new Date(this.timestamp);
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
    }

    Status = {
        NEW: "new",
        FINISHED: "finished",
        CANCELED: "canceled"
    }
});