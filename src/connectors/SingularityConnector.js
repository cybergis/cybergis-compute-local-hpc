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
exports.__esModule = true;
var SlurmConnector_1 = require("./SlurmConnector");
var config_1 = require("../../configs/config");
var SingularityConnector = /** @class */ (function (_super) {
    __extends(SingularityConnector, _super);
    function SingularityConnector() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * Connects the singularity container to the hpc enivironment
         */
        _this.volumeBinds = {};
        _this.isContainer = true;
        return _this;
    }
    /**
     * Executes specified command within specified image
     *
     * @param{string} image - docker image
     * @param{string} cmd - command to be executed
     * @param{slurm} config - slurm configuration
     */
    SingularityConnector.prototype.execCommandWithinImage = function (image, cmd, config) {
        cmd = "srun --mpi=pmi2 singularity exec ".concat(this._getVolumeBindCMD(), " ").concat(image, " ").concat(cmd);
        _super.prototype.prepare.call(this, cmd, config);
    };
    /**
     * Executes specified manifest within image
     *
     * @param{executableManifest} manifest - manifest that needs toe be executed
     * @param{slurm} config - slurm configuration
     * @throw{Error} - thrown when container is not supported
     */
    SingularityConnector.prototype.execExecutableManifestWithinImage = function (manifest, config) {
        var container = config_1.containerConfigMap[manifest.container];
        if (!container)
            throw new Error("unknown container ".concat(manifest.container));
        var containerPath = container.hpc_path[this.hpcName];
        if (!containerPath)
            throw new Error("container ".concat(manifest.container, " is not supported on HPC ").concat(this.hpcName));
        // remove buffer: https://dashboard.hpc.unimelb.edu.au/job_submission/
        var jobENV = this._getJobENV();
        var cmd = "";
        if (manifest.pre_processing_stage_in_raw_sbatch) {
            for (var i in manifest.pre_processing_stage_in_raw_sbatch) {
                cmd += "".concat(manifest.pre_processing_stage_in_raw_sbatch[i], "\n");
            }
        }
        else if (manifest.pre_processing_stage) {
            cmd += "".concat(jobENV.join(' '), " singularity exec ").concat(this._getVolumeBindCMD(manifest), " ").concat(containerPath, " bash -c \"cd ").concat(this.getContainerExecutableFolderPath(), " && ").concat(manifest.pre_processing_stage, "\"\n\n");
        }
        if (manifest.execution_stage_in_raw_sbatch) {
            for (var i in manifest.execution_stage_in_raw_sbatch) {
                cmd += "".concat(manifest.execution_stage_in_raw_sbatch[i], "\n");
            }
        }
        else {
            cmd += "".concat(jobENV.join(' '), " srun --unbuffered --mpi=pmi2 singularity exec ").concat(this._getVolumeBindCMD(manifest), " ").concat(containerPath, " bash -c \"cd ").concat(this.getContainerExecutableFolderPath(), " && ").concat(manifest.execution_stage, "\"\n\n");
        }
        if (manifest.post_processing_stage_in_raw_sbatch) {
            for (var i in manifest.post_processing_stage_in_raw_sbatch) {
                cmd += "".concat(manifest.post_processing_stage_in_raw_sbatch[i], "\n");
            }
        }
        else if (manifest.post_processing_stage) {
            cmd += "".concat(jobENV.join(' '), " singularity exec ").concat(this._getVolumeBindCMD(manifest), " ").concat(containerPath, " bash -c \"cd ").concat(this.getContainerExecutableFolderPath(), " && ").concat(manifest.post_processing_stage, "\"");
        }
        _super.prototype.prepare.call(this, cmd, config);
    };
    /**
     * Runs singularity image
     *
     * @param{string} image - singularity image
     * @param{slurm} config - slurm configuration
     */
    SingularityConnector.prototype.runImage = function (image, config) {
        var jobENV = this._getJobENV();
        var cmd = "srun --mpi=pmi2 ".concat(jobENV.join(' '), " singularity run ").concat(this._getVolumeBindCMD(), " ").concat(image);
        _super.prototype.prepare.call(this, cmd, config);
    };
    /**
     * Registers volumeBinds
     *
     * @param{{[keys: string]: string}} volumeBinds - volumeBinds that need to be registered
     */
    SingularityConnector.prototype.registerContainerVolumeBinds = function (volumeBinds) {
        for (var from in volumeBinds) {
            var to = volumeBinds[from];
            this.volumeBinds[from] = to;
        }
    };
    /**
     * Returns volumeBinds
     *
     * @param{executableManifest} manifest - manifest containing volumeBinds
     * @return{{[keys: string]: string}} volumeBinds
     */
    SingularityConnector.prototype._getVolumeBindCMD = function (manifest) {
        if (manifest === void 0) { manifest = null; }
        this.volumeBinds[this.getRemoteExecutableFolderPath()] = this.getContainerExecutableFolderPath();
        this.volumeBinds[this.getRemoteResultFolderPath()] = this.getContainerResultFolderPath();
        this.volumeBinds[this.getRemoteDataFolderPath()] = this.getContainerDataFolderPath();
        if (manifest) {
            var container = config_1.containerConfigMap[manifest.container];
            if (container) {
                if (container.mount) {
                    if (container.mount[this.hpcName]) {
                        for (var i in container.mount[this.hpcName]) {
                            this.volumeBinds[i] = container.mount[this.hpcName][i];
                        }
                    }
                }
            }
        }
        var bindCMD = [];
        for (var from in this.volumeBinds) {
            var to = this.volumeBinds[from];
            bindCMD.push("".concat(from, ":").concat(to));
        }
        return "--bind ".concat(bindCMD.join(','));
    };
    /**
     * Returns job environment
     *
     * @return{string[]} jobENV - jobenvironment variables
     */
    SingularityConnector.prototype._getJobENV = function () {
        var jobJSON = {
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
        var jobENV = [];
        for (var key in jobJSON) {
            var structuredKeys = ['param', 'env'];
            if (structuredKeys.includes(key)) {
                for (var i in jobJSON[key]) {
                    jobENV.push("".concat(key, "_").concat(i, "=\"").concat(jobJSON[key][i], "\""));
                }
            }
            else {
                jobENV.push("".concat(key, "=\"").concat(jobJSON[key], "\""));
            }
        }
        return jobENV;
    };
    return SingularityConnector;
}(SlurmConnector_1["default"]));
exports["default"] = SingularityConnector;
