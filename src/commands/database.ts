import * as ejs from "ejs";
import { errorAndExit, logInfo } from "../utils/log";
import { renderTemplate } from "../utils/Utils";

export const command: string = "database [config]";
export const desc: string = "Create a PostgreSQL schema.";
export const builder: any = {
    config: {
        required: false,
        desc: "The name of the configuration file to load."
    }
};

export const handler = (argv: any) => {};
