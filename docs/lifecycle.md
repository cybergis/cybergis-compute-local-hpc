# CyberGIS-Compute Core Lifecycle
The **core** is a middleware server that sits between **JupyterLab Environments** (ex. CyberGISX) and **HPCs**. It bridge the computing power of HPCs with the user-friendly UI of JupyterLab.

***

The server architecture is divided into:
1. **Server Space**: exposes a set of RESTful API interfaces, handles authentication
2. **Maintainer Pool**: automated processes that manages HPC jobs
3. **Connector Pool**: shared SSH connection between server and HPCs

***

## Build Project
- Before you build your code, you should install all dependencies using `npm install`. 
- Then, simply run `npm run build` to build your project. 
- All compiled code are under the `/production` folder.

## Models
We use [TypeORM](https://typeorm.io) to define service related data types in our databases. All models are defined in `/src/models`:
- [Job.ts](https://github.com/cybergis/cybergis-compute-core/blob/v2/src/models/Job.ts): represents a Job instance
- [Git.ts](https://github.com/cybergis/cybergis-compute-core/blob/v2/src/models/Git.ts): defines a git project
- [Log.ts](https://github.com/cybergis/cybergis-compute-core/blob/v2/src/models/Log.ts): represents a log entry (stdout/err) of a particular job.
- [Event.ts](https://github.com/cybergis/cybergis-compute-core/blob/v2/src/models/Event.ts): represents an event (execution step) of a particular job.
- [GlobusTransferRefreshToken.ts](https://github.com/cybergis/cybergis-compute-core/blob/v2/src/models/GlobusTransferRefreshToken.ts): represents the refresh token of a Globus entry point, [see doc](https://globus-sdk-python.readthedocs.io/en/stable/authorization.html).

***

## Server Space

### RESTful APIs
The RESTful APIs are constructed using [ExpressJS](http://expressjs.com), a lightweight JavaScript web framework. All server code is defined in a single file [/server.ts](https://github.com/cybergis/cybergis-compute-core/blob/v2/server.ts). This file is also responsible for [constructing all the components](https://github.com/cybergis/cybergis-compute-core/blob/7048cebf3aa6b80e6667572ec10b704a102ff790/server.ts#L39) and acts as the entrypoint for CyberGIS-Compute. 
> Just run `node /production/server.js` to start the Compute-Core.

### Authorization
For historical reasons, CyberGIS-Compute Core has two sets of authentication systems:
1. Job tokens: represents a job submission.
2. Jupyter Auth: native Jupyter API token, [see doc](https://jupyterhub.readthedocs.io/en/stable/reference/rest.html).

***

> ⚠️ JAT should be deprecated due to performance reasons, transition to only Jupyter Auth.

Job Token uses JAT (Job Access Token) as encryption scheme defined in [src/JAT.ts](https://github.com/cybergis/cybergis-compute-core/blob/v2/src/JAT.ts). Both client (SDK) and the server needs to use JAT in order for it to work. The client receives a `secretToken`, and parses it into `accessToken`. The server decodes the `accessToken` using `jat.parseAccessToken(aT)` and get information related to the job (mainly Job ID).

JAT is an **inefficient** design because validating an `accessToken` requires hashing every known `secretToken`s to match. The [Guard](https://github.com/cybergis/cybergis-compute-core/blob/v2/src/Guard.ts) object is designed to cache trusted `accessToken` and return `Job` object when validated.

***

For **user** authentication, we use the existing [Jupyter API Token](https://jupyterhub.readthedocs.io/en/stable/reference/rest.html) system. Given the `url` of the Jupyter instance and the `token`, we can ask Jupyter to validate the `token` and get the username. All Jupyter Auth related services are defined in [/src/JupyterHub.ts](https://github.com/cybergis/cybergis-compute-core/blob/v2/src/JupyterHub.ts)

***

### Queue
All incoming job submission requests will be stored in our database, and labeled as `Job.queuedAt = null`. The `Job` will enter a [redis Queue](https://github.com/cybergis/cybergis-compute-core/blob/v2/src/Queue.ts) waiting to be consumed by **Maintainer Pool**. If there is available capacity in the **Maintainer Pool**, it will `Queue.shift` the job out of the queue, and set `Job.queuedAt = new Date('current date')`.

***

## Maintainer
One of the design goals of this project is to allocate and manipulate complex computational resources with simple API calls. The **maintainer system** is designed to automate the HPC submission process according to user input.

### Defining A Simple Maintainer Process
A maintainer reads from the following user input, and perform automated tasks accordingly:
- `BaseMaintainer.job: Job`: the job object that describes:
   1. `executableFolder: string`: where the code locates
   2. `dataFolder: string`: where the uploaded data locates
   3. `resultFolder: string`: where the downloadable data locates
   4. `param: {[keys: string]: string}`: key-value of user input parameters
- `BaseMaintainer.hpc: hpc`: describes the HPC where the job locates
- `BaseMaintainer.slurm: slurm`: describes the computing resources allocation on a Slurm system

During the lifecycle of a maintainer process, the automated script will update the `BaseMaintainer.job` state using `BaseMaintainer.updateJob` and emit events/logs.

### Maintainer Lifecycle
The completion of a job has three stages:
1. `onDefine`: the maintainer configures itself before the lifecycle starts
2. `onInit`: the maintainer upload and initiates the job onto a remote HPC.
3. `onMaintain`: the maintainer checks the status of the job, logs necessary runtime information, and terminate the job if complete.

> ⚠️ note that automation in `onDefine` and `onInit` only runs once, while `onMaintain` will be called multiple times in a loop until complete.

### Maintainer Supervisor
Each user job request corresponds with a single maintainer process. A [Maintainer Supervisor](https://github.com/cybergis/cybergis-compute-core/blob/v2/src/Supervisor.ts)) is responsible for:
1. maintain a fixed amount of worker (defined in `Supervisor.jobPoolCapacities`) processes running in the system.
2. remove the job from the system once the job exited (if job emits `JOB_ENDED` or `JOB_FAILED` events)
3. Once there are available spaces (jobs running < capacity), try to 