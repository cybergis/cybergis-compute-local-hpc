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
var DB_1 = require("./DB");
var Job_1 = require("./models/Job");
var Statistic = /** @class */ (function () {
    function Statistic() {
        this.db = new DB_1["default"]();
    }
    Statistic.prototype.getRuntimeByJobId = function (jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var connection, statistic;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.connect()];
                    case 1:
                        connection = _a.sent();
                        return [4 /*yield*/, connection
                                .getRepository(Job_1.Job)
                                .createQueryBuilder("job")
                                .select('TIMESTAMPDIFF(SECOND,job.initializedAt,job.finishedAt) as STATISTIC')
                                .where("job.initializedAt IS NOT NULL AND job.finishedAt IS NOT NULL AND job.id = :id", { id: jobId })
                                .getRawOne()];
                    case 2:
                        statistic = _a.sent();
                        if (statistic) {
                            return [2 /*return*/, parseInt(statistic['STATISTIC'])];
                        }
                        else {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Statistic.prototype.getRuntimeTotal = function () {
        return __awaiter(this, void 0, void 0, function () {
            var connection, statisticTotal, statisticByHPC, out, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.connect()];
                    case 1:
                        connection = _a.sent();
                        return [4 /*yield*/, connection
                                .getRepository(Job_1.Job)
                                .createQueryBuilder("job")
                                .select('SUM(TIMESTAMPDIFF(SECOND,job.initializedAt,job.finishedAt)) as STATISTIC')
                                .where("job.initializedAt IS NOT NULL AND job.finishedAt IS NOT NULL")
                                .getRawOne()];
                    case 2:
                        statisticTotal = _a.sent();
                        return [4 /*yield*/, connection
                                .getRepository(Job_1.Job)
                                .createQueryBuilder("job")
                                .select('SUM(TIMESTAMPDIFF(SECOND,job.initializedAt,job.finishedAt)) as STATISTIC, job.hpc as HPC')
                                .where("job.initializedAt IS NOT NULL AND job.finishedAt IS NOT NULL")
                                .groupBy('hpc')
                                .getRawMany()];
                    case 3:
                        statisticByHPC = _a.sent();
                        if (statisticTotal && statisticByHPC) {
                            out = {
                                total: parseInt(statisticTotal['STATISTIC'])
                            };
                            for (i in statisticByHPC) {
                                out[statisticByHPC[i]['HPC']] = parseInt(statisticByHPC[i]['STATISTIC']);
                            }
                            return [2 /*return*/, out];
                        }
                        else {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return Statistic;
}());
exports["default"] = Statistic;
