import  Image  from "next/image";

interface Props {
    title: string;
    description: string;
};

export const EmptyState = (
    {
        title,
        description
    }: Props) => {
        return (
            <div className="py-4 px-8 flex flex-1 items-center justify-center">

                    <Image src="/logo.svg" alt="Empty" width={240} height={240} className="size-6 text-red-500"/>
                    <div className="flex flex-col gap-y-2 max-w-md mx-autotext-center">
                        <h6 className="text-lg font-medium">{title}</h6>
                        <p className="text-sm text-muted-foreground">{description}</p>

                    </div>

               
            </div>
        )

    };
