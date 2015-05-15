/**
 * @author Bogdan Kovalev
 */

angular.module('users-back', [])
    .factory('Users', function () {

        function Users() {
            var currentUser = "Bogdan";
            var users = [currentUser, "Patric", "Bob", "Salvador"];

            Users.prototype.isExistent = function (user) {
                return users.indexOf(user) > -1;
            };

            Users.prototype.getCurrentUser = function () {
                return currentUser;
            }
        }

        return new Users();
    });