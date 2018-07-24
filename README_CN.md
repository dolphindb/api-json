## DolphinDB WebApi

### 简介

DolphinDB WebApi是DolphinDB提供的访问Server 资源的程序接口,通过向url(http://Ip:Port) post json数据包，即可使server运行指定脚本代码，并将结果以json的格式返回。

### 适用场景

任何编程语言，只要支持通过http协议向指定url提交数据，能够解析json格式数据包，那么就可以使用 DolphinDB WebApi访问DolphinDB Server。

### 新手入门示例

#### 返回值对象示例

通过一个简单的示例，让大家直观的了解WebApi是如何调用的。

这里我们简单的让server做一个1+2=3的运算。只要组织一个类似下面的格式的json数据包，然后把数据包post到datanode url，比如 http://localhost:8848。
> * javascript调用示例
``` javascript
var paramJson = {...}
var option = {
        url: "http://localhost:8848",
        async: true,
        data: paramJson,
        type: "POST",
        dataType: "json",
        success: function (data) {
             var resultJson = data; //data={...}
        }
    }
    $.ajax(option);
```
> * 入参格式

*注意在浏览器环境下，json里包含+号等特殊符号会被jsonParser处理掉，所以提交前先对要提交的数据做encodeURIComponent*

```json
var code = "1+2";
codestr = encodeURIComponent(code);
paramJson = {
	"sessionID": "942605602",
	"functionName": "executeCode",
	"params": [{
		"name": "script",
		"form": "scalar",
		"type": "string",
		"value": codestr
	}]
}
```
> * 返回结果格式
```json
resultJson = {
	"sessionID": "942605602",
	"resultCode": "0",
	"msg": "",
	"object": [{
		"name": "",
		"form": "scalar",
		"type": "int",
		"value": "3"
	}]
}
```


#### 返回Table对象示例
这个示例我们会通过DolphinDB script ：select * from table(1..3 as id,'tom' 'bob' 'tony' as name)， 在server端生成一个table,并以json格式返回给客户端，由于DolphinDB Server是以列式存储table数据，所以返回的json也是以多个一维Array组成。

> * 入参格式
```
var code = "select * from table(1..3 as id,'tom' 'bob' 'tony' as name)";
code = encodeURIComponent(code);
var paramJson = {
    "sessionID": "0",
    "functionName": "executeCode",
    "params": [{
        "name": "script",
        "form": "scalar",
        "type": "string",
        "value": code
    }]
};
```
> * 返回结果格式
```
{
	"sessionID": "1130397736",
	"resultCode": "0",
	"msg": "",
	"object": [{
		"name": "",
		"form": "table",
		"size": "3",
		"value": [{
			"name": "id",
			"form": "vector",
			"type": "int",
			"size": "3",
			"value": [1, 2, 3]
		}, {
			"name": "name",
			"form": "vector",
			"type": "string",
			"size": "3",
			"value": ["tom", "bob", "tony"]
		}]
	}]
}
```

#### 参数为Table对象示例
这个示例我们以server端的equal join function(ej)为例，通过对两个table进行ej，返回的join结果也是table。

为了方便理解，下面以简化方式列出入参和返回结果。

leftTable: table(1 2 3 as id,'a' 'b' 'c' as name)

rightTable: table(2 3 4 as id,'e' 'f' 'g' as name)

resultTable: table(2,3 as id,'b' 'c' as name,'e' 'f' as rightTable_name)

> * 入参格式

```
var paramJson = {
        "sessionID": "0",
        "functionName": "ej",
        "params": [{
            "name": "leftTable",
            "form": "table",
            "size": "3",
            "value": [{
                    "name": "id",
                    "form": "vector",
                    "type": "int",
                    "size": "3",
                    "value": [1, 2, 3]
                }, {
                    "name": "name",
                    "form": "vector",
                    "type": "string",
                    "size": "3",
                    "value": ["a", "b", "c"]
                }]
        },{
            "name": "rightTable",
            "form": "table",
            "size": "3",
            "value": [{
                    "name": "id",
                    "form": "vector",
                    "type": "int",
                    "size": "3",
                    "value": [2, 3, 4]
                }, {
                    "name": "name",
                    "form": "vector",
                    "type": "string",
                    "size": "3",
                    "value": ["e", "f", "g"]
                }]
        },{
            "name": "joincolumn",
            "form": "scalar",
            "type": "string",
            "value": "id"
        }]
    };
```

> * 返回结果格式

```
{
	"sessionID": "1358033411",
	"resultCode": "0",
	"msg": "",
	"object": [{
		"name": "",
		"form": "table",
		"size": "2",
		"value": [{
			"name": "id",
			"form": "vector",
			"type": "int",
			"size": "2",
			"value": [2, 3]
		}, {
			"name": "name",
			"form": "vector",
			"type": "string",
			"size": "2",
			"value": ["b", "c"]
		}, {
			"name": "righttable_name",
			"form": "vector",
			"type": "string",
			"size": "2",
			"value": ["e", "f"]
		}]
	}]
}
```

### Json包格式详解

######  [提交格式]
* SessionID：指定调用的会话ID，初次调用会话ID为0，在一个用户登录会话期间，同一个Server会将SessionID跟登录用户关联。

* functionName：指定调用的函数名称。

* params: functionName指定参数所需要的入参，params是一个json array。

######  [返回格式]
* sessionID：本次脚本执行所在的会话ID。

* resultCode : 0-执行正常  1-执行异常。

* msg：当resultCode为1时，此处会告知异常提示信息。

* object：脚本执行返回的对象信息。


### Javascript DolphinDB WebApi Package

我们为javascript的开发者提供了访问webApi的开发包，封装如下方法：
* CallWebApi: 提供 CallWebApi方法，将Json数据包提交到指定url。
* CodeExecutor: 提供run和runSync方法，是通过callWebApi的方式调用了server的executeCode方法,封装了json参数的组装过程。
* DolphinEntity：返回结果处理类。提供toScalar，toVector，toTable，toMatrix 方法，可以方便的将返回结果从json数据包中解析成为 javascript 的json object或json array，开发者根据返回的DataForm选择合适的方法来解析结果。

 要使用javascript 开发包，需要引入 `callWebApi.js, executeCode.js, dolphinApi.js`

>* 注意javascript开发包内部依赖JQuery,只能在浏览器环境下使用, 不适用nodejs环境。

按照上面的例子，同样运行1+2的脚本，利用开发包调用方式如下：
``` javascript
var server = new DatanodeServer("http://localhost:8848");
var result = new DolphinEntity(server.runSync("1+2")).toScalar();
```
在js里得到的result = 3。

上面的代码使用同步方式调用，javascript脚本会等待server执行完毕后才会继续，如果需要使用异步方式调用，代码如下：
```
var server = new DatanodeServer("http://localhost:8848");
server.run("1+2",function(re){
     var reObj = new DolphinEntity(re);
     var result = reObj.toScalar();
});
```

### DolphinDB WebApi Reference
1. run：异步执行脚本
```
new DatanodeServer("http://[datanodeIp]:[port]").run(script,function(re){
       //var jsonstr = re;
       //var DolphinEntity(jsonstr);
})
```
2. runSync：同步执行脚本
```
var re = new DatanodeServer("http://[datanodeIp]:[port]").runSync(script);
```
3. login：登录系统
```
new DatanodeServer("http://[datanodeIp]:[port]").login("admin","pass");
```
4. logout：登出当前用户
```
new DatanodeServer("http://[datanodeIp]:[port]").logout();
```
