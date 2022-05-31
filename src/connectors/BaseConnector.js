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
var errors_1 = require("../errors");
var DB_1 = require("../DB");
var path = require("path");
var BaseConnector = /** @class */ (function () {
    function BaseConnector(job, hpcConfig, maintainer, env) {
        if (env === void 0) { env = {}; }
        this.db = new DB_1["default"]();
        this.envCmd = '#!/bin/bash\n';
        this.jobID = job.id;
        this.hpcName = job.hpc;
        this.config = hpcConfig;
        this.maintainer = maintainer;
        var envCmd = 'source /etc/profile;';
        for (var i in env) {
            var v = env[i];
            envCmd += "export ".concat(i, "=").concat(v, ";\n");
        }
        this.envCmd = envCmd;
        this.remote_executable_folder_path = path.join(this.config.root_path, this.maintainer.id, 'executable');
        this.remote_data_folder_path = path.join(this.config.root_path, this.maintainer.id, 'data');
        this.remote_result_folder_path = path.join(this.config.root_path, this.maintainer.id, 'result');
    }
    /** actions **/
    /**
     Returns ssh connection from maintainer configuration
     */
    BaseConnector.prototype.ssh = function () {
        if (this.config.is_community_account) {
            return this.maintainer.supervisor.jobSSHPool[this.hpcName];
        }
        else {
            return this.maintainer.supervisor.jobSSHPool[this.jobID];
        }
    };
    /**
     * @async
     * Executes the command on the maintainer and returns the outpt
     *
     * @param {string} commands - command/commands that need to be executed
     * @param {string} options - execution options
     * @param {boolean} muteEvent - set to True if you want to mute maintauner emitted Event
     * @param {boolean} muteLog - set to True if you want to mute maintainer emitted Log
     * @param {boolean} continueOnError - set to True if you want the command/commands to continue despite errors
     * @return {Object} out - maintainer output
     *
     */
    BaseConnector.prototype.exec = function (commands, options, muteEvent, muteLog, continueOnError) {
        if (options === void 0) { options = {}; }
        if (muteEvent === void 0) { muteEvent = true; }
        if (muteLog === void 0) { muteLog = true; }
        if (continueOnError === void 0) { continueOnError = false; }
        return __awaiter(this, void 0, void 0, function () {
            var out, maintainer, opt, _a, _b, _i, i, command;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        out = {
                            stdout: null,
                            stderr: null
                        };
                        maintainer = this.maintainer;
                        options = Object.assign({
                            cwd: this.config.root_path
                        }, options);
                        if (typeof commands == 'string') {
                            commands = [commands];
                        }
                        opt = Object.assign({
                            onStdout: function (o) {
                                o = o.toString();
                                if (out.stdout === null)
                                    out.stdout = o;
                                else
                                    out.stdout += o;
                                if (maintainer && !muteLog)
                                    maintainer.emitLog(o);
                            },
                            onStderr: function (o) {
                                o = o.toString();
                                if (out.stderr === null)
                                    out.stderr = o;
                                else
                                    out.stderr += o;
                                if (maintainer && !muteLog)
                                    maintainer.emitLog(o);
                                if (maintainer && !muteEvent)
                                    maintainer.emitEvent('SSH_STDERR', o);
                            }
                        }, options);
                        _a = [];
                        for (_b in commands)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        i = _a[_i];
                        command = commands[i].trim();
                        if (this.maintainer && !muteEvent)
                            this.maintainer.emitEvent('SSH_RUN', 'running command [' + command + ']');
                        return [4 /*yield*/, this.ssh().connection.execCommand(this.envCmd + command, opt)];
                    case 2:
                        _c.sent();
                        if (out.stderr && !continueOnError)
                            return [3 /*break*/, 4]; // behavior similar to &&
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, out];
                }
            });
        });
    };
    /** file operators **/
    /**
     * @aysnc
     * Uncompresses the specified zip file to the Local folder
     *
     * @param{string} from - input file string
     * @param{LocalFolder} to - output folder
     * @param {boolean} muteEvent - set to True if you want to mute maintauner emitted Event
     * @throws {ConnectorError} - Thrown if maintainer emits 'SSH_SCP_DOWNLOAD_ERROR'
     */
    BaseConnector.prototype.download = function (from, to, muteEvent) {
        if (muteEvent === void 0) { muteEvent = false; }
        return __awaiter(this, void 0, void 0, function () {
            var fromZipFilePath, toZipFilePath, e_1, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (to == undefined)
                            throw new errors_1.ConnectorError('please init input file first');
                        fromZipFilePath = from.endsWith('.zip') ? from : "".concat(from, ".zip");
                        toZipFilePath = "".concat(to.path, ".zip");
                        return [4 /*yield*/, this.zip(from, fromZipFilePath)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 7]);
                        if (this.maintainer && !muteEvent)
                            this.maintainer.emitEvent('SSH_SCP_DOWNLOAD', "get file from ".concat(from, " to ").concat(to.path));
                        return [4 /*yield*/, this.ssh().connection.getFile(toZipFilePath, fromZipFilePath)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.rm(fromZipFilePath)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, to.putFileFromZip(toZipFilePath)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        e_1 = _a.sent();
                        error = "unable to get file from ".concat(from, " to ").concat(to.path, ": ") + e_1.toString();
                        if (this.maintainer && !muteEvent)
                            this.maintainer.emitEvent('SSH_SCP_DOWNLOAD_ERROR', error);
                        throw new errors_1.ConnectorError(error);
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @aysnc
     * Compresses the contents of the LocalFolder to the specified zip file
     *
     * @param{string} from - input file string
     * @param{LocalFolder} to - output folder
     * @param {boolean} muteEvent - set to True if you want to mute maintauner emitted Event
     * @throws {ConnectorError} - Thrown if maintainer emits 'SSH_SCP_DOWNLOAD_ERROR'
     */
    BaseConnector.prototype.upload = function (from, to, muteEvent) {
        if (muteEvent === void 0) { muteEvent = false; }
        return __awaiter(this, void 0, void 0, function () {
            var fromZipFilePath, toZipFilePath, toFilePath, e_2, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (from == undefined)
                            throw new errors_1.ConnectorError('please init input file first');
                        return [4 /*yield*/, from.getZip()];
                    case 1:
                        fromZipFilePath = _a.sent();
                        toZipFilePath = to.endsWith('.zip') ? to : "".concat(to, ".zip");
                        toFilePath = to.endsWith('.zip') ? to.replace('.zip', '') : to;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        if (this.maintainer && !muteEvent)
                            this.maintainer.emitEvent('SSH_SCP_UPLOAD', "put file from ".concat(from.path, " to ").concat(to));
                        return [4 /*yield*/, this.ssh().connection.putFile(fromZipFilePath, toZipFilePath)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_2 = _a.sent();
                        error = "unable to put file from ".concat(fromZipFilePath, " to ").concat(toZipFilePath, ": ") + e_2.toString();
                        if (this.maintainer && !muteEvent)
                            this.maintainer.emitEvent('SSH_SCP_UPLOAD_ERROR', error);
                        throw new errors_1.ConnectorError(error);
                    case 5: return [4 /*yield*/, this.unzip(toZipFilePath, toFilePath)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.rm(toZipFilePath)];
                    case 7:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /** helpers **/
    /**
     * @aysnc
     * Returns the homeDirectory path
     *
     * @param{Object} options - dictionary with string options
     * @return{Object} - returns command execution output
     */
    // getters
    BaseConnector.prototype.homeDirectory = function (options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var out;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.exec('cd ~;pwd;', options)];
                    case 1:
                        out = _a.sent();
                        return [2 /*return*/, out.stdout];
                }
            });
        });
    };
    /**
     * @aysnc
     * Returns the username
     *
     * @param{Object} options - dictionary with string options
     * @return{Object} - returns command execution output
     */
    BaseConnector.prototype.whoami = function (options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var out;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.exec('whoami;', options)];
                    case 1:
                        out = _a.sent();
                        return [2 /*return*/, out.stdout];
                }
            });
        });
    };
    /**
     * @aysnc
     * Returns the specified path
     *
     * @param{string} path - execution path
     * @param{Object} options - dictionary with string options
     * @return{Object} - returns command execution output
     */
    BaseConnector.prototype.pwd = function (path, options) {
        if (path === void 0) { path = undefined; }
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var cmd, out;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cmd = 'pwd;';
                        if (path)
                            cmd = 'cd ' + path + ';' + cmd;
                        return [4 /*yield*/, this.exec(cmd, options)];
                    case 1:
                        out = _a.sent();
                        return [2 /*return*/, out.stdout];
                }
            });
        });
    };
    /**
     * @aysnc
     * Returns all of the files/directories in specified path
     *
     * @param{string} path - specified path
     * @param{Object} options - dictionary with string options
     * @return{Object} - returns command execution output
     */
    BaseConnector.prototype.ls = function (path, options) {
        if (path === void 0) { path = undefined; }
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var cmd, out;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cmd = 'ls;';
                        if (path)
                            cmd = 'cd ' + path + ';' + cmd;
                        return [4 /*yield*/, this.exec(cmd, options)];
                    case 1:
                        out = _a.sent();
                        return [2 /*return*/, out.stdout];
                }
            });
        });
    };
    /**
     * @aysnc
     * creates an empty file at specified path
     *
     * @param(string) path - specified path with filename
     * @param(Object) options - dictionary with string options
     * @return(Object) returns - command execution output
     */
    BaseConnector.prototype.cat = function (path, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var cmd, out;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cmd = 'cat ' + path;
                        return [4 /*yield*/, this.exec(cmd, options)];
                    case 1:
                        out = _a.sent();
                        return [2 /*return*/, out.stdout];
                }
            });
        });
    };
    // file operators
    /**
     * @aysnc
     * removes the file/folder at specified path
     *
     * @param(string) path - specified path with filename
     * @param(Object) options - dictionary with string options
     * @param {boolean} muteEvent - set to True if you want to mute maintauner emitted Event
     * @return(Object) returns - command execution output
     */
    BaseConnector.prototype.rm = function (path, options, muteEvent) {
        if (options === void 0) { options = {}; }
        if (muteEvent === void 0) { muteEvent = false; }
        return __awaiter(this, void 0, void 0, function () {
            var out;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.maintainer && !muteEvent)
                            this.maintainer.emitEvent('SSH_RM', "removing ".concat(path));
                        return [4 /*yield*/, this.exec("rm -rf ".concat(path, ";"), options)];
                    case 1:
                        out = _a.sent();
                        return [2 /*return*/, out.stdout];
                }
            });
        });
    };
    /**
     * @aysnc
     * creates directory at specified path
     *
     * @param(string) path - specified path with filename
     * @param(Object) options - dictionary with string options
     * @param {boolean} muteEvent - set to True if you want to mute maintauner emitted Event
     * @return(Object) returns - command execution output
     */
    BaseConnector.prototype.mkdir = function (path, options, muteEvent) {
        if (options === void 0) { options = {}; }
        if (muteEvent === void 0) { muteEvent = false; }
        return __awaiter(this, void 0, void 0, function () {
            var out;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.maintainer && !muteEvent)
                            this.maintainer.emitEvent('SSH_MKDIR', "removing ".concat(path));
                        return [4 /*yield*/, this.exec("mkdir -p ".concat(path, ";"), options)];
                    case 1:
                        out = _a.sent();
                        return [2 /*return*/, out.stdout];
                }
            });
        });
    };
    /**
     * @aysnc
     * zips the file/directory at specified path
     *
     * @param(string) from - input file/directory path
     * @param(string) to - compress file path with file name
     * @param(Object) options - dictionary with string options
     * @param {boolean} muteEvent - set to True if you want to mute maintauner emitted Event
     * @return(Object) returns - command execution output
     */
    BaseConnector.prototype.zip = function (from, to, options, muteEvent) {
        if (options === void 0) { options = {}; }
        if (muteEvent === void 0) { muteEvent = false; }
        return __awaiter(this, void 0, void 0, function () {
            var out;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.maintainer && !muteEvent)
                            this.maintainer.emitEvent('SSH_ZIP', "zipping ".concat(from, " to ").concat(to));
                        return [4 /*yield*/, this.exec("zip -q -r ".concat(to, " . ").concat(path.basename(from)), Object.assign({
                                cwd: from
                            }, options))];
                    case 1:
                        out = _a.sent();
                        return [2 /*return*/, out.stdout];
                }
            });
        });
    };
    /**
     * @aysnc
     * unzips the file/folder at specified path
     *
     * @param(string) from - input file/directory path
     * @param(string) to - compress file path with file name
     * @param(Object) options - dictionary with string options
     * @param {boolean} muteEvent - set to True if you want to mute maintauner emitted Event
     * @return(Object) returns - command execution output
     */
    BaseConnector.prototype.unzip = function (from, to, options, muteEvent) {
        if (options === void 0) { options = {}; }
        if (muteEvent === void 0) { muteEvent = false; }
        return __awaiter(this, void 0, void 0, function () {
            var out;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.maintainer && !muteEvent)
                            this.maintainer.emitEvent('SSH_UNZIP', "unzipping ".concat(from, " to ").concat(to));
                        return [4 /*yield*/, this.exec("unzip -o -q ".concat(from, " -d ").concat(to), options)];
                    case 1:
                        out = _a.sent();
                        return [2 /*return*/, out.stdout];
                }
            });
        });
    };
    /**
     * @aysnc
     * tars the file/directory at specified path
     *
     * @param(string) from - input file/directory path
     * @param(string) to - compress file path with file name
     * @param(Object) options - dictionary with string options
     * @param {boolean} muteEvent - set to True if you want to mute maintauner emitted Event
     * @return(Object) returns - command execution output
     */
    BaseConnector.prototype.tar = function (from, to, options, muteEvent) {
        if (options === void 0) { options = {}; }
        if (muteEvent === void 0) { muteEvent = false; }
        return __awaiter(this, void 0, void 0, function () {
            var out;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.maintainer && !muteEvent)
                            this.maintainer.emitEvent('SSH_TAR', "taring ".concat(from, " to ").concat(to));
                        to = to.endsWith('.tar') ? to : to + '.tar';
                        return [4 /*yield*/, this.exec("tar cf ".concat(to, " *"), Object.assign({
                                cwd: from
                            }, options))];
                    case 1:
                        out = _a.sent();
                        return [2 /*return*/, out.stdout];
                }
            });
        });
    };
    /**
     * @aysnc
     * untars the file/directory at specified path
     *
     * @param(string) from - input file/directory path
     * @param(string) to - compress file path with file name
     * @param(Object) options - dictionary with string options
     * @param {boolean} muteEvent - set to True if you want to mute maintauner emitted Event
     * @return(Object) returns - command execution output
     */
    BaseConnector.prototype.untar = function (from, to, options, muteEvent) {
        if (options === void 0) { options = {}; }
        if (muteEvent === void 0) { muteEvent = false; }
        return __awaiter(this, void 0, void 0, function () {
            var out;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.maintainer && !muteEvent)
                            this.maintainer.emitEvent('SSH_UNTAR', "untaring ".concat(from, " to ").concat(to));
                        return [4 /*yield*/, this.exec("tar -C ".concat(to, " -xvf ").concat(from), options)];
                    case 1:
                        out = _a.sent();
                        return [2 /*return*/, out.stdout];
                }
            });
        });
    };
    /**
     * @aysnc
     * creates file with specified content
     *
     * @param(string) content - file content
     * @param(string) path - specified path with filename
     * @param(Object) options - dictionary with string options
     * @param {boolean} muteEvent - set to True if you want to mute maintauner emitted Event
     * @return(Object) returns - command execution output
     */
    BaseConnector.prototype.createFile = function (content, path, options, muteEvent) {
        if (options === void 0) { options = {}; }
        if (muteEvent === void 0) { muteEvent = false; }
        return __awaiter(this, void 0, void 0, function () {
            var out;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.maintainer && !muteEvent)
                            this.maintainer.emitEvent('SSH_CREATE_FILE', "create file to ".concat(path));
                        if (typeof content != 'string') {
                            content = JSON.stringify(content).replace(/(["'])/g, "\\$1");
                        }
                        else {
                            content = content.replace(/(["'])/g, "\\$1");
                        }
                        return [4 /*yield*/, this.exec("touch ".concat(path, "; echo \"").concat(content, "\" >> ").concat(path), options, true)];
                    case 1:
                        out = _a.sent();
                        return [2 /*return*/, out.stdout];
                }
            });
        });
    };
    /**
     * @aysnc
     * gets remote executable folder path
     *
     * @param(string) providedPath - specified path
     * @return(Object) returns - command execution output
     */
    BaseConnector.prototype.getRemoteExecutableFolderPath = function (providedPath) {
        if (providedPath === void 0) { providedPath = null; }
        if (providedPath)
            return path.join(this.remote_executable_folder_path, providedPath);
        else
            return this.remote_executable_folder_path;
    };
    /**
     * @aysnc
     * gets remote data folder path
     *
     * @param(string) providedPath - specified path
     * @return(Object) returns - command execution output
     */
    BaseConnector.prototype.getRemoteDataFolderPath = function (providedPath) {
        if (providedPath === void 0) { providedPath = null; }
        if (providedPath)
            return path.join(this.remote_data_folder_path, providedPath);
        else
            return this.remote_data_folder_path;
    };
    /**
     * @aysnc
     * gets remote result folder path
     *
     * @param(string) providedPath - specified path
     * @return(Object) returns - command execution output
     */
    BaseConnector.prototype.getRemoteResultFolderPath = function (providedPath) {
        if (providedPath === void 0) { providedPath = null; }
        if (providedPath)
            return path.join(this.remote_result_folder_path, providedPath);
        else
            return this.remote_result_folder_path;
    };
    return BaseConnector;
}());
exports["default"] = BaseConnector;
