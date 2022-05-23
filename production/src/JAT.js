"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Helper_1 = require("./Helper");
var JAT = (function () {
    function JAT() {
        this.secretToken = null;
        this.algorithm = null;
        this.algorithmName = null;
        this.algorithms = {};
    }
    JAT.prototype.init = function (algorithm, id, secretToken) {
        try {
            if (!this.algorithms[algorithm])
                this.algorithms[algorithm] = require('crypto-js/' + algorithm);
        }
        catch (_a) {
            throw Error('encryption algorithm not supported by crypto-js package, please refer to https://github.com/brix/crypto-js');
        }
        this.algorithm = this.algorithms[algorithm];
        this.algorithmName = algorithm;
        this.secretToken = secretToken;
        this.id = id;
        return this;
    };
    JAT.prototype.parseAccessToken = function (accessToken) {
        var aT = accessToken.split('.');
        if (aT.length != 4) {
            throw Error('invalid accessToken');
        }
        return {
            alg: this._decodeStr(aT[0]),
            payload: {
                encoded: aT[1],
                decoded: this._decodeJSON(aT[1])
            },
            id: this._decodeStr(aT[2]),
            hash: aT[3],
        };
    };
    JAT.prototype.hash = function (payload) {
        this._checkInit();
        return this.algorithm(this.secretToken + this.id + payload).toString();
    };
    JAT.prototype.getDate = function () {
        return this._date();
    };
    JAT.prototype._date = function () {
        var current = new Date();
        var y = current.getUTCFullYear();
        var m = current.getUTCMonth() + 1;
        var d = current.getUTCDate();
        var h = current.getUTCHours();
        var mStr = m < 10 ? '0' + m.toString() : m.toString();
        var dStr = d < 10 ? '0' + d.toString() : d.toString();
        var hStr = h < 10 ? '0' + h.toString() : h.toString();
        return parseInt(y + mStr + dStr + hStr);
    };
    JAT.prototype._decodeJSON = function (target) {
        return JSON.parse(Helper_1.default.btoa(target));
    };
    JAT.prototype._decodeStr = function (target) {
        return Helper_1.default.btoa(target);
    };
    JAT.prototype._checkInit = function () {
        if (!this.algorithm || !this.secretToken || !this.algorithmName || !this.id) {
            throw Error('please init object before getting accessToken');
        }
    };
    return JAT;
}());
exports.default = JAT;
