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
exports.ResultFolderContentManager = void 0;
var types_1 = require("../types");
var Job_1 = require("../models/Job");
var config_1 = require("../../configs/config");
var FileSystem_1 = require("../FileSystem");
var config_2 = require("../../configs/config");
var path = require("path");
var DB_1 = require("../DB");
var redis = require('redis');
var promisify = require("util").promisify;
/**
 * Some comment
 */
var ResultFolderContentManager = /** @class */ (function () {
    function ResultFolderContentManager() {
        this.redis = {
            getValue: null,
            setValue: null,
            delValue: null
        };
        this.isConnected = false;
    }
    /**
    * Set the value of the job result folder to the contents passed
    *
    * @async
    * @param {string} jobId - This job
    * @param {string[]} contents - Contents to be listed in the result folder
    */
    ResultFolderContentManager.prototype.put = function (jobId, contents) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.redis.setValue("job_result_folder_content".concat(jobId), JSON.stringify(contents))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Return the parsed contents of the results folder
     *
     * @async
     * @param {string} jobId - This job
     * @returns {string[]} - Contents of the results folder
     */
    ResultFolderContentManager.prototype.get = function (jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var out;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.redis.getValue("job_result_folder_content".concat(jobId))];
                    case 2:
                        out = _a.sent();
                        return [2 /*return*/, out ? JSON.parse(out) : null];
                }
            });
        });
    };
    /**
     * Delete the result folder content associated with this job
     *
     * @async
     * @param {string} jobId - This job
     */
    ResultFolderContentManager.prototype.remove = function (jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var out;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.get(jobId)];
                    case 2:
                        out = _a.sent();
                        if (!out)
                            return [2 /*return*/];
                        this.redis.delValue("job_result_folder_content".concat(jobId));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Connect with host
     *
     * @async
     */
    ResultFolderContentManager.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var client, redisAuth;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isConnected)
                            return [2 /*return*/];
                        client = new redis.createClient({
                            host: config_2.config.redis.host,
                            port: config_2.config.redis.port
                        });
                        if (!(config_2.config.redis.password != null && config_2.config.redis.password != undefined)) return [3 /*break*/, 2];
                        redisAuth = promisify(client.auth).bind(client);
                        return [4 /*yield*/, redisAuth(config_2.config.redis.password)];
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
    return ResultFolderContentManager;
}());
exports.ResultFolderContentManager = ResultFolderContentManager;
var JobUtil = /** @class */ (function () {
    function JobUtil() {
    }
    /**
     * Ensure the job has all the nessecary input parameters
     *
     * @static
     * @param job - This job
     * @param paramRules - Parameter rules for this job
     * @throws Job must have a complete parameter list
     */
    JobUtil.validateParam = function (job, paramRules) {
        for (var i in paramRules) {
            if (!job.param[i]) {
                throw new Error("job missing input param ".concat(i));
            }
        }
    };
    /**
     * Get the total slurm usage of the indicated user
     *
     * @static
     * @async
     * @param {string} userID - User to collect slurm usage from
     * @param {boolean} format - Whether or not the cputume, memory, memoryusage, and walltime are already formatted
     * @returns {Object} - Total slurm usage of the indicated user
     */
    JobUtil.getUserSlurmUsage = function (userId, format) {
        if (format === void 0) { format = false; }
        return __awaiter(this, void 0, void 0, function () {
            var db, connection, jobs, userSlurmUsage, i, job;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = new DB_1["default"]();
                        return [4 /*yield*/, db.connect()];
                    case 1:
                        connection = _a.sent();
                        return [4 /*yield*/, connection.getRepository(Job_1.Job).find({ userId: userId })];
                    case 2:
                        jobs = _a.sent();
                        userSlurmUsage = {
                            nodes: 0,
                            cpus: 0,
                            cpuTime: 0,
                            memory: 0,
                            memoryUsage: 0,
                            walltime: 0
                        };
                        for (i in jobs) {
                            job = jobs[i];
                            if (job.nodes)
                                userSlurmUsage.nodes += job.nodes;
                            if (job.cpus)
                                userSlurmUsage.cpus += job.cpus;
                            if (job.cpuTime)
                                userSlurmUsage.cpuTime += job.cpuTime;
                            if (job.memory)
                                userSlurmUsage.memory += job.memory;
                            if (job.memoryUsage)
                                userSlurmUsage.memoryUsage += job.memoryUsage;
                            if (job.walltime)
                                userSlurmUsage.walltime += job.walltime;
                        }
                        if (format) {
                            return [2 /*return*/, {
                                    nodes: userSlurmUsage.nodes,
                                    cpus: userSlurmUsage.cpus,
                                    cpuTime: this.secondsToTimeDelta(userSlurmUsage.cpuTime),
                                    memory: this.kbToStorageUnit(userSlurmUsage.memory),
                                    memoryUsage: this.kbToStorageUnit(userSlurmUsage.memoryUsage),
                                    walltime: this.secondsToTimeDelta(userSlurmUsage.walltime)
                                }];
                        }
                        else {
                            return [2 /*return*/, {
                                    nodes: userSlurmUsage.nodes,
                                    cpus: userSlurmUsage.cpus,
                                    cpuTime: userSlurmUsage.cpuTime,
                                    memory: userSlurmUsage.memory,
                                    memoryUsage: userSlurmUsage.memoryUsage,
                                    walltime: userSlurmUsage.walltime
                                }];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Ensure this job has valid input data and slurm config rules
     *
     * @static
     * @async
     * @param {Job} job - This job
     * @param {string} jupyterHost - Jupyter host for this job
     * @param {string} username - Username of the user who submitted this job
     * @throws - DataFolder must have a valid path, the job must have upload data, and there must be an executable folder in the maintainerConfig
     */
    JobUtil.validateJob = function (job, jupyterHost, username) {
        return __awaiter(this, void 0, void 0, function () {
            var jupyterGlobus, validPath, providedSlurmInputRules, providedParamRules, requireUploadData, maintainerConfig, u, f, m, file;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // validate input data
                        if (job.dataFolder) {
                            jupyterGlobus = config_1.jupyterGlobusMap[jupyterHost];
                            if (jupyterGlobus) {
                                validPath = path.join(jupyterGlobus.root_path, username);
                                if (job.dataFolder.includes(jupyterGlobus.root_path) && !job.dataFolder.includes(validPath)) {
                                    throw new Error('invalid dataFolder path');
                                }
                            }
                        }
                        providedSlurmInputRules = {};
                        providedParamRules = {};
                        requireUploadData = false;
                        maintainerConfig = config_1.maintainerConfigMap[job.maintainer];
                        if (!maintainerConfig.executable_folder.from_user) return [3 /*break*/, 2];
                        u = job.executableFolder.split('://');
                        if (!(u[0] === 'git')) return [3 /*break*/, 2];
                        f = new FileSystem_1.GitFolder(u[1]);
                        return [4 /*yield*/, f.getExecutableManifest()];
                    case 1:
                        m = _a.sent();
                        if (m.slurm_input_rules) {
                            providedSlurmInputRules = m.slurm_input_rules;
                        }
                        if (m.param_rules) {
                            providedParamRules = m.param_rules;
                        }
                        if (m.require_upload_data) {
                            requireUploadData = m.require_upload_data;
                        }
                        _a.label = 2;
                    case 2:
                        if (requireUploadData && !job.dataFolder) {
                            throw new Error("job missing upload data");
                        }
                        if (maintainerConfig.executable_folder.from_user) {
                            if (job.executableFolder == undefined)
                                throw new Error('no file provided');
                            file = FileSystem_1.FileSystem.getFolderByURL(job.executableFolder, maintainerConfig.executable_folder.allowed_protocol);
                            file.validate();
                        }
                        JobUtil.validateSlurmConfig(job, providedSlurmInputRules);
                        JobUtil.validateParam(job, providedParamRules);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Set the slurm rules for this job, and ensure that those rules don't exceed the default slurm ceiling
     *
     * @static
     * @param {Job} job - This job
     * @param {slurmInputRules} slurmInputRules - Slurm input rules associated with this job
     * @throws - Slurm input rules associated with this job must not exceed the default slurm ceiling
     */
    JobUtil.validateSlurmConfig = function (job, slurmInputRules) {
        var slurmCeiling = {};
        var globalInputCap = config_1.hpcConfigMap[job.hpc].slurm_global_cap;
        if (!globalInputCap)
            globalInputCap = {};
        slurmInputRules = Object.assign(config_1.hpcConfigMap[job.hpc].slurm_input_rules, slurmInputRules);
        var defaultSlurmCeiling = {
            num_of_node: 50,
            num_of_task: 50,
            cpu_per_task: 50,
            memory_per_cpu: '10G',
            memory_per_gpu: '10G',
            memory: '50G',
            gpus: 20,
            gpus_per_node: 20,
            gpus_per_socket: 20,
            gpus_per_task: 20,
            time: '10:00:00'
        };
        for (var i in slurmInputRules) {
            if (!slurmInputRules[i].max)
                continue;
            if (types_1.slurm_integer_storage_unit_config.includes(i)) {
                slurmCeiling[i] = slurmInputRules[i].max + slurmInputRules[i].unit;
            }
            else if (types_1.slurm_integer_time_unit_config.includes(i)) {
                var val = slurmInputRules[i].max;
                var unit = slurmInputRules[i].unit;
                var sec = JobUtil.unitTimeToSeconds(val, unit);
                slurmCeiling[i] = JobUtil.secondsToTime(sec);
            }
            else if (types_1.slurm_integer_configs.includes(i)) {
                slurmCeiling[i] = slurmInputRules[i].max;
            }
        }
        for (var i in globalInputCap) {
            if (!slurmCeiling[i])
                slurmCeiling[i] = globalInputCap[i];
            else if (this.compareSlurmConfig(i, globalInputCap[i], slurmCeiling[i])) {
                slurmCeiling[i] = globalInputCap[i];
            }
        }
        for (var i in defaultSlurmCeiling) {
            if (!slurmCeiling[i]) {
                slurmCeiling[i] = defaultSlurmCeiling[i];
                continue;
            }
        }
        for (var i in slurmCeiling) {
            if (!job.slurm[i])
                continue;
            if (this.compareSlurmConfig(i, slurmCeiling[i], job.slurm[i])) {
                throw new Error("slurm config ".concat(i, " exceeds the threshold of ").concat(slurmCeiling[i], " (current value ").concat(job.slurm[i], ")"));
            }
        }
    };
    /**
     * Return true if the slurm config exceeds the threshold of the slurm ceiling.
     *
     * @static
     * @param {string} i - Slurm field that a and b are associated with
     * @param {string} a - Storage or projected time for this job from the slurm ceiling
     * @param {string} b - Storage or projected time for this job for this job
     * @return {boolean} - If the slurm config exceeds the threshold of the slurm ceiling
     */
    JobUtil.compareSlurmConfig = function (i, a, b) {
        if (types_1.slurm_integer_storage_unit_config.includes(i)) {
            return this.storageUnitToKB(a) < this.storageUnitToKB(b);
        }
        if (types_1.slurm_integer_time_unit_config.includes(i)) {
            return this.timeToSeconds(a) < this.timeToSeconds(b);
        }
        return a < b;
    };
    /**
     * Turns the passed amount of storage into kb
     *
     * @static
     * @param {string} i - Amount of storage in original unit
     * @return {number} - Storage in kb
     */
    JobUtil.storageUnitToKB = function (i) {
        i = i.toLowerCase().replace(/b/gi, '');
        if (i.includes('p')) {
            return parseInt(i.replace('p', '').trim()) * 1024 * 1024 * 1024;
        }
        if (i.includes('g')) {
            return parseInt(i.replace('g', '').trim()) * 1024 * 1024;
        }
        if (i.includes('m')) {
            return parseInt(i.replace('m', '').trim()) * 1024;
        }
    };
    /**
     * Turns the passed amount of storage into the most convenient unit.
     *
     * @static
     * @param {number} i - Amount of storage in kb
     * @return {string} - Storage in most convenient unit (kb, mb, gb, tb, pb, eb)
     */
    JobUtil.kbToStorageUnit = function (i) {
        var units = ['kb', 'mb', 'gb', 'tb', 'pb', 'eb'].reverse();
        while (units.length > 0) {
            var unit = units.pop();
            if (i < 1024)
                return "".concat(i).concat(unit);
            i = i / 1024;
        }
        return "".concat(i, "pb");
    };
    /**
     * Turns the passed time into a string specifying each unit
     *
     * @static
     * @param {number} seconds - Time in seconds
     * @return {string} - Passed time converted into dayds, hours, minutes, seconds format
     */
    JobUtil.secondsToTimeDelta = function (seconds) {
        var days = Math.floor(seconds / (60 * 60 * 24));
        var hours = Math.floor(seconds / (60 * 60) - (days * 24));
        var minutes = Math.floor(seconds / 60 - (days * 60 * 24) - (hours * 60));
        var seconds = Math.floor(seconds - (days * 60 * 60 * 24) - (hours * 60 * 60));
        //
        var format = function (j) {
            if (j == 0)
                return '00';
            else if (j < 10)
                return "0".concat(j);
            else
                return "".concat(j);
        };
        return "".concat(format(days), " days, ").concat(format(hours), " hours, ").concat(format(minutes), " minutes, ").concat(format(seconds), " seconds");
    };
    /**
     * Turns the passed time into seconds
     *
     * @static
     * @param {number} time - Time in specified unit
     * @param {string} unit - Unit the passed time is in
     * @return {int} - Passed time converted into seconds
     */
    JobUtil.unitTimeToSeconds = function (time, unit) {
        if (unit == 'Minutes')
            return time * 60;
        if (unit == 'Hours')
            return time * 60 * 60;
        if (unit == 'Days')
            return time * 60 * 60 * 24;
        return 0;
    };
    /**
     * Turns passed seconds time into days-hours:minutes:seconds format
     *
     * @static
     * @param {number} seconds - Time in seconds
     * @return {int} time - Passed seconds time converted to days-hours:minutes:seconds format.
     */
    JobUtil.secondsToTime = function (seconds) {
        var days = Math.floor(seconds / (60 * 60 * 24));
        var hours = Math.floor(seconds / (60 * 60) - (days * 24));
        var minutes = Math.floor(seconds / 60 - (days * 60 * 24) - (hours * 60));
        var d = days < 10 ? "0".concat(days) : "".concat(days);
        var h = hours < 10 ? "0".concat(hours) : "".concat(hours);
        var m = minutes < 10 ? "0".concat(minutes) : "".concat(minutes);
        if (days == 0) {
            if (hours == 0) {
                return "".concat(m, ":00");
            }
            else {
                return "".concat(h, ":").concat(m, ":00");
            }
        }
        else {
            return "".concat(d, "-").concat(h, ":").concat(m, ":00");
        }
    };
    /**
     * Turns passed days-hours:minutes:seconds time into seconds format
     *
     * @static
     * @param {string} raw - Time in days-hours:minutes:seconds format.
     * @return {int} - Passed days-hours:minutes:seconds time converted to seconds.
     */
    JobUtil.timeToSeconds = function (raw) {
        var i = raw.split(':');
        if (i.length == 1) {
            var j = i[0].split('-');
            if (j.length == 1) {
                // minutes
                return parseInt(i[0]) * 60;
            }
            else {
                // days-hours
                return parseInt(j[0]) * 60 * 60 * 24 + parseInt(j[0]) * 60 * 60;
            }
        }
        else if (i.length == 2) {
            var j = i[0].split('-');
            if (j.length == 2) {
                // days-hours:minutes
                return parseInt(j[0]) * 60 * 60 * 24 + parseInt(j[1]) * 60 * 60 + parseInt(i[1]) * 60;
            }
            else {
                // minutes:seconds
                return parseInt(i[0]) * 60 + parseInt(i[0]);
            }
        }
        else if (i.length == 3) {
            var j = i[0].split('-');
            if (j.length == 2) {
                // days-hours:minutes:seconds
                return parseInt(j[0]) * 60 * 60 * 24 + parseInt(j[1]) * 60 * 60 + parseInt(i[1]) * 60 + parseInt(i[2]);
            }
            else {
                // hours:minutes:seconds
                return parseInt(i[0]) * 60 * 60 + parseInt(i[1]) * 60 + parseInt(i[2]);
            }
        }
        return Infinity;
    };
    return JobUtil;
}());
exports["default"] = JobUtil;
