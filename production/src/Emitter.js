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
var DB_1 = require("./DB");
var config_1 = require("../configs/config");
var Event_1 = require("./models/Event");
var Log_1 = require("./models/Log");
var Job_1 = require("./models/Job");
var Emitter = (function () {
    function Emitter() {
        this.db = new DB_1.default();
    }
    Emitter.prototype.registerEvents = function (job, type, message) {
        return __awaiter(this, void 0, void 0, function () {
            var connection, eventRepo, jobId, event, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (config_1.config.is_testing)
                            console.log("".concat(job.id, ": [event]"), type, message);
                        return [4, this.db.connect()];
                    case 1:
                        connection = _b.sent();
                        eventRepo = connection.getRepository(Event_1.Event);
                        jobId = job.id;
                        if (!(type === 'JOB_INIT')) return [3, 3];
                        job.initializedAt = new Date();
                        return [4, connection.createQueryBuilder()
                                .update(Job_1.Job)
                                .where('id = :id', { id: job.id })
                                .set({ initializedAt: job.initializedAt })
                                .execute()];
                    case 2:
                        _b.sent();
                        return [3, 5];
                    case 3:
                        if (!(type == 'JOB_ENDED' || type === 'JOB_FAILED')) return [3, 5];
                        job.finishedAt = new Date();
                        job.isFailed = type === 'JOB_FAILED';
                        return [4, connection.createQueryBuilder()
                                .update(Job_1.Job)
                                .where('id = :id', { id: job.id })
                                .set({ finishedAt: job.finishedAt, isFailed: job.isFailed })
                                .execute()];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        event = new Event_1.Event();
                        event.jobId = jobId;
                        event.type = type;
                        event.message = message;
                        _b.label = 6;
                    case 6:
                        _b.trys.push([6, 8, , 9]);
                        return [4, eventRepo.save(event)];
                    case 7:
                        _b.sent();
                        return [3, 9];
                    case 8:
                        _a = _b.sent();
                        return [3, 9];
                    case 9: return [2];
                }
            });
        });
    };
    Emitter.prototype.registerLogs = function (job, message) {
        return __awaiter(this, void 0, void 0, function () {
            var connection, logRepo, log, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (config_1.config.is_testing)
                            console.log("".concat(job.id, ": [log]"), message);
                        return [4, this.db.connect()];
                    case 1:
                        connection = _b.sent();
                        logRepo = connection.getRepository(Log_1.Log);
                        log = new Log_1.Log();
                        log.jobId = job.id;
                        log.message = message.length > 500 ? message.substring(0, 500) + '...[download for full log]' : message;
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4, logRepo.save(log)];
                    case 3:
                        _b.sent();
                        return [3, 5];
                    case 4:
                        _a = _b.sent();
                        return [3, 5];
                    case 5: return [2];
                }
            });
        });
    };
    Emitter.prototype.getEvents = function (jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.db.connect()];
                    case 1:
                        connection = _a.sent();
                        return [4, connection.createQueryBuilder(Event_1.Event, 'event')
                                .where('event.jobId = :jobId', { jobId: jobId })
                                .orderBy('event.createdAt', 'DESC')
                                .getMany()];
                    case 2: return [2, _a.sent()];
                }
            });
        });
    };
    Emitter.prototype.getLogs = function (jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.db.connect()];
                    case 1:
                        connection = _a.sent();
                        return [4, connection.createQueryBuilder(Log_1.Log, 'log')
                                .where('log.jobId = :jobId', { jobId: jobId })
                                .orderBy('log.createdAt', 'DESC')
                                .getMany()];
                    case 2: return [2, _a.sent()];
                }
            });
        });
    };
    return Emitter;
}());
exports.default = Emitter;
