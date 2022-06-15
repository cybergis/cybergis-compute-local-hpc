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
var Queue_1 = require("./Queue");
var Emitter_1 = require("./Emitter");
var Job_1 = require("./models/Job");
var config_1 = require("../configs/config");
var events = require("events");
var NodeSSH = require("node-ssh");
var DB_1 = require("./DB");
var Supervisor = (function () {
    function Supervisor() {
        this.db = new DB_1.default();
        this.jobPoolCapacities = {};
        this.jobCommunitySSHCounters = {};
        this.jobPoolCounters = {};
        this.jobSSHPool = {};
        this.queues = {};
        this.emitter = new Emitter_1.default();
        this.maintainerMasterThread = null;
        this.maintainerMasterEventEmitter = new events.EventEmitter();
        this.queueConsumeTimePeriodInSeconds = config_1.config.queue_consume_time_period_in_seconds;
        this.actionQueue = {};
        for (var hpcName in config_1.hpcConfigMap) {
            var hpcConfig = config_1.hpcConfigMap[hpcName];
            this.jobPoolCapacities[hpcName] = hpcConfig.job_pool_capacity;
            this.jobPoolCounters[hpcName] = 0;
            this.queues[hpcName] = new Queue_1.default(hpcName);
            if (!hpcConfig.is_community_account)
                continue;
            this.jobCommunitySSHCounters[hpcName] = 0;
            var sshConfig = {
                host: hpcConfig.ip,
                port: hpcConfig.port,
                username: hpcConfig.community_login.user
            };
            if (hpcConfig.community_login.use_local_key) {
                sshConfig.privateKey = config_1.config.local_key.private_key_path;
                if (config_1.config.local_key.passphrase)
                    sshConfig.passphrase = config_1.config.local_key.passphrase;
            }
            else {
                sshConfig.privateKey = hpcConfig.community_login.external_key.private_key_path;
                if (hpcConfig.community_login.external_key.passphrase)
                    sshConfig.passphrase = hpcConfig.community_login.external_key.passphrase;
            }
            this.jobSSHPool[hpcName] = {
                connection: new NodeSSH(),
                config: sshConfig
            };
        }
        this.createMaintainerMaster();
    }
    Supervisor.prototype.createMaintainerMaster = function () {
        var _this = this;
        var self = this;
        this.maintainerMasterThread = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, _i, hpcName, _c, job, maintainer, e_1, connection, hpcConfig;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = [];
                        for (_b in self.jobPoolCounters)
                            _a.push(_b);
                        _i = 0;
                        _d.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3, 12];
                        hpcName = _a[_i];
                        _d.label = 2;
                    case 2:
                        _c = self.jobPoolCounters[hpcName] < self.jobPoolCapacities[hpcName];
                        if (!_c) return [3, 4];
                        return [4, self.queues[hpcName].isEmpty()];
                    case 3:
                        _c = !(_d.sent());
                        _d.label = 4;
                    case 4:
                        if (!_c) return [3, 11];
                        return [4, self.queues[hpcName].shift()];
                    case 5:
                        job = _d.sent();
                        if (!job)
                            return [3, 2];
                        maintainer = require("./maintainers/".concat(config_1.maintainerConfigMap[job.maintainer].maintainer)).default;
                        _d.label = 6;
                    case 6:
                        _d.trys.push([6, 7, , 10]);
                        job.maintainerInstance = new maintainer(job, self);
                        return [3, 10];
                    case 7:
                        e_1 = _d.sent();
                        self.emitter.registerEvents(job, 'JOB_INIT_ERROR', "job [".concat(job.id, "] failed to initialized with error ").concat(e_1.toString()));
                        job.finishedAt = new Date();
                        return [4, self.db.connect()];
                    case 8:
                        connection = _d.sent();
                        return [4, connection.createQueryBuilder()
                                .update(Job_1.Job)
                                .where('id = :id', { id: job.id })
                                .set({ finishedAt: job.finishedAt })
                                .execute()];
                    case 9:
                        _d.sent();
                        return [3, 2];
                    case 10:
                        self.jobPoolCounters[hpcName]++;
                        if (job.maintainerInstance.connector.config.is_community_account) {
                            self.jobCommunitySSHCounters[job.hpc]++;
                        }
                        else {
                            hpcConfig = config_1.hpcConfigMap[job.hpc];
                            self.jobSSHPool[job.id] = {
                                connection: new NodeSSH(),
                                config: {
                                    host: hpcConfig.ip,
                                    port: hpcConfig.port,
                                    username: job.credential.user,
                                    password: job.credential.password,
                                    readyTimeout: 1000
                                }
                            };
                        }
                        self.emitter.registerEvents(job, 'JOB_REGISTERED', "job [".concat(job.id, "] is registered with the supervisor, waiting for initialization"));
                        this.createMaintainerWorker(job);
                        return [3, 2];
                    case 11:
                        _i++;
                        return [3, 1];
                    case 12: return [2];
                }
            });
        }); }, this.queueConsumeTimePeriodInSeconds * 1000);
        this.maintainerMasterEventEmitter.on('job_end', function (hpcName, jobName) {
            if (config_1.config.is_testing)
                console.log("received job_end event from ".concat(jobName));
            self.jobPoolCounters[hpcName]--;
        });
    };
    Supervisor.prototype.createMaintainerWorker = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            var self, ssh, e_2, events, logs, j, j;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        _a.label = 1;
                    case 1:
                        if (!true) return [3, 19];
                        if (job.maintainerInstance.connector.config.is_community_account) {
                            ssh = self.jobSSHPool[job.hpc];
                        }
                        else {
                            ssh = self.jobSSHPool[job.id];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 10, , 11]);
                        if (!!ssh.connection.isConnected()) return [3, 4];
                        return [4, ssh.connection.connect(ssh.config)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [4, ssh.connection.execCommand('sbatch --wrap="uptime"')];
                    case 5:
                        _a.sent();
                        this.emitter.registerEvents(job, 'JOB_REGISTERED', 'SSH Connection is working');
                        if (!job.maintainerInstance.isInit) return [3, 7];
                        return [4, job.maintainerInstance.maintain()];
                    case 6:
                        _a.sent();
                        return [3, 9];
                    case 7: return [4, job.maintainerInstance.init()];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9: return [3, 11];
                    case 10:
                        e_2 = _a.sent();
                        if (config_1.config.is_testing)
                            console.error(e_2.stack);
                        return [3, 1];
                    case 11:
                        events = job.maintainerInstance.dumpEvents();
                        logs = job.maintainerInstance.dumpLogs();
                        for (j in events)
                            self.emitter.registerEvents(job, events[j].type, events[j].message);
                        for (j in logs)
                            self.emitter.registerLogs(job, logs[j]);
                        if (!job.maintainerInstance.isEnd) return [3, 18];
                        if (!job.maintainerInstance.connector.config.is_community_account) return [3, 14];
                        self.jobCommunitySSHCounters[job.hpc]--;
                        if (!(self.jobCommunitySSHCounters[job.hpc] === 0)) return [3, 13];
                        if (!ssh.connection.isConnected()) return [3, 13];
                        return [4, ssh.connection.dispose()];
                    case 12:
                        _a.sent();
                        _a.label = 13;
                    case 13: return [3, 17];
                    case 14:
                        if (!ssh.connection.isConnected()) return [3, 16];
                        return [4, ssh.connection.dispose()];
                    case 15:
                        _a.sent();
                        _a.label = 16;
                    case 16:
                        delete self.jobSSHPool[job.id];
                        _a.label = 17;
                    case 17:
                        this.maintainerMasterEventEmitter.emit('job_end', job.hpc, job.id);
                        return [2];
                    case 18: return [3, 1];
                    case 19: return [2];
                }
            });
        });
    };
    Supervisor.prototype.pushJobToQueue = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.queues[job.hpc].push(job)];
                    case 1:
                        _a.sent();
                        this.emitter.registerEvents(job, 'JOB_QUEUED', 'job [' + job.id + '] is queued, waiting for registration');
                        return [2];
                }
            });
        });
    };
    Supervisor.prototype.destroy = function () {
        clearInterval(this.maintainerMasterThread);
    };
    return Supervisor;
}());
exports.default = Supervisor;
