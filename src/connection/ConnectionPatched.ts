import {ConnectionOptions} from "./ConnectionOptions";
import {Connection} from "./Connection";
import {DriverFactoryPatched} from "../driver/sqlite/DriverFactoryPatched";

export class ConnectionPatched extends Connection {
    constructor (connectionOptions: ConnectionOptions) {
        super(connectionOptions);
        const that = this as any;
        that.driver = new DriverFactoryPatched().create(this);
    }
}
