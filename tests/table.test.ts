import { Table } from "../src/database/Table";

test("table name", async () => {
    const table = new Table("table1");
    expect(table.getName()).toEqual("table1");
});

test("table name with schema", async () => {
    const table = new Table("table1", "schema1");
    expect(table.getName()).toEqual("schema1.table1");
});
