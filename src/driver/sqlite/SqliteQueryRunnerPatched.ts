import {SqliteQueryRunner} from "./SqliteQueryRunner";
import {Mutex, MutexInterface} from "async-mutex";

const mutex = new Mutex();

export class SqliteQueryRunnerPatched extends SqliteQueryRunner {
    private _releaseMutex: MutexInterface.Releaser | null;
    async startTransaction (): Promise<void> {
        this._releaseMutex = await mutex.acquire()
        return super.startTransaction()
    }

    async commitTransaction (): Promise<void> {
        if (!this._releaseMutex) {
            throw new Error('SqliteQueryRunnerPatched.commitTransaction -> mutex releaser unknown')
        }
        await super.commitTransaction()
        this._releaseMutex()
        this._releaseMutex = null
    }

    async rollbackTransaction (): Promise<void> {
        if (!this._releaseMutex) {
            throw new Error('SqliteQueryRunnerPatched.rollbackTransaction -> mutex releaser unknown')
        }
        await super.rollbackTransaction()
        this._releaseMutex();
        this._releaseMutex = null;
    }

    async connect (): Promise<any> {
        if (!this.isTransactionActive) {
            const release = await mutex.acquire()
            release()
        }
        return super.connect()
    }
}
