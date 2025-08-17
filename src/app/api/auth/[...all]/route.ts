import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";
 console.log(" API Route Loaded: /api/auth/[...all]");
export const { POST, GET } = toNextJsHandler(auth);
