function runTests() {
	console.log("DTO tests\n");
	testNewTask();
	testTaskAssignTo();
	testTaskGetID();
	testTaskSetStatus();
	
	console.log("\nService tests\n");
	testAddValidTask();
	testAddTaskWithInvalidDescription();
	testAddTaskWithInvalidAuthor();
	testFetchTasks();
	testDeleteTask();
	testGetTaskByID();
	testAssignTask();
	testChangeTaskDescription();
	testChangeTaskStatus();
}

// DTO tests
function testNewTask() {
	var eDescription = "Wash my car";
	var eAuthor = "Bogdan Kovalev";
	var eAssignee = "Bogdan Kovalev";
	
	var t = new Task(eDescription, eAuthor);
	
	var aDescription = t.getDescription();
	var aAuthor = t.getAuthor();
	var aAssignee = t.getAssignee();
	
	if(	aDescription && eDescription === aDescription && 
			aAuthor && eAuthor === aAuthor && 
			aAssignee && eAssignee === aAssignee 
		) {
		console.log("testNewTask() - Passed!");
	} else { 
		console.log("testNewTask() - Failed!");
	}
}

function testTaskAssignTo() {
	var t = new Task("Wash my car", "Bogdan Kovalev");
	t.assignTo("Autowasherman");
	
	if(t.getAssignee() === "Autowasherman") {
		console.log("testTaskAssignTo() - Passed!");
	} else { 
		console.log("testTaskAssignTo() - Failed!");
	}
}

function testTaskGetID() {
	var t = new Task("Wash my car", "Bogdan Kovalev");
	var id = t.getID();
	// id is actualy equals timestamp
	if(!isNaN(parseFloat(id)) && isFinite(id)) { // check that id is number
		console.log("testTaskGetID() - Passed!");
	} else { 
		console.log("testTaskGetID() - Failed!");
	}
}

function testTaskSetStatus() {
	var t = new Task("Wash my car", "Bogdan Kovalev");
	t.setStatus(Status.FINISHED);
	
	if(t.getStatus() == Status.FINISHED) {
		console.log("testTaskSetStatus() - Passed!");
	} else { 
		console.log("testTaskSetStatus() - Failed!");
	}
}

// Service tests
function testAddValidTask() {
	var t = new Task("Wash my car", "Bogdan Kovalev");
	var taskService = new TaskService([]);
	
	taskService.addTask(t);
	
	var tasks = taskService.fetchTasks();
	
	if(tasks[0] === t) {
		console.log("testAddValidTask() - Passed!");
	} else {
		console.log("testAddValidTask() - Failed!");
	}
}

function testAddTaskWithInvalidDescription() {
	var t = new Task("", "Bogdan Kovalev");
	var taskService = new TaskService([]);
	
	try {
		taskService.addTask(t);
		console.log("testAddTaskWithInvalidDescription() - Failed!");
	} catch (e) {
		if(e.message == "Description is undefined") {
			console.log("testAddTaskWithInvalidDescription() - Passed!");
		}
	}
}

function testAddTaskWithInvalidAuthor() {
	var t = new Task("Wash my car", "");
	var taskService = new TaskService([]);
	
	try {
		taskService.addTask(t);
		console.log("testAddTaskWithInvalidAuthor() - Failed!");
	} catch (e) {
		if(e.message == "Author is undefined") {
			console.log("testAddTaskWithInvalidAuthor() - Passed!");
		}
	}
}

function testFetchTasks() {
	var taskService = new TaskService([]);
	var task1 = new Task("Wash my car", "Bogdan");
	var task2 = new Task("Drive my car", "Arthur");
	
	taskService.addTask(task1);
	taskService.addTask(task2);
	
	var tasks = taskService.fetchTasks();
	
	if(tasks.length == 2 && tasks[0] === task1 && tasks[1] === task2) {
		console.log("testFetchTasks() - Passed!");
	} else {
		console.log("testFetchTasks() - Failed!");
	}
}

function testDeleteTask() {
	var t = new Task("Wash my car", "Bogdan Kovalev");
	var taskService = new TaskService([]);
	
	taskService.addTask(t);
	taskService.deleteTask(t.getID());
	
	if(taskService.getTaskByID(t.getID()) == undefined) {
		console.log("testDeleteTask() - Passed!");
	} else {
		console.log("testDeleteTask() - Failed!");
	}
}

function testGetTaskByID() {
	var expected = new Task("Wash my car", "Bogdan Kovalev");
	var taskService = new TaskService([]);
	
	taskService.addTask(expected);
	taskService.addTask(new Task("Wash my car", "Bogdan Kovalev"));
	taskService.addTask(new Task("Wash my car", "Bogdan Kovalev"));
	
	var actual = taskService.getTaskByID(expected.getID());
	
	if(actual && actual.getID() === expected.getID()) {
		console.log("testGetTaskByID() - Passed!");
	} else { 
		console.log("testGetTaskByID() - Failed! "+"actual: "+actual+ " expected: "+expected.getID());
	}
}

function testAssignTask() {
	var t = new Task("Wash my car", "Bogdan Kovalev");
	var taskService = new TaskService([]);
	taskService.addTask(t);
	taskService.assignTask(t.getID(), "Arthur Zagorskiy");
	
	if(t.getAssignee() === "Arthur Zagorskiy") {
		console.log("testAssignTask() - Passed!");
	} else {
		console.log("testAssignTask() - Failed!");
	}
}

function testChangeTaskDescription() {
	var t = new Task("Wash my car", "Bogdan Kovalev");
	var taskService = new TaskService([]);
	taskService.addTask(t);
	var expected = "Drive my car";
	taskService.changeTaskDescription(t.getID(), "Drive my car");
	
	if(t.getDescription() === expected) {
		console.log("testChangeTaskDescription() - Passed!");
	} else {
		console.log("testChangeTaskDescription() - Failed! actual: "+t.getDescription()+" expected: "+expected);
	}
}

function testChangeTaskStatus() {
	var t = new Task("Wash my car", "Bogdan Kovalev");
	var taskService = new TaskService([]);
	taskService.addTask(t);
	taskService.changeTaskStatus(t.getID(), Status.FINISHED);
	
	if(t.getStatus() == Status.FINISHED) {
		console.log("testChangeTaskStatus() - Passed!");
	} else {
		console.log("testChangeTaskStatus() - Failed!");
	}
}
