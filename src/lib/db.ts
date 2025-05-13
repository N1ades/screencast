import { SQLiteKV } from "./sqlite-kv.ts";

export const db = new SQLiteKV('./db.sqlite3');