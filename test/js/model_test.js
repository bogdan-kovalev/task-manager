QUnit.test("ADD NEW TASK", function (assert) {
    var eventBus = {};
    var storage = new Storage("model-test-storage");
    var model = new Model(storage, eventBus);

    var newTask = new TaskItem("Test description", "Test user");

    $(eventBus).on(Event.MODEL_TASK_ADDED, function (event, data) {
        assert.deepEqual(data.task, newTask.getDTO(), "Passed!");
    });

    $(eventBus).trigger(Event.MODEL_ADD_TASK, {task: newTask});

    storage.clear();
});