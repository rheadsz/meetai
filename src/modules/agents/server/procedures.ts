import { db } from "@/db";
import { agents } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const agentsRouter = createTRPCRouter({
    getMany: baseProcedure.query(async() => {
        console.log('Fetching agents from database...');
        
        const data = await db
        .select()
        .from(agents);
        
        console.log('Agents fetched:', data);
        console.log('Number of agents:', data.length);

        // Convert dates to strings for serialization
        const serializedData = data.map(agent => {
            const result = {
                ...agent,
                createdAt: typeof agent.createdAt === 'string' ? agent.createdAt : agent.createdAt?.toISOString(),
                updatedAt: typeof agent.updatedAt === 'string' ? agent.updatedAt : agent.updatedAt?.toISOString(),
            };
            console.log('Serialized agent:', result);
            return result;
        });

        console.log('Returning serialized data:', serializedData);
        return serializedData;
    }),
});