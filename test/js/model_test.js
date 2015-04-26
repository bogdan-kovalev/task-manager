QUnit.test("ADD NEW TASK", function (assert) {
    var eventBus = {};
    var app = new Application();
    var model = app.createModel(eventBus);

    var newTask = app.createTaskItem("Test description", "Test user");

    $(eventBus).on(Event.MODEL_TASK_ADDED, function (event, data) {
        var task = model.getTaskByID(newTask.getID());
        assert.deepEqual(task.getDTO(), newTask.getDTO(), "Passed!");
    });

    $(eventBus).trigger(Event.MODEL_ADD_TASK, {task: newTask});
});

QUnit.test("DELETE TASK", function (assert) {
    var eventBus = {};
    var app = new Application();
    var model = app.createModel(eventBus);

    var newTask = app.createTaskItem("Test description", "Test user");

    $(eventBus).on(Event.MODEL_TASK_DELETED, function (event, data) {
        var task = model.getTaskByID(newTask.getID());
        assert.deepEqual(task, undefined, "Passed!");
    });

    $(eventBus).trigger(Event.MODEL_ADD_TASK, {task: newTask});
    $(eventBus).trigger(Event.MODEL_DELETE_TASK, {taskID: newTask.getID()});

});

QUnit.test("CHANGE DESCRIPTION", function (assert) {
    var eventBus = {};
    var app = new Application();
    var model = app.createModel(eventBus);

    var newTask = app.createTaskItem("Test description", "Test user");
    var newDescription = "New description";

    $(eventBus).on(Event.MODEL_DESCRIPTION_CHANGED, function (event, data) {
        var task = model.getTaskByID(newTask.getID());
        assert.deepEqual(task.getDescription(), newDescription, "Passed!");
    });

    $(eventBus).trigger(Event.MODEL_ADD_TASK, {task: newTask});
    $(eventBus).trigger(Event.MODEL_CHANGE_DESCRIPTION, {taskID: newTask.getID(), description: newDescription});

});

QUnit.test("ASSIGN", function (assert) {
    var eventBus = {};
    var app = new Application();
    var model = app.createModel(eventBus);

    var newTask = app.createTaskItem("Test description", "Test user");
    var newAssignee = "Test assignee";

    $(eventBus).on(Event.MODEL_TASK_ASSIGNED, function (event, data) {
        var task = model.getTaskByID(newTask.getID());
        assert.deepEqual(task.getAssignee(), newAssignee, "Passed!");
    });

    $(eventBus).trigger(Event.MODEL_ADD_TASK, {task: newTask});
    $(eventBus).trigger(Event.MODEL_ASSIGN_TASK, {taskID: newTask.getID(), assignee: newAssignee});
});