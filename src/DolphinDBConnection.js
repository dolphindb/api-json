/*=============================================
Decription  : DolphinDBConnection
Author      : LinL 
Date        : 2019-06-26
==============================================*/
class DolphinDBConnection {
    constructor(url) {
        this.apiurl = url;
        this.session_storage_id = "dolphindb_js_api_sessoinid"
    }
    
    CallWebApi(apiurl, paramstr, sucfunc, errfunc, customOption) {

        if (typeof this._currentSessionID === 'undefined') {
            this._currentSessionID = 0;
        }
        if (localStorage.getItem(this.session_storage_id) == null || localStorage.getItem(this.session_storage_id) == "") {
            paramstr['sessionID'] = this._currentSessionID;
            localStorage.setItem(this.session_storage_id, this._currentSessionID)
        } else {
            this._currentSessionID = localStorage.getItem(this.session_storage_id);
            paramstr['sessionID'] = this._currentSessionID;
        }
        var d = JSON.stringify(paramstr);
    
        var slash = apiurl.charAt(apiurl.length - 1);
    
        var sessId = this._currentSessionID == 0 ? "" : this._currentSessionID;
        if (slash == "/") {
            apiurl = apiurl + sessId;
        } else {
            apiurl = apiurl + "/" + sessId;
        }
    
        var option = {
            url: apiurl,
            async: true,
            data: d,
            type: "POST",
            dataType: "json",
            success: function (data, status, xhr) {
    
                this._currentSessionID = data["sessionID"];
                localStorage.setItem(this.session_storage_id, this._currentSessionID);
    
                if (sucfunc) sucfunc(data);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (errfunc)
                    errfunc(errorThrown);
                else
                    throw errorThrown;
            }
        }
    
        if (customOption)
            $.extend(option, customOption);
    
        $.ajax(option);
    }

    run(script,callback) {
        var p = {
            "sessionID": "0",
            "functionName": "executeCode",
            "params": [{
                "name": "script",
                "form": "scalar",
                "type": "string",
                "value": script
            }]
        };

        this.CallWebApi(this.apiurl, p, function(re) {
            callback(re);
        }, function(re) {
            console.log(re);
        });
    }

    runFunction(functionName, params, callback){
        var p = {
            "sessionID": 0,
            "functionName": functionName,
            "params":params
        };

        this.CallWebApi(this.apiurl, p, function (re) {
            if(callback) callback(re);
        }, function(re) {
            console.log(re);
        });
    }

    login(userId, password, callback) {
        this.runFunction("login",[{
            "name": "userId",
            "form": "scalar",
            "type": "string",
            "value": userId
        }, {
            "name": "password",
            "form": "scalar",
            "type": "string",
            "value": password
        }], function(re){
            if (re.resultCode === "0") {
                if(callback) callback({"loginResult":true,"msg":""});
            } else if (re.resultCode === "1") {
                if(callback) callback({"loginResult":false,"msg":re.msg});
            }
        });
    }

    logout(callback) {
        this.runFunction("logout",function(re){
            if (re.resultCode === "0") {
                if(callback) callback({"loginResult":true,"msg":""});
            } else if (re.resultCode === "1") {
                if(callback) callback({"loginResult":false,"msg":re.msg});
            }
        });
    }
};