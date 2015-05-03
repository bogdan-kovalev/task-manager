/**
 * @author Bogdan Kovalev
 */

var currentUser = "Bogdan";
var users = [currentUser, "Patric", "Bob", "Salvador"];

Status = {
    NEW: "new",
    FINISHED: "finished",
    REOPENED: "reopened"
};

angular.module('app', ['tasklist-front', 'tasklist-back', 'utils'])