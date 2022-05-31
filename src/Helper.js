"use strict";
exports.__esModule = true;
var fs = require("fs");
var Helper = {
    btoa: function (target) {
        return Buffer.from(target, 'base64').toString('binary');
    },
    atob: function (target) {
        return Buffer.from(target).toString('base64');
    },
    job2object: function (job, exclude) {
        if (exclude === void 0) { exclude = []; }
        if (Array.isArray(job)) {
            var outArray = [];
            for (var i in job) {
                outArray.push(Helper.job2object(job[i]));
            }
            return outArray;
        }
        //
        var out = {};
        var include = ['id', 'userId', 'secretToken', 'slurmId', 'maintainer', 'hpc', 'executableFolder', 'dataFolder', 'resultFolder', 'param', 'env', 'slurm', 'createdAt', 'updatedAt', 'deletedAt', 'initializedAt', 'finishedAt', 'isFailed', 'events', 'logs'];
        for (var i in include) {
            i = include[i];
            if (exclude.includes(i))
                continue;
            if (i in job)
                out[i] = job[i];
            else
                out[i] = null;
        }
        return out;
    },
    prepareDataForDB: function (data, properties) {
        var out = {};
        for (var i in properties) {
            var property = properties[i];
            if (data[property])
                out[property] = data[property];
        }
        return out;
    },
    randomStr: function (length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },
    fileModifiedDate: function (path) {
        var mtime = fs.statSync(path).mtime;
        return mtime;
    },
    onExit: function (callback) {
        //do something when app is closing
        process.on('exit', function () {
            callback();
            setTimeout(function () {
                process.exit(1);
            }, 3 * 1000);
        });
        //catches ctrl+c event
        process.on('SIGINT', function () {
            callback();
            setTimeout(function () {
                process.exit(1);
            }, 3 * 1000);
        });
        // catches "kill pid" (for example: nodemon restart)
        process.on('SIGUSR1', function () {
            callback();
            setTimeout(function () {
                process.exit(1);
            }, 3 * 1000);
        });
        process.on('SIGUSR2', function () {
            callback();
            setTimeout(function () {
                process.exit(1);
            }, 3 * 1000);
        });
        process.on('SIGTERM', function () {
            callback();
            setTimeout(function () {
                process.exit(1);
            }, 3 * 1000);
        });
        process.on('uncaughtException', function () {
            callback();
            setTimeout(function () {
                process.exit(1);
            }, 3 * 1000);
        });
    },
    consoleEnd: '\x1b[0m',
    consoleGreen: '\x1b[32m'
};
exports["default"] = Helper;
