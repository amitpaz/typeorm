import {ConnectionManager} from "./connection/ConnectionManager";
import {ConnectionOptions} from "./connection/ConnectionOptions";
import {Connection} from "./connection/Connection";
import {AlreadyHasActiveConnectionError} from "./error/AlreadyHasActiveConnectionError";
import {ConnectionPatched} from "./connection/ConnectionPatched";
import {EntityManager} from "./entity-manager/EntityManager";
import {QueryRunnerProviderAlreadyReleasedError} from "./error/QueryRunnerProviderAlreadyReleasedError";

export const monekypatch = () => {
    ConnectionManager.prototype.create = function (options: ConnectionOptions): Connection {
        const that = this as any
        const existConnection = that.connections.find((conn: any) => conn.name === (options.name || 'default'))
        if (existConnection) {
            // if connection is registered and its not closed then throw an error
            if (existConnection.isConnected) {
                throw new AlreadyHasActiveConnectionError(options.name || 'default')
            }

            // if its registered but closed then simply remove it from the manager
            that.connections.splice(that.connections.indexOf(existConnection), 1)
        }

        // create a new connection
        const connection = new ConnectionPatched(options)
        that.connections.push(connection)
        return connection
    }
    // @ts-ignore
    EntityManager.prototype.transaction = async function <T> (
        runInTransaction: (entityManger: EntityManager) => Promise<T>
    ): Promise<T> {
        if (this.queryRunner && this.queryRunner.isReleased) {
            throw new QueryRunnerProviderAlreadyReleasedError()
        }

        if (this.queryRunner && this.queryRunner.isTransactionActive) {
            throw new Error(`Cannot start transaction because its already started`)
        }

        const queryRunner = this.connection.createQueryRunner('slave')

        try {
            await queryRunner.startTransaction()
            const result = await runInTransaction(queryRunner.manager)
            await queryRunner.commitTransaction()
            return result
        } catch (err) {
            try { // we throw original error even if rollback thrown an error
                await queryRunner.rollbackTransaction()
                // tslint: disable-next-line
            } catch (rollbackError) {
                // tslint: disable-next-line
            }
            throw err
        } finally {
            await queryRunner.release()
        }
    }
}
