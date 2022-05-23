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
Object.defineProperty(exports, "__esModule", { value: true });
var BaseMaintainer_1 = require("./BaseMaintainer");
var FileSystem_1 = require("../FileSystem");
var XSEDEUtil_1 = require("../lib/XSEDEUtil");
var JobUtil_1 = require("../lib/JobUtil");
var CommunityContributionMaintainer = (function (_super) {
    __extends(CommunityContributionMaintainer, _super);
    function CommunityContributionMaintainer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.resultFolderContentManager = new JobUtil_1.ResultFolderContentManager();
        return _this;
    }
    CommunityContributionMaintainer.prototype.onDefine = function () {
        this.connector = this.getSingularityConnector();
    };
    CommunityContributionMaintainer.prototype.onInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        _a = this;
                        return [4, this.executableFolder.getExecutableManifest()];
                    case 1:
                        _a.executableManifest = _b.sent();
                        this.connector.execExecutableManifestWithinImage(this.executableManifest, this.slurm);
                        return [4, this.connector.submit()];
                    case 2:
                        _b.sent();
                        this.emitEvent('JOB_INIT', 'job [' + this.id + '] is initialized, waiting for job completion');
                        XSEDEUtil_1.default.jobLog(this.connector.slurm_id, this.hpc, this.job);
                        return [3, 4];
                    case 3:
                        e_1 = _b.sent();
                        this.emitEvent('JOB_RETRY', 'job [' + this.id + '] encountered system error ' + e_1.toString());
                        return [3, 4];
                    case 4: return [2];
                }
            });
        });
    };
    CommunityContributionMaintainer.prototype.onMaintain = function () {
        return __awaiter(this, void 0, void 0, function () {
            var status, usage, contents, defaultResultFolderDownloadablePath, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 12, , 13]);
                        return [4, this.connector.getStatus()];
                    case 1:
                        status = _a.sent();
                        if (!(status == 'C' || status == 'CD' || status == 'UNKNOWN')) return [3, 10];
                        return [4, this.connector.getSlurmStdout()];
                    case 2:
                        _a.sent();
                        return [4, this.connector.getSlurmStderr()];
                    case 3:
                        _a.sent();
                        if (!(this.resultFolder instanceof FileSystem_1.LocalFolder)) return [3, 6];
                        return [4, this.connector.download(this.connector.getRemoteResultFolderPath(), this.resultFolder)];
                    case 4:
                        _a.sent();
                        return [4, this.updateJob({
                                resultFolder: this.resultFolder.getURL()
                            })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        this.emitEvent('JOB_ENDED', 'job [' + this.id + '] finished');
                        return [4, this.connector.getUsage()];
                    case 7:
                        usage = _a.sent();
                        this.updateJob(usage);
                        XSEDEUtil_1.default.jobLog(this.connector.slurm_id, this.hpc, this.job);
                        return [4, this.connector.getRemoteResultFolderContent()];
                    case 8:
                        contents = _a.sent();
                        defaultResultFolderDownloadablePath = this.executableManifest.default_result_folder_downloadable_path;
                        if (defaultResultFolderDownloadablePath) {
                            contents.sort(function (a, b) { return a == defaultResultFolderDownloadablePath ? -1 : b == defaultResultFolderDownloadablePath ? 1 : 0; });
                            if (defaultResultFolderDownloadablePath[0] != '/') {
                                defaultResultFolderDownloadablePath = "/".concat(defaultResultFolderDownloadablePath);
                                contents.sort(function (a, b) { return a == defaultResultFolderDownloadablePath ? -1 : b == defaultResultFolderDownloadablePath ? 1 : 0; });
                            }
                        }
                        return [4, this.resultFolderContentManager.put(this.id, contents)];
                    case 9:
                        _a.sent();
                        return [3, 11];
                    case 10:
                        if (status == 'ERROR' || status == 'F' || status == 'NF') {
                            this.emitEvent('JOB_FAILED', 'job [' + this.id + '] failed with status ' + status);
                        }
                        _a.label = 11;
                    case 11: return [3, 13];
                    case 12:
                        e_2 = _a.sent();
                        this.emitEvent('JOB_RETRY', 'job [' + this.id + '] encountered system error ' + e_2.toString());
                        return [3, 13];
                    case 13: return [2];
                }
            });
        });
    };
    CommunityContributionMaintainer.prototype.onPause = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.connector.pause()];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    CommunityContributionMaintainer.prototype.onResume = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.connector.resume()];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    CommunityContributionMaintainer.prototype.onCancel = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.connector.cancel()];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    return CommunityContributionMaintainer;
}(BaseMaintainer_1.default));
exports.default = CommunityContributionMaintainer;
