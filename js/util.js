function tryRestoreFromLocal(localStorageKey) {
    var restoredTasks = [];
    var localTasksIDs = [];
    if (window.localStorage[localStorageKey] == undefined) {
        window.localStorage[localStorageKey] = "";
    } else {
        try {
            localTasksIDs = JSON.parse(window.localStorage.getItem(localStorageKey));
            localTasksIDs.forEach(function (entry) {
                var task = new TaskItem();
                task.restoreFrom(JSON.parse(window.localStorage.getItem(entry)));
                restoredTasks.push(task);
            });
        } catch (e) {
            //ignored
        }
    }
    return {tasksIDs: localTasksIDs, tasks: restoredTasks};
}

function checkTask(task) {
    if (!isValidDescription(task.getDescription())) {
        throw new InvalidTaskError("Description is undefined");
    } else if (!isValidAuthor(task.getAuthor())) {
        throw new InvalidTaskError("Author is undefined");
    }
}

function isValidDescription(d) {
    return (d && /\S/.test(d)) ? true : false;
}

function isValidAuthor(a) {
    return (a && /\S/.test(a)) ? true : false;
}

function InvalidTaskError(message) {
    this.name = "InvalidTask";
    this.message = message;
}

function binarySearch(tasks, id, start, end) {
    if (start > end) {
        return null;
    } //does not exist

    var middle = Math.floor((start + end) / 2);
    var value = tasks[middle];

    if (value.getID() > id) {
        return binarySearch(tasks, id, start, middle - 1);
    }
    if (value.getID() < id) {
        return binarySearch(tasks, id, middle + 1, end);
    }
    return value; //found!
}

function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}