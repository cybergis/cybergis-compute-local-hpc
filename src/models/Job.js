"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.Job = void 0;
var typeorm_1 = require("typeorm");
var Event_1 = require("./Event");
var Log_1 = require("./Log");
/** Class representing a job. */
var Job = /** @class */ (function () {
    function Job() {
    }
    /**
     * Set the createdAt time to the current time.
     *
     * @async
     * @return {Date} date - Date this job was created.
     */
    Job.prototype.setCreatedAt = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.createdAt = new Date();
                return [2 /*return*/];
            });
        });
    };
    /**
     * Set the updatedAt time to the current time.
     *
     * @async
     * @return {Date} date - Date this job was last updated.
     */
    Job.prototype.setUpdatedAt = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.updatedAt = new Date()];
            });
        });
    };
    /**
     * Sorts the logs in the order that they were created
     *
     * @return {None} None - Updates this.logs
     */
    Job.prototype.sortLogs = function () {
        if (this.logs) {
            if (this.logs.length) {
                this.logs.sort(function (a, b) { return (a.createdAt < b.createdAt ? -1 : a.createdAt === b.createdAt ? 0 : 1); });
            }
        }
        else {
            this.logs = [];
        }
    };
    /**
     * Sorts the events in the order that they were created
     *
     * @return {None} None - Updates this.events
     */
    Job.prototype.sortEvents = function () {
        if (this.events) {
            if (this.events.length) {
                this.events.sort(function (a, b) { return (a.createdAt < b.createdAt ? -1 : a.createdAt === b.createdAt ? 0 : 1); });
            }
        }
        else {
            this.events = [];
        }
    };
    __decorate([
        (0, typeorm_1.PrimaryColumn)()
    ], Job.prototype, "id");
    __decorate([
        (0, typeorm_1.Column)({ nullable: true, "default": null })
    ], Job.prototype, "userId");
    __decorate([
        (0, typeorm_1.Column)()
    ], Job.prototype, "secretToken");
    __decorate([
        (0, typeorm_1.Column)()
    ], Job.prototype, "maintainer");
    __decorate([
        (0, typeorm_1.Column)()
    ], Job.prototype, "hpc");
    __decorate([
        (0, typeorm_1.Column)("text", { nullable: true, "default": null })
    ], Job.prototype, "executableFolder");
    __decorate([
        (0, typeorm_1.Column)("text", { nullable: true, "default": null })
    ], Job.prototype, "dataFolder");
    __decorate([
        (0, typeorm_1.Column)("text", { nullable: true, "default": null })
    ], Job.prototype, "resultFolder");
    __decorate([
        (0, typeorm_1.Column)({ type: "text", nullable: true, "default": null, transformer: {
                to: function (i) { return i ? JSON.stringify(i) : null; },
                from: function (i) { return typeof i == 'string' ? JSON.parse(i) : i; }
            } })
    ], Job.prototype, "param");
    __decorate([
        (0, typeorm_1.Column)({ type: "text", nullable: true, "default": null, transformer: {
                to: function (i) { return i ? JSON.stringify(i) : null; },
                from: function (i) { return typeof i == 'string' ? JSON.parse(i) : i; }
            } })
    ], Job.prototype, "env");
    __decorate([
        (0, typeorm_1.Column)({ type: "text", nullable: true, "default": null, transformer: {
                to: function (i) { return i ? JSON.stringify(i) : null; },
                from: function (i) { return typeof i == 'string' ? JSON.parse(i) : i; }
            } })
    ], Job.prototype, "slurm");
    __decorate([
        (0, typeorm_1.Column)({ nullable: true, "default": null })
    ], Job.prototype, "slurmId");
    __decorate([
        (0, typeorm_1.Column)({ nullable: true, "default": null })
    ], Job.prototype, "credentialId");
    __decorate([
        (0, typeorm_1.OneToMany)(function (type) { return Event_1.Event; }, function (event) { return event.job; })
    ], Job.prototype, "events");
    __decorate([
        (0, typeorm_1.OneToMany)(function (type) { return Log_1.Log; }, function (log) { return log.job; })
    ], Job.prototype, "logs");
    __decorate([
        (0, typeorm_1.Column)({ type: 'bigint', transformer: {
                to: function (i) { return i ? i.getTime() : null; },
                from: function (i) { return i ? new Date(i) : null; }
            } })
    ], Job.prototype, "createdAt");
    __decorate([
        (0, typeorm_1.Column)({ type: 'bigint', nullable: true, transformer: {
                to: function (i) { return i ? i.getTime() : null; },
                from: function (i) { return i ? new Date(i) : null; }
            } })
    ], Job.prototype, "updatedAt");
    __decorate([
        (0, typeorm_1.DeleteDateColumn)({ type: 'bigint', nullable: true, transformer: {
                to: function (i) { return i ? i.getTime() : null; },
                from: function (i) { return i ? new Date(i) : null; }
            } })
    ], Job.prototype, "deletedAt");
    __decorate([
        (0, typeorm_1.Column)({ type: 'bigint', nullable: true, transformer: {
                to: function (i) { return i ? i.getTime() : null; },
                from: function (i) { return i ? new Date(i) : null; }
            } })
    ], Job.prototype, "initializedAt");
    __decorate([
        (0, typeorm_1.Column)({ type: 'bigint', nullable: true, transformer: {
                to: function (i) { return i ? i.getTime() : null; },
                from: function (i) { return i ? new Date(i) : null; }
            } })
    ], Job.prototype, "finishedAt");
    __decorate([
        (0, typeorm_1.Column)({ type: 'bigint', nullable: true, transformer: {
                to: function (i) { return i ? i.getTime() : null; },
                from: function (i) { return i ? new Date(i) : null; }
            } })
    ], Job.prototype, "queuedAt");
    __decorate([
        (0, typeorm_1.BeforeInsert)()
    ], Job.prototype, "setCreatedAt");
    __decorate([
        (0, typeorm_1.BeforeUpdate)()
    ], Job.prototype, "setUpdatedAt");
    __decorate([
        (0, typeorm_1.Column)({ "default": false })
    ], Job.prototype, "isFailed");
    __decorate([
        (0, typeorm_1.Column)({ nullable: true, "default": null })
    ], Job.prototype, "nodes");
    __decorate([
        (0, typeorm_1.Column)({ nullable: true, "default": null })
    ], Job.prototype, "cpus");
    __decorate([
        (0, typeorm_1.Column)({ nullable: true, "default": null })
    ], Job.prototype, "cpuTime");
    __decorate([
        (0, typeorm_1.Column)({ nullable: true, "default": null })
    ], Job.prototype, "memory");
    __decorate([
        (0, typeorm_1.Column)({ nullable: true, "default": null })
    ], Job.prototype, "memoryUsage");
    __decorate([
        (0, typeorm_1.Column)({ nullable: true, "default": null })
    ], Job.prototype, "walltime");
    __decorate([
        (0, typeorm_1.AfterLoad)()
    ], Job.prototype, "sortLogs");
    __decorate([
        (0, typeorm_1.AfterLoad)()
    ], Job.prototype, "sortEvents");
    Job = __decorate([
        (0, typeorm_1.Entity)({ name: "jobs" })
    ], Job);
    return Job;
}());
exports.Job = Job;
