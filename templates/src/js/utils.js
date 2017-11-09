define(function(require, exports, module) {

    function _getQueryObject(url) {
        url = url == null ? window.location.href : url;
        var search = url.substring(url.lastIndexOf("?") + 1);
        var obj = {};
        var reg = /([^?&=]+)=([^?&=]*)/g;
        search.replace(reg, function(rs, $1, $2) {
            var name = decodeURIComponent($1);
            var val = decodeURIComponent($2);
            val = String(val).replace("#", ''); //处理锚点
            obj[name] = val;
            return rs;
        });
        return obj;
    }

    function _toJson(str) {
        return (new Function('return ' + str))();
    };

    //处理rul参数，使其变成全局变量调用
    exports.handleQueryString = function(url) {
        var queryObj = _getQueryObject(url);
        for (var k in queryObj) {
            if (queryObj.hasOwnProperty(k)) {
                window[k] = queryObj[k];
            }
        }
    };

    exports.getQueryObject = function(url) {
        return _getQueryObject(url);
    };

    exports.toJson = _toJson;

    exports.miniAjax = function(url, options) {
        //1.创建ajax对象
        var xhr = null;
        //options处理
        options = options || {};
        var async = options.async,
            method = options.method ? opt.method.toUpperCase() : 'GET',
            type = options.type || 'text',
            encode = options.encode || 'UTF-8',
            timeout = options.timeout || 3000,
            data = options.data || null,
            timeoutId = null,
            serverTime = null;

        //兼容性处理
        if (typeof XMLHttpRequest !== undefined) {
            //IE6以上
            xhr = new XMLHttpRequest();
        } else {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }

        //2.连接服务器
        //open(方法,url,是否异步)
        var param = ""; //请求参数。
        if (typeof(data) === "object") {
            for (var key in data) { //请求参数拼接
                if (data.hasOwnProperty(key)) {
                    param += encodeURIComponent(key) + "=" + encodeURIComponent(data[key]) + "&";
                }
            }
            param.replace(/&$/, "");
        } else {
            param = "timestamp=" + new Date().getTime();
        }
        //3.发送请求
        if (method === "GET") {
            xhr.open("GET", url + "?" + param, async);
            xhr.send();
        } else {
            xhr.open("POST", url, async);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=" + encode);
            xhr.send(param);
        }
        //4.接收返回

        //5.超时处理
        if (async) {
            //OnRedayStateChange事件
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {

                    if (xhr.status >= 200 && xhr.status < 300) {

                        handleRespone(xhr)
                    } else {
                        //先判断是否存在请求失败函数
                        //存在时，形参为XMLHttpRequest对象，便于进行错误进行处理
                        if (options.onfail) {
                            options.onfail({ message: "HTTP-Internal Server Error" }, xhr, serverTime);
                        }
                    }
                    clearTimeout(timeoutId);
                }
            };

            timeoutId = setTimeout(function() {
                xhr.abort();
            }, timeout);
        } else {
            handleRespone(xhr);
        }

        function handleRespone(ajax) {

            try {
                serverTime = new Date(ajax.getResponseHeader("Date"));
                var result = '';
                switch (type) {
                    case 'text':
                        result = ajax.responseText;
                        break;
                    case 'json':
                        result = _toJson(ajax.responseText)
                        break;
                    case 'xml':
                        result = ajax.responseXML;
                        break;
                }
                //请求成功。形参为获取到的字符串形式的响应数据
                options.onsuccess(result, ajax, serverTime);

            } catch (ex) {
                //先判断是否存在请求失败函数
                //存在时，形参为XMLHttpRequest对象，便于进行错误进行处理
                if (options.onfail) {
                    options.onfail(ex, ajax, serverTime);
                }
            }
        }

        return xhr;
    }
});