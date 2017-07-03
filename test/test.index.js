/**
 * 测试 文件
 * @author ydr.me
 * @create 2016-05-17 12:13
 */


'use strict';

var Cache = require('../src/index.js');
var localStorage = require('blear.core.storage')(window.localStorage);
var sessionStorage = require('blear.core.storage')(window.sessionStorage);


describe('测试文件', function () {
    it('memory', function () {
        var cache = new Cache();
        var key1 = 'myKey1';
        var key2 = 'myKey2';
        var val1 = {a:1, b:2};

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
        var val1 = {a:1, b:2};

        cache.set(key1, val1);

        var get1 = cache.get(key1);
        var get2 = cache.get(key2);

        expect(get1).toEqual(val1);
        expect(get2).toEqual(null);

        cache.remove(key1);
        expect(cache.get(key1)).toEqual(null);
    });

    it('sessionStorage', function () {
        var cache = new Cache({
            storage: sessionStorage
        });
        var key1 = 'myKey1';
        var key2 = 'myKey2';
        var val1 = {a:1, b:2};

        cache.set(key1, val1);

        var get1 = cache.get(key1);
        var get2 = cache.get(key2);

        expect(get1).toEqual(val1);
        expect(get2).toEqual(null);

        cache.remove(key1);
        expect(cache.get(key1)).toEqual(null);
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
