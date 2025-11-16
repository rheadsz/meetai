"use client";

import { z } from "zod";



import { useTRPC } from "@/trpc/client";
import { AgentGetOne } from "@/modules/agents/types";
import { agentsInsertSchema } from "@/modules/agents/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AgentFormProps {

    onSuccess?: () => void;
    onCancel?: () => void;
    initialValues?: AgentGetOne;

};

export const AgentForm = ({
    onSuccess,
    onCancel,
    initialValues,
}: AgentFormProps) => {
    const router = useRouter();
    const utils = useTRPC.useUtils();

    const createAgent = useTRPC.agents.create.useMutation({
        onSuccess: async() => {
            await utils.agents.getMany.invalidate();

            if (initialValues?.id){
                await utils.agents.getOne.invalidate({ id: initialValues.id });
            }
            
            onSuccess?.();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const form = useForm<z.infer<typeof agentsInsertSchema>>({
        resolver: zodResolver(agentsInsertSchema),
         defaultValues: {
            name: initialValues?.name ?? "",
            instructions: initialValues?.instructions ?? "",
         },
    });

    const isEdit = !!initialValues?.id;
    const isPending = createAgent.isPending;

    const onSubmit = (values: z.infer<typeof agentsInsertSchema>) => {
        if (isEdit){
            console.log("TODO: updateAgent")
        }else{
            createAgent.mutate(values);
        }
        
    };

    return (
        <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <GeneratedAvatar
                seed={form.watch("name")}
                variant="botttsNeutral"
                className="border size-16">

                </GeneratedAvatar>

                <FormField
                name="name"
                control={form.control}
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="ex: Math tutor"/>
                        </FormControl>
                      
                       
                    </FormItem>
                )}
                >

                </FormField>

                                <FormField
                name="instructions"
                control={form.control}
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Textarea {...field}
                             placeholder="ex: you are a helpful math assistant that can answer questions and help with assignments"/>
                        </FormControl>
                      
                       
                    </FormItem>
                )}
                >

                </FormField>

                <div className="flex justify-between gap-x-2">
                    {onCancel && (
                        <Button
                        variant="ghost"
                        disabled={isPending}
                        type="button"
                        onClick={() => onCancel()}>
                            Cancel
                        </Button>

                    )}

                    <Button disabled={isPending} type="submit">
                        {isEdit? "Update": "Create"}

                    </Button>

                </div>

            </form>

        </Form>
    )

}
