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
var Job_1 = require("./models/Job");
var config_1 = require("../configs/config");
var DB_1 = require("./DB");
var Guard_1 = require("./Guard");
var util_1 = require("util");
var redis = require('redis');
var Queue = /** @class */ (function () {
    function Queue(name) {
        this.redis = {
            push: null,
            shift: null,
            peak: null,
            length: null
        };
        this.isConnected = false;
        this.db = new DB_1["default"]();
        this.credentialManager = new Guard_1.CredentialManager();
        this.name = name;
    }
    Queue.prototype.push = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.redis.push([this.name, item.id])];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Queue.prototype.shift = function () {
        return __awaiter(this, void 0, void 0, function () {
            var jobId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.redis.shift(this.name)];
                    case 2:
                        jobId = _a.sent();
                        return [2 /*return*/, this.getJobById(jobId)];
                }
            });
        });
    };
    Queue.prototype.isEmpty = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.redis.length(this.name)];
                    case 2: return [2 /*return*/, (_a.sent()) === 0];
                }
            });
        });
    };
    Queue.prototype.peak = function () {
        return __awaiter(this, void 0, void 0, function () {
            var jobId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.isEmpty()];
                    case 2:
                        if (_a.sent())
                            return [2 /*return*/, undefined];
                        return [4 /*yield*/, this.redis.peak(this.name, 0, 0)];
                    case 3:
                        jobId = _a.sent();
                        return [2 /*return*/, this.getJobById(jobId)];
                }
            });
        });
    };
    Queue.prototype.length = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.redis.length(this.name)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Queue.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var client, redisAuth;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.isConnected) return [3 /*break*/, 3];
                        client = new redis.createClient({
                            host: config_1.config.redis.host,
                            port: config_1.config.redis.port
                        });
                        if (!(config_1.config.redis.password != null && config_1.config.redis.password != undefined)) return [3 /*break*/, 2];
                        redisAuth = (0, util_1.promisify)(client.auth).bind(client);
                        return [4 /*yield*/, redisAuth(config_1.config.redis.password)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.redis.push = (0, util_1.promisify)(client.rpush).bind(client);
                        this.redis.shift = (0, util_1.promisify)(client.lpop).bind(client);
                        this.redis.peak = (0, util_1.promisify)(client.lrange).bind(client);
                        this.redis.length = (0, util_1.promisify)(client.llen).bind(client);
                        this.isConnected = true;
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Queue.prototype.getJobById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var connection, jobRepo, job, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.db.connect()];
                    case 1:
                        connection = _b.sent();
                        jobRepo = connection.getRepository(Job_1.Job);
                        return [4 /*yield*/, jobRepo.findOne(id)];
                    case 2:
                        job = _b.sent();
                        if (!job)
                            return [2 /*return*/, null];
                        if (!job.credentialId) return [3 /*break*/, 4];
                        _a = job;
                        return [4 /*yield*/, this.credentialManager.get(job.credentialId)];
                    case 3:
                        _a.credential = _b.sent();
                        _b.label = 4;
                    case 4: return [2 /*return*/, job];
                }
            });
        });
    };
    return Queue;
}());
exports["default"] = Queue;
