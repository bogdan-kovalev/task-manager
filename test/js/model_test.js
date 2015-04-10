QUnit.test("ADD NEW TASK", function (assert) {
    var eventBus = {};
    var storage = new Storage("model-test-storage");
    var model = new Model(storage, eventBus);
    var description = "Test description";
    var user = "Test user";
    var newTask = new TaskItem(description, user);

    $(eventBus).on(Event.MODEL_TASK_ADDED, function (event, data) {
        assert.deepEqual(data.task, newTask.getDTO(), "Passed!");
    });

    $(eventBus).trigger(Event.MODEL_ADD_TASK, {task: newTask});

    storage.clear();
});