(function () {
    var _ = {};
    /**
     * 判断是否为方法
     * @param obj
     * @returns {boolean}
     */
    _.isFunction = function (obj) {
        return typeof obj == 'function' || false;
    };

    /**
     * 判断是否为对象
     * @param value
     * @returns {boolean}
     */
    _.isObject = function (value) {
        return value !== null && typeof value === 'object';
    };

    /**
     * 获取当前时间
     * @returns {number}
     */
    _.now = function () {
        return new Date().getTime();
    };

    var property = function (key) {
        return function (obj) {
            return obj == null ? void 0 : obj[key];
        };
    };

    // Helper for collection methods to determine whether a collection
    // should be iterated as an array or as an object
    // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
    // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
    var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
    var getLength = property('length');
    var isArrayLike = function (collection) {
        var length = getLength(collection);
        return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
    };

    var optimizeCb = function (func, context, argCount) {
        if (context === void 0) return func;
        switch (argCount == null ? 3 : argCount) {
            case 1:
                return function (value) {
                    return func.call(context, value);
                };
            case 2:
                return function (value, other) {
                    return func.call(context, value, other);
                };
            case 3:
                return function (value, index, collection) {
                    return func.call(context, value, index, collection);
                };
            case 4:
                return function (accumulator, value, index, collection) {
                    return func.call(context, accumulator, value, index, collection);
                };
        }
        return function () {
            return func.apply(context, arguments);
        };
    };

    /**
     * 对数组提供一种迭代方法s
     * @type {_.forEach}
     */
    _.each = _.forEach = function (obj, iteratee, context) {
        iteratee = optimizeCb(iteratee, context);
        var i, length;
        if (isArrayLike(obj)) {
            for (i = 0, length = obj.length; i < length; i++) {
                iteratee(obj[i], i, obj);
            }
        } else {
            console.error("this forEach just for array");
        }
        return obj;
    };

    /**
        * 计算字符串所占的内存字节数，默认使用UTF-8的编码方式计算，也可制定为UTF-16
        * UTF-8 是一种可变长度的 Unicode 编码格式，使用一至四个字节为每个字符编码
        *
        * 000000 - 00007F(128个代码)   0zzzzzzz(00-7F)               一个字节
        * 000080 - 0007FF(1920个代码)   110yyyyy(C0-DF) 10zzzzzz(80-BF)       两个字节
        * 000800 - 00D7FF
         00E000 - 00FFFF(61440个代码)  1110xxxx(E0-EF) 10yyyyyy 10zzzzzz      三个字节
        * 010000 - 10FFFF(1048576个代码) 11110www(F0-F7) 10xxxxxx 10yyyyyy 10zzzzzz 四个字节
        *
        * 注: Unicode在范围 D800-DFFF 中不存在任何字符
        * {@link http://zh.wikipedia.org/wiki/UTF-8}
        *
        * UTF-16 大部分使用两个字节编码，编码超出 65535 的使用四个字节
        * 000000 - 00FFFF 两个字节
        * 010000 - 10FFFF 四个字节
        *
        * {@link http://zh.wikipedia.org/wiki/UTF-16}
        * @param {String} str
        * @param {String} charset utf-8, utf-16
        * @return {Number}
        */
    _.sizeof = function (str, charset) {
        var total = 0,
            charCode,
            i,
            len;
        charset = charset ? charset.toLowerCase() : '';
        if (charset === 'utf-16' || charset === 'utf16') {
            for (i = 0, len = str.length; i < len; i++) {
                charCode = str.charCodeAt(i);
                if (charCode <= 0xffff) {
                    total += 2;
                } else {
                    total += 4;
                }
            }
        } else {
            for (i = 0, len = str.length; i < len; i++) {
                charCode = str.charCodeAt(i);
                if (charCode <= 0x007f) {
                    total += 1;
                } else if (charCode <= 0x07ff) {
                    total += 2;
                } else if (charCode <= 0xffff) {
                    total += 3;
                } else {
                    total += 4;
                }
            }
        }
        return total;
    };

    /**
     * 将字节转换成其他单位
     * @param bytes 字节
     * @param size 单位（可选）
     * @returns {string}
     */
    _.bytesToSize = function (bytes, size) {
        var k = 1024;
        var sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = sizes.indexOf(size);
        if (bytes === 0) {
            i = (i == -1) ? 0 : i;
            return '0' + ' ' + sizes[i];
        }
        if (i == -1) {
            i = Math.floor(Math.log(bytes) / Math.log(k));
        }
        return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
    };

    /**
     * 构造方法 存储器
     * @param proxy 代理
     * @constructor
     */
    var Store = function (proxy) {
        this.OBJ = "obj_";
        this.STR = "str_";
        this.SHORT_LIVED = "e_";
        this.FOREVER = "f_";
        this.TIME_STAMP = "TimeStamp_";
        this.Hour = 1000 * 60 * 60;
        this.Day = 1000 * 60 * 60 * 24;
        this.prefixLength = this.SHORT_LIVED.length + this.OBJ.length;
        this.proxy = proxy;
    };

    Store.prototype = {
        /**
         * 当前保存的数据是否为对象（以开头作为识别）
         * @param data 已保存的数据
         * @returns {boolean}
         * @private
         */
        _isObject: function (data) {
            var start = this.SHORT_LIVED.length;
            return data.substr(start, this.OBJ.length) == this.OBJ;
        },
        /**
         * 当前保存的数据是否为字符串（以开头作为识别）
         * @param data 已保存的数据
         * @returns {boolean}
         * @private
         */
        _isString: function (data) {
            var start = this.SHORT_LIVED.length;
            return data.substr(start, this.STR.length) == this.STR;
        },

        /**
         * 当前保存的数据是否有期限
         * @param data
         * @returns {boolean}
         * @private
         */
        _isShortLived: function (data) {
            return data.substr(0, this.SHORT_LIVED.length) == this.SHORT_LIVED;
        },

        /**
         * 当前保存的数据是否已过期
         * @param key
         * @param data
         * @returns {boolean}
         * @private
         */
        _isExpired: function (key, data) {
            if (data && this._isShortLived(data)) {
                var currentTime = _.now();
                var cacheTimeObj = this._getCacheTime(key);
                var expiredTime = cacheTimeObj[0];
                return (currentTime > expiredTime);
            }
            return false;
        },

        /**
         * 生成保存过期时间的键值
         * @param key
         * @returns {string}
         * @private
         */
        _generateExpiredKey: function (key) {
            return this.TIME_STAMP + key;
        },

        /**
         * 获取当前缓存内容的过期时间
         * @param key
         * @returns {*[]}
         * @private
         */
        _getCacheTime: function (key) {
            var cacheTimeStr = this.proxy.getItem(this._generateExpiredKey(key));
            var cacheTimeObj = cacheTimeStr.split(",") || [0, 0];
            var expiredTime = parseInt(cacheTimeObj[0]);
            var cacheTime = parseInt(cacheTimeObj[1]);
            return [expiredTime, cacheTime];
        },

        /**
         * 根据key保存过期时间
         * @param key
         * @param cacheTime
         * @private
         */
        _setCacheTime: function (key, cacheTime) {
            cacheTime = parseInt(cacheTime);
            if (isNaN(cacheTime)) {
                console.error("localStore setCache --- > cacheTime error");
                cacheTime = 0;
            }
            var cacheKey = this._generateExpiredKey(key);
            var expiredTime = _.now() + cacheTime;
            var cacheTimeStr = [expiredTime, cacheTime].join(",");
            this.proxy.setItem(cacheKey, cacheTimeStr);
        },

        /**
         * 根据key删除过期时间
         * @param key
         * @private
         */
        _removeCacheTime: function (key) {
            var cacheKey = this._generateExpiredKey(key);
            this.proxy.removeItem(cacheKey);
        },


        /**
         * 清空整个storage
         */
        clear: function () {
            this.proxy.clear();
        },

        /**
         * 根据key删除
         * @param key
         */
        remove: function (key) {
            var data = this.proxy.getItem(key);
            if (data && this._isExpired(key, data)) {
                this._removeCacheTime(key);
            }
            return this.proxy.removeItem(key);
        },

        /**
         * 根据keys删除item
         * @param keys
         */
        removes: function (keys) {
            _.each(keys, function (key, index) {
                this.remove(key);
            });
        },

        /**
         * 保存
         * @param key 键
         * @param value 值
         * @param cacheTime 保存时间，已毫秒为单位。例如有效期为3秒的话，cacheTime=3000;
         */
        set: function (key, value, cacheTime) {
            if (cacheTime) {
                this._setCacheTime(key, cacheTime);
            }
            var isObject = _.isObject(value);
            var data = isObject ? this.OBJ + JSON.stringify(value) : this.STR + value;
            data = cacheTime ? this.SHORT_LIVED + data : this.FOREVER + data;
            return this.proxy.setItem(key, data);
        },

        /**
         * 根据key获取保存内容，如果之前存的是对象的话，会自动反序列化
         * @param key
         */
        get: function (key) {
            var data = this.proxy.getItem(key);
            if (data) {
                if (this._isExpired(key, data)) {
                    this.remove(key);
                    return null;
                } else {
                    var isObject = this._isObject(data);
                    data = data.substr(this.prefixLength);
                    data = isObject ? JSON.parse(data) : data;
                }
            }
            return data;
        },

        /**
         * 更新保存中的值
         * @param key 键
         * @param handler 更新方法，需要返回一个更新后的值
         * @param cacheTime 更新之后的缓存时间
         * @returns {*}
         */
        update: function (key, handler, cacheTime) {
            var data = this.get(key);
            var updatedData = handler(key, data);
            return this.set(key, updatedData, cacheTime);
        },

        /**
         * 清空过期缓存（带有过期时间的）
         */
        clearAllExpired: function () {
            var proxy = this.proxy;
            for (var i = 0; i < proxy.length; i++) {
                var key = proxy.key(i);
                var data = proxy.getItem(key);
                if (this._isExpired(key, data)) {
                    this.remove(key);
                }
            }
        },

        /**
         * 获取所有的key
         * @returns {Array}
         * @private
         */
        keys: function (filter) {
            var keys = [];
            var proxy = this.proxy;
            var defaultFilter = function () {
                return true;
            };
            filter = _.isFunction(filter) ? filter : defaultFilter;
            for (var i = 0; i < proxy.length; i++) {
                var key = proxy.key(i);
                if (filter(key) === true) {
                    keys.push(key);
                }
            }
            return keys;
        },

        /**
         * 判断是否存在该key
         * @param key
         * @returns {boolean}
         */
        has: function (key) {
            var proxy = this.proxy;
            for (var i = 0; i < proxy.length; i++) {
                if (proxy.key(i) == key) {
                    return true;
                }
            }
            return false;
        },

        /**
         * 根据传进来的keys，计算对应的value所占用的空间
         * @param keys 数组 一系列的键
         * @param sizeType 大小单位： ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
         * @returns {string}
         */
        size: function (keys, sizeType) {
            var totalByte = 0;
            var self = this;
            _.each(keys, function (key) {
                var value = self.getString(key) || "";
                totalByte += _.sizeof(value);
            });
            return _.bytesToSize(totalByte, sizeType);
        },


        /***
         * 根据key获取实际保存的值 (返回字符串)，包括库自动帮没概念添加的前缀
         * @param key
         */
        getString: function (key) {
            return this.proxy.getItem(key);
        },

        /**
         * 获取以regex开头的keys
         * @param str 字符串
         * @returns {*|Array}
         */
        getKeyStartBy: function (str) {
            return this.keys(function (key) {
                return (key.indexOf(str) === 0);
            })
        }
    };

    function checkEnable(proxy, proxyName) {
        if (proxy) {
            console.log('This browser supports ' + proxyName);
        } else {
            alert('This browser does NOT support ' + proxyName);
        }
    }

    checkEnable(window.localStorage, "localStorage");
    checkEnable(window.sessionStorage, "sessionStorage");

    window.sessionStore = new Store(window.sessionStorage);
    window.localStore = new Store(window.localStorage);
    window.Store = Store;
    window.storeUtil = _;

})(window);