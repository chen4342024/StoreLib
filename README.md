# StoreLib

标签： LocalStorage SessionStorage 

---

对HTML5 LocalStorage 以及 SessionStorage 的api进一步的封装，使其跟符合我们平时的使用！ localStore ----> LocalStorage
sessionStore----> SessionStorage


----------


#api
###set(key, value, cacheTime)
保存内容到存储中
#####参数：

    key:键，字符串
    value:值，字符串或对象，对象则自动用JSON.stringfy(),转为字符串保存
    cacheTime：保存时间，单位毫秒，可不填

#####例子：

    localStore.set("username", "chen");//永久保存
    localStore.set("username", "chen",3000);//缓存3秒
    localStore.set("userinfo", {name:"chen",age:18},3000);//缓存对象3秒
    
---
###remove(key)
根据key删除
#####参数：

    key:键，字符串

#####例子：

    localStore.remove("username");
    
---
###update(key, handler, cacheTime)
更新内容
#####参数：

    key:键，字符串
    handler:回调，更新处理方法，返回一个更新后的值，会自动帮你更新到存储中去
    cacheTime：新的数据的缓存时间，单位毫秒，可不填

#####例子：

    localStore.update("username", function (key, data) {
        return data + "chen";//需自己确保data不为null
    });
    

---
###get(key)
根据key获取保存内容
如果存的是对象的话,会直接返回对象
如果存的时候有指定缓存时间,如果过期则返回null
#####参数：

    key:键，字符串

#####例子：

    localStore.get("username");


---
###size(keys, sizeType)
根据传进来的keys，计算对应的value所占用的空间
#####参数：

    keys:键，数组
    sizeType:指定计算大小单位： ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']，(可选)

#####例子：

    localStore.size(["username"]);
    localStore.size(["username"],"MB");
    
---
###keys(filter)
获取所有的key,如果filter不为空，则根据filter来筛选
#####参数：

    filter:过滤方法

#####例子：

    localStore.keys(); //获取所有的key
    localStore.keys(function (key) {
        return key !== "a";
    });//只获取key不等于“a”的key
    
---
###clear()
清空整个storage
#####例子：

    localStore.clear(); 
---
###clearAllExpired()
清空过期缓存（带有过期时间的）
#####例子：

    localStore.clearAllExpired();

---
###has(key)
判断某个key是否存在
#####参数：

    key:键，字符串

#####例子：

    localStore.has("username");
    
---
###getString(key)
相当于直接调用系统localStorage.getItem(key)
根据key获取实际保存的值 (返回字符串)，包括库添加的前缀（库本身用于逻辑判断）
#####参数：

    key:键，字符串

#####例子：

    localStore.getString("username");
---
###getKeyStartBy(str)
获取以str开头的key
#####参数：

    str:字符串

#####例子：

    localStore.getKeyStartBy("user");

#最后说明
由于需要对判断保存的内容是字符串还是对象，所以会在保存的value前加上特定的前缀。
以及插入对应的过期时间，会新增一个新的键为"TimeStamp"+key 来保存过期时间。
所以在chrome的resource面板里看到的内容会跟你保存的内容多一点前缀。（只要你调用对数据的增删改查，都使用上面的api，这些前缀对你的使用不会有任何不好的影响）





