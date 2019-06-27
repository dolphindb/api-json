/*=============================================
Decription  : DolphinDBEntity
Author      : LinL 
Date        : 2018-05-27
==============================================*/
var DolphinDBEntity = function (json) {
    this._json = json;
}
DolphinDBEntity.prototype = {
    toScalar: function () {
        if (typeof this._json != "object") return "";
        if (this._json.resultCode != "0") return "";
        if (this._json.object.length <= 0) return "";
        return this._json.object[0].value;
    },
    toVector: function () {
        if (typeof this._json != "object") return "";
        if (this._json.resultCode != "0") return "";
        if (this._json.object.length <= 0) return "";
        return this._json.object[0].value;
    },

    toTable: function () {
        if (typeof this._json != "object") return "";
        if (this._json.resultCode != "0") return "";
        if (this._json.object.length <= 0) return "";
        var rowcount = this._json.object.length;

        var jTable = [];
        this._json.object[0].value.forEach(function (value, index, array) {
            var valArr = value["value"];
            if (isArray(valArr)) {
                for (var i = 0; i < valArr.length; i++) {
                    jTable.setRow(i, value.name, valArr[i]);
                }
            }
        });
        return jTable;
    },

    toMatrix: function(){
        if (typeof this._json != "object") return "";
        if (this._json.resultCode != "0") return "";
        if (this._json.object.length <= 0) return "";
        var jsonobj = this._json.object[0].value;
        var jsonArr = jsonobj[0].value;
        var rowcount = Number.parseInt(jsonobj[1].value);
        var colcount = Number.parseInt(jsonobj[2].value);
        var colLabels = jsonobj[4].type === "void" ? null : jsonobj[4].value;
        //var rowLables = jsonobj[5].type === "void" ? null : jsonobj[5].value;
        var jTable = [];
        var curIndex = 0;
        for (var i = 0; i < colcount; i++) {
            var colName = colLabels ? colLabels[i] : "col" + i;
            for (var j = 0; j < rowcount; j++) {
                jTable.setRow(j, colName, jsonArr[curIndex]);
                if (curIndex < jsonArr.length - 1) {
                    curIndex++;
                }
            }
        }
        return jTable;
    }
}

function isArray(object) {
    return object && typeof object === 'object' && Array == object.constructor;
}

Array.prototype.setRow = function (index, fieldname, value) {
    if (typeof this[index] === 'undefined') {
        var row = {};
        this[index] = row;
    }
    this[index][fieldname] = value;
}