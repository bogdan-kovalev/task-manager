/**
 * @author Bogdan Kovalev
 */

angular.module('tasklist-back')
    .service('GoogleCalendarService', function ($q, GoogleAPI) {
        var _service = {};

        var worker = window.Worker ? new Worker('./script/service/google-calendar-webworker.js') : null;
        var _accessToken = null;
        var _userInfo = null;

        var SCOPES = [
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/plus.me'
        ];

        var CLIENT_ID = '1091102336473-menne0porhf02t2fjg81hpel6us9moum.apps.googleusercontent.com';

        function callWebWorker(cmd, args) {
            var defer = $q.defer();
            if (worker) {
                worker.onmessage = function (event) {
                    defer.resolve(event.data);
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
                        _accessToken = authResult.access_token;
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
                    _accessToken = authResult.access_token;
                    defer.resolve();
                } else {
                    defer.reject(authResult.error);
                }
            });
        }

        function saveUserInfo() {
            return callWebWorker('getUserInfo', _accessToken).then(function (userInfo) {
                _userInfo = userInfo;
            });
        }

        _service.auth = function () {
            return fastAuth().then(saveUserInfo);
        };

        _service.getUserInfo = function () {
            return _userInfo;
        };

        _service.fetchTasks = function () {
            return callWebWorker('downloadTasks', _accessToken);
        };

        return _service;
    });