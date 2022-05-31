"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var errors_1 = require("../errors");
var BaseConnector_1 = require("./BaseConnector");
var FileSystem_1 = require("../FileSystem");
var path = require("path");
var GlobusUtil_1 = require("../lib/GlobusUtil");
var config_1 = require("../../configs/config");
var SlurmConnector = /** @class */ (function (_super) {
    __extends(SlurmConnector, _super);
    function SlurmConnector() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.modules = [];
        _this.isContainer = false;
        return _this;
    }
    /**
     * Registers all of the specified modules
     *
     * @param{Array} modules - Array of strings
     */
    SlurmConnector.prototype.registerModules = function (modules) {
        this.modules = this.modules.concat(modules);
    };
    /**
     * Creates slurm string with specified configuation
     *
     * @param{string} cmd - command that needs to be executed
     * @param{slurm} config - slurm configuration
     */
    SlurmConnector.prototype.prepare = function (cmd, config) {
        config = Object.assign({
            time: '01:00:00',
            num_of_task: 1,
            cpu_per_task: 1
        }, config);
        var modules = "";
        if (config.modules)
            for (var i in config.modules)
                modules += "module load ".concat(config.modules[i], "\n");
        // https://researchcomputing.princeton.edu/support/knowledge-base/slurm
        this.template = "#!/bin/bash\n#SBATCH --job-name=".concat(this.jobID, "\n").concat(this.config.init_sbatch_options ? this.config.init_sbatch_options.join('\n') : '', "\n").concat(config.num_of_node ? "#SBATCH --nodes=".concat(config.num_of_node) : '', "\n#SBATCH --ntasks=").concat(config.num_of_task, "\n#SBATCH --time=").concat(config.time, "\n#SBATCH --error=").concat(path.join(this.remote_result_folder_path, 'slurm_log', 'job.stderr'), "\n#SBATCH --output=").concat(path.join(this.remote_result_folder_path, 'slurm_log', 'job.stdout'), "\n").concat(config.cpu_per_task ? "#SBATCH --cpus-per-task=".concat(config.cpu_per_task) : '', "\n").concat(config.memory_per_gpu ? "#SBATCH --mem-per-gpu=".concat(config.memory_per_gpu) : '', "\n").concat(config.memory_per_cpu ? "#SBATCH --mem-per-cpu=".concat(config.memory_per_cpu) : '', "\n").concat(config.memory ? "#SBATCH --mem=".concat(config.memory) : '', "\n").concat(config.gpus ? "#SBATCH --gpus=".concat(config.gpus) : '', "\n").concat(config.gpus_per_node ? "#SBATCH --gpus-per-node=".concat(config.gpus_per_node) : '', "\n").concat(config.gpus_per_socket ? "#SBATCH --gpus-per-socket=".concat(config.gpus_per_socket) : '', "\n").concat(config.gpus_per_task ? "#SBATCH --gpus-per-task=".concat(config.gpus_per_task) : '', "\n").concat(config.partition ? "#SBATCH --partition=".concat(config.partition) : '', "\n").concat(this.getSBatchTagsFromArray('mail-type', config.mail_type), "\n").concat(this.getSBatchTagsFromArray('mail-user', config.mail_user), "\nmodule purge\n").concat(this.config.init_sbatch_script ? this.config.init_sbatch_script.join('\n') : '', "\n").concat(modules, "\n").concat(cmd);
    };
    /**
     * @async
     * submited the job
     */
    SlurmConnector.prototype.submit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var jobJSON, to, taskId, e_1, monitorTransfer, status, sbatchResult, failed;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // executable folder
                        if (this.maintainer != null)
                            this.maintainer.emitEvent('SLURM_UPLOAD', "uploading files");
                        return [4 /*yield*/, this.upload(this.maintainer.executableFolder, this.remote_executable_folder_path, true)
                            // job.sbatch
                        ];
                    case 1:
                        _a.sent();
                        // job.sbatch
                        return [4 /*yield*/, this.mkdir(path.join(this.remote_result_folder_path, 'slurm_log'))];
                    case 2:
                        // job.sbatch
                        _a.sent();
                        return [4 /*yield*/, this.createFile(this.template, path.join(this.remote_executable_folder_path, 'job.sbatch'), {}, true)
                            // job.json
                        ];
                    case 3:
                        _a.sent();
                        jobJSON = {
                            job_id: this.maintainer.job.id,
                            user_id: this.maintainer.job.userId,
                            maintainer: this.maintainer.job.maintainer,
                            hpc: this.maintainer.job.hpc,
                            param: this.maintainer.job.param,
                            env: this.maintainer.job.env,
                            executable_folder: this.isContainer ? this.getContainerExecutableFolderPath() : this.getRemoteExecutableFolderPath(),
                            data_folder: this.isContainer ? this.getContainerDataFolderPath() : this.getRemoteDataFolderPath(),
                            result_folder: this.isContainer ? this.getContainerResultFolderPath() : this.getRemoteResultFolderPath()
                        };
                        return [4 /*yield*/, this.createFile(jobJSON, path.join(this.remote_executable_folder_path, 'job.json'))
                            // data folder
                        ];
                    case 4:
                        _a.sent();
                        if (!this.maintainer.dataFolder) return [3 /*break*/, 13];
                        if (!(this.maintainer.dataFolder instanceof FileSystem_1.LocalFolder)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.upload(this.maintainer.dataFolder, this.remote_data_folder_path, true)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!(this.maintainer.dataFolder instanceof FileSystem_1.GlobusFolder)) return [3 /*break*/, 12];
                        to = FileSystem_1.FileSystem.getGlobusFolderByHPCConfig(this.config, "".concat(this.jobID, "/data"));
                        _a.label = 7;
                    case 7:
                        _a.trys.push([7, 9, , 10]);
                        if (this.maintainer != null)
                            this.maintainer.emitEvent('GLOBUS_TRANSFER_INIT', "initializing Globus job");
                        return [4 /*yield*/, GlobusUtil_1["default"].initTransfer(this.maintainer.dataFolder, to, this.config, this.jobID)];
                    case 8:
                        taskId = _a.sent();
                        if (this.maintainer != null)
                            this.maintainer.emitEvent('GLOBUS_TRANSFER_INIT_SUCCESS', "initialized Globus job with task ID ".concat(taskId));
                        return [3 /*break*/, 10];
                    case 9:
                        e_1 = _a.sent();
                        if (this.maintainer != null)
                            this.maintainer.emitEvent('GLOBUS_TRANSFER_INIT_FAILED', "cannot initialize Globus job");
                        throw new Error(e_1);
                    case 10:
                        monitorTransfer = function () { return __awaiter(_this, void 0, void 0, function () {
                            var status, e_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 4]);
                                        return [4 /*yield*/, GlobusUtil_1["default"].monitorTransfer(taskId, this.config)];
                                    case 1:
                                        status = _a.sent();
                                        return [2 /*return*/, status];
                                    case 2:
                                        e_2 = _a.sent();
                                        return [4 /*yield*/, monitorTransfer()]; // recursive
                                    case 3: return [2 /*return*/, _a.sent()]; // recursive
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); };
                        return [4 /*yield*/, monitorTransfer()];
                    case 11:
                        status = _a.sent();
                        if (status === 'FAILED') {
                            if (this.maintainer != null)
                                this.maintainer.emitEvent('GLOBUS_TRANSFER_FAILED', "Globus job with task ID ".concat(taskId, " failed"));
                            throw new Error('Globus transfer failed');
                        }
                        else {
                            if (this.maintainer != null)
                                this.maintainer.emitEvent('GLOBUS_TRANSFER_COMPLETE', "Globus job with task ID ".concat(taskId, " is complete"));
                        }
                        _a.label = 12;
                    case 12: return [3 /*break*/, 15];
                    case 13: return [4 /*yield*/, this.mkdir(this.remote_data_folder_path, {}, true)];
                    case 14:
                        _a.sent();
                        _a.label = 15;
                    case 15:
                        // result folder
                        if (this.maintainer != null)
                            this.maintainer.emitEvent('SLURM_MKDIR_RESULT', "creating result folder");
                        return [4 /*yield*/, this.mkdir(this.remote_result_folder_path, {}, true)];
                    case 16:
                        _a.sent();
                        if (this.maintainer != null)
                            this.maintainer.emitEvent('SLURM_SUBMIT', "submitting slurm job");
                        return [4 /*yield*/, this.exec("sbatch job.sbatch", {
                                cwd: this.remote_executable_folder_path
                            }, true, true)];
                    case 17:
                        sbatchResult = (_a.sent());
                        failed = false;
                        if (!sbatchResult.stdout)
                            failed = true;
                        else if (sbatchResult.stdout.includes('ERROR') || sbatchResult.stdout.includes('WARN'))
                            failed = true;
                        else if (!sbatchResult.stdout.includes('Submitted batch job '))
                            failed = true;
                        if (failed) {
                            if (this.maintainer != null)
                                this.maintainer.emitEvent('SLURM_SUBMIT_ERROR', 'cannot submit job ' + this.maintainer.id + ': ' + JSON.stringify(sbatchResult));
                            throw new errors_1.ConnectorError('cannot submit job ' + this.maintainer.id + ': ' + JSON.stringify(sbatchResult));
                        }
                        this.slurm_id = sbatchResult.stdout.split(/[ ]+/).pop().trim();
                        return [4 /*yield*/, this.maintainer.updateJob({ slurmId: this.slurm_id })];
                    case 18:
                        _a.sent();
                        if (this.maintainer != null)
                            this.maintainer.emitEvent('SLURM_SUBMIT_SUCCESS', "slurm job submitted with slurm job id ".concat(this.slurm_id));
                        return [2 /*return*/];
                }
            });
        });
    };
    // qstat:
    // Job id              Name             Username        Time Use S Queue          
    // ------------------- ---------------- --------------- -------- - ---------------
    // 3142249             singularity      cigi-gisolve    00:00:00 R node      
    //
    // squeue: https://slurm.schedmd.com/squeue.html
    // ['JOBID', 'PARTITION', 'NAME', 'USER', 'ST', 'TIME', 'NODES', 'NODELIST(REASON)']
    // ['3142135', 'node', 'singular', 'cigi-gis', 'R', '0:11', '1', 'keeling-b08']
    /**
     * @async
     * checks job status
     */
    SlurmConnector.prototype.getStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var squeueResult, r, i, qstatResult, r, i, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.exec("squeue --job ".concat(this.slurm_id), {}, true, true)];
                    case 1:
                        squeueResult = _a.sent();
                        if (!squeueResult.stderr && squeueResult.stdout) {
                            r = squeueResult.stdout.split(/[ |\n]+/);
                            i = r.indexOf(this.slurm_id);
                            return [2 /*return*/, i >= 0 ? r[i + 4] : 'UNKNOWN'];
                        }
                        return [4 /*yield*/, this.exec("qstat ".concat(this.slurm_id), {}, true, true)];
                    case 2:
                        qstatResult = _a.sent();
                        if (qstatResult.stdout) {
                            r = qstatResult.stdout.split(/[ |\n]+/);
                            i = r.indexOf(this.slurm_id);
                            return [2 /*return*/, i >= 0 ? r[i + 4] : 'UNKNOWN'];
                        }
                        return [2 /*return*/, 'RETRY'];
                    case 3:
                        e_3 = _a.sent();
                        return [2 /*return*/, 'RETRY'];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @async
     * cancels the job
     */
    SlurmConnector.prototype.cancel = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.exec("scancel ".concat(this.slurm_id), {}, true)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @async
     * pauses the job
     */
    SlurmConnector.prototype.pause = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.exec("scontrol suspend ".concat(this.slurm_id), {}, true)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @async
     * resumes the job
     */
    SlurmConnector.prototype.resume = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.exec("scontrol resume ".concat(this.slurm_id), {}, true)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @async
     * gets SlurmStdOut
     */
    SlurmConnector.prototype.getSlurmStdout = function () {
        return __awaiter(this, void 0, void 0, function () {
            var out;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cat(path.join(this.remote_result_folder_path, 'slurm_log', 'job.stdout'), {})];
                    case 1:
                        out = _a.sent();
                        if (this.maintainer && out)
                            this.maintainer.emitLog(out);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @async
     * gets SlurmStderr
     */
    SlurmConnector.prototype.getSlurmStderr = function () {
        return __awaiter(this, void 0, void 0, function () {
            var out;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cat(path.join(this.remote_result_folder_path, 'slurm_log', 'job.stderr'), {})];
                    case 1:
                        out = _a.sent();
                        if (this.maintainer && out)
                            this.maintainer.emitLog(out);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get sbatch tags
     *
     * @param{string} tag - sbatch tags
     * @param{string[]} vals - values of sbatch tags
     * @return{string} - sbatch string
     */
    SlurmConnector.prototype.getSBatchTagsFromArray = function (tag, vals) {
        if (!vals)
            return "";
        var out = "";
        for (var i in vals)
            out += "#SBATCH --".concat(tag, "=").concat(vals[i], "\n");
        return out;
    };
    /**
     * Get Container executable folder path
     *
     * @param{string} providedPath - specified path
     * @return{string} - executable path
     */
    SlurmConnector.prototype.getContainerExecutableFolderPath = function (providedPath) {
        if (providedPath === void 0) { providedPath = null; }
        if (providedPath)
            return path.join("/job/executable", providedPath);
        else
            return "/job/executable";
    };
    /**
     * Get Container data folder path
     *
     * @param{string} providedPath - specified path
     * @return{string} - executable path
     */
    SlurmConnector.prototype.getContainerDataFolderPath = function (providedPath) {
        if (providedPath === void 0) { providedPath = null; }
        if (providedPath)
            return path.join("/job/data", providedPath);
        else
            return "/job/data";
    };
    /**
     * Get Container result folder path
     *
     * @param{string} providedPath - specified path
     * @return{string} - executable path
     */
    SlurmConnector.prototype.getContainerResultFolderPath = function (providedPath) {
        if (providedPath === void 0) { providedPath = null; }
        if (providedPath)
            return path.join("/job/result", providedPath);
        else
            return "/job/result";
    };
    /**
     * @async
     * Get remote results folder content
     *
     * @param{string} providedPath - specified path
     * @return{string[]} - file content
     */
    SlurmConnector.prototype.getRemoteResultFolderContent = function () {
        return __awaiter(this, void 0, void 0, function () {
            var findResult, rawFiles, files, i, t, rawFile, skipFile, j, filePath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.exec("find . -type d -print", { cwd: this.getRemoteResultFolderPath() }, true, true)];
                    case 1:
                        findResult = _a.sent();
                        if (config_1.config.is_testing && findResult.stderr)
                            console.log(JSON.stringify(findResult)); // logging
                        if (!findResult.stdout)
                            return [2 /*return*/, []];
                        rawFiles = findResult.stdout.split('\n');
                        files = ['/'];
                        for (i in rawFiles) {
                            t = rawFiles[i].trim();
                            if (t[0] == '.')
                                t = t.replace('./', '');
                            rawFile = t.split('/');
                            skipFile = false;
                            for (j in rawFile) {
                                if (rawFile[j].startsWith('.')) {
                                    skipFile = true;
                                    break;
                                } // ignore invisible files
                            }
                            if (skipFile)
                                continue;
                            filePath = "/".concat(rawFile.join('/'));
                            if (!files.includes(filePath))
                                files.push(filePath);
                        }
                        return [2 /*return*/, files];
                }
            });
        });
    };
    /*
        Job ID: 558556
        Cluster: keeling7
        User/Group: cigi-gisolve/cigi-gisolve-group
        State: COMPLETED (exit code 0)
        Nodes: 2
        Cores per node: 2
        CPU Utilized: 00:00:02
        CPU Efficiency: 16.67% of 00:00:12 core-walltime
        Job Wall-clock time: 00:00:03
        Memory Utilized: 61.45 MB (estimated maximum)
        Memory Efficiency: 0.38% of 16.00 GB (4.00 GB/core)
     */
    /**
 * Get job usage
 *
 * @return{Object} - usage dictionary
 */
    SlurmConnector.prototype.getUsage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var seffOutput, seffResult, tmp, i, j, k, v, l, seconds, l, seconds, kb, units, isValid, i, i, unit, l, kb, units, isValid, i, i, unit, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        seffOutput = {
                            nodes: null,
                            cpus: null,
                            cpuTime: null,
                            memory: null,
                            memoryUsage: null,
                            walltime: null
                        };
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.exec("seff ".concat(this.slurm_id), {}, true, true)];
                    case 2:
                        seffResult = _b.sent();
                        if (seffResult.stderr)
                            return [2 /*return*/, seffOutput];
                        tmp = seffResult.stdout.split('\n');
                        //
                        for (i in tmp) {
                            j = tmp[i].split(':');
                            k = j[0].trim();
                            j.shift();
                            v = j.join(':').trim();
                            //
                            switch (k) {
                                case 'Nodes':
                                    seffOutput.nodes = parseInt(v);
                                case 'Cores per node':
                                    seffOutput.cpus = parseInt(v);
                                case 'CPU Utilized':
                                    l = v.split(':');
                                    if (l.length != 3)
                                        continue;
                                    seconds = parseInt(l[0]) * 60 * 60 + parseInt(l[1]) * 60 + parseInt(l[2]);
                                    seffOutput.cpuTime = seconds;
                                case 'Job Wall-clock time':
                                    l = v.split(':');
                                    if (l.length != 3)
                                        continue;
                                    seconds = parseInt(l[0]) * 60 * 60 + parseInt(l[1]) * 60 + parseInt(l[2]);
                                    seffOutput.walltime = seconds;
                                case 'Memory Utilized':
                                    v = v.toLowerCase();
                                    kb = parseFloat(v.substring(0, v.length - 2).trim());
                                    units = ['kb', 'mb', 'gb', 'tb', 'pb', 'eb'];
                                    isValid = false;
                                    for (i in units) {
                                        if (v.includes(i)) {
                                            isValid = true;
                                            break;
                                        }
                                    }
                                    if (!isValid)
                                        continue;
                                    for (i in units) {
                                        unit = units[i];
                                        if (v.includes(unit))
                                            break;
                                        kb = kb * 1024;
                                    }
                                    seffOutput.memoryUsage = kb;
                                case 'Memory Efficiency':
                                    v = v.toLowerCase();
                                    l = v.split('of');
                                    if (l.length != 2)
                                        continue;
                                    l = l[1].trim().split('(');
                                    if (l.length != 2)
                                        continue;
                                    v = l[0].trim();
                                    kb = parseFloat(v.substring(0, v.length - 2).trim());
                                    units = ['kb', 'mb', 'gb', 'tb', 'pb', 'eb'];
                                    isValid = false;
                                    for (i in units) {
                                        if (v.includes(i)) {
                                            isValid = true;
                                            break;
                                        }
                                    }
                                    if (!isValid)
                                        continue;
                                    for (i in units) {
                                        unit = units[i];
                                        if (v.includes(unit))
                                            break;
                                        kb = kb * 1024;
                                    }
                                    seffOutput.memory = kb;
                            }
                        }
                        //
                        if (seffOutput.cpus && seffOutput.nodes) {
                            seffOutput.cpus = seffOutput.cpus * seffOutput.nodes;
                        }
                        else {
                            seffOutput.cpus = null;
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, seffOutput];
                }
            });
        });
    };
    return SlurmConnector;
}(BaseConnector_1["default"]));
exports["default"] = SlurmConnector;
