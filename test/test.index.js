/**
 * 测试 文件
 * @author ydr.me
 * @create 2016-05-17 12:13
 */


'use strict';

var plan = require('blear.utils.plan');

var Cache = require('../src/index.js');
var localStorage = require('blear.core.storage')(window.localStorage);
var sessionStorage = require('blear.core.storage')(window.sessionStorage);


describe('测试文件', function () {
    it('memory', function () {
        var cache = new Cache({
            namespace: 'test.'
        });
        var key1 = 'myKey1';
        var key2 = 'myKey2';
        var val1 = {a: 1, b: 2};

        cache.set(key1, val1);

        var get1 = cache.get(key1);
        var get2 = cache.get(key2);

        expect(get1).toEqual(val1);
        expect(get2).toEqual(null);

        cache.remove(key1);
        expect(cache.get(key1)).toEqual(null);
    });

    it('localStorage', function () {
        var cache = new Cache({
            storage: localStorage
        });
        var key1 = 'myKey1';
        var key2 = 'myKey2';
        var val1 = {a: 1, b: 2};

        cache.set(key1, val1);

        var get1 = cache.get(key1);
        var get2 = cache.get(key2);

        expect(get1).toEqual(val1);
        expect(get2).toEqual(null);

        cache.remove(key1);
        expect(cache.get(key1)).toEqual(null);
    });

    it('async', function (done) {
        var storeage = {};
        var cache = new Cache({
            storage: {
                get: function (key, callback) {
                    setTimeout(function () {
                        callback(null, storeage[key]);
                    });
                },
                set: function (key, val, exp, callback) {
                    setTimeout(function () {
                        storeage[key] = val;
                        callback(null);
                    });
                },
                remove: function (key, callback) {
                    setTimeout(function () {
                        delete storeage[key];
                        callback(null);
                    });
                }
            }
        });
        var key1 = 'myKey1';
        var key2 = 'myKey2';
        var val1 = {a: 1, b: 2};

        plan
            .task(function (next) {
                cache.set(key1, val1, next);
            })
            .task(function (next) {
                cache.get(key1, next);
            })
            .taskSync(function (get1) {
                expect(get1).toEqual(val1);
            })
            .task(function (next) {
                cache.get(key2, next);
            })
            .taskSync(function () {
                expect(get2).toEqual(null);
            })
            .task(function (next) {
                cache.remove(key1, next);
            })
            .task(function (next) {
                cache.get(key1, next);
            })
            .taskSync(function (get1) {
                expect(get1).toEqual(null);
            })
            .serial(done);
    });

    it('#expires', function (done) {
        var nowTime = new Date().getTime();
        var afterOneSecondsDate = new Date(nowTime + 1000);
        var cache = new Cache({
            expires: afterOneSecondsDate
        });
        var key = 'myKey';
        var val = 'myVal';
        cache.set(key, val);
        expect(cache.get(key)).toEqual(val);

        setTimeout(function () {
            expect(cache.get(key)).toEqual(null);
            done();
        }, 1100);
    });
});
