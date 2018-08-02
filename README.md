## DolphinDB Json Api

DolphinDB Web API is an API that programs can access server through url(http://Ip:Port) by posting data in JSON format, which can make the server to run the specified script code and return the result in JSON format.

### Applicable scenarios

Any programming language that supports:
(1) submitting data to a specified url via the http protocol;
(2) parsing json formatted packets;

### Get it started

#### Return as an object


Here we simply let the server do a 1+2=3 operation. Just organize a json packet like the javascript below and post the packet to the datanode url, such as http://localhost:8848.
> * javascript
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

*Note that in the browser environment, special symbols such as "+" needs to be url encoded through function encodeURIComponent* before sending to DolphinDB server.

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
> * Return result
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


#### Return as a table

In this example, we will generate a table on the server side through DolphinDB script :`select * from table(1..3 as id,'tom' 'bob' 'tony' as name)`, and return it to the client in JSON format, DolphinDB Server stores table data in columns, so the returned json is also composed of multiple one-dimensional Arrays representing the corresponding DolphinDB columns.

> * Input arameter format
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
> * Return result format
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

#### Example of returning as a table


In this example, we take the server's equal join function (`ej`) as an example. By performing `ej` on two tables, the result of the join is also a table.

For ease of understanding, the input and output results are listed in a simplified manner.

leftTable: table(1 2 3 as id,'a' 'b' 'c' as name)

rightTable: table(2 3 4 as id,'e' 'f' 'g' as name)

resultTable: table(2,3 as id,'b' 'c' as name,'e' 'f' as rightTable_name)

> * Input

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

> * Output

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

### Details of output JSON format 

######  [Input]
* SessionID：specifies the session ID connecting to DolphinDB. The initial session ID is 0. During a user login session, the same server associates the SessionID with the login user.

* functionName：specifies the name of the function to be called.

* params: an json array representing the input parameters of the specificed functionName. 

######  [Output]
* sessionID： the session ID where the script is executed.

* resultCode : 0-Normal  1-Exception。

* msg：wehn resultCode is 1, exception information will be throwed. 

* object： The returned object information after the script execution.


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

### DolphinDB Json Api Reference
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
