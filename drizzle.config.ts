import {defineConfig} from 'drizzle-kit';
import dotenv from 'dotenv';
dotenv.config();
export default defineConfig({
    dialect:'postgresql',
    schema:'src/schema/schema.ts',
    out:'migration',
    dbCredentials:{url:process.env.DATABASE_URL!}
});