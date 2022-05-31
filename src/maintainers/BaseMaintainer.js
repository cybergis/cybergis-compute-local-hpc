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
var Job_1 = require("../models/Job");
var FileSystem_1 = require("../FileSystem");
var BaseConnector_1 = require("../connectors/BaseConnector");
var SlurmConnector_1 = require("../connectors/SlurmConnector");
var validator_1 = require("validator");
var errors_1 = require("../errors");
var config_1 = require("../../configs/config");
var SingularityConnector_1 = require("../connectors/SingularityConnector");
var DB_1 = require("../DB");
var BaseMaintainer = /** @class */ (function () {
    /** constructor **/
    function BaseMaintainer(job, supervisor) {
        /** packages **/
        this.validator = validator_1["default"]; // https://github.com/validatorjs/validator.js
        /** config **/
        this.job = undefined;
        this.hpc = undefined;
        this.config = undefined;
        this.id = undefined;
        this.slurm = undefined;
        /** mutex **/
        this._lock = false;
        /** states **/
        this.isInit = false;
        this.isEnd = false;
        this.isPaused = false;
        this.lifeCycleState = {
            initCounter: 0,
            createdAt: null
        };
        /** parameters **/
        this.initRetry = 3;
        this.maintainThresholdInHours = 100000; // something super large
        this.envParamValidators = undefined;
        this.envParamDefault = {};
        this.envParam = {};
        this.appParamValidators = undefined;
        this.appParam = {};
        /** HPC connectors **/
        this.connector = undefined;
        /** files **/
        this.dataFolder = undefined;
        this.resultFolder = undefined;
        this.executableFolder = undefined;
        /** data **/
        this.logs = [];
        this.events = [];
        for (var i in this.envParamValidators) {
            var val = job.env[i];
            if (val != undefined) {
                if (this.envParamValidators[i](val))
                    this.envParam[i] = val;
            }
        }
        var maintainerConfig = config_1.maintainerConfigMap[job.maintainer];
        if (maintainerConfig.executable_folder.from_user) {
            var folder = FileSystem_1.FileSystem.getFolderByURL(job.executableFolder);
            if (folder instanceof FileSystem_1.LocalFolder) {
                this.executableFolder = folder;
            }
            else {
                throw new Error('executable folder must be local folder');
            }
        }
        else {
            this.executableFolder = FileSystem_1.FileSystem.createLocalFolder();
        }
        this.supervisor = supervisor;
        this.job = job;
        this.config = maintainerConfig;
        this.id = job.id;
        this.slurm = job.slurm;
        this.db = new DB_1["default"]();
        var hpc = job.hpc ? job.hpc : this.config.default_hpc;
        this.hpc = config_1.hpcConfigMap[hpc];
        if (!this.hpc)
            throw new Error("cannot find hpc with name [" + hpc + "]");
        this.onDefine();
        this.dataFolder = job.dataFolder ? FileSystem_1.FileSystem.getFolderByURL(job.dataFolder) : null;
        if (this.dataFolder instanceof FileSystem_1.GlobusFolder && !this.hpc.globus) {
            throw new Error('HPC does not support Globus');
        }
        this.resultFolder = job.resultFolder ? FileSystem_1.FileSystem.getFolderByURL(job.resultFolder) : FileSystem_1.FileSystem.createLocalFolder();
    }
    /** lifecycle interfaces **/
    /**
     * Throw execption when ondefine not implemented
     *
     * @throws {NotImplementedError} - Ondefine is not implemented
     */
    BaseMaintainer.prototype.onDefine = function () {
        throw new errors_1.NotImplementedError("onDefine not implemented");
    };
    /**
     * Throw execption when oninit not implemented
     *
     * @throws {NotImplementedError} - Oninit is not implemented
     */
    BaseMaintainer.prototype.onInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new errors_1.NotImplementedError("onInit not implemented");
            });
        });
    };
    /**
     * Throw execption when onmaintain not implemented
     *
     * @throws {NotImplementedError} - Onmaintain is not implemented
     */
    BaseMaintainer.prototype.onMaintain = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new errors_1.NotImplementedError("onMaintain not implemented");
            });
        });
    };
    /**
     * Throw execption when onpause not implemented
     *
     * @throws {NotImplementedError} - Onpause is not implemented
     */
    BaseMaintainer.prototype.onPause = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new errors_1.NotImplementedError("onPause not implemented");
            });
        });
    };
    /**
     * Throw execption when onresume not implemented
     *
     * @throws {NotImplementedError} - Onresume is not implemented
     */
    BaseMaintainer.prototype.onResume = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new errors_1.NotImplementedError("onResume not implemented");
            });
        });
    };
    /**
     * Throw execption when oncancel not implemented
     *
     * @throws {NotImplementedError} - Oncancel is not implemented
     */
    BaseMaintainer.prototype.onCancel = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new errors_1.NotImplementedError("onCancel not implemented");
            });
        });
    };
    /** emitters **/
    /**
     * Update this.events with the new event, and this.isInit or this.isEnd as appropriate
     *
     * @param {string} type - Type of event to be recorded
     * @param {string} message - Message associated with the event
     */
    BaseMaintainer.prototype.emitEvent = function (type, message) {
        if (type === 'JOB_INIT')
            this.isInit = true;
        if (type === 'JOB_ENDED' || type === 'JOB_FAILED')
            this.isEnd = true;
        this.events.push({
            type: type,
            message: message
        });
    };
    /**
     * Update this.events with the new event
     *
     * @param {string} message - Message associated with the event
     */
    BaseMaintainer.prototype.emitLog = function (message) {
        this.logs.push(message);
    };
    /** supervisor interfaces **/
    /**
     * Initialize job in the maintainer. If the job has been retried too many times, terminate and update events.
     *
     * @async
     */
    BaseMaintainer.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._lock)
                            return [2 /*return*/];
                        this._lock = true;
                        if (!(this.lifeCycleState.initCounter >= this.initRetry)) return [3 /*break*/, 1];
                        this.emitEvent('JOB_FAILED', 'initialization counter exceeds ' + this.initRetry + ' counts');
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.onInit()];
                    case 2:
                        _a.sent();
                        this.lifeCycleState.initCounter++;
                        _a.label = 3;
                    case 3:
                        this._lock = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Ensure that the job is still running, and if the runtime has exceeded the maintain threshold, terminate and update events.
     *
     * @async
     */
    BaseMaintainer.prototype.maintain = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._lock)
                            return [2 /*return*/];
                        this._lock = true;
                        if (this.lifeCycleState.createdAt === null) {
                            this.lifeCycleState.createdAt = Date.now();
                        }
                        if (!(((this.lifeCycleState.createdAt - Date.now()) / (1000 * 60 * 60)) >= this.maintainThresholdInHours)) return [3 /*break*/, 1];
                        this.emitEvent('JOB_FAILED', 'maintain time exceeds ' + this.maintainThresholdInHours + ' hours');
                        return [3 /*break*/, 4];
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.onMaintain()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        if (config_1.config.is_testing)
                            console.error(e_1.toString()); // ignore error
                        return [3 /*break*/, 4];
                    case 4:
                        this._lock = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clear all logs in this.logs
     *
     * @async
     * @return {Object} - List of jobs that were just deleted.
     */
    BaseMaintainer.prototype.dumpLogs = function () {
        var logs = this.logs;
        this.logs = [];
        return logs;
    };
    /**
     * Clear all events in this.events
     *
     * @async
     * @return {Object} - List of events that were just deleted.
     */
    BaseMaintainer.prototype.dumpEvents = function () {
        var events = this.events;
        this.events = [];
        return events;
    };
    /**
     * Update this job to reflect the information in the passed job.
     *
     * @async
     * @public
     * @param {jobMaintainerUpdatable} job - New information to update this job with.
     */
    BaseMaintainer.prototype.updateJob = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            var connection, jobRepo, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.db.connect()];
                    case 1:
                        connection = _b.sent();
                        return [4 /*yield*/, connection.createQueryBuilder()
                                .update(Job_1.Job)
                                .where('id = :id', { id: this.id })
                                .set(job)
                                .execute()];
                    case 2:
                        _b.sent();
                        jobRepo = connection.getRepository(Job_1.Job);
                        _a = this;
                        return [4 /*yield*/, jobRepo.findOne(this.id)];
                    case 3:
                        _a.job = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Return the slurm connector associated with this job and hpc.
     *
     * @public
     * @returns {SlurmConnector} - The slurm connector associated with this job.
     */
    BaseMaintainer.prototype.getSlurmConnector = function () {
        return new SlurmConnector_1["default"](this.job, this.hpc, this);
    };
    /**
     * Return the singularity connector associated with this job and hpc.
     *
     * @public
     * @returns {SingularityConnector} - The singularity connector associated with this job.
     */
    BaseMaintainer.prototype.getSingularityConnector = function () {
        return new SingularityConnector_1["default"](this.job, this.hpc, this);
    };
    /**
     * Return the base connector associated with this job and hpc.
     *
     * @public
     * @returns {BaseConnector} - The base connector associated with this job.
     */
    BaseMaintainer.prototype.getBaseConnector = function () {
        return new BaseConnector_1["default"](this.job, this.hpc, this);
    };
    return BaseMaintainer;
}());
exports["default"] = BaseMaintainer;
