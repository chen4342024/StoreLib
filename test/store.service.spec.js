describe('Store Util specs', function () {
    var _ = storeUtil;
    var localStore = window.localStore;

    it('should return get size sucess', function () {
        var byte = _.sizeof("abcd");
        expect(byte).toEqual(4);
    });

    it('should get size success', function () {
        var size = _.bytesToSize(1024);
        var sizeKB = _.bytesToSize(1024, "KB");
        var sizeMB = _.bytesToSize(1024 * 1024, "MB");
        expect(size).toEqual("1.00 KB");
        expect(sizeKB).toEqual("1.00 KB");
        expect(sizeMB).toEqual("1.00 MB");
    });

    it('should judge type success ', function () {
        var str1 = "e_str_1";
        expect(localStore._isObject(str1), false);
        expect(localStore._isString(str1), true);
        expect(localStore._isShortLived(str1), true);

        var str2 = "f_obj_2";
        expect(localStore._isObject(str2), true);
        expect(localStore._isString(str2), false);
        expect(localStore._isShortLived(str2), false);

    });
});

describe("Store specs", function () {
    var timerCallback;
    var _ = storeUtil;
    var localStore = window.localStore;

    beforeEach(function () {
        timerCallback = jasmine.createSpy("timerCallback");
        jasmine.clock().install();
    });

    afterEach(function () {
        jasmine.clock().uninstall();
        localStore.clear();
    });

    it('should save data success', function () {
        var key = "test";
        var value = "testStr";
        var timeStamp = "TimeStamp_test";

        //测试正常保存
        localStore.set(key, value);
        expect(localStore.get(key)).toBe(value);

        //测试有缓存时间的保存
        localStore.set(key, value, 3000);
        expect(localStore.get(key)).toBe(value);
        expect(localStore.get(timeStamp)).not.toBe(null);

        //缓存时间过后
        var baseTime = new Date().getTime() + 3000;
        var baseTimeDate = new Date(baseTime);
        jasmine.clock().mockDate(baseTimeDate);//构造一个虚拟的当前时间
        jasmine.clock().tick(1);
        expect(localStore.get(key)).toBe(null);
        expect(localStore.getString(key)).toBe(null);
        expect(localStore.get(timeStamp)).toBe(null);
    });

    it("should save correct and remove success", function () {
        var OBJ = "obj_";
        var STR = "str_";
        var SHORT_LIVED = "e_";
        var FOREVER = "f_";

        var key = "test";
        var strValue = "testStr";
        var strObj = {a: 1, b: 2};

        //测试正常保存
        localStore.set(key, strValue);
        expect(localStore.getString(key)).toBe(FOREVER + STR + strValue);
        expect(localStore.has(key)).toBe(true);
        localStore.remove(key);
        expect(localStore.has(key)).toBe(false);

        localStore.set(key, strObj);
        expect(localStore.getString(key)).toBe(FOREVER + OBJ + JSON.stringify(strObj));
        localStore.remove(key);
        expect(localStore.has(key)).toBe(false);

        localStore.set(key, strValue, 3000);
        expect(localStore.getString(key)).toBe(SHORT_LIVED + STR + strValue);
        localStore.remove(key);
    });

    it("should get all key correct", function () {
        var keys = ["a", "b", "c", "d"];
        localStore.clear();
        for (var i = 0, len = keys.length; i < len; i++) {
            localStore.set(keys[i], i);
        }
        expect(localStore.keys()).toEqual(keys);

        var filter = function (key) {
            return key !== "a";
        };
        var filteredKeys = localStore.keys(filter);
        expect(filteredKeys).toEqual(keys.filter(filter));
    });

    it("should clear out date data success", function () {
        var key1 = "test1";
        var key2 = "test2";
        var key3 = "test3";
        var value = "testStr";
        var timeStamp = "TimeStamp_";
        //测试有缓存时间的保存
        localStore.clear();
        localStore.set(key1, value, 2000);
        localStore.set(key2, value, 4000);
        localStore.set(key3, value, 6000);

        var baseTime = new Date().getTime();
        var baseTimeDate = new Date(baseTime);
        jasmine.clock().mockDate(baseTimeDate);//构造一个虚拟的当前时间
        //2秒后
        jasmine.clock().tick(2003);
        localStore.clearAllExpired();
        expect(localStore.keys()).toEqual([timeStamp + key2, timeStamp + key3, key2, key3]);
        //4秒后
        jasmine.clock().tick(2000);
        localStore.clearAllExpired();
        expect(localStore.keys()).toEqual([timeStamp + key3, key3]);
        //6秒后
        jasmine.clock().tick(2000);
        localStore.clearAllExpired();
        expect(localStore.keys()).toEqual([]);
    });

    it("should update success", function () {
        var key = "test";
        var strValue = "testStr";
        var updatedData = "updateStr";
        localStore.set(key, strValue);
        expect(localStore.get(key)).toBe(strValue);

        localStore.update(key, function (key, data) {
            return updatedData;
        });
        expect(localStore.get(key)).toBe(updatedData);
    });

    it("should getKeyStartBy success", function () {
        var key1 = "test1";
        var key2 = "test1_1";
        var key3 = "test3";
        var strValue = "testStr";
        localStore.set(key1, strValue);
        localStore.set(key2, strValue);
        localStore.set(key3, strValue);
        expect(localStore.getKeyStartBy("test1")).toEqual([key1,key2]);
    });
});