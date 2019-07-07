import * as ejs from "ejs";
import * as fs from "fs";
import * as path from "path";

/**
 * Logs the to console.
 *
 * @export
 * @param {string} message
 */
export function log(message: string) {
    if (process.env.DEBUG) {
        console.log(message);
    }
}

/**
 * Renders a template
 *
 * @export
 * @param {string} name
 * @param {*} [data]
 * @returns {string}
 */
export function renderTemplate(name: string, data?: any): string {
    const file = path.join(__dirname, "..", "..", "templates", name.replace(/\//gim, path.sep));
    const templates = fs.readFileSync(file).toString();
    ejs.clearCache();
    return ejs.render(templates, data || {});
}

/**
 * Converts tabs to spaces
 *
 * @export
 * @param {string} text
 * @returns {string}
 */
export function tabsToSpaces(text: string): string {
    return text
        .split("\n")
        .map(line => {
            return line.replace(/\t/gim, "    ").trimRight();
        })
        .join("\n");
}
