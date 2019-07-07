import { Pool, QueryResult } from "pg";
import { Database } from "./Database";
import { ForeignKeyConstraint } from "./ForeignKeyConstraint";
import { Table } from "./Table";
import { eDBColumnType, eDBConstraintType, eDBForeignKeyAction } from "./Types";
import { log } from "../utils/Utils";

/**
 * The global PG Pool object.
 */
let pool: Pool = new Pool();

/**
 * Interface for configuring a database connection
 *
 * @export
 * @interface IConnection
 */
export interface IConnection {
    host: string;
    database: string;
    user: string;
    password: string;
    port?: string;
}

export function createConnection(config: IConnection) {
    pool = new Pool(config as any)
}

/**
 * Executes a SQL statement and returns a QueryResult object
 *
 * @param {string} stmt
 * @param {any[]} [params]
 * @returns {Promise<QueryResult>}
 */
function executeQuery(stmt: string, params?: any[]): Promise<QueryResult> {
    log(`${stmt};`);
    return pool.query(stmt, params || []);
}

/**
 * This class is generated a PostgreSQL database based on the Database/Table
 * description.
 *
 * @export
 * @class PostgreSQLDatabase
 * @extends {Database}
 */
export class PostgreSQLDatabase extends Database {
    /**
     * Internal sql scripts lines.
     */
    protected script: string[];
    protected schemas: any;

    /**
     * Creates an instance of PostgreSQLDatabase.
     * @memberof PostgreSQLDatabase
     */
    public constructor() {
        super();
        this.script = [];
        this.schemas = {};
    }

    /**
     * Adds a table to this database.
     * @override
     * @param {string} name
     * @returns {Table}
     * @memberof PostgreSQLDatabase
     */
    public addTable(name: string): Table {
        const parts = name.split('.');
        if (parts.length === 2) {
            this.schemas[parts[0]] = true;
        }
        return super.addTable(name);
    }

    /**
     * Maps the column types to PostgreSQL types.
     *
     * @protected
     * @param {eDBColumnType} type
     * @returns {string}
     * @memberof PostgreSQLDatabase
     */
    protected mapColumnType(type: eDBColumnType): string {
        switch (type) {
            case eDBColumnType.string:
                return "varchar";
            case eDBColumnType.number:
                return "integer";
            case eDBColumnType.guid:
                return "uuid";
            case eDBColumnType.decimal:
                return "decimal";
            case eDBColumnType.dateTime:
                return "timestamp";
            case eDBColumnType.boolean:
                return "boolean";
            case eDBColumnType.autoIncrement:
                return "serial";
            default:
                throw Error(`Undefined column type ${type}`);
        }
    }

    /**
     * Map the foreign key reference actions.
     *
     * @protected
     * @param {eDBForeignKeyAction} type
     * @returns
     * @memberof PostgreSQLDatabase
     */
    protected mapRefAction(type: eDBForeignKeyAction) {
        switch (type) {
            case eDBForeignKeyAction.cascade:
                return "CASCADE";
            case eDBForeignKeyAction.setNull:
                return "SET NULL";
            default:
                throw Error(`Undefined reference action type ${type}`);
        }
    }

    /**
     * Drop cascade the table.
     *
     * @protected
     * @param {Table} table
     * @memberof PostgreSQLDatabase
     */
    protected dropTable(table: Table) {
        this.script.push(`DROP TABLE IF EXISTS ${table.getName()} CASCADE`);
    }

    /**
     * Create the table.
     *
     * @param {Table} table
     * @memberof PostgreSQLDatabase
     */
    protected createTable(table: Table) {
        this.script.push(`CREATE TABLE ${table.getName()}()`);
    }

    /**
     * Create the table columns.
     *
     * @protected
     * @param {Table} table
     * @memberof PostgreSQLDatabase
     */
    protected createColumns(table: Table) {
        const me = this;
        table.getColumns().forEach(column => {
            me.script.push(
                `ALTER TABLE ${table.getName()} ADD COLUMN ${column.getName()} ${this.mapColumnType(
                    column.getType()
                )} ${column.isRequired() ? "NOT NULL" : ""} ${
                    column.getDefault() ? `DEFAULT ${column.getDefault()}` : ""
                    } ${column.getCheck() ? `CHECK (${column.getCheck()})` : ""}`.trim()
            );
        });
    }

    /**
     * Create the primary key.
     *
     * @protected
     * @param {Table} table
     * @memberof PostgreSQLDatabase
     */
    protected createPrimaryKey(table: Table) {
        const pkey = table.getPrimaryKey();
        if (pkey) {
            this.script.push(`ALTER TABLE ${table.getName()} ADD PRIMARY KEY (${pkey.getColumnNames().join(",")})`);
        }
    }

    /**
     * Create the unique constraints.
     *
     * @protected
     * @param {Table} table
     * @memberof PostgreSQLDatabase
     */
    protected createUniqueConstraints(table: Table) {
        const me = this;
        table.getConstraints(eDBConstraintType.unique).forEach(item => {
            me.script.push(`ALTER TABLE ${table.getName()} ADD UNIQUE (${item.getColumnNames().join(",")})`);
        });
    }

    /**
     * Create the foreign keys constraints.
     *
     * @protected
     * @param {Table} table
     * @memberof PostgreSQLDatabase
     */
    protected createForeignKeyConstraints(table: Table) {
        const me = this;
        table.getConstraints<ForeignKeyConstraint>(eDBConstraintType.foreignKey).forEach(item => {
            me.script.push(
                `ALTER TABLE ${table.getName()} ADD FOREIGN KEY (${item
                    .getColumnNames()
                    .join(",")}) REFERENCES ${item.getRefTable().getName()} (${item
                        .getRefColumns()
                        .join(",")}) ON UPDATE ${me.mapRefAction(item.getOnUpdate())} ON DELETE ${me.mapRefAction(
                            item.getOnDelete()
                        )}`
            );
        });
    }

    protected rebuildSchema(name: string) {
        this.script.push(`DROP SCHEMA IF EXISTS ${name} CASCADE`);
        this.script.push(`CREATE SCHEMA ${name}`);
    }

    /**
     * @override
     * @memberof PostgreSQLDatabase
     */
    public create() {
        Object.keys(this.schemas).forEach(schema => {
            this.rebuildSchema(schema);
        })
        this.tables.forEach(table => {
            this.dropTable(table);
        });
        this.tables.forEach(table => {
            this.createTable(table);
            this.createColumns(table);
            this.createPrimaryKey(table);
            this.createUniqueConstraints(table);
        });
        this.tables.forEach(table => {
            this.createForeignKeyConstraints(table);
        });
        executeQuery(this.script.join(";\n")).then(() => {
            pool.end();
        });
    }
}
