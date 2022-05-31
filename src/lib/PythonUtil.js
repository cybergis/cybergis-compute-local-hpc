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
var child_process_1 = require("child_process");
var config_1 = require("../../configs/config");
var PythonUtil = /** @class */ (function () {
    function PythonUtil() {
    }
    /**
     * Runs the specified python file. The person running this file can provide user input.
     *
     * @static
     * @async
     * @param {string} file - Path of the file to run
     * @param {string[]} args - Arguments to be passed when running the file.
     * @param {string[]} returnTags - Items to be returned
     * @returns {Promise} - Values returned by the function that correspond the the ones passed in returnTags
     */
    PythonUtil.runInteractive = function (file, args, returnTags) {
        if (args === void 0) { args = []; }
        if (returnTags === void 0) { returnTags = []; }
        return __awaiter(this, void 0, void 0, function () {
            var child, out;
            return __generator(this, function (_a) {
                args.unshift("".concat(__dirname, "/python/").concat(file));
                child = (0, child_process_1.spawn)('python3', args);
                out = {};
                child.stdout.on('data', function (result) {
                    var stdout = Buffer.from(result, 'utf-8').toString();
                    var parsedStdout = stdout.split('@');
                    for (var i in parsedStdout) {
                        var o = parsedStdout[i];
                        for (var j in returnTags) {
                            var tag = returnTags[j];
                            var regex = new RegExp("".concat(tag, "=((?!]).)*"), 'g');
                            var m = o.match(regex);
                            if (m) {
                                m.forEach(function (v, i) {
                                    v = v.replace("".concat(tag, "=["), '');
                                    out[tag] = v;
                                });
                                stdout = stdout.replace('@', '');
                                stdout = stdout.replace(regex, '');
                                stdout = stdout.replace(']', '');
                            }
                        }
                    }
                });
                process.stdin.on('readable', function () {
                    var chunk = process.stdin.read();
                    if (chunk !== null)
                        child.stdin.write(chunk);
                });
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        child.on('exit', function () { resolve(out); });
                        child.on('error', function () { resolve(out); });
                        child.on('close', function () { resolve(out); });
                    })];
            });
        });
    };
    /**
     * Runs the specified python file.
     *
     * @static
     * @async
     * @param {string} file - Path of the file to run
     * @param {string[]} args - Arguments to be passed when running the file.
     * @param {string[]} returnTags - Items to be returned
     * @returns {Promise} - Values returned by the function that correspond the the ones passed in returnTags
     */
    PythonUtil.run = function (file, args, returnTags) {
        if (args === void 0) { args = []; }
        if (returnTags === void 0) { returnTags = []; }
        return __awaiter(this, void 0, void 0, function () {
            var child, out;
            return __generator(this, function (_a) {
                args.unshift("".concat(__dirname, "/python/").concat(file));
                child = (0, child_process_1.spawn)('python3', args);
                out = {
                    error: null
                };
                child.stderr.on('data', function (result) {
                    var stderr = Buffer.from(result, 'utf-8').toString();
                    if (config_1.config.is_testing)
                        console.log(stderr);
                    if (!out.error)
                        out.error = stderr;
                    else
                        out.error += stderr;
                });
                child.stdout.on('data', function (result) {
                    var stdout = Buffer.from(result, 'utf-8').toString();
                    var parsedStdout = stdout.split('@');
                    for (var i in parsedStdout) {
                        var o = parsedStdout[i];
                        for (var j in returnTags) {
                            var tag = returnTags[j];
                            var regex = new RegExp("".concat(tag, "=((?!]).)*"), 'g');
                            var m = o.match(regex);
                            if (m) {
                                m.forEach(function (v, i) {
                                    v = v.replace("".concat(tag, "=["), '');
                                    out[tag] = v;
                                });
                                stdout = stdout.replace('@', '');
                                stdout = stdout.replace(regex, '');
                                stdout = stdout.replace(']', '');
                            }
                        }
                    }
                    if (config_1.config.is_testing)
                        console.log(stdout);
                });
                if (config_1.config.is_testing) {
                    child.stderr.on('data', function (result) {
                        console.log(Buffer.from(result, 'utf-8').toString());
                    });
                }
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        child.on('exit', function () { resolve(out); });
                        child.on('error', function (err) { reject(err); });
                        child.on('close', function () { resolve(out); });
                    })];
            });
        });
    };
    return PythonUtil;
}());
exports["default"] = PythonUtil;
