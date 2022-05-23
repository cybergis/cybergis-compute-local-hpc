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
exports.GitFolder = exports.LocalFolder = exports.GlobusFolder = exports.BaseFolder = exports.FileSystem = void 0;
var Helper_1 = require("./Helper");
var errors_1 = require("./errors");
var fs = require("fs");
var path = require("path");
var Git_1 = require("./models/Git");
var types_1 = require("./types");
var DB_1 = require("./DB");
var config_1 = require("../configs/config");
var child_process_async_1 = require("child-process-async");
var child_process_1 = require("child_process");
var rimraf = require("rimraf");
var FileSystem = (function () {
    function FileSystem() {
    }
    FileSystem.createClearLocalCacheProcess = function () {
        var cachePath = config_1.config.local_file_system.cache_path;
        setInterval(function () {
            try {
                fs.readdir(cachePath, function (err, files) {
                    if (!files)
                        return;
                    files.forEach(function (file, index) {
                        if (file != '.gitkeep') {
                            fs.stat(path.join(cachePath, file), function (err, stat) {
                                var endTime, now;
                                if (err)
                                    return console.error(err);
                                now = function () { return 'CURRENT_TIMESTAMP'; };
                                endTime = new Date(stat.ctime).getTime() + 3600000;
                                if (now > endTime)
                                    return rimraf(path.join(cachePath, file), function (err) { });
                            });
                        }
                    });
                });
            }
            catch (_a) { }
        }, 60 * 60 * 1000);
    };
    FileSystem.initGlobusTransfer = function (from, to, muteEvent) {
        if (muteEvent === void 0) { muteEvent = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (from == undefined || to == undefined)
                    throw new Error('please init input file first');
                return [2];
            });
        });
    };
    FileSystem.getFolderByURL = function (url, onlyAllow) {
        if (onlyAllow === void 0) { onlyAllow = null; }
        var u = url.split('://');
        if (onlyAllow) {
            if (typeof onlyAllow == 'string') {
                if (u[0] != onlyAllow)
                    throw new Error("file protocol ".concat(u[0], " is not allowed"));
            }
            else {
                if (!onlyAllow.includes(u[0]))
                    throw new Error("file protocol ".concat(u[0], " is not allowed"));
            }
        }
        return this.getFolder(u[0], u[1]);
    };
    FileSystem.getFolder = function (type, id) {
        if (type == 'local')
            return new LocalFolder(id);
        if (type == 'git')
            return new GitFolder(id);
        if (type == 'globus')
            return new GlobusFolder(id);
        throw new Error("cannot find file ".concat(type, "://").concat(id));
    };
    FileSystem.getLocalFolder = function (id) {
        return new LocalFolder(id);
    };
    FileSystem.getGitFolder = function (id) {
        return new GitFolder(id);
    };
    FileSystem.getGlobusFolder = function (id) {
        return new GlobusFolder(id);
    };
    FileSystem.getGlobusFolderByHPCConfig = function (hpcConfig, dir) {
        if (dir === void 0) { dir = ''; }
        if (!hpcConfig.globus)
            throw new Error("HPC does not have a globus account associated with it");
        var id = "".concat(hpcConfig.globus.endpoint, ":").concat(path.join(hpcConfig.globus.root_path, dir));
        return this.getGlobusFolder(id);
    };
    FileSystem.createLocalFolder = function (providedFileConfig) {
        if (providedFileConfig === void 0) { providedFileConfig = {}; }
        var id = this._generateID();
        var filePath = path.join(config_1.config.local_file_system.root_path, id);
        while (fs.existsSync(filePath)) {
            id = this._generateID();
            filePath = path.join(config_1.config.local_file_system.root_path, id);
        }
        fs.mkdirSync(filePath);
        if (providedFileConfig != {}) {
            var infoJSON = JSON.stringify({ config: providedFileConfig });
            fs.writeFileSync(path.join(filePath, '.file_config.json'), infoJSON);
        }
        return new LocalFolder(id);
    };
    FileSystem._generateID = function () {
        return Math.round((new Date()).getTime() / 1000) + Helper_1.default.randomStr(4);
    };
    return FileSystem;
}());
exports.FileSystem = FileSystem;
var BaseFolder = (function () {
    function BaseFolder(id) {
        this.id = id;
    }
    BaseFolder.prototype.validate = function () {
    };
    BaseFolder.prototype.getURL = function () {
        return "".concat(this.type, "://").concat(this.id);
    };
    return BaseFolder;
}());
exports.BaseFolder = BaseFolder;
var GlobusFolder = (function (_super) {
    __extends(GlobusFolder, _super);
    function GlobusFolder(id) {
        var _this = _super.call(this, id) || this;
        _this.type = 'globus';
        var i = _this.id.split(':');
        if (i.length != 2) {
            throw new Error('invalid folder url format [' + _this.getURL() + '] (ex. globus://endpoint:/path/to/file)');
        }
        _this.endpoint = i[0];
        _this.path = i[1];
        return _this;
    }
    return GlobusFolder;
}(BaseFolder));
exports.GlobusFolder = GlobusFolder;
var LocalFolder = (function (_super) {
    __extends(LocalFolder, _super);
    function LocalFolder(id) {
        var _this = _super.call(this, id) || this;
        _this.type = 'local';
        _this.isReadonly = false;
        _this.path = path.join(config_1.config.local_file_system.root_path, id);
        _this.fileConfig = _this._getFileConfig();
        return _this;
    }
    LocalFolder.prototype.validate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var files, mustHaveFiles, i, file, i, mustHave;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.exists()];
                    case 1:
                        if (!(_a.sent()))
                            throw new errors_1.FileNotExistError('file not exists or initialized');
                        return [4, fs.promises.readdir(this.path)];
                    case 2:
                        files = _a.sent();
                        mustHaveFiles = [];
                        for (i in files) {
                            file = files[i];
                            if (this.fileConfig.must_have.includes(file))
                                mustHaveFiles.push(file);
                        }
                        for (i in this.fileConfig.must_have) {
                            mustHave = this.fileConfig.must_have[i];
                            if (!mustHaveFiles.includes(mustHave))
                                throw new errors_1.FileStructureError("file [".concat(file, "] must be included"));
                        }
                        return [2];
                }
            });
        });
    };
    LocalFolder.prototype.exists = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4, fs.promises.access(this.path, fs.constants.F_OK)];
                    case 1:
                        _b.sent();
                        return [2, true];
                    case 2:
                        _a = _b.sent();
                        return [2, false];
                    case 3: return [2];
                }
            });
        });
    };
    LocalFolder.prototype.chmod = function (filePath, mode) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.exists()];
                    case 1:
                        if (!(_a.sent()))
                            throw new errors_1.FileNotExistError('file not exists or initialized');
                        if (this.isReadonly)
                            throw new Error('cannot write to a read only folder');
                        return [4, fs.promises.chmod(path.join(this.path, filePath), mode)];
                    case 2:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    LocalFolder.prototype.putFileFromZip = function (zipFilePath) {
        return __awaiter(this, void 0, void 0, function () {
            var child_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.exists()];
                    case 1:
                        if (!(_a.sent()))
                            throw new errors_1.FileNotExistError('file not exists or initialized');
                        if (this.isReadonly)
                            throw new Error('cannot write to a read only folder');
                        try {
                            child_1 = (0, child_process_1.spawn)("unzip", ['-o', '-q', "".concat(zipFilePath), '-d', "".concat(this.path)]);
                            return [2, new Promise(function (resolve, reject) {
                                    child_1.on('exit', function () { return resolve("".concat(_this.path, ".zip")); });
                                    child_1.on('close', function () { return resolve("".concat(_this.path, ".zip")); });
                                    child_1.on('error', function () { return reject("".concat(_this.path, ".zip")); });
                                })];
                        }
                        catch (e) {
                            throw new Error(e);
                        }
                        return [2];
                }
            });
        });
    };
    LocalFolder.prototype.putFileFromTemplate = function (template, replacements, filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var key, value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.exists()];
                    case 1:
                        if (!(_a.sent()))
                            throw new errors_1.FileNotExistError('file not exists or initialized');
                        if (this.isReadonly)
                            throw new Error('cannot write to a read only folder');
                        for (key in replacements) {
                            value = replacements[key];
                            template = template.replace("{{".concat(key, "}}"), value);
                        }
                        return [4, this.putFileFromString(template, filePath)];
                    case 2:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    LocalFolder.prototype.putFileFromString = function (content, filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var fileName, fileParentPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.exists()];
                    case 1:
                        if (!(_a.sent()))
                            throw new errors_1.FileNotExistError('file not exists or initialized');
                        if (this.isReadonly)
                            throw new Error('cannot write to a read only folder');
                        fileName = path.basename(filePath);
                        filePath = path.join(this.path, filePath);
                        if (this.fileConfig.ignore_everything_except_must_have && !this.fileConfig.must_have.includes(fileName))
                            return [2];
                        if (!this.fileConfig.ignore_everything_except_must_have && this.fileConfig.ignore.includes(fileName))
                            return [2];
                        fileParentPath = path.dirname(filePath);
                        if (!!fs.existsSync(fileParentPath)) return [3, 3];
                        return [4, fs.promises.mkdir(fileParentPath, { recursive: true })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4, fs.promises.writeFile(filePath, content, {
                            mode: 493
                        })];
                    case 4:
                        _a.sent();
                        return [4, this.removeZip()];
                    case 5:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    LocalFolder.prototype.putFolder = function (folderPath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.exists()];
                    case 1:
                        if (!(_a.sent()))
                            throw new errors_1.FileNotExistError('file not exists or initialized');
                        if (this.isReadonly)
                            throw new Error('cannot write to a read only folder');
                        folderPath = path.join(this.path, folderPath);
                        if (!!fs.existsSync(folderPath)) return [3, 3];
                        return [4, fs.promises.mkdir(folderPath, { recursive: true })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2];
                }
            });
        });
    };
    LocalFolder.prototype.isZipped = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4, fs.promises.access(this.path + '.zip', fs.constants.F_OK)];
                    case 1:
                        _b.sent();
                        return [2, true];
                    case 2:
                        _a = _b.sent();
                        return [2, false];
                    case 3: return [2];
                }
            });
        });
    };
    LocalFolder.prototype.removeZip = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.isZipped()];
                    case 1:
                        if (!_a.sent()) return [3, 3];
                        return [4, fs.promises.unlink(this.path + '.zip')];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2];
                }
            });
        });
    };
    LocalFolder.prototype.getZip = function () {
        return __awaiter(this, void 0, void 0, function () {
            var child_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.path)
                            throw new Error('getZip operation is not supported');
                        return [4, this.isZipped()];
                    case 1:
                        if (_a.sent())
                            return [2, this.path + '.zip'];
                        try {
                            child_2 = (0, child_process_1.spawn)("zip", ['-q', '-r', "".concat(this.path, ".zip"), '.', "".concat(path.basename(this.path))], { cwd: this.path });
                            return [2, new Promise(function (resolve, reject) {
                                    child_2.on('exit', function () { return resolve("".concat(_this.path, ".zip")); });
                                    child_2.on('close', function () { return resolve("".concat(_this.path, ".zip")); });
                                    child_2.on('error', function () { return reject("".concat(_this.path, ".zip")); });
                                })];
                        }
                        catch (e) {
                            throw new Error(e);
                        }
                        return [2];
                }
            });
        });
    };
    LocalFolder.prototype._getFileConfig = function () {
        var fileConfig = {
            ignore: ['.placeholder', '.DS_Store', '.file_config.json'],
            must_have: [],
            ignore_everything_except_must_have: false
        };
        var configPath = path.join(this.path, '.file_config.json');
        if (fs.existsSync(configPath)) {
            var providedFileConfig = require(configPath);
            if (providedFileConfig != undefined) {
                if (providedFileConfig.ignore != undefined)
                    fileConfig.ignore.concat(providedFileConfig.ignore);
                if (providedFileConfig.must_have != undefined)
                    fileConfig.must_have = providedFileConfig.must_have;
                if (providedFileConfig.ignore_everything_except_must_have != undefined) {
                    fileConfig.ignore_everything_except_must_have = providedFileConfig.ignore_everything_except_must_have;
                }
            }
        }
        return fileConfig;
    };
    return LocalFolder;
}(BaseFolder));
exports.LocalFolder = LocalFolder;
var GitFolder = (function (_super) {
    __extends(GitFolder, _super);
    function GitFolder(id) {
        var _this = _super.call(this, id) || this;
        _this.db = new DB_1.default();
        _this.type = 'git';
        _this.isReadonly = true;
        return _this;
    }
    GitFolder.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var connection, gitRepo, _a, _b, e_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 18, , 19]);
                        return [4, this.db.connect()];
                    case 1:
                        connection = _c.sent();
                        gitRepo = connection.getRepository(Git_1.Git);
                        _a = this;
                        return [4, gitRepo.findOne(this.id)];
                    case 2:
                        _a.git = _c.sent();
                        if (!this.git)
                            throw new Error("cannot find git folder with url ".concat(this.getURL()));
                        if (!!fs.existsSync(this.path)) return [3, 5];
                        return [4, fs.promises.mkdir(this.path)];
                    case 3:
                        _c.sent();
                        return [4, (0, child_process_async_1.exec)("cd ".concat(this.path, " && git clone ").concat(this.git.address, " ").concat(this.path))];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5: return [4, this.removeZip()];
                    case 6:
                        _c.sent();
                        if (!this.git.sha) return [3, 14];
                        _c.label = 7;
                    case 7:
                        _c.trys.push([7, 9, , 13]);
                        return [4, (0, child_process_async_1.exec)("cd ".concat(this.path, " && git checkout ").concat(this.git.sha))];
                    case 8:
                        _c.sent();
                        return [3, 13];
                    case 9:
                        _b = _c.sent();
                        rimraf.sync(this.path);
                        return [4, fs.promises.mkdir(this.path)];
                    case 10:
                        _c.sent();
                        return [4, (0, child_process_async_1.exec)("cd ".concat(this.path, " && git clone ").concat(this.git.address, " ").concat(this.path))];
                    case 11:
                        _c.sent();
                        return [4, (0, child_process_async_1.exec)("cd ".concat(this.path, " && git checkout ").concat(this.git.sha))];
                    case 12:
                        _c.sent();
                        return [3, 13];
                    case 13: return [3, 16];
                    case 14: return [4, (0, child_process_async_1.exec)("cd ".concat(this.path, " && git pull"))];
                    case 15:
                        _c.sent();
                        _c.label = 16;
                    case 16: return [4, this._readExecutableManifest()];
                    case 17:
                        _c.sent();
                        return [3, 19];
                    case 18:
                        e_1 = _c.sent();
                        throw new Error("initialization failed with error: ".concat(e_1.toString()));
                    case 19: return [2];
                }
            });
        });
    };
    GitFolder.prototype.getExecutableManifest = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, this.init()];
                    case 1:
                        _a.sent();
                        return [3, 3];
                    case 2:
                        e_2 = _a.sent();
                        throw new Error(e_2);
                    case 3: return [2, this.executableManifest];
                }
            });
        });
    };
    GitFolder.prototype.getZip = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4, this.init()];
                    case 1:
                        _a.sent();
                        return [4, _super.prototype.getZip.call(this)];
                    case 2: return [2, _a.sent()];
                    case 3:
                        e_3 = _a.sent();
                        throw new Error(e_3);
                    case 4: return [2];
                }
            });
        });
    };
    GitFolder.prototype._readExecutableManifest = function () {
        return __awaiter(this, void 0, void 0, function () {
            var executableFolderPath, rawExecutableManifest, i, j, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        executableFolderPath = path.join(this.path, 'manifest.json');
                        return [4, fs.promises.readFile(executableFolderPath)];
                    case 1:
                        rawExecutableManifest = (_a.sent()).toString();
                        this.executableManifest = Object.assign({
                            name: undefined,
                            container: undefined,
                            pre_processing_stage: undefined,
                            execution_stage: undefined,
                            post_processing_stage: undefined,
                            description: 'none',
                            estimated_runtime: 'unknown',
                            supported_hpc: ['keeling_community'],
                            default_hpc: undefined,
                            repository: this.git.address,
                            require_upload_data: false,
                            slurm_input_rules: {},
                            param_rules: {}
                        }, JSON.parse(rawExecutableManifest));
                        if (!this.executableManifest.default_hpc) {
                            this.executableManifest.default_hpc = this.executableManifest.supported_hpc[0];
                        }
                        for (i in this.executableManifest.slurm_input_rules) {
                            if (!types_1.slurm_configs.includes(i)) {
                                delete this.executableManifest.slurm_input_rules[i];
                                continue;
                            }
                            if (!this.executableManifest.slurm_input_rules[i].default_value) {
                                delete this.executableManifest.slurm_input_rules[i];
                                continue;
                            }
                            j = this.executableManifest.slurm_input_rules[i];
                            if (types_1.slurm_integer_time_unit_config.includes(i) && !(['Minutes', 'Hours', 'Days'].includes(j.unit))) {
                                delete this.executableManifest.slurm_input_rules[i];
                                continue;
                            }
                            if (types_1.slurm_integer_storage_unit_config.includes(i) && !(['GB', 'MB'].includes(j.unit))) {
                                delete this.executableManifest.slurm_input_rules[i];
                                continue;
                            }
                            if (types_1.slurm_integer_none_unit_config.includes(i)) {
                                this.executableManifest.slurm_input_rules[i].unit = 'None';
                                continue;
                            }
                            if (types_1.slurm_integer_configs.includes(i)) {
                                if (!this.executableManifest.slurm_input_rules[i].max) {
                                    this.executableManifest.slurm_input_rules[i].max = this.executableManifest.slurm_input_rules[i].default_value * 2;
                                }
                                if (!this.executableManifest.slurm_input_rules[i].min) {
                                    this.executableManifest.slurm_input_rules[i].min = 0;
                                }
                                if (!this.executableManifest.slurm_input_rules[i].step) {
                                    this.executableManifest.slurm_input_rules[i].step = 1;
                                }
                            }
                            if (types_1.slurm_string_option_configs.includes(i)) {
                                if (!this.executableManifest.slurm_input_rules[i].options) {
                                    this.executableManifest.slurm_input_rules[i].options = [
                                        this.executableManifest.slurm_input_rules[i].default_value
                                    ];
                                }
                                if (!this.executableManifest.slurm_input_rules[i].options.includes(this.executableManifest.slurm_input_rules[i].default_value)) {
                                    this.executableManifest.slurm_input_rules[i].options.push(this.executableManifest.slurm_input_rules[i].default_value);
                                }
                            }
                        }
                        for (i in this.executableManifest.param_rules) {
                            if (!this.executableManifest.param_rules[i].default_value) {
                                delete this.executableManifest.param_rules[i];
                                continue;
                            }
                            if (!['integer', 'string_option', 'string_input'].includes(this.executableManifest.param_rules[i].type)) {
                                delete this.executableManifest.param_rules[i];
                                continue;
                            }
                            if (this.executableManifest.param_rules[i].type == 'integer') {
                                if (!this.executableManifest.param_rules[i].max) {
                                    this.executableManifest.param_rules[i].max = this.executableManifest.param_rules[i].default_value * 2;
                                }
                                if (!this.executableManifest.param_rules[i].min) {
                                    this.executableManifest.param_rules[i].min = 0;
                                }
                                if (!this.executableManifest.param_rules[i].step) {
                                    this.executableManifest.param_rules[i].step = 1;
                                }
                            }
                            if (this.executableManifest.param_rules[i].type == 'string_option') {
                                if (!this.executableManifest.param_rules[i].options) {
                                    this.executableManifest.param_rules[i].options = [
                                        this.executableManifest.param_rules[i].default_value
                                    ];
                                }
                                if (!this.executableManifest.param_rules[i].options.includes(this.executableManifest.param_rules[i].default_value)) {
                                    this.executableManifest.param_rules[i].options.push(this.executableManifest.param_rules[i].default_value);
                                }
                            }
                        }
                        return [2];
                }
            });
        });
    };
    return GitFolder;
}(LocalFolder));
exports.GitFolder = GitFolder;
