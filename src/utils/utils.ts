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
