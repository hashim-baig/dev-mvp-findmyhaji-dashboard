import { Pool } from "pg";

const dbPool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  user: process.env.PG_USER || 'admin',
  password: process.env.PG_PASSWORD || 'findmyhaji123', // must be a string
  database: process.env.PG_DATABASE || 'findmyhaji'
});

export default dbPool;