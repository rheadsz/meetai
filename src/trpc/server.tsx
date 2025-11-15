import 'server-only'; // <-- ensure this file cannot be imported from the client
import { cache } from 'react';
import { createTRPCContext } from './init';
import { makeQueryClient } from './query-client';
import { appRouter } from './routers/_app';
import { createServerSideHelpers } from '@trpc/react-query/server';

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient);

export const getServerSideHelpers = cache(() =>
  createServerSideHelpers({
    router: appRouter,
    ctx: createTRPCContext(),
  })
);

export const trpc = getServerSideHelpers();