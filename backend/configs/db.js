import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

const sql = neon(`${process.env.DATABASE_URL}`);

export default sql;