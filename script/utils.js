angular.module('utils', []).
    factory('Utils', function () {
        var Utils = {};

        Utils.autoRows = function (textarea) {
            textarea.attr('rows', textarea.val().split(/\r\n|\r|\n/).length);
            while (textarea.height() < textarea.get(0).scrollHeight - 10) {
                textarea.attr('rows', +textarea.attr('rows') + 1);
            }
        };

        Utils.resetTextarea = function (textarea) {
            textarea.val('');
            textarea.attr('rows', 1);
        };

        Utils.clone = function (obj) {
            var copy;
            // Handle the 3 simple types, and null or undefined
            if (null == obj || "object" != typeof obj) return obj;

            // Handle Date
            if (obj instanceof Date) {
                copy = new Date();
                copy.setTime(obj.getTime());
                return copy;
            }

            // Handle Array
            if (obj instanceof Array) {
                copy = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    copy[i] = Utils.clone(obj[i]);
                }
                return copy;
            }

            // Handle Object
            if (obj instanceof Object) {
                copy = {};
                for (var attr in obj) {
                    if (obj.hasOwnProperty(attr)) copy[attr] = Utils.clone(obj[attr]);
                }
                return copy;
            }

            throw new Error("Unable to copy obj! Its type isn't supported.");
        };

        Utils.remove = function (array, elem) {
            var index = array.indexOf(elem);
            if (index > -1) {
                array.splice(index, 1);
            }
        };

        Utils.generateID = function () {
            return Math.floor(Math.random() * 1000);
        };

        return Utils;
    });

KeyCode = {
    Enter: 13,
    Esc: 27
};