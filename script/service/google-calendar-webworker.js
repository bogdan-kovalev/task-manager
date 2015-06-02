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

self.getUserInfo = function (access_token) {

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://www.googleapis.com/plus/v1/people/me', false);
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
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

self.downloadTasks = function (access_token) {

    var tasks = [];

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://www.googleapis.com/calendar/v3/calendars/primary/events', false);
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
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