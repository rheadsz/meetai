import { AgentsView } from "@/modules/agents/server/ui/views/agents-view";
import { AgentsListHeader } from "@/modules/agents/server/ui/views/components/agents-list-header";

const Page = () => {
    
    return( 
        <div>
        <AgentsListHeader />
    
        <AgentsView />
        </div>
);

    

}

export default Page;