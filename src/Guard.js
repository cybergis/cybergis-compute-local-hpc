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
exports.__esModule = true;
exports.Guard = exports.CredentialManager = void 0;
var JAT_1 = require("./JAT");
var Helper_1 = require("./Helper");
var DB_1 = require("./DB");
var Job_1 = require("./models/Job");
var config_1 = require("../configs/config");
var NodeSSH = require('node-ssh');
var redis = require('redis');
var promisify = require("util").promisify;
var CredentialManager = /** @class */ (function () {
    function CredentialManager() {
        this.redis = {
            getValue: null,
            setValue: null,
            delValue: null
        };
        this.isConnected = false;
    }
    CredentialManager.prototype.add = function (key, cred) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.redis.setValue(key, JSON.stringify(cred))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CredentialManager.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        _c.sent();
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, this.redis.getValue(key)];
                    case 2: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    CredentialManager.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var client, redisAuth;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isConnected)
                            return [2 /*return*/];
                        client = new redis.createClient({
                            host: config_1.config.redis.host,
                            port: config_1.config.redis.port
                        });
                        if (!(config_1.config.redis.password != null && config_1.config.redis.password != undefined)) return [3 /*break*/, 2];
                        redisAuth = promisify(client.auth).bind(client);
                        return [4 /*yield*/, redisAuth(config_1.config.redis.password)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.redis.getValue = promisify(client.get).bind(client);
                        this.redis.setValue = promisify(client.set).bind(client);
                        this.redis.delValue = promisify(client.del).bind(client);
                        this.isConnected = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    return CredentialManager;
}());
exports.CredentialManager = CredentialManager;
var Guard = /** @class */ (function () {
    function Guard() {
        this.jat = new JAT_1["default"]();
        this.authenticatedAccessTokenCache = {};
        this.credentialManager = new CredentialManager();
        this.ssh = new NodeSSH();
        this.db = new DB_1["default"]();
    }
    Guard.prototype.validatePrivateAccount = function (hpcName, user, password) {
        return __awaiter(this, void 0, void 0, function () {
            var hpc, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.clearCache();
                        hpc = config_1.hpcConfigMap[hpcName];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.ssh.connect({
                                host: hpc.ip,
                                port: hpc.port,
                                user: user,
                                password: password
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.ssh.dispose()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        throw new Error("unable to check credentials with ".concat(hpcName));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Guard.prototype.validateCommunityAccount = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.clearCache();
                return [2 /*return*/];
            });
        });
    };
    Guard.prototype.issueJobSecretToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var connection, jobRepo, secretToken;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.connect()];
                    case 1:
                        connection = _a.sent();
                        jobRepo = connection.getRepository(Job_1.Job);
                        secretToken = Helper_1["default"].randomStr(45);
                        _a.label = 2;
                    case 2: return [4 /*yield*/, jobRepo.findOne({ secretToken: secretToken })];
                    case 3:
                        if (!_a.sent()) return [3 /*break*/, 4];
                        secretToken = Helper_1["default"].randomStr(45);
                        return [3 /*break*/, 2];
                    case 4: return [2 /*return*/, secretToken];
                }
            });
        });
    };
    Guard.prototype.registerCredential = function (user, password) {
        return __awaiter(this, void 0, void 0, function () {
            var credentialId;
            return __generator(this, function (_a) {
                credentialId = this.generateID();
                this.credentialManager.add(credentialId, {
                    id: credentialId,
                    user: user,
                    password: password
                });
                return [2 /*return*/, credentialId];
            });
        });
    };
    Guard.prototype.validateJobAccessToken = function (accessToken, withRelations) {
        if (withRelations === void 0) { withRelations = false; }
        return __awaiter(this, void 0, void 0, function () {
            var rawAccessToken, date, cacheJob, connection, jobRepo, options, job, hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.clearCache();
                        rawAccessToken = this.jat.parseAccessToken(accessToken);
                        date = this.jat.getDate();
                        if (rawAccessToken.payload.decoded.date != date)
                            throw new Error('invalid accessToken provided');
                        if (!this.authenticatedAccessTokenCache[date]) {
                            this.authenticatedAccessTokenCache[date] = {};
                        }
                        else {
                            cacheJob = this.authenticatedAccessTokenCache[date][rawAccessToken.hash];
                            if (cacheJob != undefined && !withRelations)
                                return [2 /*return*/, cacheJob];
                        }
                        return [4 /*yield*/, this.db.connect()];
                    case 1:
                        connection = _a.sent();
                        jobRepo = connection.getRepository(Job_1.Job);
                        options = withRelations ? {
                            relations: ['logs', 'events']
                        } : {};
                        return [4 /*yield*/, jobRepo.findOne(rawAccessToken.id, options)];
                    case 2:
                        job = _a.sent();
                        if (!job)
                            throw new Error('invalid accessToken provided');
                        hash = this.jat.init(rawAccessToken.alg, job.id, job.secretToken).hash(rawAccessToken.payload.encoded);
                        if (hash != rawAccessToken.hash)
                            throw new Error('invalid accessToken provided');
                        this.authenticatedAccessTokenCache[date][rawAccessToken.hash] = job;
                        return [2 /*return*/, job];
                }
            });
        });
    };
    Guard.prototype.updateJobAccessTokenCache = function (accessToken, job) {
        var date = this.jat.getDate();
        var rawAccessToken = this.jat.parseAccessToken(accessToken);
        this.authenticatedAccessTokenCache[date][rawAccessToken.hash] = job;
    };
    Guard.prototype.generateID = function () {
        return Math.round((new Date()).getTime() / 1000) + Helper_1["default"].randomStr(5);
    };
    Guard.prototype.clearCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            var date, i;
            return __generator(this, function (_a) {
                date = this.jat.getDate();
                for (i in this.authenticatedAccessTokenCache) {
                    if (parseInt(i) < date) {
                        delete this.authenticatedAccessTokenCache[i];
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    return Guard;
}());
exports.Guard = Guard;
exports["default"] = Guard;
