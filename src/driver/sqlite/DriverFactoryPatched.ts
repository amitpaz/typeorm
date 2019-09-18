import {DriverFactory} from "../DriverFactory";
import {Connection, Driver} from "../..";
import {SqliteDriverPatched} from "./SqliteDriverPatched";

export class DriverFactoryPatched extends DriverFactory {
    create (connection: Connection): Driver {
        const type = connection.options.type
        if (type === 'sqlite') {
            return new SqliteDriverPatched(connection)
        }
        return super.create(connection)
    }
}
