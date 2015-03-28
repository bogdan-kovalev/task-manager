ModelTests = {

    run: function () {
        console.log("\nModel tests\n");
        testAddValidTask();
        testAddTaskWithInvalidDescription();
        testAddTaskWithInvalidAuthor();
        testFetchTasks();
        testDeleteTask();
        testGetTaskByID();
        testAssignTask();
        testChangeTaskDescription();
        testChangeTaskStatus();


        // Model tests
        function testAddValidTask() {
            var t = new Task("Wash my car", "Bogdan Kovalev");
            var taskService = new Model([]);

            taskService.addTask(t);

            var tasks = taskService.fetchTasks();

            if (tasks[0] === t) {
                console.log("testAddValidTask() - Passed!");
            } else {
                console.log("testAddValidTask() - Failed!");
            }
        }

        function testAddTaskWithInvalidDescription() {
            var t = new Task("", "Bogdan Kovalev");
            var taskService = new Model([]);

            try {
                taskService.addTask(t);
                console.log("testAddTaskWithInvalidDescription() - Failed!");
            } catch (e) {
                if (e.message == "Description is undefined") {
                    console.log("testAddTaskWithInvalidDescription() - Passed!");
                }
            }
        }

        function testAddTaskWithInvalidAuthor() {
            var t = new Task("Wash my car", "");
            var taskService = new Model([]);

            try {
                taskService.addTask(t);
                console.log("testAddTaskWithInvalidAuthor() - Failed!");
            } catch (e) {
                if (e.message == "Author is undefined") {
                    console.log("testAddTaskWithInvalidAuthor() - Passed!");
                }
            }
        }

        function testFetchTasks() {
            var taskService = new Model([]);
            var task1 = new Task("Wash my car", "Bogdan");
            var task2 = new Task("Drive my car", "Arthur");

            taskService.addTask(task1);
            taskService.addTask(task2);

            var tasks = taskService.fetchTasks();

            if (tasks.length == 2 && tasks[0] === task1 && tasks[1] === task2) {
                console.log("testFetchTasks() - Passed!");
            } else {
                console.log("testFetchTasks() - Failed!");
            }
        }

        function testDeleteTask() {
            var t = new Task("Wash my car", "Bogdan Kovalev");
            var taskService = new Model([]);

            taskService.addTask(t);
            taskService.deleteTask(t.getID());

            if (taskService.getTaskByID(t.getID()) == undefined) {
                console.log("testDeleteTask() - Passed!");
            } else {
                console.log("testDeleteTask() - Failed!");
            }
        }

        function testGetTaskByID() {
            var expected = new Task("Wash my car", "Bogdan Kovalev");
            var taskService = new Model([]);

            taskService.addTask(expected);
            taskService.addTask(new Task("Wash my car", "Bogdan Kovalev"));
            taskService.addTask(new Task("Wash my car", "Bogdan Kovalev"));

            var actual = taskService.getTaskByID(expected.getID());

            if (actual && actual.getID() === expected.getID()) {
                console.log("testGetTaskByID() - Passed!");
            } else {
                console.log("testGetTaskByID() - Failed! " + "actual: " + actual + " expected: " + expected.getID());
            }
        }

        function testAssignTask() {
            var t = new Task("Wash my car", "Bogdan Kovalev");
            var taskService = new Model([]);
            taskService.addTask(t);
            taskService.assignTask(t.getID(), "Arthur Zagorskiy");

            if (t.getAssignee() === "Arthur Zagorskiy") {
                console.log("testAssignTask() - Passed!");
            } else {
                console.log("testAssignTask() - Failed!");
            }
        }

        function testChangeTaskDescription() {
            var t = new Task("Wash my car", "Bogdan Kovalev");
            var taskService = new Model([]);
            taskService.addTask(t);
            var expected = "Drive my car";
            taskService.changeTaskDescription(t.getID(), "Drive my car");

            if (t.getDescription() === expected) {
                console.log("testChangeTaskDescription() - Passed!");
            } else {
                console.log("testChangeTaskDescription() - Failed! actual: " + t.getDescription() + " expected: " + expected);
            }
        }

        function testChangeTaskStatus() {
            var t = new Task("Wash my car", "Bogdan Kovalev");
            var taskService = new Model([]);
            taskService.addTask(t);
            taskService.changeTaskStatus(t.getID(), Status.FINISHED);

            if (t.getStatus() == Status.FINISHED) {
                console.log("testChangeTaskStatus() - Passed!");
            } else {
                console.log("testChangeTaskStatus() - Failed!");
            }
        }
    }
}
