import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export const LoadingPage = ({ visible, screen = true, absolute = false, background = true }: { visible: boolean, screen?: boolean, absolute?: boolean, background?: boolean }) => {
    const { t } = useTranslation()
    return (
        <div className={`${screen ? "w-screen h-screen" : "w-full h-full"} ${absolute && "absolute"} select-none flex justify-center items-center z-50 absolute ${background ? "bg-background" : "bg-transparent"} transition-opacity duration-300 ease-in-out overflow-hidden ${visible ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}>
            <div className="flex">
                <Loader2 className="animate-spin" />
                <span className="font-bold ml-3">{t("loading")}</span>
            </div>
        </div>
    )
}