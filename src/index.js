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

var namespace = 'øclasses/cache:';
var DATE_1970 = new Date(0);
var cacheId = 0;
var memoryStorage = Object.create(null);
var memory = {
    get: function (key) {
        return memoryStorage[key];
    },
    set: function (key, val) {
        memoryStorage[key] = val;
    },
    remove: function (key) {
        delete memoryStorage[key];
    },
    keys: function () {
        return object.keys(memoryStorage);
    }
};
var defaults = {
    /**
     * 存储器，默认为内存，存储器必须支持以下实例方法
     * - `.get(key)`
     * - `.set(key)`
     * - `.remove(key)`
     * - `.clear(key)`
     * - `.keys()`
     * - `.size()`
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
        the[_options] = options = object.assign(true, {}, defaults, options);
        the[_storage] = options.storage || memory;
        the[_prefix] = namespace + (cacheId++) + '/';
        the[_rePrefix] = new RegExp('^' + string.escapeRegExp(the[_prefix]));
    },


    /**
     * 设置值
     * @param key
     * @param val
     * @param [options]
     * @param [callback]
     * @returns {Cache}
     */
    set: function (key, val, options, callback) {
        var the = this;

        the[_setKeyVal](key, val, options, callback);

        return the;
    },


    /**
     * 确保有值
     * @param key
     * @param val
     * @param [options]
     * @param [callback]
     * @returns {Cache}
     */
    ensure: function (key, val, options, callback) {
        var the = this;

        the[_getDataByKey](key, function (err, val) {
            if (err || !val) {
                return the.set(key, val, options, callback);
            }

            return callback(val);
        });

        return the;
    },


    /**
     * 如果有则替换值
     * @param key
     * @param val
     * @param options
     * @returns {*}
     */
    replace: function (key, val, options) {
        var the = this;
        var old = the[_getDataByKey](key);

        if (!old) {
            return null;
        }

        return the.set(key, val, options);
    },


    /**
     * 获取数据
     * @param key
     * @returns {*}
     */
    get: function (key) {
        var the = this;
        var data = the[_getDataByKey](key);

        if (!data) {
            return data;
        }

        return data.val;
    },


    /**
     * 获取数据有效期
     * @param key
     * @returns {Date}
     */
    getExpires: function (key) {
        var the = this;
        var data = the[_getDataByKey](key);

        if (!data) {
            return DATE_1970;
        }

        return new Date(data.exp);
    },


    /**
     * 判断是否有存储
     * @param key
     * @returns {boolean}
     */
    has: function (key) {
        return this[_getKeys]().indexOf(key) > -1;
    },


    /**
     * 删除数据
     * @param key
     * @returns {*}
     */
    remove: function (key) {
        this[_removeDataByKey](key);
        return key;
    },


    /**
     * 获取所有键
     * @returns {Array}
     */
    keys: function () {
        return this[_getKeys]();
    },


    /**
     * 清空
     * @returns {Cache}
     */
    clear: function () {
        var the = this;
        var keys = the.keys();

        the[_removeDataByKeys](keys);

        return the;
    },


    /**
     * 长度
     * @override size
     * @returns {Number}
     */
    size: function () {
        return this.keys().length;
    }
});
var _options = Cache.sole();
var _storage = Cache.sole();
var _prefix = Cache.sole();
var _rePrefix = Cache.sole();
var _setKeyVal = Cache.sole();
var _getDataByKey = Cache.sole();
var _removeDataByKey = Cache.sole();
var _removeDataByKeys = Cache.sole();
var _getKeys = Cache.sole();
var pro = Cache.prototype;


/**
 * 设置 key、val
 * @param key
 * @param val
 * @param [options]
 */
pro[_setKeyVal] = function (key, val, options) {
    var the = this;
    var exp;

    options = object.assign(true, {}, the[_options], options);

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
    var storageKey = the[_prefix] + key;

    the[_storage].set(storageKey, data);
};


/**
 * 根据 key 获取数据
 * @param key
 * @returns {*}
 */
pro[_getDataByKey] = function (key) {
    var the = this;
    var storageKey = the[_prefix] + key;
    var data;

    data = the[_storage].get(storageKey);

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
 * @returns {*}
 */
pro[_removeDataByKey] = function (key) {
    var the = this;
    var storageKey = the[_prefix] + key;

    the[_storage].remove(storageKey);
};


/**
 * 根据 keys 删除数据
 * @param keys
 * @returns {*}
 */
pro[_removeDataByKeys] = function (keys) {
    var the = this;
    array.each(keys, function (index, key) {
        the[_removeDataByKey](key);
    });
};


/**
 * 获取键
 */
pro[_getKeys] = function () {
    var the = this;
    var keys = the[_storage].keys();

    keys = array.filter(keys, function (key) {
        return the[_rePrefix].test(key);
    });

    return array.map(keys, function (key) {
        return key.replace(the[_rePrefix], '');
    });
};


Cache.defaults = defaults;
module.exports = Cache;
