/**
 * @author Bogdan Kovalev
 */

function convertToTask(item) {
    return {
        _description: item.summary,
        _author: item.creator.displayName,
        _assignee: item.creator.displayName,
        _timestamp: new Date(item.created).getTime(),
        _status: 'new'
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
                tasks.push(convertToTask(items[i]));
            }

            self.postMessage(tasks);

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