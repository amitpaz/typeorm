import {SqliteDriver} from "./SqliteDriver";
import {QueryRunner} from "../..";
import {SqliteQueryRunnerPatched} from "./SqliteQueryRunnerPatched";

export class SqliteDriverPatched extends SqliteDriver {
    createQueryRunner (mode: 'master' | 'slave' = 'master'): QueryRunner {
        if (mode === 'slave') {
            return new SqliteQueryRunnerPatched(this);
        }
        if (!this.queryRunner) {
            this.queryRunner = new SqliteQueryRunnerPatched(this)
        }
        return this.queryRunner
    }
}
