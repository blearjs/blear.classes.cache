/**
 * 同步缓存
 * @author ydr.me
 * @create 2016-05-06 01:59
 */



'use strict';

var Events = require('blear.classes.events');
var object = require('blear.utils.object');
var array = require('blear.utils.array');
var typeis = require('blear.utils.typeis');
var number = require('blear.utils.number');
var string = require('blear.utils.string');
var fun = require('blear.utils.function');
var access = require('blear.utils.access');

var DATE_1970 = new Date(0);
var defaults = {
    /**
     * 命名空间
     * @type String
     */
    namespace: '',

    /**
     * 存储器，默认为内存，存储器必须支持以下实例方法
     * - `.get(key)`
     * - `.set(key, val, [exp])`
     * - `.remove(key)`
     * @type Object
     */
    storage: null,

    /**
     * 有效期，可以是毫秒数，也可以是一个日期对象，默认 1 天
     * 有效期不精确，只会在访问 cache 的时候才会去判断是否在有效期内
     * @type Number|Date
     */
    expires: 24 * 60 * 60 * 1000
};
var Cache = Events.extend({
    className: 'Cache',
    constructor: function (options) {
        var the = this;

        Cache.parent(the);
        the[_options] = options = object.assign({}, defaults, options);
        the[_storage] = options.storage || buildMemoryCache();
        the[_async] = options.async || the[_storage].get.length === 2;
    },

    /**
     * 设置值
     * @param key
     * @param val
     * @param [expires]
     * @param [callback]
     * @returns {Cache}
     */
    set: function (key, val, expires, callback) {
        var the = this;
        var exp;
        var args = access.args(arguments);

        if(the[_async]) {
            // #set(key, val, callback);
            if(args.length === 3 && typeis.Function(args[2])) {
                callback = args[2];
                expires = null;
            }
        }

        var options = object.assign({}, the[_options], {
            expires: expires
        });
        key = options.namespace + key;

        if (typeis.Date(options.expires)) {
            exp = options.expires;
        } else {
            exp = new Date(new Date().getTime() + number.parseInt(options.expires, defaults.expires));
        }

        var data = {
            key: key,
            val: val,
            exp: exp.getTime()
        };
        the[_storage].set(key, data, exp, callback);
        return the;
    },

    /**
     * 获取数据
     * @param key
     * @param [callback]
     * @returns {*}
     */
    get: function (key, callback) {
        var the = this;
        var options = the[_options];
        var data;
        callback = fun.ensure(callback);
        key = options.namespace + key;
        var cal = function (data) {
            if (!data) {
                return null;
            }

            if (data.exp < new Date().getTime()) {
                the[_removeDataByKey](key, callback);
                return null;
            }

            if (!data) {
                return data;
            }

            return data.val;
        };

        if (the[_async]) {
            the[_storage].get(key, function (err, data) {
                if (err) {
                    return callback(err)
                }

                callback(null, cal(data));
            });
            return the;
        }

        data = the[_storage].get(key);
        return cal(data);
    },

    /**
     * 删除数据
     * @param key
     * @param [callback]
     * @returns {*}
     */
    remove: function (key, callback) {
        this[_removeDataByKey](key, callback);
        return key;
    },

    /**
     * 销毁缓存
     */
    destroy: function () {
        var the = this;

        the[_storage].destroy();
    }
});
var _options = Cache.sole();
var _async = Cache.sole();
var _storage = Cache.sole();
var _setKeyVal = Cache.sole();
var _getDataByKey = Cache.sole();
var _removeDataByKey = Cache.sole();
var pro = Cache.prototype;


/**
 * 设置 key、val
 * @param key
 * @param val
 * @param [expires]
 */
pro[_setKeyVal] = function (key, val, expires) {
    var the = this;
    var exp;
    var options = object.assign({}, the[_options], {
        expires: expires
    });

    key = options.namespace + key;

    if (typeis.Date(options.expires)) {
        exp = options.expires;
    } else {
        exp = new Date(new Date().getTime() + number.parseInt(options.expires, defaults.expires));
    }

    var data = {
        key: key,
        val: val,
        exp: exp.getTime()
    };

    the[_storage].set(key, data);
};


/**
 * 根据 key 获取数据
 * @param key
 * @returns {*}
 */
pro[_getDataByKey] = function (key) {
    var the = this;
    var data;

    key = the[_options].namespace + key;
    data = the[_storage].get(key);

    if (!data) {
        return null;
    }

    if (data.exp < new Date().getTime()) {
        the[_removeDataByKey](key);
        return null;
    }

    return data;
};


/**
 * 根据 key 删除数据
 * @param key
 * @param callback
 * @returns {*}
 */
pro[_removeDataByKey] = function (key, callback) {
    var the = this;

    callback = fun.ensure(callback);
    key = the[_options].namespace + key;
    the[_storage].remove(key, callback);
};


/**
 * 创建一个内存区域的缓存
 * @returns {{get: get, set: set, remove: remove, destroy: destroy}}
 */
function buildMemoryCache() {
    var memoryStorage = Object.create(null);
    return {
        get: function (key) {
            return memoryStorage[key];
        },
        set: function (key, val) {
            memoryStorage[key] = val;
        },
        remove: function (key) {
            delete memoryStorage[key];
        },
        destroy: function () {
            memoryStorage = null;
        }
    };
}


Cache.defaults = defaults;
module.exports = Cache;
