/**
 * @author Bogdan Kovalev
 */

angular.module('users-back', [])
    .service('Users', function (GoogleCalendarService) {

        function Users() {

            Users.LOCAL_USER = 'Local User';

            var currentUser = Users.LOCAL_USER;

            var users = {};
            users[currentUser] = currentUser;

            Users.prototype.exists = function (user) {
                return user in users;
            };

            Users.prototype.add = function (user) {
                users[user] = user;
            };

            Users.prototype.getCurrentUser = function () {
                return currentUser;
            };

            Users.prototype.isLocalUser = function () {
                return currentUser == Users.LOCAL_USER;
            };

            Users.prototype.loginToGoogle = function () {
                return GoogleCalendarService.auth()
                    .then(function () {
                        currentUser = GoogleCalendarService.getUserInfo().displayName;
                        users[currentUser] = currentUser;
                    })
            };

            Users.prototype.getUsersMap = function () {
                return users;
            };
        }

        return new Users();
    });