/**
 * @author Bogdan Kovalev
 */

angular.module('tasklist-back')
    .factory('GoogleCalendarService', function ($q, GoogleAPI) {
        var _service = {};

        var _accessToken = null;
        var _userInfo = null;

        var SCOPES = [
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/plus.me'
        ];

        var CLIENT_ID = '1091102336473-menne0porhf02t2fjg81hpel6us9moum.apps.googleusercontent.com';

        function callWebWorker(cmd, args) {
            var worker = new Worker('./script/service/google-calendar-webworker.js');
            var defer = $q.defer();

            worker.onmessage = function (event) {
                defer.resolve(event.data);
                worker.terminate();
            };

            worker.postMessage({func: cmd, args: args});
            return defer.promise;
        }

        function fastAuth() {
            var defer = $q.defer();
            GoogleAPI.auth.authorize({client_id: CLIENT_ID, scope: SCOPES, immediate: true}, function (authResult) {
                if (authResult && !authResult.error) {
                    _accessToken = authResult.access_token;
                    defer.resolve(authResult);
                } else {
                    consentAuth(defer);
                }
            });
            return defer.promise;
        }

        function consentAuth(defer) {
            GoogleAPI.auth.authorize({client_id: CLIENT_ID, scope: SCOPES, immediate: false}, function (authResult) {
                if (authResult && !authResult.error) {
                    _accessToken = authResult.access_token;
                    defer.resolve(authResult);
                } else {
                    defer.reject(authResult.error);
                }
            });
        }

        function saveUserInfo() {

            /* NOT working yet*/

            callWebWorker('getUserInfo', _accessToken).then(function (userInfo) {
                console.log(userInfo);
                _userInfo = userInfo;
            });
        }

        _service.auth = function () {

            /* return fastAuth().then(saveUserInfo);*/

            return fastAuth();
        };

        _service.fetchTasks = function () {
            return callWebWorker('downloadTasks', _accessToken);
        };

        return _service;
    });