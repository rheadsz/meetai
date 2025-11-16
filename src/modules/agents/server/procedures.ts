import { z } from "zod";
import { eq, getTableColumns, sql } from "drizzle-orm";
import { db } from "@/db";
import { agents } from "@/db/schema";
import {  createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { agentsInsertSchema } from "../schemas";

export const agentsRouter = createTRPCRouter({
        getOne: protectedProcedure.input(z.object({id: z.string()})).query(async( {input} ) => {
        console.log('Fetching agents from database...');
        
        const [existingAgent] = await db
        .select({
            ...getTableColumns(agents),
            meetingCount: sql<number>`5`,
        })
        .from(agents)
        .where(eq(agents.id, input.id));

        return existingAgent;

    }),

    getMany: protectedProcedure.query(async() => {
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

    create: protectedProcedure
    .input(agentsInsertSchema)
    .mutation(async ({ input, ctx }) => {
        const [createdAgent] = await db
        .insert(agents)
        .values({
            ...input,
            userId: ctx.auth.user.id,

        })
        .returning();

        return createdAgent;
    })


});