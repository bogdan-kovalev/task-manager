function Task(description, author) {
	this._description = description;
	this._author = author;
	this._assignee = author;
	this._timestamp = new Date().getTime();
	this._status = Status.NEW;
	
	var __proto__ = Task.prototype;
	
	__proto__.getDescription = function() {
		return this._description;
	}
	
	__proto__.setDescription = function(description) {
		this._description = description;
	}
	
	__proto__.getAuthor = function() {
		return this._author;
	}
	
	__proto__.assignTo = function(user) {
		this._assignee = user;
	}
	
	__proto__.getAssignee = function() {
		return this._assignee;
	}
	
	__proto__.getTimestamp = function() {
		return this._timestamp;
	}
	
	__proto__.getID = function() {
		return this._timestamp;
	}
	
	__proto__.getStatus = function() {
		return this._status;
	}
	
	__proto__.setStatus = function(status) {
		this._status = status;
	}
}

function TaskService(storage) {
	this._storage = storage;
	
	var __proto__ = TaskService.prototype;
	
	__proto__.addTask = function(task) {
		var description = task.getDescription();
		var author = task.getAuthor();
	
		checkTask(task); // throws InvalidTaskException
		this._storage.push(task);
	}
	
	__proto__.fetchTasks = function() {
		return this._storage;
	}
	
	__proto__.deleteTask = function(taskID) {
		var task = this.getTaskByID(taskID);
		if(task) {
			this._storage.pop(task);
		}
	}
	
	__proto__.getTaskByID = function(id) {
		var task = binarySearch(this._storage, id, 0, this._storage.length-1);
		return task;
		
		function binarySearch(values, target, start, end) {
			if (start > end) { return undefined; } //does not exist

			var middle = Math.floor((start + end) / 2);
			var value = values[middle];

			if (value.getID() > target) { return binarySearch(values, target, start, middle-1); }
			if (value.getID() < target) { return binarySearch(values, target, middle+1, end); }
			return value; //found!
		}
	}

	__proto__.assignTask = function(taskID, user) {
		var task = this.getTaskByID(taskID);
	
		if(task) {
			task.assignTo(user);
		}
	}
	
	__proto__.changeTaskDescription = function(taskID, newDescription) {
		var task = this.getTaskByID(taskID);
	
		if(task && isValidDescription(newDescription)) {
			task.setDescription(newDescription);
		}
	}
	
	__proto__.changeTaskStatus = function(taskID, newStatus) {
		var task = this.getTaskByID(taskID);
	
		if(task) {
			task.setStatus(newStatus);
		}
	}
}

function checkTask(task) {
	if (!isValidDescription(task.getDescription())) {
		throw new InvalidTaskError("Description is undefined");
	} else if (!isValidAuthor(task.getAuthor())) {
		throw new InvalidTaskError("Author is undefined");
	}
}

function isValidDescription(d) {
	return (d && d != "") ? true : false;
}

function isValidAuthor(a) {
	return (a && a != "") ? true : false;
}

function InvalidTaskError(message) {
	this.name = "InvalidTask";
	this.message = message;
}

Status = {
	NEW : "new",
	FINISHED : "finished",
	CANCELED : "canceled"
}




















