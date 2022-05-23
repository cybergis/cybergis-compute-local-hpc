# Job Supervisor
HPC job submitting and maintaining framework with Restful API
<img width="1028" alt="Screen Shot 2020-08-12 at 3 37 04 PM" src="https://user-images.githubusercontent.com/34933627/90065330-bad40280-dcb1-11ea-8e8c-4edfd3eb8987.png">

## Content
- [Setup a Supervisor Server](https://github.com/cybergis/job-supervisor#setup-a-supervisor-server)
- [Restful API](https://github.com/cybergis/job-supervisor#restful-api)
- [General Development Guidelines](https://github.com/cybergis/job-supervisor#general-development-guidelines)
  - [Development Environment Setup](https://github.com/cybergis/job-supervisor#development-environment-setup)
  - [Add Service](https://github.com/cybergis/job-supervisor#add-service)
  - [User Upload File](https://github.com/cybergis/job-supervisor#user-upload-file)
  - [Define Maintainer Class](https://github.com/cybergis/job-supervisor#define-maintainer-class)
- [Future Roadmap](https://github.com/cybergis/job-supervisor#future-roadmap)


## Setup a Supervisor Server
0. Requirements
    - NodeJS & npm/yarn
    - Python3.4+ & pip3
    - Redis
> ⚠️ please run the following under root

1. Install Job Supervisor & Redis
    ```bash
    git clone https://github.com/cybergis/job-supervisor.git
    cd job-supervisor
    npm install

    # instal redis
    apt install redis
    vi /etc/redis/redis.conf
    # setting up password is strongly recommended
    # please follow this tutorial -> https://www.digitalocean.com/community/tutorials/how-to-secure-your-redis-installation-on-ubuntu-14-04
    ```

2. Configure
    ```bash
    cp config.example.json config.json
    ```

3. Run doctor script to check if Bash/Python dependencies are correctly installed
    ```bash
    node ./doctor.js
    ```

4. Run server in background
    ```bash
    node ./cli.js serve
    ```

## Restful API
#### POST /guard/secretToken, get secretToken
request BODY:
```JavaScript
{
    "destination": "summa",
    "user": "zimox2",
    "password": "myPassword" // optional, only needed for private account service
}
```
response BOYD:
```JavaScript
{
    "secretToken": "P7iLpaF9PXtdlXHathBjnY4PcR6w2bZ280xVDk6nhvsWD"
}
```

#### POST /supervisor
request BODY:
```JavaScript
{
	"aT": "bWQ1.eyJkYXRlIjoyMDIwMDgxMjAyfQ==.af415c396e9a21cb725c1a8e1e79e049",
	"dest": "summa",
	"env": {
		"A": 1,
		"B": "B",
		"C": 2
	},
	"payload": {
		"scripts": [
			"1.sh",
			"2.sh"
		]
	}
}
```
response BODY:
```JavaScript
{
    "aT": "bWQ1.eyJkYXRlIjoyMDIwMDgxMjAyfQ==.af415c396e9a21cb725c1a8e1e79e049",
    "uid": 1,
    "id": "1597266236HDAL",
	"dest": "summa",
	"env": {
		"A": 1,
		"B": "B",
		"C": 2
	},
	"payload": {
		"scripts": [
			"1.sh",
			"2.sh"
		]
	}
}
```

#### GET /supervisor
request BODY:
```JavaScript
{
	"aT": "bWQ1.eyJkYXRlIjoyMDIwMDgxMjIxfQ==.517fa03046ae53d3b14d6fcb2dc44274"
}
```

response BODY:
```JavaScript
{
    "events": {
        "1597266236HDAL": [
            {
                "type": "JOB_QUEUED",
                "message": "job [1597266236HDAL] is queued, waiting for registration",
                "at": "2020-08-12T21:03:55.898Z"
            },
            {
                "type": "JOB_REGISTERED",
                "message": "job [1597266236HDAL] is registered with the supervisor, waiting for initialization",
                "at": "2020-08-12T21:03:56.601Z"
            }
        ]
    },
    "logs": {
        "1597266236HDAL": [
            "this is a log"
        ]
    }
}
```

#### GET /supervisor/destination
request BODY:
```JavaScript
{}
```

response BODY:
```JavaScript
{
    "destinations": {
        "summa": {
            "ip": "keeling.earth.illinois.edu",
            "port": 22,
            "maintainer": "SUMMAMaintainer",
            "jobPoolCapacity": 5,
            "isCommunityAccount": true,
            "useUploadedFile": true,
            "uploadFileConfig": {
                "ignore": [],
                "mustHave": [
                    "summa_options.json",
                    "installTestCases_local.sh",
                    "data",
                    "output",
                    "settings"
                ],
                "ignoreEverythingExceptMustHave": true
            }
        },
        "spark": {
            "ip": "hadoop01.cigi.illinois.edu",
            "port": 50022,
            "maintainer": "SparkMaintainer",
            "jobPoolCapacity": 5,
            "isCommunityAccount": false,
            "useUploadedFile": true,
            "uploadFileConfig": {
                "mustHave": [
                    "index.py"
                ]
            }
        }
    }
}
```

#### /supervisor/:id (ex. /supervisor/1597266236HDAL)
request BODY:
```JavaScript
{
	"aT": "bWQ1.eyJkYXRlIjoyMDIwMDgxMjIxfQ==.517fa03046ae53d3b14d6fcb2dc44274"
}
```

response BODY:
```JavaScript
{
    "events": [
        {
            "type": "JOB_QUEUED",
            "message": "job [1597266236HDAL] is queued, waiting for registration",
            "at": "2020-08-12T21:03:55.898Z"
        },
        {
            "type": "JOB_REGISTERED",
            "message": "job [1597266236HDAL] is registered with the supervisor, waiting for initialization",
            "at": "2020-08-12T21:03:56.601Z"
        }
    ],
    "logs": [
        "this is a log"
    ]
}
```

## Command Line Tools
1. Revoke a secretToken
```bash
node cli.js revoke <sT>
```

2. Get user information (include secretToken) using uid
```bash
node cli.js check-user <uid>
```


## General Development Guidelines
### Development Environment Setup
 - The project uses TypeScript. Please install `tsc` command for compiling TypeScript to JavaScript.
```bash
npm install -g typescript
```
- to compile TypeScript into JavaScript, simply run:
```bash
tsc
```

### Add Service
Service is defined in `src/constant.ts`. There are three types:

- private account services:
> Users use their own Linux account & password to login and submit jobs to a remote terminal
```js
serviceName: {
    ip: "hadoop01.cigi.illinois.edu",
    port: 50022,
    maintainer: 'ExampleMaintainer',
    capacity: 5,
    isCommunityAccount: false
}
```
- community account using local key:
> A local private key is defined in config.json, usually under ~/.ssh. User login to community account using the machine's private-public key pairs
```js
serviceName: {
    ip: "keeling.earth.illinois.edu",
    port: 22,
    maintainer: 'SUMMAMaintainer',
    jobPoolCapacity: 5,
    isCommunityAccount: true,
    communityAccountSSH: {
        user: 'cigi-gisolve',
        useLocalKeys: true
    }
}
```
- community account using custom key:
> A custom private key is copied under ./key. Define the location of the private key and the passphrase associated with the key. User login to community account using the custom private-public key pairs
```js
serviceName: {
    ip: "keeling.earth.illinois.edu",
    port: 22,
    maintainer: 'SUMMAMaintainer',
    jobPoolCapacity: 5,
    isCommunityAccount: true,
    communityAccountSSH: {
        user: 'cigi-gisolve',
        useLocalKeys: false,
        key: {
            privateKeyPath: __dirname + '/../key/cigi-gisolve.key',
            passphrase: null
        }
    }
}
```

### User Upload File
If you want users to upload their own file, you can enable file upload functionality by setting `useUploadedFile` option in `src/constant.ts` to `true`.
```JavaScript
{
    ...,
    useUploadedFile: true,
    uploadFileConfig: {
        // files/folder to ignore
        ignore: [],
        // must have files
        mustHave: [
            'summa_options.json',
            'installTestCases_local.sh',
            'data',
            'output',
            'settings'
        ],
        // if you wish to ignore all files except must-have ones, enable this option
        ignoreEverythingExceptMustHave: true
    }
}
```

### Define Maintainer Class

Add a new **Maintainer** class under `./src/maintainers` which extends the `BaseMaintainer` class
```JavaScript
import BaseMaintainer from './BaseMaintainer'

class ExampleMaintainer extends BaseMaintainer {
    // your code
}
```

The lifecycle of a **Maintainer** class is defined as the following:

  1. `onInit()` method is called when a job first enters the job execution pool. The method is supposed to initialize the running environment before the job execution *(copy script, install packages, setup environment variables, etc.)*.
     -  The `Supervisor` invoke the `onInit()` method and stop when received a `JOB_INITIALIZED` event emitted by the `Maintainer`. 
     - If the method finished running yet never emitted a `JOB_INITIALIZED` event, the `Supervisor` will rerun the script until initialization success.
     - `onInit()` should always emit `JOB_INITIALIZED` event when initialization is completed.

  2. `onMaintain()` method is called when a job initialization is finalized. The method is supposed to check the status of the job.
     - The `Supervisor` invoke the `onMaintain()` method and stop when received a `JOB_ENDED` or `JOB_FAILED` event emitted by the `Maintainer`. 
     - `onMaintain()` should always emit `JOB_ENDED` or `JOB_FAILED` event when job is completed or failed on remote terminal.

**Maintainer** Interface:
  - **user define methods**
    - `define()`: *(optional)* define allowed system environment variables when connected to the remote terminal
    - `await onInit()`: *[async]* initialize job
    - `await onMaintain()`: *[async]* monitor job status
  - **helper methods**
    - `this.emitLog(message: string)`: emit log
    - `this.emitEvent(type: string, message: string)`: emit event
    - `await this.runPython(file: string, args?: Array<string>): any{}`: *[async]* run python script
      - **file**: name of the python script under `src/maintainers/python`
      - **args**: array of arguments passed in to the python script
        - use `sys.argv[i]` to receive argument
      - **magic python syntax**:
        - by printing the following string in your python script, the python process is able to communicate back with the maintainer.
          - `print('@log=[example log msg]')`: emit a log to `Maintainer`
          - `print('@event=[EVENT_NAME:event message]')`: emit an event to `Maintainer`
          - `print('@var=[NAME:value]')`: define an output of the `runPython()` class.
    - `await this.runBash(cmdPipeline: Array<any>, ?options: options)`: *[async]* execute BASH commands in sequence on remote terminal
      - **cmdPipeline**: an array of strings or anonymous functions
        - string: a command to execute (ex. `echo $A`)
        - anonymous function: a function that receives 
      - **options**:
        ```JavaScript
        options {
            cwd?: string,
            execOptions?: any,
            encoding?: BufferEncoding
        }
        ```
    - `await this.upload(destinationRootPath: string)`: upload file user uploaded files to remote server
    - `await this.download(sourceRootPath: string)`: download file from remote server
    - `this.registerCustomDownloadedPath(sourceRootPath: string)`: register downloaded file path
    - `this.injectRuntimeFlagsToFile(filePath: string, lang: string)`: inject stdout flags when running user's custom scripts to indicate runtime status (ex. SCRIPT_ENDED)

Python **Maintainer** Example
- SUMMAMaintainer.ts
```JavaScript
import BaseMaintainer from './BaseMaintainer'

class ExampleMaintainer extends BaseMaintainer {
    private output_a

    async onInit() {
        var params = await this.runPython('SUMMA/init.py', ['input_a', 'input_b'])
        this.output_a = params['output_a']
    }

    async onMaintain() {
        await this.runPython('SUMMA/maintain.py', [this.output_a])
    }
}

export default SUMMAMaintainer
```
- SUMMA/init.py
```python
input_a = str(sys.argv[1])
input_b = str(sys.argv[2])
# some code that initialize job
print("@event=[JOB_INITIALIZED:initialized SUMMA job in HPC job queue with remote_id: "
    + out["remote_id"]
    + "]")
print("@var=[output_a:"+out['a']+"]")
```

- SUMMA/maintain.py
```python
# some code that check job status
if job.status() == 'finished':
    print("@event=[JOB_ENDED:SUMMA job with remote_id: "
    + out["remote_id"]
    + " completed]")
elif job.status() == 'error':
    print("@event=[JOB_FAILED:SUMMA job with remote_id: "
    + out["remote_id"]
    + " failed]")
```

SSH **Maintainer** Example

```JavaScript
import BaseMaintainer from './BaseMaintainer'
const path = require('path')

class SparkMaintainer extends BaseMaintainer {

    private workspacePath

    define() {
        this.allowedEnv = {
            //
        }
    }

    async onInit() {
        this.injectRuntimeFlagsToFile('index.py', 'python')
        this.workspacePath = await this.upload(await this.getRemoteHomePath())
        this.emitEvent('JOB_INITIALIZED', 'job [' + this.id + '] is initialized, waiting for job completion')
    }

    async onMaintain() {
        var pipeline = [
            'python3 ' + path.join(this.workspacePath, 'index.py')
        ]

        await this.runBash(pipeline, {})
        await this.download(await this.getRemoteHomePath())
        this.emitEvent('JOB_ENDED', 'job [' + this.id + '] is complete')
    }
}

export default SparkMaintainer
```

## Future Roadmap
- <del>Spark/YARN submission</del>
