ControllerTests = {

	run : function() {
		console.log("\nController tests\n");
    var taskService = new TaskService([]);
    Controller.init(taskService);

    testTaskAdded();
    testTaskDeleted();

		// Controller tests
    function testTaskAdded() {
      var description = "Wash my car";
      var author = "Bogdan Kovalev";
      var task = new Task(description, author);

      $(document).trigger("task-added", task);

      if(taskService.getTaskByID(task.getID()) === task) {
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

      if(!taskService.getTaskByID(task.getID())) {
        console.log("testTaskDeleted() - Passed!");
      } else {
        console.log("testTaskDeleted() - Failed!");
      }
    }
	}
}
