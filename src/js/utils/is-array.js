var isArray = Array.isArray || function (arr) {
        return Object.prototype.toString.call(arr) == '[object Array]';
    };

export default isArray;