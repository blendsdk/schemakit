import { generateInterface, PostgreSQLDatabase } from "../src";
import { has } from "./has";

test("create types", async () => {
    const db = new PostgreSQLDatabase();
    const t1 = db.addTable("table1", "yours");
    t1.primaryKeyColumn("id");
    t1.stringColumn("email", { unique: true });

    const result = generateInterface(t1.getName(), t1.getColumns())
        .split("\n")
        .map(l => {
            return l.trim();
        });
    expect(has(result, "export interface IYoursTable1 {")).toBeTruthy();
});
