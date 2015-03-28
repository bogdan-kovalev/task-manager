ControllerTests = {

    run: function () {
        console.log("\nController tests\n");
        var taskService = new Model([]);
        Controller.init(taskService);

        testTaskAdded();
        testTaskDeleted();
        testDescriptionChanged();
        testTaskAssigned();

        // Controller tests
        function testTaskAdded() {
            var description = "Wash my car";
            var author = "Bogdan Kovalev";
            var task = new Task(description, author);

            $(document).trigger("task-added", task);

            if (taskService.getTaskByID(task.getID()) === task) {
                console.log("testTaskAdded() - Passed!");
            } else {
                console.log("testTaskAdded() - Failed!");
            }
        }

        function testTaskDeleted() {
            var description = "Wash my car";
            var author = "Bogdan Kovalev";
            var task = new Task(description, author);
            taskService.addTask(task);

            $(document).trigger("task-deleted", task.getID());

            if (!taskService.getTaskByID(task.getID())) {
                console.log("testTaskDeleted() - Passed!");
            } else {
                console.log("testTaskDeleted() - Failed!");
            }
        }

        function testDescriptionChanged() {
            var description = "Wash my car";
            var author = "Bogdan Kovalev";
            var task = new Task(description, author);
            taskService.addTask(task);

            var expected = "Drive my car";

            $(document).trigger("description-changed", {taskID: task.getID(), newDescription: expected});

            var actual = taskService.getTaskByID(task.getID()).getDescription();
            if (actual == expected) {
                console.log("testDescriptionChanged() - Passed!");
            } else {
                console.log("testDescriptionChanged() - Failed! actual: " + actual + " expected: " + expected);
            }
        }

        function testTaskAssigned() {
            var description = "Wash my car";
            var author = "Bogdan Kovalev";
            var task = new Task(description, author);
            taskService.addTask(task);

            var expected = "John Doe";

            $(document).trigger("task-assigned", {task: task.getID(), user: expected});

            var actual = taskService.getTaskByID(task.getID()).getAssignee();
            if (actual == expected) {
                console.log("testTaskAssigned() - Passed!");
            } else {
                console.log("testTaskAssigned() - Failed! actual: " + actual + " expected: " + expected);
            }
        }
    }
}
