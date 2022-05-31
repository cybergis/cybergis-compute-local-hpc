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
exports.GlobusTaskListManager = void 0;
var GlobusTransferRefreshToken_1 = require("../models/GlobusTransferRefreshToken");
var PythonUtil_1 = require("./PythonUtil");
var config_1 = require("../../configs/config");
var DB_1 = require("../DB");
var redis = require('redis');
var promisify = require("util").promisify;
var GlobusTaskListManager = /** @class */ (function () {
    function GlobusTaskListManager() {
        /**
         * Class for managing globus tasks
         */
        this.redis = {
            getValue: null,
            setValue: null,
            delValue: null
        };
        this.isConnected = false;
    }
    /**
     * Assigns label to taskId
     *
     * @param{string} label - input label
     * @param{string} taskId - setValue id
     */
    GlobusTaskListManager.prototype.put = function (label, taskId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.redis.setValue("globus_task_".concat(label), taskId)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get taskId for specified label
     *
     * @param{string} label - input label
     * @return{string} out - redis output
     */
    GlobusTaskListManager.prototype.get = function (label) {
        return __awaiter(this, void 0, void 0, function () {
            var out;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.redis.getValue("globus_task_".concat(label))];
                    case 2:
                        out = _a.sent();
                        return [2 /*return*/, out ? out : null];
                }
            });
        });
    };
    /**
     * removes taskId for specified label
     *
     * @param{string} label - input label
     */
    GlobusTaskListManager.prototype.remove = function (label) {
        return __awaiter(this, void 0, void 0, function () {
            var out;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.get(label)];
                    case 2:
                        out = _a.sent();
                        if (!out)
                            return [2 /*return*/];
                        this.redis.delValue("globus_task_".concat(label));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @async
     * Connect to globus through redis
     */
    GlobusTaskListManager.prototype.connect = function () {
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
    return GlobusTaskListManager;
}());
exports.GlobusTaskListManager = GlobusTaskListManager;
var GlobusUtil = /** @class */ (function () {
    function GlobusUtil() {
    }
    /**
     * @static
     * Initializes globus job
     * @param{GlobusFolder} from - from transfer folder
     * @param{GlobusFolder} to - to transfer folder
     * @param{hpcConfig} hpcConfig - hpcConfiguration
     * @param{string} label - task label
     * @throw{Error} - Thrown if globus query status fails
     * @return{string} - taskId
     */
    GlobusUtil.initTransfer = function (from, to, hpcConfig, label) {
        if (label === void 0) { label = ''; }
        return __awaiter(this, void 0, void 0, function () {
            var connection, globusTransferRefreshTokenRepo, g, out, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.connect()];
                    case 1:
                        connection = _a.sent();
                        globusTransferRefreshTokenRepo = connection.getRepository(GlobusTransferRefreshToken_1.GlobusTransferRefreshToken);
                        return [4 /*yield*/, globusTransferRefreshTokenRepo.findOne(hpcConfig.globus.identity)];
                    case 2:
                        g = _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, PythonUtil_1["default"].run('globus_init.py', [
                                config_1.config.globus_client_id,
                                g.transferRefreshToken,
                                from.endpoint,
                                from.path,
                                to.endpoint,
                                to.path,
                                "".concat(label, "_").concat(Math.floor(Math.random() * 1000))
                            ], ['task_id'])];
                    case 4:
                        out = _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _a.sent();
                        throw new Error("Globus query status failed with error: ".concat(e_1));
                    case 6:
                        if (!out['task_id'])
                            throw new Error("cannot initialize Globus job: ".concat(out['error']));
                        return [2 /*return*/, out['task_id']];
                }
            });
        });
    };
    /**
     * @static
     * @async
     * Returns output of querying 'globus_monitor.py'
     * @param{string} taskId - taskId of transfer
     * @param{hpcConfig} hpcConfig - hpcConfiguration
     * @return{Promise<string>} - queryStatus string
     */
    GlobusUtil.monitorTransfer = function (taskId, hpcConfig) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._queryStatus(taskId, hpcConfig, 'globus_monitor.py')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * @static
     * @async
     * Returns output of querying 'globus_query_status.py'
     * @param{string} taskId - taskId of transfer
     * @param{hpcConfig} hpcConfig - hpcConfiguration
     * @return{Promise<string>} - queryStatus string
     */
    GlobusUtil.queryTransferStatus = function (taskId, hpcConfig) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._queryStatus(taskId, hpcConfig, 'globus_query_status.py')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * @static
     * @async
     * Implements the specified globus query
     * @param{string} taskId - taskId of transfer
     * @param{hpcConfig} hpcConfig - hpcConfiguration
     * @param{string} script - query string
     * @throw{Error} - thrown when Globus query status fails
     * @return{string} - queryStatus string
     */
    GlobusUtil._queryStatus = function (taskId, hpcConfig, script) {
        return __awaiter(this, void 0, void 0, function () {
            var connection, globusTransferRefreshTokenRepo, g, out, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.connect()];
                    case 1:
                        connection = _a.sent();
                        globusTransferRefreshTokenRepo = connection.getRepository(GlobusTransferRefreshToken_1.GlobusTransferRefreshToken);
                        return [4 /*yield*/, globusTransferRefreshTokenRepo.findOne(hpcConfig.globus.identity)];
                    case 2:
                        g = _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, PythonUtil_1["default"].run(script, [
                                config_1.config.globus_client_id,
                                g.transferRefreshToken,
                                taskId
                            ], ['status'])];
                    case 4:
                        out = _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        e_2 = _a.sent();
                        throw new Error("Globus query status failed with error: ".concat(e_2));
                    case 6: return [2 /*return*/, out['status']];
                }
            });
        });
    };
    /**
     * Class for accessing Globus commands
     */
    GlobusUtil.db = new DB_1["default"]();
    return GlobusUtil;
}());
exports["default"] = GlobusUtil;
