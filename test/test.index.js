/**
 * 测试 文件
 * @author ydr.me
 * @create 2016-05-17 12:13
 */


'use strict';

var Cache = require('../src/index.js');


describe('测试文件', function () {
    it('options', function (done) {
        var times = 0;

        try {
            var cache = new Cache({
                storage: '...'
            });
        } catch (err) {
            times++;
        }

        expect(times).toEqual(1);

        done();
    });

    it('localStorage', function () {
        var cache = new Cache({
            storage: 'local'
        });
        var key1 = 'myKey1';
        var key2 = 'myKey2';
        var key3 = 'myKey3';
        var key4 = 'myKey4';
        var val1 = {a:1, b:2};
        var val2 = '{a:1, b:2}';
        var val3 = '3';
        var val4 = '4';

        cache.set(key1, val1);
        cache.set(key2, val2);
        cache.ensure(key1, val3);
        cache.ensure(key3, val3);
        cache.replace(key2, val4);
        cache.replace(key4, val4);
        var getted1 = cache.get(key1);
        var getted2 = cache.get(key2);
        var getted3 = cache.get(key3);
        var getted4 = cache.get(key4);
        var exp1 = cache.getExpires(key1);
        var exp2 = cache.getExpires(key4);
        var keys = cache.keys();
        var size = cache.size();
        expect(keys.indexOf(key1) > -1).toEqual(true);
        expect(keys.indexOf(key2) > -1).toEqual(true);
        expect(keys.indexOf(key3) > -1).toEqual(true);
        expect(keys.length).toEqual(3);
        expect(size).toEqual(3);
        expect(getted1).toEqual(val1);
        expect(getted2).toEqual(val4);
        expect(getted3).toEqual(val3);
        expect(getted4).toEqual(null);
        expect(exp1.getTime() > new Date().getTime()).toEqual(true);
        expect(exp2.getTime() < new Date().getTime()).toEqual(true);


        cache.remove(key1);
        expect(cache.get(key1)).toEqual(null);
        expect(cache.has(key1)).toEqual(false);
        expect(cache.get(key2)).toEqual(getted2);
        expect(cache.has(key2)).toEqual(true);


        cache.clear();
        expect(cache.get(key1)).toEqual(null);
        expect(cache.keys().length).toEqual(0);
        expect(cache.size()).toEqual(0);
    });


    it('session', function () {
        var cache = new Cache({
            storage: 'session'
        });
        var key1 = 'myKey1';
        var key2 = 'myKey2';
        var key3 = 'myKey3';
        var key4 = 'myKey4';
        var val1 = {a:1, b:2};
        var val2 = '{a:1, b:2}';
        var val3 = '3';
        var val4 = '4';

        cache.set(key1, val1);
        cache.set(key2, val2);
        cache.ensure(key1, val3);
        cache.ensure(key3, val3);
        cache.replace(key2, val4);
        cache.replace(key4, val4);
        var getted1 = cache.get(key1);
        var getted2 = cache.get(key2);
        var getted3 = cache.get(key3);
        var getted4 = cache.get(key4);
        var exp1 = cache.getExpires(key1);
        var exp2 = cache.getExpires(key4);
        var keys = cache.keys();
        var size = cache.size();
        expect(keys.indexOf(key1) > -1).toEqual(true);
        expect(keys.indexOf(key2) > -1).toEqual(true);
        expect(keys.indexOf(key3) > -1).toEqual(true);
        expect(keys.length).toEqual(3);
        expect(size).toEqual(3);
        expect(getted1).toEqual(val1);
        expect(getted2).toEqual(val4);
        expect(getted3).toEqual(val3);
        expect(getted4).toEqual(null);
        expect(exp1.getTime() > new Date().getTime()).toEqual(true);
        expect(exp2.getTime() < new Date().getTime()).toEqual(true);


        cache.remove(key1);
        expect(cache.get(key1)).toEqual(null);
        expect(cache.has(key1)).toEqual(false);
        expect(cache.get(key2)).toEqual(getted2);
        expect(cache.has(key2)).toEqual(true);


        cache.clear();
        expect(cache.get(key1)).toEqual(null);
        expect(cache.keys().length).toEqual(0);
        expect(cache.size()).toEqual(0);
    });


    it('memory', function () {
        var cache = new Cache({
            storage: 'memory'
        });
        var key1 = 'myKey1';
        var key2 = 'myKey2';
        var key3 = 'myKey3';
        var key4 = 'myKey4';
        var val1 = {a:1, b:2};
        var val2 = '{a:1, b:2}';
        var val3 = '3';
        var val4 = '4';

        cache.set(key1, val1);
        cache.set(key2, val2);
        cache.ensure(key1, val3);
        cache.ensure(key3, val3);
        cache.replace(key2, val4);
        cache.replace(key4, val4);
        var getted1 = cache.get(key1);
        var getted2 = cache.get(key2);
        var getted3 = cache.get(key3);
        var getted4 = cache.get(key4);
        var exp1 = cache.getExpires(key1);
        var exp2 = cache.getExpires(key4);
        var keys = cache.keys();
        var size = cache.size();
        expect(keys.indexOf(key1) > -1).toEqual(true);
        expect(keys.indexOf(key2) > -1).toEqual(true);
        expect(keys.indexOf(key3) > -1).toEqual(true);
        expect(keys.length).toEqual(3);
        expect(size).toEqual(3);
        expect(getted1).toEqual(val1);
        expect(getted2).toEqual(val4);
        expect(getted3).toEqual(val3);
        expect(getted4).toEqual(null);
        expect(exp1.getTime() > new Date().getTime()).toEqual(true);
        expect(exp2.getTime() < new Date().getTime()).toEqual(true);


        cache.remove(key1);
        expect(cache.get(key1)).toEqual(null);
        expect(cache.has(key1)).toEqual(false);
        expect(cache.get(key2)).toEqual(getted2);
        expect(cache.has(key2)).toEqual(true);


        cache.clear();
        expect(cache.get(key1)).toEqual(null);
        expect(cache.keys().length).toEqual(0);
        expect(cache.size()).toEqual(0);
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
        expect(cache.getExpires(key)).toEqual(afterOneSecondsDate);

        setTimeout(function () {
            expect(cache.get(key)).toEqual(null);
            done();
        }, 1100);
    });
});
