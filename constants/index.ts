import "dotenv/config";

const HARPER_DB_USERNAME = process.env.NEXT_PUBLIC_HARPER_DB_USERNAME;
const HARPER_DB_PASSWORD = process.env.NEXT_PUBLIC_HARPER_DB_PASSWORD;
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const AUTH = Buffer.from(
    `${HARPER_DB_USERNAME}:${HARPER_DB_PASSWORD}`
).toString("base64");
