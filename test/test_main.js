var Assert = function(caseName){
    this.Equal = function(expected,actual){
        var b = expected === actual;
        if(expected instanceof Array && actual instanceof Array){
            b = expected.equals(actual);
        }

        if(b){
            addMsg(caseName + ": <font color='green'>ok</font>");
        }else{
            addMsg(caseName + ": <font color='red'>failed</font>")
        }
    }

    var addMsg = function(msg){
        document.getElementById("msg").innerHTML += ("<span>" + msg + "</span><br>")
    }

    
}
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
      return false;
    // compare lengths - can save a lot of time 
    if (this.length != array.length)
      return false;
    for (var i = 0, l = this.length; i < l; i++) {
      // Check if we have nested arrays
      if (this[i] instanceof Array && array[i] instanceof Array) {
        // recurse into the nested arrays
        if (!this[i].equals(array[i]))
          return false;    
      }      
      else if (this[i] != array[i]) { 
        // Warning - two different object instances will never be equal: {x:20} != {x:20}
        return false;  
      }      
    }    
    return true;
  }
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

var doTest = function(){
    testSimpleJson();
    testComplexJsonResult();
    testCommplexJsonParam();
}

var server = "http://localhost:8900"

var testSimpleJson = function(){
    var code = "1+2";
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
    var conn = new DolphinDBConnection(server);
    conn.run(code,function(re){
        var result = re.object[0].value;
        new Assert("test simple json").Equal("3",result);
    });
    
}

var testComplexJsonResult = function(){
    var code = "table(1..3 as id,'tom' 'bob' 'tony' as name)";
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
    var conn = new DolphinDBConnection(server);
    conn.run(code,function(re){
        var result = re.object[0].value;
        console.log(result);
        new Assert("testComplexJsonResult.result.length=2").Equal(2,result.length);
        console.log("result[0].value",result[0].value);
        new Assert("testComplexJsonResult.result[0].value=[1,2,3]").Equal([1,2,3],result[0].value);
        console.log("result[0].value",result[1].value);
        new Assert("testComplexJsonResult.result[1].value=[`tom`bob`tony]").Equal(['tom','bob','tony'],result[1].value);
    });
}


var testCommplexJsonParam = function(){
	var paramJson = {
        "sessionID": "0",
        "functionName": "ej",
        "params": [{
            "name": "lefttable",
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
            "name": "righttable",
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
    var conn = new DolphinDBConnection(server);
    conn.run(code, function(re){
        var result = re.object[0].value;
        console.log("testCommplexJsonParam.result = " ,result);
        //new Assert("test simple json").Equal("3",result);
    });
}