/**
 * @author Bogdan Kovalev
 */

angular.module('tasklist-back')
    .factory('GoogleCalendarService', function ($q) {
        var service = {};

        // https://developers.google.com/google-apps/calendar/auth if you want to request write scope.
        var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

        var CLIENT_ID = '1091102336473-menne0porhf02t2fjg81hpel6us9moum.apps.googleusercontent.com';

        function callWebWorker(cmd) {
            var worker = new Worker('./script/service/google-calendar-webworker.js');
            var defer = $q.defer();

            worker.onmessage = function (event) {
                defer.resolve(event.data);
                worker.terminate();
            };

            worker.postMessage({func: cmd});
            return defer.promise;
        }

        service.fetchTasks = function () {
            return callWebWorker('downloadTasks');
        };

        return service;
    });