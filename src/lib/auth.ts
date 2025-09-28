import { betterAuth } from "better-auth";
import { drizzleAdapter} from "better-auth/adapters/drizzle";

import {db} from "@/db";
import * as schema from "@/db/schema";
export const auth = betterAuth({
    trustedOrigins: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://10.0.0.80:3000",
        "http://10.0.0.80:3001",
        "http://10.0.0.80:3002"
    ],
    socialProviders: {
        github: { 
            clientId: process.env.GITHUB_CLIENT_ID as string, 
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
        }, 
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 

    },
    emailAndPassword:{
        enabled: true,
    },
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema: {
            ...schema,
        },
    }),
});