seajs.config({
    base: './js',
    chartset: 'utf-8',
    alias: {
        "main": "main.js",
        'vendor': 'vendor.js'
    },
    paths: {},
    map: [
        [/^(.*\.(?:css|js))(.*)$/i, '$1?v=6666']
    ],
    vars: {}
});

define(function(require, exports, module) {

    var utils = require("utils"),
        callQueue = [],
        recordCount = -1;

    function _deferred(name, fn) {
        if (fn && typeof fn === "function") {

            var eventName = name + "_" + (++recordCount);
            callQueue.push(eventName);
            var args = Array.prototype.slice.call(arguments, 2);
            seajs.on(eventName, function(data) {
                var next = data.record + 1;
                args = [next].concat(args);
                fn.apply(null, args);
                if (!data.isAsync) {
                    seajs.emit("next", next);
                }
            });
            return eventName;
        }
    }

    function _next() {
        seajs.on("next", function(record) {

            record = record || 0;
            if (callQueue.length > 0 && record <= callQueue.length - 1) {

                var ename = callQueue[record];
                var isAsync = ename.indexOf("async") > -1;
                if (record == callQueue.length - 1 && ename == "completed") {
                    //complete
                    seajs.emit("completed");
                } else {

                    seajs.emit(ename, {
                        isAsync: isAsync,
                        record: record
                    });
                }
            }
        });
    }

    function _async() {
        seajs.on("async", function(next) {
            seajs.emit("next", next);
        });
    }

    exports.init = function() {

        _deferred("init", function() {
            utils.handleQueryString();
            getRobotSource();

        })

        return module.exports;
    }

    exports.load = function(modules, callback) {

        _deferred("asyncLoad", function(next, mods, callback) {
            require.async(mods, function(m) {

                if (callback && typeof callback == "function") {
                    callback(m);
                }
                seajs.emit("async", next);
            });
        }, modules, callback);

        return module.exports;
    };

    exports.render = function() {

        _deferred("render", function(next, data) {

            var tplFn = doT.template($("#tpl_example").html());
            var content = tplFn("Hello world!!!");
            $("#app").html(content);
        });

        return module.exports;
    }

    exports.run = function(data) {
        _next();
        _async();
        callQueue.push("completed");
        seajs.on("completed", function() {

            //加载业务代码
            seajs.use("main", function(main) {
                main.exec(data);
            });
        });
        seajs.emit("next");
        return module.exports;
    };
});