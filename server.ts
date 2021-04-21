import Guard from './src/Guard'
import Supervisor from './src/Supervisor'
import { FileSystem, LocalFile } from './src/FileSystem'
import Helper from './src/Helper'
import { hpcConfig, maintainerConfig } from './src/types'
import { config, hpcConfigMap, maintainerConfigMap } from './configs/config'
import express = require('express')
const bodyParser = require('body-parser')
const Validator = require('jsonschema').Validator;
const fileUpload = require('express-fileupload')
const morgan = require('morgan')

const app = express()
app.use(bodyParser.json())
app.use(morgan('combined'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(fileUpload({
    limits: { fileSize: config.local_file_system.limit_in_mb * 1024 * 1024 }, // 50MB
    useTempFiles: true,
    abortOnLimit: true,
    tempFileDir: config.local_file_system.cache_path,
    safeFileNames: true,
    limitHandler: (req, res, next) => {
        res.json({ error: "file too large" })
        res.status(402)
    }
}))

const guard = new Guard()
const supervisor = new Supervisor()
const fileSystem = new FileSystem()
const validator = new Validator()

fileSystem.createClearLocalCacheProcess()

var schemas = {
    manifest: {
        type: 'object',
        properties: {
            aT: { type: 'string' },
            env: { type: 'object' },
            app: { type: 'object' },
            file: { type: 'string' }
        },
        required: ['aT']
    },

    jobCredentials: {
        type: 'object',
        properties: {
            hpc: { type: 'string' },
            maintainer: { type: 'string' },
            user: { type: 'string' },
            password: { type: 'string' }
        },
        required: ['maintainer', 'hpc', 'maintainer']
    },

    jobAccessToken: {
        type: 'object',
        properties: {
            aT: { type: 'string' }
        },
        required: ['aT']
    }
}

function requestErrors(v) {
    if (v.valid) return []
    var errors = []
    for (var i in v.errors) errors.push(v.errors[i].message)
    return errors
}

function setDefaultValues(data, defaults) {
    for (var k in defaults) {
        if (data[k] == undefined) data[k] = defaults[k]
    }
    return data
}

// index
app.get('/', (req, res) => {
    res.json({ message: 'hello world' })
})

// guard
app.post('/auth/job', async function (req, res) {
    var cred = req.body
    var errors = requestErrors(validator.validate(cred, schemas.jobCredentials))

    if (errors.length > 0) {
        res.json({ error: "invalid input", messages: errors })
        res.status(402)
        return
    }

    var hpc = hpcConfigMap[cred.hpc]
    var maintainer = maintainerConfigMap[cred.maintainer]

    if (hpc === undefined) {
        res.json({ error: "unrecognized hpc " + cred.hpc, message: null })
        res.status(401)
        return
    }

    if (maintainer === undefined) {
        res.json({ error: "unrecognized maintainer " + cred.maintainer, message: null })
        res.status(401)
        return
    }

    try {
        if (hpc.is_community_account) {
            var manifest = await guard.issueJobSecretTokenForCommunityAccount(cred.hpc, cred.maintainer, hpc.community_login.user)
        } else {
            var manifest = await guard.issueJobSecretTokenForPrivateAccount(cred.hpc, cred.maintainer, cred.user, cred.password)
        }
    } catch (e) {
        res.json({ error: "invalid credentials", messages: [e.toString()] })
        res.status(401)
        return
    }

    res.json(manifest)
})

// supervisor
app.post('/job', async function (req, res) {
    var manifest = req.body
    var errors = requestErrors(validator.validate(manifest, schemas.manifest))

    if (errors.length > 0) {
        res.json({ error: "invalid input", messages: errors })
        res.status(402)
        return
    }

    manifest = setDefaultValues(manifest, { env: {}, payload: {} })

    try {
        manifest = await guard.validateJobAccessToken(manifest)
    } catch (e) {
        res.json({ error: "invalid access token", messages: [e.toString()] })
        res.status(401)
        return
    }

    try {
        manifest = await supervisor.pushJobToQueue(manifest)
    } catch (e) {
        res.json({ error: e.toString() })
        res.status(402)
        return
    }

    manifest = Helper.hideCredFromManifest(manifest)
    res.json(manifest)
})

app.get('/hpc', function (req, res) {
    var parseHPC = (dest: {[key: string]: hpcConfig}) => {
        var out = {}
        for (var i in dest) {
            var d: hpcConfig = JSON.parse(JSON.stringify(dest[i])) // hard copy
            delete d.community_login
            out[i] = d
        }
        return out
    }

    res.json({ hpc: parseHPC(hpcConfigMap) })
})

app.get('/maintainer', function (req, res) {
    var parseMaintainer = (dest: {[key: string]: maintainerConfig}) => {
        var out = {}
        for (var i in dest) {
            var d: maintainerConfig = JSON.parse(JSON.stringify(dest[i])) // hard copy
            out[i] = d
        }
        return out
    }

    res.json({ hpc: parseMaintainer(maintainerConfigMap) })
})

app.post('/job/upload', async function (req: any, res) {
    if (res.statusCode == 402) return

    var aT = req.body
    var errors = requestErrors(validator.validate(aT, schemas.jobAccessToken))

    if (errors.length > 0) {
        res.json({ error: "invalid input", messages: errors })
        res.status(402)
        return
    }

    try {
        var manifest = await guard.validateJobAccessToken(aT)
    } catch (e) {
        res.json({ error: "invalid access token", messages: [e.toString()] })
        res.status(401)
        return
    }

    try {
        var maintainerConfig = maintainerConfigMap[manifest.maintainer]
        if (maintainerConfig.executable_file.from_user_upload) {
            var fileConfig = maintainerConfig.executable_file.file_config
            var file: LocalFile = await fileSystem.createLocalFile(fileConfig)
            await file.putFromZip(req.files.file.tempFilePath)
        }
        res.json({ file: file.getURL() })
    } catch (e) {
        res.json({ error: e.toString() })
        res.status(402)
        return
    }
})

app.get('/job/download', async function (req, res) {
    var aT = req.body
    var errors = requestErrors(validator.validate(aT, schemas.jobAccessToken))

    if (errors.length > 0) {
        res.json({ error: "invalid input", messages: errors })
        res.status(402)
        return
    }

    try {
        await guard.validateJobAccessToken(aT)
    } catch (e) {
        res.json({ error: "invalid access token", messages: [e.toString()] })
        res.status(401)
        return
    }

    var jobID = req.params.jobID
    var file = supervisor.getJobDownload(jobID)
    if (file != undefined)res.json({ error: `job id ${jobID} does not have a download file` })

    var fileZipPath = await file.getZip()
    res.download(fileZipPath)
})

app.get('/job/status', async function (req, res) {
    var aT = req.body
    var errors = requestErrors(validator.validate(aT, schemas.jobAccessToken))

    if (errors.length > 0) {
        res.json({ error: "invalid input", messages: errors })
        res.status(402)
        return
    }

    try {
        var manifest = await guard.validateJobAccessToken(aT)
    } catch (e) {
        res.json({ error: "invalid access token", messages: [e.toString()] })
        res.status(401)
        return
    }

    res.json(await supervisor.getJobStatus(manifest.uid, req.params.jobID))
})

app.listen(config.server_port, config.server_ip, () => console.log('supervisor server is up, listening to port: ' + config.server_port))
