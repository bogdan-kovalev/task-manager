$(function () {

    var bus;

    var model = new Model([]);

    var controller = new Controller();

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
            $('#taskItemTmpl').tmpl([task]).appendTo('.' + that.widgetClass);
        });
    }

    new Widget();
    new Widget();
    new Widget();
});