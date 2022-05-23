import Helper from "./Helper"
import { FileStructureError, FileNotExistError } from './errors'
import * as fs from 'fs'
import * as path from 'path'
import { Git } from "./models/Git"
import { executableManifest, hpcConfig, slurm_integer_configs, slurm_integer_none_unit_config, slurm_integer_time_unit_config, slurm_integer_storage_unit_config, slurm_configs, slurm_string_option_configs } from './types'
import DB from './DB'
import { config } from '../configs/config'
import { exec } from 'child-process-async'
import { spawn } from "child_process"
const rimraf = require("rimraf")

type fileConfig = {
    ignore?: Array<string>,
    must_have?: Array<string>,
    ignore_everything_except_must_have?: boolean
}

type fileTypes = 'local' | 'git' | 'globus'

export class FileSystem {
    static createClearLocalCacheProcess() {
        var cachePath = config.local_file_system.cache_path
        setInterval(function () {
            try {
                fs.readdir(cachePath, function (err, files) {
                    if (!files) return // hack
                    files.forEach(function (file, index) {
                        if (file != '.gitkeep') {
                            fs.stat(path.join(cachePath, file), function (err, stat) {
                                var endTime, now;
                                if (err) return console.error(err)
                                now = () => 'CURRENT_TIMESTAMP'
                                endTime = new Date(stat.ctime).getTime() + 3600000
                                if (now > endTime) return rimraf(path.join(cachePath, file), (err) => {})
                            })
                        }
                    })
                })
            } catch {}
        }, 60 * 60 * 1000)
    }

    // operations
    static async initGlobusTransfer(from: GlobusFolder, to: GlobusFolder, muteEvent = false) {
        if (from == undefined || to == undefined) throw new Error('please init input file first')

    }

    // getter
    static getFolderByURL(url: string, onlyAllow: string | Array<string> = null): BaseFolder {
        var u = url.split('://')
        if (onlyAllow) {
            if (typeof onlyAllow == 'string') {
                if (u[0] != onlyAllow) throw new Error(`file protocol ${u[0]} is not allowed`)
            } else {
                if (!onlyAllow.includes(u[0])) throw new Error(`file protocol ${u[0]} is not allowed`)
            }
        }
        return this.getFolder(u[0], u[1])
    }

    static getFolder(type: string, id: string): BaseFolder {
        if (type == 'local') return new LocalFolder(id)
        if (type == 'git') return new GitFolder(id)
        if (type == 'globus') return new GlobusFolder(id)
        throw new Error(`cannot find file ${type}://${id}`)
    }

    static getLocalFolder(id: string): LocalFolder {
        return new LocalFolder(id)
    }

    static getGitFolder(id: string): GitFolder {
        return new GitFolder(id)
    }

    static getGlobusFolder(id: string): GlobusFolder {
        return new GlobusFolder(id)
    }

    static getGlobusFolderByHPCConfig(hpcConfig: hpcConfig, dir: string = '') {
        if (!hpcConfig.globus) throw new Error(`HPC does not have a globus account associated with it`)
        var id = `${hpcConfig.globus.endpoint}:${path.join(hpcConfig.globus.root_path, dir)}`
        return this.getGlobusFolder(id)
    }

    static createLocalFolder(providedFileConfig: fileConfig = {}): LocalFolder {
        var id = this._generateID()
        var filePath = path.join(config.local_file_system.root_path, id)

        while (fs.existsSync(filePath)) {
            id = this._generateID()
            filePath = path.join(config.local_file_system.root_path, id)
        }

        fs.mkdirSync(filePath)
        if (providedFileConfig != {}) {
            var infoJSON: string = JSON.stringify({config: providedFileConfig})
            fs.writeFileSync(path.join(filePath, '.file_config.json'), infoJSON)
        }
        return new LocalFolder(id)
    }

    static _generateID(): string {
        return Math.round((new Date()).getTime() / 1000) + Helper.randomStr(4)
    }
}

export class BaseFolder {
    public type: fileTypes

    public id: string

    constructor(id: string) {
        this.id = id
    }

    validate() {
        // empty interface
    }

    getURL() {
        return `${this.type}://${this.id}`
    }
}

export class GlobusFolder extends BaseFolder {
    public endpoint: string

    public path: string

    constructor(id: string) {
        super(id)
        this.type = 'globus'
        var i = this.id.split(':')
        if (i.length != 2) {
            throw new Error('invalid folder url format [' + this.getURL() + '] (ex. globus://endpoint:/path/to/file)')
        }
        this.endpoint = i[0]
        this.path = i[1]
    }
}

export class LocalFolder extends BaseFolder {
    public path: string

    public fileConfig: fileConfig

    public isReadonly: boolean

    constructor(id: string) {
        super(id)
        this.type = 'local'
        this.isReadonly = false
        this.path = path.join(config.local_file_system.root_path, id)
        this.fileConfig = this._getFileConfig()
    }

    // folder status

    async validate() {
        if (!await this.exists()) throw new FileNotExistError('file not exists or initialized')

        const files = await fs.promises.readdir(this.path)
        var mustHaveFiles = []

        for (var i in files) {
            var file = files[i]
            if (this.fileConfig.must_have.includes(file)) mustHaveFiles.push(file)
        }

        for (var i in this.fileConfig.must_have) {
            var mustHave = this.fileConfig.must_have[i]
            if (!mustHaveFiles.includes(mustHave)) throw new FileStructureError(`file [${file}] must be included`)   
        }
    }

    async exists(): Promise<boolean> {
        try {
            await fs.promises.access(this.path, fs.constants.F_OK); return true
        } catch {
            return false
        }
    }

    // write operations

    async chmod(filePath: string, mode: string) {
        if (!await this.exists()) throw new FileNotExistError('file not exists or initialized')
        if (this.isReadonly) throw new Error('cannot write to a read only folder') 
        await fs.promises.chmod(path.join(this.path, filePath), mode)
    }

    async putFileFromZip(zipFilePath: string) {
        if (!await this.exists()) throw new FileNotExistError('file not exists or initialized')
        if (this.isReadonly) throw new Error('cannot write to a read only folder')

        try {
            const child = spawn(`unzip`, ['-o', '-q', `${zipFilePath}`, '-d', `${this.path}`])
            return new Promise((resolve, reject) => {
                child.on('exit', () => resolve(`${this.path}.zip`))
                child.on('close', () => resolve(`${this.path}.zip`))
                child.on('error', () => reject(`${this.path}.zip`))
            })
        } catch (e) {
            throw new Error(e)
        }
    }

    async putFileFromTemplate(template: string, replacements: any, filePath: string) {
        if (!await this.exists()) throw new FileNotExistError('file not exists or initialized')
        if (this.isReadonly) throw new Error('cannot write to a read only folder') 

        for (var key in replacements) {
            var value = replacements[key]
            template = template.replace(`{{${key}}}`, value)
        }
        await this.putFileFromString(template, filePath)
    }

    async putFileFromString(content: string, filePath: string) {
        if (!await this.exists()) throw new FileNotExistError('file not exists or initialized')
        if (this.isReadonly) throw new Error('cannot write to a read only folder') 

        const fileName = path.basename(filePath)
        filePath = path.join(this.path, filePath)
        if (this.fileConfig.ignore_everything_except_must_have && !this.fileConfig.must_have.includes(fileName)) return
        if (!this.fileConfig.ignore_everything_except_must_have && this.fileConfig.ignore.includes(fileName)) return

        const fileParentPath = path.dirname(filePath)
        if (!fs.existsSync(fileParentPath)) await fs.promises.mkdir(fileParentPath, { recursive: true })

        await fs.promises.writeFile(filePath, content, {
            mode: 0o755
        })

        await this.removeZip()
    }

    async putFolder(folderPath: string) {
        if (!await this.exists()) throw new FileNotExistError('file not exists or initialized')
        if (this.isReadonly) throw new Error('cannot write to a read only folder') 

        folderPath = path.join(this.path, folderPath)
        if (!fs.existsSync(folderPath)) await fs.promises.mkdir(folderPath, { recursive: true })
    }

    // zip operations

    async isZipped(): Promise<boolean> {
        try {
            await fs.promises.access(this.path + '.zip', fs.constants.F_OK); return true
        } catch {
            return false
        }
    }

    async removeZip() {
        if (await this.isZipped()) await fs.promises.unlink(this.path + '.zip')
    }

    async getZip(): Promise<string> {
        if (!this.path) throw new Error('getZip operation is not supported')
        if (await this.isZipped()) return this.path + '.zip'

        try {
            const child = spawn(`zip`, ['-q', '-r', `${this.path}.zip`, '.', `${path.basename(this.path)}`], { cwd: this.path })
            return new Promise((resolve, reject) => {
                child.on('exit', () => resolve(`${this.path}.zip`))
                child.on('close', () => resolve(`${this.path}.zip`))
                child.on('error', () => reject(`${this.path}.zip`))
            })
        } catch (e) {
            throw new Error(e)
        }
    }

    private _getFileConfig(): fileConfig  {
        const fileConfig = {
            ignore: ['.placeholder', '.DS_Store', '.file_config.json'],
            must_have: [],
            ignore_everything_except_must_have: false
        }

        var configPath = path.join(this.path, '.file_config.json')
        if (fs.existsSync(configPath)) {
            var providedFileConfig = require(configPath)
            if (providedFileConfig != undefined) {
                if (providedFileConfig.ignore != undefined) fileConfig.ignore.concat(providedFileConfig.ignore)
                if (providedFileConfig.must_have != undefined) fileConfig.must_have = providedFileConfig.must_have
                if (providedFileConfig.ignore_everything_except_must_have != undefined) {
                    fileConfig.ignore_everything_except_must_have = providedFileConfig.ignore_everything_except_must_have
                }
            }
        }

        return fileConfig
    }
}

export class GitFolder extends LocalFolder {
    public executableManifest: executableManifest

    public git: Git

    private db = new DB()

    constructor(id: string) {
        super(id)
        this.type = 'git'
        this.isReadonly = true
    }

    async init() {
        try {
            var connection = await this.db.connect()
            var gitRepo = connection.getRepository(Git)
            this.git = await gitRepo.findOne(this.id)

            if (!this.git) throw new Error(`cannot find git folder with url ${this.getURL()}`)

            if (!fs.existsSync(this.path)) {
                await fs.promises.mkdir(this.path)
                await exec(`cd ${this.path} && git clone ${this.git.address} ${this.path}`)
            }

            await this.removeZip()

            if (this.git.sha) {
                try {
                    await exec(`cd ${this.path} && git checkout ${this.git.sha}`)
                } catch {
                    rimraf.sync(this.path)
                    await fs.promises.mkdir(this.path)
                    await exec(`cd ${this.path} && git clone ${this.git.address} ${this.path}`)
                    await exec(`cd ${this.path} && git checkout ${this.git.sha}`)
                }
            } else {
                await exec(`cd ${this.path} && git pull`)
            }

            await this._readExecutableManifest()
        } catch (e) {
            throw new Error(`initialization failed with error: ${e.toString()}`)
        }
    }

    async getExecutableManifest(): Promise<executableManifest> {
        try { await this.init() } catch (e) { throw new Error(e) }
        return this.executableManifest
    }

    async getZip(): Promise<string> {
        try {
            await this.init()
            return await super.getZip()
        } catch (e) {
            throw new Error(e)
        }
    }

    async _readExecutableManifest() {
        var executableFolderPath = path.join(this.path, 'manifest.json')
        const rawExecutableManifest = (await fs.promises.readFile(executableFolderPath)).toString()

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
        }, JSON.parse(rawExecutableManifest))

        if (!this.executableManifest.default_hpc) {
            this.executableManifest.default_hpc = this.executableManifest.supported_hpc[0]
        }

        for (var i in this.executableManifest.slurm_input_rules) {
            // remove invalid configs
            if (!slurm_configs.includes(i)) {
                delete this.executableManifest.slurm_input_rules[i]
                continue
            }

            if (!this.executableManifest.slurm_input_rules[i].default_value) {
                delete this.executableManifest.slurm_input_rules[i]
                continue
            }

            var j = this.executableManifest.slurm_input_rules[i]
            if (slurm_integer_time_unit_config.includes(i) && !(['Minutes', 'Hours', 'Days'].includes(j.unit))) {
                delete this.executableManifest.slurm_input_rules[i]
                continue
            }

            if (slurm_integer_storage_unit_config.includes(i) && !(['GB', 'MB'].includes(j.unit))) {
                delete this.executableManifest.slurm_input_rules[i]
                continue
            }

            // default values
            if (slurm_integer_none_unit_config.includes(i)) {
                this.executableManifest.slurm_input_rules[i].unit = 'None'
                continue
            }

            if (slurm_integer_configs.includes(i)) {
                if (!this.executableManifest.slurm_input_rules[i].max) {
                    this.executableManifest.slurm_input_rules[i].max = this.executableManifest.slurm_input_rules[i].default_value * 2
                }
                if (!this.executableManifest.slurm_input_rules[i].min) {
                    this.executableManifest.slurm_input_rules[i].min = 0
                }
                if (!this.executableManifest.slurm_input_rules[i].step) {
                    this.executableManifest.slurm_input_rules[i].step = 1
                }
            }

            if (slurm_string_option_configs.includes(i)) {
                if (!this.executableManifest.slurm_input_rules[i].options) {
                    this.executableManifest.slurm_input_rules[i].options = [
                        this.executableManifest.slurm_input_rules[i].default_value
                    ]
                }
                if (!this.executableManifest.slurm_input_rules[i].options.includes(this.executableManifest.slurm_input_rules[i].default_value)) {
                    this.executableManifest.slurm_input_rules[i].options.push(this.executableManifest.slurm_input_rules[i].default_value)
                }
            }
        }

        for (var i in this.executableManifest.param_rules) {
            // ignore invalid param
            if (!this.executableManifest.param_rules[i].default_value) {
                delete this.executableManifest.param_rules[i]
                continue
            }

            if (!['integer', 'string_option', 'string_input'].includes(this.executableManifest.param_rules[i].type)) {
                delete this.executableManifest.param_rules[i]
                continue
            }

            // default values
            if (this.executableManifest.param_rules[i].type == 'integer') {
                if (!this.executableManifest.param_rules[i].max) {
                    this.executableManifest.param_rules[i].max = this.executableManifest.param_rules[i].default_value * 2
                }
                if (!this.executableManifest.param_rules[i].min) {
                    this.executableManifest.param_rules[i].min = 0
                }
                if (!this.executableManifest.param_rules[i].step) {
                    this.executableManifest.param_rules[i].step = 1
                }
            }

            if (this.executableManifest.param_rules[i].type == 'string_option') {
                if (!this.executableManifest.param_rules[i].options) {
                    this.executableManifest.param_rules[i].options = [
                        this.executableManifest.param_rules[i].default_value
                    ]
                }
                if (!this.executableManifest.param_rules[i].options.includes(this.executableManifest.param_rules[i].default_value)) {
                    this.executableManifest.param_rules[i].options.push(this.executableManifest.param_rules[i].default_value)
                }
            }
        }
    }
}
