import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({
    /** Use explicit URL to ensure port 3000 is used */
    baseURL: "http://localhost:3000"
})