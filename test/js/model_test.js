QUnit.test("ADD NEW TASK", function (assert) {
    var eventBus = {};
    var storage = new Storage("model-test-storage");
    var model = new Model(storage, eventBus);

    var newTask = new TaskItem("Test description", "Test user");

    $(eventBus).on(Event.MODEL_TASK_ADDED, function (event, data) {
        var task = model.getTaskByID(newTask.getID());
        assert.deepEqual(task.getDTO(), newTask.getDTO(), "Passed!");
    });

    $(eventBus).trigger(Event.MODEL_ADD_TASK, {task: newTask});

    storage.clear();
});

QUnit.test("DELETE TASK", function (assert) {
    var eventBus = {};
    var storage = new Storage("model-test-storage");
    var model = new Model(storage, eventBus);

    var newTask = new TaskItem("Test description", "Test user");

    $(eventBus).on(Event.MODEL_TASK_DELETED, function (event, data) {
        var task = model.getTaskByID(newTask.getID());
        assert.deepEqual(task, null, "Passed!");
    });

    $(eventBus).trigger(Event.MODEL_ADD_TASK, {task: newTask});
    $(eventBus).trigger(Event.MODEL_DELETE_TASK, {taskID: newTask.getID()});

    storage.clear();
});

QUnit.test("CHANGE DESCRIPTION", function (assert) {
    var eventBus = {};
    var storage = new Storage("model-test-storage");
    var model = new Model(storage, eventBus);

    var newTask = new TaskItem("Test description", "Test user");
    var newDescription = "New description";

    $(eventBus).on(Event.MODEL_DESCRIPTION_CHANGED, function (event, data) {
        var task = model.getTaskByID(newTask.getID());
        assert.deepEqual(task.getDescription(), newDescription, "Passed!");
    });

    $(eventBus).trigger(Event.MODEL_ADD_TASK, {task: newTask});
    $(eventBus).trigger(Event.MODEL_CHANGE_DESCRIPTION, {taskID: newTask.getID(), description: newDescription});

    storage.clear();
});