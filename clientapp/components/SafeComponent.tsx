import { useEffect, useState } from "react";
import { Skeleton } from "components/ui/skeleton"

const SafeComponent = ({ animation = true, children }: { animation?:boolean,  children: React.ReactNode }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {

        if (animation) {
            return (
                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                    <div className="flex flex-col space-y-3">
                        <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                </div>
            )
        } else {
            return (<></>)
        }
    }
    return <>{children}</>;
};

export default SafeComponent;