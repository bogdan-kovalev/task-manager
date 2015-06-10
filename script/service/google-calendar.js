/**
 * @author Bogdan Kovalev
 */

angular.module('tasklist-back')
    .service('GoogleCalendarService', function ($q, GoogleAPI) {
        var service = {};

        var accessToken = null;
        var userInfo = null;
        var calendarId = null;

        var CALENDAR_SUMMARY = 'To-Do List Calendar';

        var SCOPES = [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/plus.me'
        ];

        var CLIENT_ID = '1091102336473-menne0porhf02t2fjg81hpel6us9moum.apps.googleusercontent.com';

        function callWebWorker(cmd, args) {
            var defer = $q.defer();
            if (window.Worker) {
                var worker = new Worker('./script/service/google-calendar-webworker.js');

                worker.onmessage = function (event) {
                    defer.resolve(event.data);
                    worker.terminate();
                };

                worker.postMessage({func: cmd, args: args});
            } else {
                defer.reject("Browser doesn't have Web Workers");
            }
            return defer.promise;
        }

        function fastAuth() {
            var defer = $q.defer();
            if (GoogleAPI.auth) {
                GoogleAPI.auth.authorize({client_id: CLIENT_ID, scope: SCOPES, immediate: true}, function (authResult) {
                    if (authResult && !authResult.error) {
                        accessToken = authResult.access_token;
                        defer.resolve();
                    } else {
                        consentAuth(defer);
                    }
                });
            } else {
                defer.reject('Google authorization rejected');
            }
            return defer.promise;
        }

        function consentAuth(defer) {
            GoogleAPI.auth.authorize({client_id: CLIENT_ID, scope: SCOPES, immediate: false}, function (authResult) {
                if (authResult && !authResult.error) {
                    accessToken = authResult.access_token;
                    defer.resolve();
                } else {
                    defer.reject(authResult.error);
                }
            });
        }

        function saveUserInfo() {
            return callWebWorker('getUserInfo', {access_token: accessToken}).then(function (user_info) {
                userInfo = user_info;
            });
        }

        function getCalendar() {
            return callWebWorker('getCalendar', {
                access_token: accessToken,
                calendar_summary: CALENDAR_SUMMARY
            }).then(function (calendar) {
                calendarId = calendar.id;
            });
        }

        service.auth = function () {
            return fastAuth().then(saveUserInfo);
        };

        service.getUserInfo = function () {
            return userInfo;
        };

        service.fetchTasks = function () {
            return getCalendar().then(function () {
                return callWebWorker('downloadTasks', {access_token: accessToken, calendar_id: calendarId});
            });
        };

        service.addTask = function (taskDTO) {
            callWebWorker('addTask', {access_token: accessToken, calendar_id: calendarId, task: taskDTO});
        };

        service.updateTask = function (taskDTO) {
            callWebWorker('updateTask', {access_token: accessToken, calendar_id: calendarId, task: taskDTO});
        };

        service.deleteTask = function (taskId) {
            callWebWorker('deleteTask', {access_token: accessToken, calendar_id: calendarId, task_id: taskId});
        };

        return service;
    });