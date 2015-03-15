Controller = {
  init : function(taskService) {
    $(document).on("task-added", handleAddTask);

    $(document).on("task-deleted", handleDeleteTask);

    function handleAddTask(event, task) {
      taskService.addTask(task);
    }

    function handleDeleteTask(event, taskID) {
      taskService.deleteTask(taskID);
    }
  }
}
