## DolphinDB WebAPI

### 1. 简介

DolphinDB WebAPI是访问DolphinDB server资源的程序接口。向url(http://IP:Port) post JSON数据包，即可使DolphinDB server运行指定脚本代码，并将结果以JSON的格式返回。

任何编程语言，只要支持通过http协议向指定url提交数据，且能够解析JSON格式数据包，那么就可以使用DolphinDB WebAPI访问DolphinDB server。

### 2. 示例

#### 返回值对象示例

在DolphinDB server中做一个1+2=3的运算。组织一个类似下面的格式的JSON数据包，然后把数据包post到datanode url，比如 http://localhost:8848。

* javascript调用示例
``` javascript
var paramJson = {...}
var option = {
        url: "http://localhost:8848",
        async: true,
        data: JSON.stringify(paramJson),
        type: "POST",
        dataType: "json",
        success: function (data) {
             var resultJson = data; //data={...}
        }
    }
    $.ajax(option);
```
* 入参格式

*注意在浏览器环境下，JSON里包含+号等特殊符号在提交前先做encodeURIComponent*

```javascript
var code = "1+2";
code = encodeURIComponent(code);
paramJson = {
	"sessionID": "942605602",
	"functionName": "executeCode",
	"params": [{
		"name": "script",
		"form": "scalar",
		"type": "string",
		"value": code
	}]
}
```
* 返回结果格式
```javascript
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
这个示例通过DolphinDB script ：select * from table(1..3 as id,'tom' 'bob' 'tony' as name)， 在server端生成一个table,并以json格式返回给客户端，返回的json是以多个Array组成。

* 入参格式
```javascript
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
* 返回结果格式
```javascript
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

这个示例中， 我们以server端的equal join function(ej)为例，通过对两个table进行ej，返回的join结果也是table。

为了方便理解，下面以简化方式列出入参和返回结果。

leftTable: table(1 2 3 as id,'a' 'b' 'c' as name)

rightTable: table(2 3 4 as id,'e' 'f' 'g' as name)

resultTable: table(2 3 as id,'b' 'c' as name,'e' 'f' as rightTable_name)

* 入参格式

```javascript
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

* 返回结果格式

```javascript
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

### 3. JSON包格式详解

#####  [提交格式]

* SessionID：指定调用的会话ID，初次调用会话ID为0，在一个用户登录会话期间，同一个Server会将SessionID跟登录用户关联。

* functionName：指定调用的函数名称。

* params: functionName指定参数所需要的入参，params是一个json array。

#####  [返回格式]

* sessionID：本次脚本执行所在的会话ID。

* resultCode : 0-执行正常  1-执行异常。

* msg：当resultCode为1时，此处会告知异常提示信息。

* object：脚本执行返回的对象信息。


### 4. Javascript 开发包

DolphinDB为javascript的开发者提供了的开发包。 要使用javascript 开发包，需要引入 `DolphinDBConnection.js`，`DolphinDBEntity.js`，以及 jquery 开发包。

DolphinDBConnection.js提供了`run`,`runFunction`,`login`,`logout` 方法。

* run(script, [callback]) : 运行DolphinDB脚本

``` javascript
var server = new DolphinDBConnection("http://localhost:8848");
server.run("1+2",function(re){
    console.log(var DolphinDBEntity(re).toScalar());
});
```

* runFunction(functionName, params, [callback]) : 运行DolphinDB函数，并以json方式传递参数。

``` javascript
var server = new DolphinDBConnection("http://localhost:8848");
var param = [{
        "name": "userId",
        "form": "scalar",
        "type": "string",
        "value": "user1"
    }, {
        "name": "password",
        "form": "scalar",
        "type": "string",
        "value": "passwordstring"
    }];
server.runFunction("login", param , function(re){
    if (re.resultCode === "1") {
        alert(re.msg);
    }
});
```

* login(userId, password, [callback]) : 以用户名密码登录DolphinDB Server。

```javascript
var server = new DolphinDBConnection("http://localhost:8848");
server.login("user1","pass");
```

* logout() : 注销当前登录用户。

```javascript
var server = new DolphinDBConnection("http://localhost:8848");
server.logout();
```

### 5. 注意事项

* javascript开发包依赖JQuery，只能在浏览器环境下使用。

* Web数据接口单表一次最多返回10万条记录。
