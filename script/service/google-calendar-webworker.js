/**
 * @author Bogdan Kovalev
 */

function taskFromEvent(event) {
    return {
        _description: event.summary,
        _author: event.creator.displayName,
        _assignee: event.creator.displayName,
        _timestamp: +event.id,
        _status: 'new'
    };
}

function eventFromTask(task) {
    console.log(task.id);
    return {
        summary: task.description,
        start: {dateTime: task.creationDate.toJSON()},
        end: {dateTime: (new Date()).toJSON()},
        id: task.id
    };
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
                var task = taskFromEvent(items[i]);
                console.log(task._timestamp);
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