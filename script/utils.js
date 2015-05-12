angular.module('utils', []).
    factory('Utils', function () {
        return {
            checkTask: function (task) {
                if (!isValidDescription(task.getDescription())) {
                    throw new InvalidTaskError("Description is undefined");
                } else if (!isValidAuthor(task.getAuthor())) {
                    throw new InvalidTaskError("Author is undefined");
                }
            },

            autoRows: function (textarea) {
                textarea.attr('rows', textarea.val().split(/\r\n|\r|\n/).length);
                while (textarea.height() < textarea.get(0).scrollHeight - 10) {
                    textarea.attr('rows', +textarea.attr('rows') + 1);
                }
            },

            trimTextareaValue: function (textarea) {
                var val = textarea.val().trim();
                textarea.val(val);
            },

            resetTextarea: function (textarea) {
                textarea.val('');
                textarea.attr('rows', 1);
            },

            isValidDescription: function (d) {
                return (d && /\S/.test(d)) ? true : false;
            },

            isValidAuthor: function (a) {
                return (a && /\S/.test(a)) ? true : false;
            },

            InvalidTaskError: function (message) {
                this.name = "InvalidTask";
                this.message = message;
            },

            clone: function (obj) {
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
                        copy[i] = clone(obj[i]);
                    }
                    return copy;
                }

                // Handle Object
                if (obj instanceof Object) {
                    copy = {};
                    for (var attr in obj) {
                        if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
                    }
                    return copy;
                }

                throw new Error("Unable to copy obj! Its type isn't supported.");
            },

            remove: function (array, elem) {
                var index = array.indexOf(elem);
                if (index > -1) {
                    array.splice(index, 1);
                }
            },

            generateID: function () {
                return Math.floor(Math.random() * 1000);
            }
        }
    });

KeyCode = {
    Enter: 13,
    Esc: 27
};