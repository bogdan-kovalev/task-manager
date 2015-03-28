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

function binarySearch(values, target, start, end) {
    if (start > end) {
        return null;
    } //does not exist

    var middle = Math.floor((start + end) / 2);
    var value = values[middle];

    if (value.getID() > target) {
        return binarySearch(values, target, start, middle - 1);
    }
    if (value.getID() < target) {
        return binarySearch(values, target, middle + 1, end);
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