/**
 * @author Bogdan Kovalev
 */

self.downloadTasks = function () {

    // TODO request to Google Calendar API

    var sampleTask = {
        _description: "from web worker",
        _author: "Bogdan",
        _assignee: "Bogdan",
        _timestamp: new Date().getTime(),
        _status: 'new'
    };

    self.postMessage([sampleTask]);
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