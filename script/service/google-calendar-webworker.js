/**
 * @author Bogdan Kovalev
 */

function taskFromEvent(event) {
    var params = getParams(event);
    return {
        id: event.id,
        description: event.description ? withoutParams(event.description) : event.summary,
        author: event.creator.displayName,
        assignee: params.assignee,
        timestamp: new Date(event.start.dateTime),
        status: params.status
    };
}

function eventFromTask(task) {
    return {
        summary: task.description.split('\n')[0],
        description: withParams(task.description, task),
        start: {dateTime: (new Date(task.timestamp)).toJSON()},
        end: {dateTime: (new Date()).toJSON()},
        id: task.id
    };
}

function withParams(description, task) {
    return description + '\n\nPARAMETERS\n' +
        '@assignee ' + task.assignee +
        '\n@status ' + task.status;
}

function withoutParams(description) {
    return description.split('\n\nPARAMETERS\n')[0];
}

function getParams(event) {
    var assignee, status;

    try {
        var params = event.description.split('\n\nPARAMETERS\n')[1];
        assignee = params.split('assignee ')[1].split('\n')[0];
        status = params.split('status ')[1].split('\n')[0];
    } catch (e) {
        assignee = event.creator.displayName;
        status = 'new';
    }

    return {
        assignee: assignee,
        status: status
    }
}

self.getUserInfo = function (args) {
    var accessToken = args.access_token;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://www.googleapis.com/plus/v1/people/me', false);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.send();

    if (xhr.status != 200) {
        console.log(xhr.status + ': ' + xhr.statusText);
    } else {
        try {
            var userInfo = JSON.parse(xhr.responseText);
            self.postMessage(userInfo);
        } catch (e) {
            console.log(e);
        }
    }
};

self.getCalendar = function (args) {
    var accessToken = args.access_token,
        calendarSummary = args.calendar_summary;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://www.googleapis.com/calendar/v3/users/me/calendarList', false);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.send();

    if (xhr.status != 200) {
        console.log(xhr.status + ': ' + xhr.statusText);
    } else {
        try {
            var calendarList = JSON.parse(xhr.responseText);
            var calendar = null;

            for (var i = 0; i < calendarList.items.length; i++) {
                if (calendarList.items[i].summary == calendarSummary) {
                    calendar = calendarList.items[i];
                    break;
                }
            }

            if (!calendar) {
                self.createCalendar(args);
            } else {
                self.postMessage(calendar);
            }
        } catch (e) {
            console.log(e);
        }
    }
};

self.createCalendar = function (args) {
    var accessToken = args.access_token,
        calendarSummary = args.calendar_summary;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://www.googleapis.com/calendar/v3/calendars', false);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({summary: calendarSummary}));

    if (xhr.status != 200) {
        console.log(xhr.status + ': ' + xhr.statusText);
    } else {
        try {
            var calendar = JSON.parse(xhr.responseText);
            self.postMessage(calendar);
        } catch (e) {
            console.log(e);
        }
    }
};

self.downloadTasks = function (args) {
    var accessToken = args.access_token;
    var calendarId = args.calendar_id;

    var tasks = [];

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://www.googleapis.com/calendar/v3/calendars/' + calendarId + '/events', false);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.send();

    if (xhr.status != 200) {
        console.log(xhr.status + ': ' + xhr.statusText);
    } else {
        try {
            var items = JSON.parse(xhr.responseText).items;

            for (var i = 0; i < items.length; ++i) {
                tasks.push(taskFromEvent(items[i]));
            }

            self.postMessage(tasks);

        } catch (e) {
            console.log(e);
        }
    }
};

self.addTask = function (args) {
    var accessToken = args.access_token;
    var calendarId = args.calendar_id;
    var task = args.task;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://www.googleapis.com/calendar/v3/calendars/' + calendarId + '/events', false);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(eventFromTask(task)));

    if (xhr.status != 200) {
        console.log(xhr.status + ': ' + xhr.statusText);
    } else {
        try {
            self.postMessage(true);
        } catch (e) {
            console.log(e);
        }
    }
};

self.updateTask = function (args) {
    var accessToken = args.access_token;
    var calendarId = args.calendar_id;
    var task = args.task;

    var xhr = new XMLHttpRequest();
    xhr.open('PUT', 'https://www.googleapis.com/calendar/v3/calendars/' + calendarId + '/events/' + task.id, false);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(eventFromTask(task)));

    if (xhr.status != 200) {
        console.log(xhr.status + ': ' + xhr.statusText);
    } else {
        try {
            self.postMessage(true);
        } catch (e) {
            console.log(e);
        }
    }
};

self.deleteTask = function (args) {
    var accessToken = args.access_token;
    var calendarId = args.calendar_id;
    var taskId = args.task_id;

    var xhr = new XMLHttpRequest();
    xhr.open('DELETE', 'https://www.googleapis.com/calendar/v3/calendars/' + calendarId + '/events/' + taskId, false);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.send();

    if (xhr.status != 200) {
        console.log(xhr.status + ': ' + xhr.statusText);
    } else {
        try {
            self.postMessage(true);
        } catch (e) {
            console.log(e);
        }
    }
};

self.onmessage = function (event) {

    var name = event.data['func'];
    var args = event.data['args'];

    var callFunc = self[name];

    if (typeof callFunc == 'function') {
        if (args) {
            callFunc(args);
        } else {
            callFunc();
        }
    }
};