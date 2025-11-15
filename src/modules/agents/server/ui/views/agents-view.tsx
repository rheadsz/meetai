"use client";

import { LoadingState } from "@/components/loading-state";

import { useTRPC } from "@/trpc/client";

export const AgentsView = () => {
    const { data, isLoading, error } = useTRPC.agents.getMany.useQuery();
    
    if (isLoading) {
        return <LoadingState title="Loading Agents" description="Fetching agents..." />;
    }
    
    if (error) {
        return <div className="p-4 text-red-500">Error: {error.message}</div>;
    }
    
    return (
        <div className="p-4">
            
            <h2 className="text-xl font-bold mb-4">Agents Data:</h2>
            <p className="mb-2">Data exists: {data ? 'Yes' : 'No'}</p>
            <p className="mb-2">Data length: {data?.length ?? 'N/A'}</p>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
               
                {data ? JSON.stringify(data, null, 2) : 'No data'}
            </pre>
        </div>
    )
};

export const AgentsViewLoading = () => {
    return (
        <LoadingState title="Loading Agents" description="This may take a few seconds..." />
    )
};