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
var Guard_1 = require("./src/Guard");
var Supervisor_1 = require("./src/Supervisor");
var Git_1 = require("./src/models/Git");
var FileSystem_1 = require("./src/FileSystem");
var Helper_1 = require("./src/Helper");
var config_1 = require("./configs/config");
var GlobusUtil_1 = require("./src/lib/GlobusUtil");
var express = require("express");
var Job_1 = require("./src/models/Job");
var JupyterHub_1 = require("./src/JupyterHub");
var DB_1 = require("./src/DB");
var Statistic_1 = require("./src/Statistic");
var path = require("path");
var JobUtil_1 = require("./src/lib/JobUtil");
var swaggerUI = require('swagger-ui-express');
var swaggerDocument = require('../production/swagger.json');
var bodyParser = require('body-parser');
var Validator = require('jsonschema').Validator;
var fileUpload = require('express-fileupload');
var morgan = require('morgan');
var app = express();
app.use(bodyParser.json());
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({
    limits: { fileSize: config_1.config.local_file_system.limit_in_mb * 1024 * 1024 },
    useTempFiles: true,
    abortOnLimit: true,
    tempFileDir: config_1.config.local_file_system.cache_path,
    safeFileNames: true,
    limitHandler: function (req, res, next) {
        res.json({ error: "file too large" });
        res.status(402);
    }
}));
var guard = new Guard_1["default"]();
var supervisor = new Supervisor_1["default"]();
var validator = new Validator();
var db = new DB_1["default"]();
var globusTaskList = new GlobusUtil_1.GlobusTaskListManager();
var resultFolderContent = new JobUtil_1.ResultFolderContentManager();
var jupyterHub = new JupyterHub_1["default"]();
var statistic = new Statistic_1["default"]();
app.use(function (req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!req.body.jupyterhubApiToken) return [3 /*break*/, 5];
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 4, , 5]);
                    _a = res.locals;
                    return [4 /*yield*/, jupyterHub.getUsername(req.body.jupyterhubApiToken)];
                case 2:
                    _a.username = _d.sent();
                    _b = res.locals;
                    return [4 /*yield*/, jupyterHub.getHost(req.body.jupyterhubApiToken)];
                case 3:
                    _b.host = _d.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _c = _d.sent();
                    return [3 /*break*/, 5];
                case 5:
                    next();
                    return [2 /*return*/];
            }
        });
    });
});
FileSystem_1.FileSystem.createClearLocalCacheProcess();
var schemas = {
    user: {
        type: 'object',
        properties: {
            jupyterhubApiToken: { type: 'string' }
        },
        required: ['jupyterhubApiToken']
    },
    updateJob: {
        type: 'object',
        properties: {
            accessToken: { type: 'string' },
            jupyterhubApiToken: { type: 'string' },
            param: { type: 'object' },
            env: { type: 'object' },
            slurm: { type: 'object' },
            executableFolder: { type: 'string' },
            dataFolder: { type: 'string' },
            resultFolder: { type: 'string' }
        },
        required: ['accessToken']
    },
    createJob: {
        type: 'object',
        properties: {
            jupyterhubApiToken: { type: 'string' },
            maintainer: { type: 'string' },
            hpc: { type: 'string' },
            user: { type: 'string' },
            password: { type: 'string' }
        },
        required: []
    },
    getJob: {
        type: 'object',
        properties: {
            jupyterhubApiToken: { type: 'string' },
            accessToken: { type: 'string' },
            hpc: { type: 'string' }
        },
        required: []
    },
    downloadResultFolderLocal: {
        type: 'object',
        properties: {
            jupyterhubApiToken: { type: 'string' },
            accessToken: { type: 'string' }
        },
        required: ['accessToken']
    },
    downloadResultFolderGlobus: {
        type: 'object',
        properties: {
            jupyterhubApiToken: { type: 'string' },
            accessToken: { type: 'string' },
            downloadTo: { type: 'string' },
            downloadFrom: { type: 'string' }
        },
        required: ['accessToken', 'downloadTo', 'downloadFrom']
    },
    getFile: {
        type: 'object',
        properties: {
            jupyterhubApiToken: { type: 'string' },
            accessToken: { type: 'string' },
            fileUrl: { type: 'string' }
        },
        required: ['accessToken', 'fileUrl']
    }
};
function requestErrors(v) {
    if (v.valid)
        return [];
    var errors = [];
    for (var i in v.errors)
        errors.push(v.errors[i].message);
    return errors;
}
function setDefaultValues(data, defaults) {
    for (var k in defaults) {
        if (data[k] == undefined)
            data[k] = defaults[k];
    }
    return data;
}
app.use('/ts-docs', express.static('production/tsdoc'));
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
// index
app.get('/', function (req, res) {
    res.json({ message: 'hello world' });
});
// statistic
app.get('/statistic', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _b = (_a = res).json;
                _c = {};
                return [4 /*yield*/, statistic.getRuntimeTotal()];
            case 1:
                _b.apply(_a, [(_c.runtime_in_seconds = _d.sent(), _c)]);
                return [2 /*return*/];
        }
    });
}); });
/**
 * /:
 *  get:
 *      description: Get the runtime for a specific job.
 *      responses:
 *          200:
 *              descrption: Returns the runtime for the specified job.
 *          401:
 *              description: Returns a list of errors rasied when validating the job access token.
 *          402:
 *              description: Returns a list of errors with the format of the req body.
 *
 */
app.get('/statistic/job/:jobId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var body, errors, job, e_1, _a, _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                body = req.body;
                errors = requestErrors(validator.validate(body, schemas.getJob));
                if (errors.length > 0) {
                    res.json({ error: "invalid input", messages: errors });
                    res.status(402);
                    return [2 /*return*/];
                }
                _d.label = 1;
            case 1:
                _d.trys.push([1, 3, , 4]);
                return [4 /*yield*/, guard.validateJobAccessToken(body.accessToken)];
            case 2:
                job = _d.sent();
                return [3 /*break*/, 4];
            case 3:
                e_1 = _d.sent();
                res.json({ error: "invalid access token", messages: [e_1.toString()] });
                res.status(401);
                return [2 /*return*/];
            case 4:
                _b = (_a = res).json;
                _c = {};
                return [4 /*yield*/, statistic.getRuntimeByJobId(job.id)];
            case 5:
                _b.apply(_a, [(_c.runtime_in_seconds = _d.sent(), _c)]);
                return [2 /*return*/];
        }
    });
}); });
// user
/**
 * /:
 *  get:
 *      description: Returns the current user's username.
 *      responses:
 *          200:
 *              description: Returns the current user's username.
 *          402:
 *              description: Returns a list of errors with the format of the req body if there are any, or "invalid token" if there is no user logged in.
 */
app.get('/user', function (req, res) {
    var body = req.body;
    var errors = requestErrors(validator.validate(body, schemas.user));
    if (errors.length > 0) {
        res.json({ error: "invalid input", messages: errors });
        res.status(402);
        return;
    }
    if (!res.locals.username) {
        res.json({ error: "invalid token" });
        res.status(402);
        return;
    }
    res.json({ username: res.locals.username });
});
/**
  * @openapi
  * /user/jupyter-globus:
  *  get:
  *      description: Returns the jupyter-globus endpoint, root path and container home path
  *      responses:
  *          200:
  *              description: Returns the jupyter-globus endpoint, root path and container home path.
  *          402:
  *              description: Returns a list of errors with the format of the req body along with "invalid input" if there are any, or "invalid token" if there is no user logged in.
  *          404:
  *              description: Returns "unknown host" if jupyter-globus cannot be found in local hosts.
  */
app.get('/user/jupyter-globus', function (req, res) {
    var body = req.body;
    var errors = requestErrors(validator.validate(body, schemas.user));
    if (errors.length > 0) {
        res.json({ error: "invalid input", messages: errors });
        res.status(402);
        return;
    }
    if (!res.locals.username) {
        res.json({ error: "invalid token" });
        res.status(402);
        return;
    }
    var jupyterGlobus = config_1.jupyterGlobusMap[res.locals.host];
    if (!jupyterGlobus) {
        res.json({ error: "unknown host" });
        res.status(404);
        return;
    }
    res.json({
        endpoint: jupyterGlobus.endpoint,
        root_path: path.join(jupyterGlobus.root_path, res.locals.username.split('@')[0]),
        container_home_path: jupyterGlobus.container_home_path
    });
});
/**
  * @openapi
  * /user/job:
  *  get:
  *      description: Returns all of the jobs for the current user.
  *      responses:
  *          200:
  *              description: Returns all of the jobs for the current user.
  *          402:
  *              description: Returns a list of errors with the format of the req body along with "invalid input" if there are any, or "invalid token" if there is no user logged in.
  */
app.get('/user/job', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var body, errors, connection, jobs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = req.body;
                errors = requestErrors(validator.validate(body, schemas.user));
                if (errors.length > 0) {
                    res.json({ error: "invalid input", messages: errors });
                    res.status(402);
                    return [2 /*return*/];
                }
                if (!res.locals.username) {
                    res.json({ error: "invalid token" });
                    res.status(402);
                    return [2 /*return*/];
                }
                return [4 /*yield*/, db.connect()];
            case 1:
                connection = _a.sent();
                return [4 /*yield*/, connection
                        .getRepository(Job_1.Job)
                        .find({ userId: res.locals.username })];
            case 2:
                jobs = _a.sent();
                res.json({ job: Helper_1["default"].job2object(jobs) });
                return [2 /*return*/];
        }
    });
}); });
/**
  * @openapi
  * /user/slurm-usage:
  *  get:
  *      description: Returns slurm usage for the current user
  *      responses:
  *          200:
  *              description: Returns slurm usage for the current user
  *          402:
  *              description: Returns a list of errors with the format of the req body along with "invalid input" if there are any, or "invalid token" if there is no user logged in.
  */
app.get('/user/slurm-usage', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var body, errors, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                body = req.body;
                errors = requestErrors(validator.validate(body, schemas.user));
                if (errors.length > 0) {
                    res.json({ error: "invalid input", messages: errors });
                    res.status(402);
                    return [2 /*return*/];
                }
                if (!res.locals.username) {
                    res.json({ error: "invalid token" });
                    res.status(402);
                    return [2 /*return*/];
                }
                _b = (_a = res).json;
                return [4 /*yield*/, JobUtil_1["default"].getUserSlurmUsage(res.locals.username, true)];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [2 /*return*/];
        }
    });
}); });
/**
  * @openapi
  * /hpc:
  *  get:
  *      description: Returns current hpcConfig
  *      responses:
  *          200:
  *              description: Returns current hpcConfig
  */
app.get('/hpc', function (req, res) {
    var parseHPC = function (dest) {
        var out = {};
        for (var i in dest) {
            var d = JSON.parse(JSON.stringify(dest[i])); // hard copy
            delete d.init_sbatch_script;
            delete d.init_sbatch_options;
            delete d.community_login;
            delete d.root_path;
            out[i] = d;
        }
        return out;
    };
    res.json({ hpc: parseHPC(config_1.hpcConfigMap) });
});
/**
  * @openapi
  * /maintainer:
  *  get:
  *      description: Returns current maintainerConfig
  *      responses:
  *          200:
  *              description: Returns current maintainerConfig
  */
app.get('/maintainer', function (req, res) {
    var parseMaintainer = function (dest) {
        var out = {};
        for (var i in dest) {
            var d = JSON.parse(JSON.stringify(dest[i])); // hard copy
            out[i] = d;
        }
        return out;
    };
    res.json({ maintainer: parseMaintainer(config_1.maintainerConfigMap) });
});
/**
  * @openapi
  * /maintainer:
  *  get:
  *      description: Returns current containerConfig
  *      responses:
  *          200:
  *              description: Returns current containerConfig
  */
app.get('/container', function (req, res) {
    var parseContainer = function (dest) {
        var out = {};
        for (var i in dest) {
            var d = JSON.parse(JSON.stringify(dest[i])); // hard copy
            if (!(i in ['dockerfile', 'dockerhub'])) {
                out[i] = d;
            }
        }
        return out;
    };
    res.json({ container: parseContainer(config_1.containerConfigMap) });
});
app.get('/git', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var parseGit, connection, gitRepo, gits, _a, _b;
        var _c;
        var _this = this;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    parseGit = function (dest) { return __awaiter(_this, void 0, void 0, function () {
                        var out, _a, _b, _i, i, gitFolder, _c, _d, e_2;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    out = {};
                                    _a = [];
                                    for (_b in dest)
                                        _a.push(_b);
                                    _i = 0;
                                    _e.label = 1;
                                case 1:
                                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                                    i = _a[_i];
                                    gitFolder = new FileSystem_1.GitFolder(dest[i].id);
                                    _e.label = 2;
                                case 2:
                                    _e.trys.push([2, 4, , 5]);
                                    _c = out;
                                    _d = dest[i].id;
                                    return [4 /*yield*/, gitFolder.getExecutableManifest()];
                                case 3:
                                    _c[_d] = _e.sent();
                                    return [3 /*break*/, 5];
                                case 4:
                                    e_2 = _e.sent();
                                    console.error("cannot clone git: ".concat(e_2.toString()));
                                    return [3 /*break*/, 5];
                                case 5:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 6: return [2 /*return*/, out];
                            }
                        });
                    }); };
                    return [4 /*yield*/, db.connect()];
                case 1:
                    connection = _d.sent();
                    gitRepo = connection.getRepository(Git_1.Git);
                    return [4 /*yield*/, gitRepo.find({
                            order: {
                                id: "DESC"
                            }
                        })];
                case 2:
                    gits = _d.sent();
                    _b = (_a = res).json;
                    _c = {};
                    return [4 /*yield*/, parseGit(gits)];
                case 3:
                    _b.apply(_a, [(_c.git = _d.sent(), _c)]);
                    return [2 /*return*/];
            }
        });
    });
});
// TODO: remove after new versions, back compatibility
app.get('/file', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var body, errors, job, e_3, folder, dir, taskId, hpcConfig, from, taskId, status, e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = req.body;
                    errors = requestErrors(validator.validate(body, schemas.getFile));
                    if (errors.length > 0) {
                        res.json({ error: "invalid input", messages: errors });
                        res.status(402);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, guard.validateJobAccessToken(body.accessToken)];
                case 2:
                    job = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_3 = _a.sent();
                    res.json({ error: "invalid access token", messages: [e_3.toString()] });
                    res.status(401);
                    return [2 /*return*/];
                case 4:
                    if (!job.finishedAt) {
                        res.json({ error: "job is not finished, please try it later" });
                        res.status(402);
                        return [2 /*return*/];
                    }
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 16, , 17]);
                    folder = FileSystem_1.FileSystem.getFolderByURL(body.fileUrl, ['local', 'globus']);
                    if (!(folder instanceof FileSystem_1.LocalFolder)) return [3 /*break*/, 7];
                    return [4 /*yield*/, folder.getZip()];
                case 6:
                    dir = _a.sent();
                    res.download(dir);
                    return [3 /*break*/, 15];
                case 7:
                    if (!(folder instanceof FileSystem_1.GlobusFolder)) return [3 /*break*/, 15];
                    return [4 /*yield*/, globusTaskList.get(job.id)];
                case 8:
                    taskId = _a.sent();
                    if (!!taskId) return [3 /*break*/, 11];
                    hpcConfig = config_1.hpcConfigMap[job.hpc];
                    from = FileSystem_1.FileSystem.getGlobusFolderByHPCConfig(config_1.hpcConfigMap[job.hpc], "".concat(job.id, "/result"));
                    return [4 /*yield*/, GlobusUtil_1["default"].initTransfer(from, folder, hpcConfig, job.id)];
                case 9:
                    taskId = _a.sent();
                    return [4 /*yield*/, globusTaskList.put(job.id, taskId)];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11: return [4 /*yield*/, GlobusUtil_1["default"].queryTransferStatus(taskId, config_1.hpcConfigMap[job.hpc])];
                case 12:
                    status = _a.sent();
                    if (!['SUCCEEDED', 'FAILED'].includes(status)) return [3 /*break*/, 14];
                    return [4 /*yield*/, globusTaskList.remove(job.id)];
                case 13:
                    _a.sent();
                    _a.label = 14;
                case 14:
                    res.json({ task_id: taskId, status: status });
                    _a.label = 15;
                case 15: return [3 /*break*/, 17];
                case 16:
                    e_4 = _a.sent();
                    res.json({ error: "cannot get file by url [".concat(body.fileUrl, "]"), messages: [e_4.toString()] });
                    res.status(402);
                    return [2 /*return*/];
                case 17: return [2 /*return*/];
            }
        });
    });
});
// file
app.post('/file', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var body, errors, job, e_5, maintainerConfig, fileConfig, file, e_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (res.statusCode == 402)
                        return [2 /*return*/];
                    body = req.body;
                    errors = requestErrors(validator.validate(body, schemas.getJob));
                    if (errors.length > 0) {
                        res.json({ error: "invalid input", messages: errors });
                        res.status(402);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, guard.validateJobAccessToken(body.accessToken)];
                case 2:
                    job = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_5 = _a.sent();
                    res.json({ error: "invalid access token", messages: [e_5.toString()] });
                    res.status(401);
                    return [2 /*return*/];
                case 4:
                    _a.trys.push([4, 8, , 9]);
                    maintainerConfig = config_1.maintainerConfigMap[job.maintainer];
                    if (!maintainerConfig.executable_folder.from_user) return [3 /*break*/, 7];
                    fileConfig = maintainerConfig.executable_folder.file_config;
                    return [4 /*yield*/, FileSystem_1.FileSystem.createLocalFolder(fileConfig)];
                case 5:
                    file = _a.sent();
                    return [4 /*yield*/, file.putFileFromZip(req.files.file.tempFilePath)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    res.json({ file: file.getURL() });
                    return [3 /*break*/, 9];
                case 8:
                    e_6 = _a.sent();
                    res.json({ error: e_6.toString() });
                    res.status(402);
                    return [2 /*return*/];
                case 9: return [2 /*return*/];
            }
        });
    });
});
app.get('/file/result-folder/direct-download', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var body, errors, job, e_7, folder, dir, e_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = req.body;
                    errors = requestErrors(validator.validate(body, schemas.downloadResultFolderLocal));
                    if (errors.length > 0) {
                        res.json({ error: "invalid input", messages: errors });
                        res.status(402);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, guard.validateJobAccessToken(body.accessToken)];
                case 2:
                    job = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_7 = _a.sent();
                    res.json({ error: "invalid access token", messages: [e_7.toString()] });
                    res.status(401);
                    return [2 /*return*/];
                case 4:
                    if (!job.finishedAt) {
                        res.json({ error: "job is not finished, please try it later" });
                        res.status(402);
                        return [2 /*return*/];
                    }
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    folder = FileSystem_1.FileSystem.getLocalFolder(job.resultFolder);
                    return [4 /*yield*/, folder.getZip()];
                case 6:
                    dir = _a.sent();
                    res.download(dir);
                    return [3 /*break*/, 8];
                case 7:
                    e_8 = _a.sent();
                    res.json({ error: "cannot get file by url [".concat(body.fileUrl, "]"), messages: [e_8.toString()] });
                    res.status(402);
                    return [2 /*return*/];
                case 8: return [2 /*return*/];
            }
        });
    });
});
app.get('/file/result-folder/globus-download', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var body, errors, job, e_9, to, downloadFromPath, taskId, hpcConfig, from, taskId, status, e_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = req.body;
                    errors = requestErrors(validator.validate(body, schemas.downloadResultFolderGlobus));
                    if (errors.length > 0) {
                        res.json({ error: "invalid input", messages: errors });
                        res.status(402);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, guard.validateJobAccessToken(body.accessToken)];
                case 2:
                    job = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_9 = _a.sent();
                    res.json({ error: "invalid access token", messages: [e_9.toString()] });
                    res.status(401);
                    return [2 /*return*/];
                case 4:
                    if (!job.finishedAt) {
                        res.json({ error: "job is not finished, please try it later" });
                        res.status(402);
                        return [2 /*return*/];
                    }
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 14, , 15]);
                    to = FileSystem_1.FileSystem.getFolderByURL(body.downloadTo);
                    downloadFromPath = body.downloadFrom;
                    if (downloadFromPath[0] == '/')
                        downloadFromPath = downloadFromPath.replace('/', '');
                    return [4 /*yield*/, globusTaskList.get(job.id)];
                case 6:
                    taskId = _a.sent();
                    if (!!taskId) return [3 /*break*/, 10];
                    if (!(to instanceof FileSystem_1.GlobusFolder)) return [3 /*break*/, 9];
                    hpcConfig = config_1.hpcConfigMap[job.hpc];
                    to.path = path.join(to.path, downloadFromPath);
                    downloadFromPath = path.join("".concat(job.id, "/result"), downloadFromPath);
                    from = FileSystem_1.FileSystem.getGlobusFolderByHPCConfig(config_1.hpcConfigMap[job.hpc], downloadFromPath);
                    return [4 /*yield*/, GlobusUtil_1["default"].initTransfer(from, to, hpcConfig, job.id)];
                case 7:
                    taskId = _a.sent();
                    return [4 /*yield*/, globusTaskList.put(job.id, taskId)];
                case 8:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 9:
                    res.json({ error: "invalid file url", messages: [] });
                    res.status(402);
                    return [2 /*return*/];
                case 10: return [4 /*yield*/, GlobusUtil_1["default"].queryTransferStatus(taskId, config_1.hpcConfigMap[job.hpc])];
                case 11:
                    status = _a.sent();
                    if (!['SUCCEEDED', 'FAILED'].includes(status)) return [3 /*break*/, 13];
                    return [4 /*yield*/, globusTaskList.remove(job.id)];
                case 12:
                    _a.sent();
                    _a.label = 13;
                case 13:
                    console.log("Job Id: ".concat(job.id, ", Task Id: ").concat(taskId, ", HPC: ").concat(config_1.hpcConfigMap[job.hpc].globus.identity, " Globus Status: ").concat(status));
                    res.json({ task_id: taskId, status: status });
                    return [3 /*break*/, 15];
                case 14:
                    e_10 = _a.sent();
                    res.json({ error: "cannot get file by url [".concat(body.fileUrl, "]"), messages: [e_10.toString()] });
                    res.status(402);
                    return [2 /*return*/];
                case 15: return [2 /*return*/];
            }
        });
    });
});
// globus
app.post('/globus-util/jupyter/upload', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var body, errors, jupyterGlobus, to, from, hpcConfig;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = req.body;
                    errors = requestErrors(validator.validate(body, schemas.user));
                    if (errors.length > 0) {
                        res.json({ error: "invalid input", messages: errors });
                        res.status(402);
                        return [2 /*return*/];
                    }
                    if (!res.locals.username) {
                        res.json({ error: "invalid token" });
                        res.status(402);
                        return [2 /*return*/];
                    }
                    jupyterGlobus = config_1.jupyterGlobusMap[res.locals.host];
                    if (!jupyterGlobus) {
                        res.json({ error: "unknown host" });
                        res.status(404);
                        return [2 /*return*/];
                    }
                    to = new FileSystem_1.GlobusFolder("".concat(jupyterGlobus.endpoint, ":").concat(path.join(jupyterGlobus.root_path, res.locals.username.split('@')[0])));
                    from = new FileSystem_1.GlobusFolder(body.from);
                    hpcConfig = config_1.hpcConfigMap[body.hpc];
                    return [4 /*yield*/, GlobusUtil_1["default"].initTransfer(from, to, hpcConfig)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
});
app.post('/globus-util/jupyter/download', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var body, errors, jupyterGlobus, from, to, hpcConfig;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = req.body;
                    errors = requestErrors(validator.validate(body, schemas.user));
                    if (errors.length > 0) {
                        res.json({ error: "invalid input", messages: errors });
                        res.status(402);
                        return [2 /*return*/];
                    }
                    if (!res.locals.username) {
                        res.json({ error: "invalid token" });
                        res.status(402);
                        return [2 /*return*/];
                    }
                    jupyterGlobus = config_1.jupyterGlobusMap[res.locals.host];
                    if (!jupyterGlobus) {
                        res.json({ error: "unknown host" });
                        res.status(404);
                        return [2 /*return*/];
                    }
                    from = new FileSystem_1.GlobusFolder("".concat(jupyterGlobus.endpoint, ":").concat(path.join(jupyterGlobus.root_path, res.locals.username.split('@')[0])));
                    to = new FileSystem_1.GlobusFolder(body.to);
                    hpcConfig = config_1.hpcConfigMap[body.hpc];
                    return [4 /*yield*/, GlobusUtil_1["default"].initTransfer(from, to, hpcConfig)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
});
// job
app.post('/job', function (req, res) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var body, errors, maintainerName, maintainer, hpcName, hpc, e_11, connection, jobRepo, job, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    body = req.body;
                    errors = requestErrors(validator.validate(body, schemas.createJob));
                    if (errors.length > 0) {
                        res.json({ error: "invalid input", messages: errors });
                        res.status(402);
                        return [2 /*return*/];
                    }
                    maintainerName = (_a = body.maintainer) !== null && _a !== void 0 ? _a : 'community_contribution';
                    maintainer = config_1.maintainerConfigMap[maintainerName];
                    if (maintainer === undefined) {
                        res.json({ error: "unrecognized maintainer", message: null });
                        res.status(401);
                        return [2 /*return*/];
                    }
                    hpcName = body.hpc ? body.hpc : maintainer.default_hpc;
                    hpc = config_1.hpcConfigMap[hpcName];
                    if (hpc === undefined) {
                        res.json({ error: "unrecognized hpc", message: null });
                        res.status(401);
                        return [2 /*return*/];
                    }
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 6, , 7]);
                    if (!hpc.is_community_account) return [3 /*break*/, 3];
                    return [4 /*yield*/, guard.validateCommunityAccount()];
                case 2:
                    _d.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, guard.validatePrivateAccount(hpcName, body.user, body.password)];
                case 4:
                    _d.sent();
                    _d.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    e_11 = _d.sent();
                    res.json({ error: "invalid credentials", messages: [e_11.toString()] });
                    res.status(401);
                    return [2 /*return*/];
                case 7: return [4 /*yield*/, db.connect()];
                case 8:
                    connection = _d.sent();
                    jobRepo = connection.getRepository(Job_1.Job);
                    job = new Job_1.Job();
                    job.id = guard.generateID();
                    job.userId = res.locals.username ? res.locals.username : null;
                    _b = job;
                    return [4 /*yield*/, guard.issueJobSecretToken()];
                case 9:
                    _b.secretToken = _d.sent();
                    job.maintainer = maintainerName;
                    job.hpc = hpcName;
                    job.param = {};
                    job.env = {};
                    if (!!hpc.is_community_account) return [3 /*break*/, 11];
                    _c = job;
                    return [4 /*yield*/, guard.registerCredential(body.user, body.password)];
                case 10:
                    _c.credentialId = _d.sent();
                    _d.label = 11;
                case 11: return [4 /*yield*/, jobRepo.save(job)];
                case 12:
                    _d.sent();
                    res.json(Helper_1["default"].job2object(job));
                    return [2 /*return*/];
            }
        });
    });
});
app.put('/job/:jobId', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var body, errors, job, e_12, connection, jobRepo, job, e_13;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = req.body;
                    errors = requestErrors(validator.validate(body, schemas.updateJob));
                    if (errors.length > 0) {
                        res.json({ error: "invalid input", messages: errors });
                        res.status(402);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, guard.validateJobAccessToken(body.accessToken)];
                case 2:
                    job = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_12 = _a.sent();
                    res.json({ error: "invalid access token", messages: [e_12.toString()] });
                    res.status(401);
                    return [2 /*return*/];
                case 4:
                    if (job.id != req.params.jobId) {
                        res.json({ error: "invalid access", messages: [] });
                        res.status(401);
                        return [2 /*return*/];
                    }
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 9, , 10]);
                    return [4 /*yield*/, db.connect()];
                case 6:
                    connection = _a.sent();
                    return [4 /*yield*/, connection.createQueryBuilder()
                            .update(Job_1.Job)
                            .where('id = :id', { id: req.params.jobId })
                            .set(Helper_1["default"].prepareDataForDB(body, ['param', 'env', 'slurm', 'executableFolder', 'dataFolder', 'resultFolder']))
                            .execute()];
                case 7:
                    _a.sent();
                    jobRepo = connection.getRepository(Job_1.Job);
                    return [4 /*yield*/, jobRepo.findOne(job.id)];
                case 8:
                    job = _a.sent();
                    return [3 /*break*/, 10];
                case 9:
                    e_13 = _a.sent();
                    res.json({ error: e_13.toString() });
                    res.status(402);
                    return [2 /*return*/];
                case 10:
                    guard.updateJobAccessTokenCache(body.accessToken, job);
                    res.json(Helper_1["default"].job2object(job));
                    return [2 /*return*/];
            }
        });
    });
});
app.post('/job/:jobId/submit', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var body, errors, connection, e_14, job, e_15, connection, e_16;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = req.body;
                    errors = requestErrors(validator.validate(body, schemas.getJob));
                    if (!(body.hpc == "dummy_hpc")) return [3 /*break*/, 6];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, supervisor.pushJobToQueue(job)
                        // update status
                    ];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, db.connect()];
                case 3:
                    connection = _a.sent();
                    job.queuedAt = new Date();
                    return [4 /*yield*/, connection.createQueryBuilder()
                            .update(Job_1.Job)
                            .where('id = :id', { id: job.id })
                            .set({ queuedAt: job.queuedAt })
                            .execute()];
                case 4:
                    _a.sent();
                    job.finishedAt = new Date();
                    return [3 /*break*/, 6];
                case 5:
                    e_14 = _a.sent();
                    res.json({ error: e_14.toString() });
                    res.status(402);
                    return [2 /*return*/];
                case 6:
                    if (errors.length > 0) {
                        res.json({ error: "invalid input", messages: errors });
                        res.status(402);
                        return [2 /*return*/];
                    }
                    if (!res.locals.username) {
                        res.json({ error: "submit without login is not allowed", messages: [] });
                        res.status(401);
                        return [2 /*return*/];
                    }
                    _a.label = 7;
                case 7:
                    _a.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, guard.validateJobAccessToken(body.accessToken)];
                case 8:
                    job = _a.sent();
                    return [3 /*break*/, 10];
                case 9:
                    e_15 = _a.sent();
                    res.json({ error: "invalid access token", messages: [e_15.toString()] });
                    res.status(401);
                    return [2 /*return*/];
                case 10:
                    if (job.id != req.params.jobId) {
                        res.json({ error: "invalid access", messages: [] });
                        res.status(401);
                        return [2 /*return*/];
                    }
                    if (job.queuedAt) {
                        res.json({ error: "job already submitted or in queue", messages: [] });
                        res.status(401);
                        return [2 /*return*/];
                    }
                    _a.label = 11;
                case 11:
                    _a.trys.push([11, 16, , 17]);
                    return [4 /*yield*/, JobUtil_1["default"].validateJob(job, res.locals.host, res.locals.username.split('@')[0])];
                case 12:
                    _a.sent();
                    return [4 /*yield*/, supervisor.pushJobToQueue(job)
                        // update status
                    ];
                case 13:
                    _a.sent();
                    return [4 /*yield*/, db.connect()];
                case 14:
                    connection = _a.sent();
                    job.queuedAt = new Date();
                    return [4 /*yield*/, connection.createQueryBuilder()
                            .update(Job_1.Job)
                            .where('id = :id', { id: job.id })
                            .set({ queuedAt: job.queuedAt })
                            .execute()];
                case 15:
                    _a.sent();
                    return [3 /*break*/, 17];
                case 16:
                    e_16 = _a.sent();
                    res.json({ error: e_16.toString() });
                    res.status(402);
                    return [2 /*return*/];
                case 17:
                    res.json(Helper_1["default"].job2object(job));
                    return [2 /*return*/];
            }
        });
    });
});
app.put('/job/:jobId/pause', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/];
        });
    });
});
app.put('/job/:jobId/resume', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/];
        });
    });
});
app.put('/job/:jobId/cancel', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/];
        });
    });
});
app.get('/job/:jobId/events', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var body, errors, job, e_17;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = req.body;
                    errors = requestErrors(validator.validate(body, schemas.getJob));
                    if (errors.length > 0) {
                        res.json({ error: "invalid input", messages: errors });
                        res.status(402);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, guard.validateJobAccessToken(body.accessToken, true)];
                case 2:
                    job = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_17 = _a.sent();
                    res.json({ error: "invalid access token", messages: [e_17.toString()] });
                    res.status(401);
                    return [2 /*return*/];
                case 4:
                    if (job.id != req.params.jobId) {
                        res.json({ error: "invalid access", messages: [] });
                        res.status(401);
                        return [2 /*return*/];
                    }
                    res.json(job.events);
                    return [2 /*return*/];
            }
        });
    });
});
app.get('/job/:jobId/result-folder-content', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var body, errors, job, e_18, out;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = req.body;
                    errors = requestErrors(validator.validate(body, schemas.getJob));
                    if (errors.length > 0) {
                        res.json({ error: "invalid input", messages: errors });
                        res.status(402);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, guard.validateJobAccessToken(body.accessToken, true)];
                case 2:
                    job = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_18 = _a.sent();
                    res.json({ error: "invalid access token", messages: [e_18.toString()] });
                    res.status(401);
                    return [2 /*return*/];
                case 4:
                    if (job.id != req.params.jobId) {
                        res.json({ error: "invalid access", messages: [] });
                        res.status(401);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, resultFolderContent.get(job.id)];
                case 5:
                    out = _a.sent();
                    res.json(out ? out : []);
                    return [2 /*return*/];
            }
        });
    });
});
app.get('/job/:jobId/logs', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var body, errors, job, e_19;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = req.body;
                    errors = requestErrors(validator.validate(body, schemas.getJob));
                    if (errors.length > 0) {
                        res.json({ error: "invalid input", messages: errors });
                        res.status(402);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, guard.validateJobAccessToken(body.accessToken, true)];
                case 2:
                    job = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_19 = _a.sent();
                    res.json({ error: "invalid access token", messages: [e_19.toString()] });
                    res.status(401);
                    return [2 /*return*/];
                case 4:
                    if (job.id != req.params.jobId) {
                        res.json({ error: "invalid access", messages: [] });
                        res.status(401);
                        return [2 /*return*/];
                    }
                    res.json(job.logs);
                    return [2 /*return*/];
            }
        });
    });
});
// same as /job/:jobId
app.get('/job/get-by-token', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var body, errors, job, e_20;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = req.body;
                    errors = requestErrors(validator.validate(body, schemas.getJob));
                    if (errors.length > 0) {
                        res.json({ error: "invalid input", messages: errors });
                        res.status(402);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, guard.validateJobAccessToken(body.accessToken, true)];
                case 2:
                    job = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_20 = _a.sent();
                    res.json({ error: "invalid access token", messages: [e_20.toString()] });
                    res.status(401);
                    return [2 /*return*/];
                case 4:
                    res.json(Helper_1["default"].job2object(job));
                    return [2 /*return*/];
            }
        });
    });
});
app.get('/job/:jobId', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var body, errors, job, e_21;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = req.body;
                    errors = requestErrors(validator.validate(body, schemas.getJob));
                    if (errors.length > 0) {
                        res.json({ error: "invalid input", messages: errors });
                        res.status(402);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, guard.validateJobAccessToken(body.accessToken, true)];
                case 2:
                    job = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_21 = _a.sent();
                    res.json({ error: "invalid access token", messages: [e_21.toString()] });
                    res.status(401);
                    return [2 /*return*/];
                case 4:
                    if (job.id != req.params.jobId) {
                        res.json({ error: "invalid access", messages: [] });
                        res.status(401);
                        return [2 /*return*/];
                    }
                    res.json(Helper_1["default"].job2object(job));
                    return [2 /*return*/];
            }
        });
    });
});
app.listen(config_1.config.server_port, config_1.config.server_ip, function () { return console.log('supervisor server is up, listening to port: ' + config_1.config.server_port); });
