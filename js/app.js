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
            var task = new Task(description, "Bogdan");
            $('#taskItemTmpl').tmpl([task.getDTO()]).appendTo('.' + that.widgetClass);
        });
    }

    function Controller() {
        $(bus).on("task-added", handleAddTask);

        $(bus).on("task-deleted", handleDeleteTask);

        $(bus).on("description-changed", handleDescriptionChanged);

        $(bus).on("task-assigned", handleTaskAssigned);

        function handleAddTask(event, task) {
            taskService.addTask(task);
        }

        function handleDeleteTask(event, taskID) {
            taskService.deleteTask(taskID);
        }

        function handleDescriptionChanged(event, data) {
            taskService.changeTaskDescription(data.taskID, data.newDescription);
        }

        function handleTaskAssigned(event, data) {
            taskService.assignTask(data.taskID, data.user);
        }
    }
});