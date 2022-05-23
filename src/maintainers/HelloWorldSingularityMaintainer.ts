import SingularityConnector from '../connectors/SingularityConnector'
import BaseMaintainer from './BaseMaintainer'
import { LocalFolder } from '../FileSystem'

export default class HelloWorldSingularityMaintainer extends BaseMaintainer {

    public connector: SingularityConnector

    public resultFolder: LocalFolder

    public executableFolder: LocalFolder

    private entry_script_template = `
import time
print("{{content}}") # {{content}} is replaceable
time.sleep(5) #sleep for 5 seconds
print("job complete!")
`

    private entry_script_file_name = 'main.py'

    private image_path = '/data/keeling/a/cigi-gisolve/simages/spatialaccess.simg'

    onDefine() {
        // define connector
        this.connector = this.getSingularityConnector()
    }

    /**
     * On maintainer initialization, set executableFolder and give it to the connector. Log event reflecting if the job was initialized or encountered a system error.
     * 
     * @async
     */
    async onInit() {
        try {
            var replacements = {content: "hello world"}
            this.executableFolder.putFileFromTemplate(this.entry_script_template, replacements, this.entry_script_file_name)
            this.connector.execCommandWithinImage(this.image_path, `python ${this.connector.getContainerExecutableFolderPath('./main.py')}`, this.slurm)
            await this.connector.submit()
            this.emitEvent('JOB_INIT', 'job [' + this.id + '] is initialized, waiting for job completion')
        } catch (e) {
            this.emitEvent('JOB_RETRY', 'job [' + this.id + '] encountered system error ' + e.toString())
        }
    }

    /**
     * If the job is complete, clear executable files and get slurm stdout, and if it encounters an error, update the event log to reflect this.
     * 
     * @async
     */
    async onMaintain() {
        try {
            var status = await this.connector.getStatus()
            if (status == 'C' || status == 'UNKNOWN') {
                await this.connector.getSlurmStdout()
                await this.connector.getSlurmStderr()
                // ending condition
                await this.connector.rm(this.connector.getRemoteExecutableFolderPath()) // clear executable files
                this.emitEvent('JOB_ENDED', 'job [' + this.id + '] finished')
            } else if (status == 'ERROR') {
                // failing condition
                this.emitEvent('JOB_FAILED', 'job [' + this.id + '] failed')
            }
        } catch (e) {
            this.emitEvent('JOB_RETRY', 'job [' + this.id + '] encountered system error ' + e.toString())
        }
    }

    /**
     * Pause the connector
     */
    async onPause() {
        await this.connector.pause()
    }

    /**
     * Resume the connector
     */
    async onResume() {
        await this.connector.resume()
    }

    /**
     * Cancel the connector
     */
    async onCancel() {
        await this.connector.cancel()
    }
}
