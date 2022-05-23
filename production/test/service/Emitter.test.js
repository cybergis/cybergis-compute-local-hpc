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
require("jest");
var TestHelper_1 = require("../TestHelper");
var Emitter_1 = require("../../src/Emitter");
var config_1 = require("../../configs/config");
var DB_1 = require("../../src/DB");
var db = new DB_1.default();
beforeAll(function () {
    config_1.config.is_jest = true;
});
afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, db.clearAll()];
            case 1:
                _a.sent();
                return [2];
        }
    });
}); });
var jobId = 'test-job';
var userId = 'test-user';
var secretToken = 'abcdefg';
var maintainer = 'community_contribution';
var hpc = 'keeling_community';
var eventType = 'test-event';
var eventMessage = 'I am testing this event';
var logType = 'test-event';
var logMessage = 'I am testing this log';
describe('test Emitter.getEvents', function () {
    var emitter = new Emitter_1.default();
    test('simple get event', function () { return __awaiter(void 0, void 0, void 0, function () {
        var job, createdEvent, queriedEvents;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, TestHelper_1.default.createJob(jobId, userId, secretToken, maintainer, hpc)];
                case 1:
                    job = _a.sent();
                    return [4, TestHelper_1.default.createEvent(job, eventType, eventMessage)];
                case 2:
                    createdEvent = _a.sent();
                    return [4, emitter.getEvents(job.id)];
                case 3:
                    queriedEvents = _a.sent();
                    expect(queriedEvents.length).toEqual(1);
                    expect(queriedEvents[0].jobId).toEqual(job.id);
                    expect(queriedEvents[0].id).toEqual(createdEvent.id);
                    expect(queriedEvents[0].type).toEqual(createdEvent.type);
                    return [2];
            }
        });
    }); });
    test('get events', function () { return __awaiter(void 0, void 0, void 0, function () {
        var eventsCount, job, i, queriedEvents, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    eventsCount = 10;
                    return [4, TestHelper_1.default.createJob(jobId, userId, secretToken, maintainer, hpc)];
                case 1:
                    job = _a.sent();
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < eventsCount)) return [3, 5];
                    return [4, TestHelper_1.default.createEvent(job, "".concat(eventType, "_").concat(i), "".concat(eventMessage, "_").concat(i))];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    i++;
                    return [3, 2];
                case 5: return [4, emitter.getEvents(job.id)];
                case 6:
                    queriedEvents = _a.sent();
                    expect(queriedEvents.length == eventsCount);
                    for (i = 0; i < eventsCount; i++) {
                        expect(queriedEvents[i].jobId).toEqual(job.id);
                        expect(queriedEvents[i].type).toEqual("".concat(eventType, "_").concat(i));
                    }
                    return [2];
            }
        });
    }); });
});
describe('test Emitter.getLogs', function () {
    var emitter = new Emitter_1.default();
    test('simple get log', function () { return __awaiter(void 0, void 0, void 0, function () {
        var job, createdLog, queriedLogs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, TestHelper_1.default.createJob(jobId, userId, secretToken, maintainer, hpc)];
                case 1:
                    job = _a.sent();
                    return [4, TestHelper_1.default.createLog(job, logMessage)];
                case 2:
                    createdLog = _a.sent();
                    return [4, emitter.getLogs(job.id)];
                case 3:
                    queriedLogs = _a.sent();
                    expect(queriedLogs.length).toEqual(1);
                    expect(queriedLogs[0].jobId).toEqual(job.id);
                    expect(queriedLogs[0].id).toEqual(createdLog.id);
                    expect(queriedLogs[0].message).toEqual(createdLog.message);
                    return [2];
            }
        });
    }); });
    test('get logs', function () { return __awaiter(void 0, void 0, void 0, function () {
        var logsCount, job, i, queriedLogs, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logsCount = 10;
                    return [4, TestHelper_1.default.createJob(jobId, userId, secretToken, maintainer, hpc)];
                case 1:
                    job = _a.sent();
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < logsCount)) return [3, 5];
                    return [4, TestHelper_1.default.createLog(job, "".concat(logMessage, "_").concat(i))];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    i++;
                    return [3, 2];
                case 5: return [4, emitter.getLogs(job.id)];
                case 6:
                    queriedLogs = _a.sent();
                    expect(queriedLogs.length == logsCount);
                    for (i = 0; i < logsCount; i++) {
                        expect(queriedLogs[i].jobId).toEqual(job.id);
                        expect(queriedLogs[i].message).toEqual("".concat(logMessage, "_").concat(i));
                    }
                    return [2];
            }
        });
    }); });
});
describe('test Emitter.registerLogs', function () {
    var emitter = new Emitter_1.default();
    test('simple register log', function () { return __awaiter(void 0, void 0, void 0, function () {
        var job, queriedLogs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, TestHelper_1.default.createJob(jobId, userId, secretToken, maintainer, hpc)];
                case 1:
                    job = _a.sent();
                    return [4, emitter.registerLogs(job, "".concat(logMessage, "_register_").concat(0))];
                case 2:
                    _a.sent();
                    return [4, emitter.registerLogs(job, "".concat(logMessage, "_register_").concat(1))];
                case 3:
                    _a.sent();
                    return [4, emitter.getLogs(job.id)];
                case 4:
                    queriedLogs = _a.sent();
                    expect(queriedLogs.length).toEqual(2);
                    expect(queriedLogs[0].jobId).toEqual(job.id);
                    expect(queriedLogs[1].jobId).toEqual(job.id);
                    expect(queriedLogs[0].message).toEqual("".concat(logMessage, "_register_").concat(0));
                    expect(queriedLogs[1].message).toEqual("".concat(logMessage, "_register_").concat(1));
                    return [2];
            }
        });
    }); });
});
describe('test Emitter.registerEvents', function () {
    var emitter = new Emitter_1.default();
    test('simple register events', function () { return __awaiter(void 0, void 0, void 0, function () {
        var job, queriedEvents;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, TestHelper_1.default.createJob(jobId, userId, secretToken, maintainer, hpc)];
                case 1:
                    job = _a.sent();
                    return [4, emitter.registerEvents(job, "".concat(logType, "_register_").concat(0), "".concat(logMessage, "_register_").concat(0))];
                case 2:
                    _a.sent();
                    return [4, emitter.registerEvents(job, "".concat(logType, "_register_").concat(1), "".concat(logMessage, "_register_").concat(1))];
                case 3:
                    _a.sent();
                    return [4, emitter.getEvents(job.id)];
                case 4:
                    queriedEvents = _a.sent();
                    expect(queriedEvents.length).toEqual(2);
                    expect(queriedEvents[0].jobId).toEqual(job.id);
                    expect(queriedEvents[1].jobId).toEqual(job.id);
                    expect(queriedEvents[0].type).toEqual("".concat(logMessage, "_register_").concat(0));
                    expect(queriedEvents[1].type).toEqual("".concat(logMessage, "_register_").concat(1));
                    return [2];
            }
        });
    }); });
});
