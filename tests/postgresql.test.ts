import { PostgreSQLDatabase } from "../src";
import { has } from "./has";

test("create table public", async () => {
    const db = new PostgreSQLDatabase();
    db.addTable("table1");
    const result = db.create();
    expect(has(result, "DROP TABLE IF EXISTS table1 CASCADE")).toBeTruthy();
    expect(has(result, "CREATE TABLE table1()")).toBeTruthy();
});

test("create table schema", async () => {
    const db = new PostgreSQLDatabase();
    db.addTable("table1", "my");
    const result = db.create();
    expect(has(result, "DROP SCHEMA IF EXISTS my CASCADE")).toBeTruthy();
    expect(has(result, "DROP TABLE IF EXISTS my.table1 CASCADE")).toBeTruthy();
    expect(has(result, "CREATE TABLE my.table1()")).toBeTruthy();
});

test("create contarints public", async () => {
    const db = new PostgreSQLDatabase();
    const t1 = db.addTable("table1");
    t1.primaryKeyColumn("id");
    t1.stringColumn("email", { unique: true });

    const t2 = db.addTable("table2");
    t2.primaryKeyColumn("id");
    t2.referenceColumn("table1_id", t1, "id");

    const result = db.create();
    expect(has(result, "ALTER TABLE table1 ADD COLUMN id serial NOT NULL")).toBeTruthy();
    expect(has(result, "ALTER TABLE table1 ADD PRIMARY KEY (id)")).toBeTruthy();
    expect(has(result, "ALTER TABLE table1 ADD PRIMARY KEY (id)")).toBeTruthy();
    expect(has(result, "ALTER TABLE table1 ADD UNIQUE (email)")).toBeTruthy();
    expect(
        has(
            result,
            "ALTER TABLE table2 ADD FOREIGN KEY (table1_id) REFERENCES table1 (id) ON UPDATE CASCADE ON DELETE CASCADE"
        )
    ).toBeTruthy();
});

test("create contarints schema", async () => {
    const db = new PostgreSQLDatabase();
    const t1 = db.addTable("table1", "yours");
    t1.primaryKeyColumn("id");
    t1.stringColumn("email", { unique: true });

    const t2 = db.addTable("table2", "my");
    t2.primaryKeyColumn("id");
    t2.referenceColumn("table1_id", t1, "id");
    const result = db.create();
    expect(has(result, "ALTER TABLE yours.table1 ADD COLUMN id serial NOT NULL")).toBeTruthy();
    expect(has(result, "ALTER TABLE yours.table1 ADD PRIMARY KEY (id)")).toBeTruthy();
    expect(has(result, "ALTER TABLE yours.table1 ADD PRIMARY KEY (id)")).toBeTruthy();
    expect(has(result, "ALTER TABLE yours.table1 ADD UNIQUE (email)")).toBeTruthy();
    expect(
        has(
            result,
            "ALTER TABLE my.table2 ADD FOREIGN KEY (table1_id) REFERENCES yours.table1 (id) ON UPDATE CASCADE ON DELETE CASCADE"
        )
    ).toBeTruthy();
});
