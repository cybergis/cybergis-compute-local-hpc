"use strict";
exports.__esModule = true;
exports.jupyterGlobusMap = exports.containerConfigMap = exports.maintainerConfigMap = exports.hpcConfigMap = exports.config = void 0;
var rawConfig = require('../config.json');
var rawHpc = require('./hpc.json');
var rawMaintainer = require('./maintainer.json');
var rawContainerConfig = require('./container.json');
var rawJupyterGlobusMapConfig = require('./jupyter-globus-map.json');
var config = JSON.parse(JSON.stringify(rawConfig));
exports.config = config;
var hpcConfigMap = {};
exports.hpcConfigMap = hpcConfigMap;
for (var i in rawHpc) {
    hpcConfigMap[i] = Object.assign({
        ip: undefined,
        port: undefined,
        is_community_account: undefined,
        community_login: undefined,
        root_path: undefined,
        job_pool_capacity: undefined,
        init_sbatch_script: [],
        init_sbatch_options: [],
        description: 'none',
        globus: undefined,
        slurm_input_rules: {}
    }, JSON.parse(JSON.stringify(rawHpc[i])));
}
var jupyterGlobusMap = {};
exports.jupyterGlobusMap = jupyterGlobusMap;
for (var i in rawJupyterGlobusMapConfig) {
    jupyterGlobusMap[i] = JSON.parse(JSON.stringify(rawJupyterGlobusMapConfig[i]));
}
var maintainerConfigMap = {};
exports.maintainerConfigMap = maintainerConfigMap;
for (var i in rawMaintainer) {
    maintainerConfigMap[i] = JSON.parse(JSON.stringify(rawMaintainer[i]));
}
var containerConfigMap = {};
exports.containerConfigMap = containerConfigMap;
for (var i in rawContainerConfig) {
    containerConfigMap[i] = JSON.parse(JSON.stringify(rawContainerConfig[i]));
}
