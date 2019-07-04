## DolphinDB Web API

DolphinDB Web API is an API that programs can access DolphinDB server through url (http://IP:port) by posting data in JSON format, which instructs the server to run the specified script and return the result in JSON format.

Any programming language that supports submitting data to a specified url via the http protocol and parsing JSON formatted packets can use DolphinDB web API:

### Examples

#### Return as an object

We conduct 1+2=3 in DolphinDB server. Organize a JSON packet like the JavaScript below and post the packet to the url of a data node, such as "http://localhost:8848".

> * JavaScript
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
> * Input format

*Note that in the browser environment, special symbols such as "+" need to be url encoded with function encodeURIComponent before sending to DolphinDB server.

```javascript
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
> * Output format
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


#### Return as a table

In this example, we generate a table on the server side through DolphinDB script `select * from table(1..3 as id,'tom' 'bob' 'tony' as name)`, and return it to the client in JSON format. DolphinDB server stores tables in columns, so the returned JSON is also composed of multiple one-dimensional arrays representing DolphinDB columns.

> * Input arameter format
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
> * Return result format
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

#### Example of returning as a table

In this example, we use DolphinDB equal join function `ej` on two tables. The result is also a table.

leftTable: table(1 2 3 as id,'a' 'b' 'c' as name)

rightTable: table(2 3 4 as id,'e' 'f' 'g' as name)

resultTable: table(2 3 as id,'b' 'c' as name,'e' 'f' as rightTable_name)

> * Input

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

> * Output

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

To use the javascript development kit, you need to include `DolphinDBConnection.js`, `DolphinDBEntity.js` and jquery development kit.

`DolphinDBConnection.js` provides the following methods: `run`, `runFunction`, `login` and `logout`.

- Run Script

Use __run(script, [callback])__ to run DolphinDB script. For example:

```javascript
var server = new DolphinDBConnection("http://localhost:8848");
server.run("1+2",function(re){
    console.log(var DolphinDBEntity(re).toScalar());
});

```

- Run DolphinDB Functions

Use __runFunction(functionName, params, [callback])__ to run DolphinDB functions. For example:

```javascript
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

- Login and Logout DolphinDB server

Use __login(userId, password, [callback])__ to login DolphinDB server and use __logout()__ to logout DolphinDB server.

```javascript
var server = new DolphinDBConnection("http://localhost:8848");
server.login("user1","pass");
server.logout();
```

> Note:
> 1. The javascript development kit depends on javascript library JQuery. It can only be used in a browser environment.
> 2. Web API returns up to 100,000 records at a time.
