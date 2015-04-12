function checkTask(task) {
    if (!isValidDescription(task.getDescription())) {
        throw new InvalidTaskError("Description is undefined");
    } else if (!isValidAuthor(task.getAuthor())) {
        throw new InvalidTaskError("Author is undefined");
    }
}

function autoRows(textarea) {
    textarea.attr('rows', textarea.val().split(/\r\n|\r|\n/).length);
    while (textarea.height() < textarea.get(0).scrollHeight - 10) {
        textarea.attr('rows', +textarea.attr('rows') + 1);
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

function remove(array, elem) {
    var index = array.indexOf(elem);
    if (index > -1) {
        array.splice(index, 1);
    }
}