"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("../configs/config");
var DB_1 = require("../src/DB");
var PythonUtil_1 = require("../src/lib/PythonUtil");
var GlobusTransferRefreshToken_1 = require("../src/models/GlobusTransferRefreshToken");
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var db, identities, i, connection, counter, _a, _b, _i, i, identity, out, globusTransferRefreshTokenRepo, g;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                db = new DB_1.default(false);
                identities = [];
                for (i in config_1.hpcConfigMap) {
                    if (config_1.hpcConfigMap[i].globus) {
                        if (!(config_1.hpcConfigMap[i].globus.identity in identities)) {
                            identities.push(config_1.hpcConfigMap[i].globus.identity);
                        }
                    }
                }
                return [4, db.connect()];
            case 1:
                connection = _c.sent();
                counter = 0;
                _a = [];
                for (_b in identities)
                    _a.push(_b);
                _i = 0;
                _c.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3, 7];
                i = _a[_i];
                identity = identities[i];
                if (counter > 0)
                    console.log("\u26A0\uFE0F please logout of globus before logging into a new identity");
                console.log("refreshing transfer refresh token for ".concat(identity, "..."));
                return [4, PythonUtil_1.default.runInteractive('globus_refresh_transfer_token.py', [config_1.config.globus_client_id], ['transfer_refresh_token'])];
            case 3:
                out = _c.sent();
                if (!out['transfer_refresh_token']) return [3, 5];
                globusTransferRefreshTokenRepo = connection.getRepository(GlobusTransferRefreshToken_1.GlobusTransferRefreshToken);
                g = new GlobusTransferRefreshToken_1.GlobusTransferRefreshToken();
                g.identity = identity;
                g.transferRefreshToken = out['transfer_refresh_token'];
                return [4, globusTransferRefreshTokenRepo.save(g)];
            case 4:
                _c.sent();
                _c.label = 5;
            case 5:
                counter++;
                _c.label = 6;
            case 6:
                _i++;
                return [3, 2];
            case 7: return [4, db.close()];
            case 8:
                _c.sent();
                return [2];
        }
    });
}); };
main();
