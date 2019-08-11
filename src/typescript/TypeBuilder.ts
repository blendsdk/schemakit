import { camelCase } from "@blendsdk/stdlib/dist/camelCase";
import { wrapInArray } from "@blendsdk/stdlib/dist/wrapInArray";
import * as fs from "fs";
import { Column } from "../database/Column";
import { Table } from "../database/Table";
import { eDBColumnType } from "../database/Types";
import { renderTemplate, tabsToSpaces } from "../utils/utils";

/**
 * Maps generic types to typescript types.
 *
 * @export
 * @param {eDBColumnType} type
 * @returns {string}
 */
function mapColumnType(type: eDBColumnType): string {
    switch (type) {
        case eDBColumnType.string:
            return "string";
        case eDBColumnType.number:
            return "number";
        case eDBColumnType.guid:
            return "string";
        case eDBColumnType.decimal:
            return "number";
        case eDBColumnType.dateTime:
            return "Date";
        case eDBColumnType.boolean:
            return "boolean";
        case eDBColumnType.autoIncrement:
            return "number";
        default:
            throw Error(`Undefined column type ${type}`);
    }
}

/**
 * Generates an interface
 *
 * @param {Table} table
 * @returns
 */
function generateInterfaceForTable(table: Table) {
    return generateInterface(table.getName(), table.getColumns());
}

/**
 * Generates an interface
 *
 * @export
 * @param {string} tableName
 * @param {(Column | Column[])} column
 * @returns
 */
export function generateInterface(tableName: string, column: Column | Column[]) {
    return renderTemplate("typescript/interface.ejs", {
        name: `I${camelCase(tableName.replace(/\./gi, "_"))}`,
        columns: wrapInArray(column),
        tableName,
        mapType: mapColumnType
    });
}

/**
 * Creates TypeScript interfaces based on
 * Table objects
 *
 * @export
 * @param {string} outFile
 * @param {Table[]} tables
 */
export function createTypes(outFile: string, tables: Table[]) {
    const result: string[] = [];
    tables.forEach(table => {
        result.push(generateInterfaceForTable(table).trim());
    });
    fs.writeFileSync(outFile, tabsToSpaces(result.join("\n\n")));
}
