var async = require('async'),
    asynx = Object.create(async);


asynx.shift = function (error) {
    // slice off error and first result argument
    var args = Array.prototype.slice.call(arguments, 2);
    var callback = args.pop();

    callback.apply(null, args);
};


asynx.if = function (test, consequent, alternate, callback) {
    test(function (testResult) {
        testResult ? consequent(callback) : alternate(callback);
    });
};


asynx.manual = function (states, callback) {
    var next = {end: callback};

    Object.keys(states).forEach(function (state) {
        next[state] = function (error) {
            var args = Array.prototype.slice.call(arguments, 1);
            if (error) callback(error)
            else states[state].apply(null, args.concat([next]));
        };
    });

    states.start(next);
};


module.exports = asynx
