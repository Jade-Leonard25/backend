import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from './schema/schema.js'
import 'dotenv/config'
import {db} from './db.js'
export const auth = betterAuth({
    database:drizzleAdapter(db,{
        provider:'pg',schema
    }),
    emailAndPassword:{enabled:true},
    advanced:{
        disableOriginCheck:process.env.NODE_ENV !== "production"
    }
})