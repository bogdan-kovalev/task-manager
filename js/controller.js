function Controller() {
    $(document).on("task-added", handleAddTask);

    $(document).on("task-deleted", handleDeleteTask);

    $(document).on("description-changed", handleDescriptionChanged);

    $(document).on("task-assigned", handleTaskAssigned);

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
