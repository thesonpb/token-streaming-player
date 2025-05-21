const HARPER_DB_USERNAME = "HDB_ADMIN";
const HARPER_DB_PASSWORD = "son123456";
export const AUTH = Buffer.from(
    `${HARPER_DB_USERNAME}:${HARPER_DB_PASSWORD}`
).toString("base64");
