import { Base } from "./Base";
import { Table } from "./Table";

/**
 * Base class for modeling a database with tables.
 *
 * @export
 * @abstract
 * @class Database
 * @extends {Base}
 */
export abstract class Database extends Base {
    /**
     * Internal list of tables.
     *
     * @protected
     * @type {Table[]}
     * @memberof Database
     */
    protected tables: Table[];

    /**
     * Abstract method for implementing the database creation scripts.
     *
     * @protected
     * @abstract
     * @returns {*}
     * @memberof Database
     */
    public abstract create(): any;

    /**
     * Creates an instance of Database.
     * @memberof Database
     */
    public constructor() {
        super("");
        this.tables = [];
    }

    /**
     * Adds a table to this database.
     *
     * @param {string} name
     * @returns {Table}
     * @memberof Database
     */
    public addTable(name: string, schema?: string): Table {
        this.tables.push(new Table(name, schema));
        return this.tables[this.tables.length - 1];
    }

    /**
     * Gets the tables from this database.
     *
     * @returns {Table[]}
     * @memberof Database
     */
    public getTables(): Table[] {
        return this.tables;
    }
}
