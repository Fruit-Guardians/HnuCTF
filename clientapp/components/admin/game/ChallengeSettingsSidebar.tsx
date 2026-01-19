import { Button } from "components/ui/button";
import { useGlobalVariableContext } from "contexts/GlobalVariableContext";
import { Flag, Minimize, Package, PocketKnife, ReceiptText, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

export default function ChallengeSettingsSidebar(
    {
        curChoicedModule,
        setCurChoicedModule,
        setSheetOpen
    }: {
        curChoicedModule: string,
        setCurChoicedModule: Dispatch<SetStateAction<string>>,
        setSheetOpen: Dispatch<SetStateAction<boolean>>
    }
) {

    const { theme } = useTheme()
    const { t } = useTranslation("challenge_manage")
    const { clientConfig } = useGlobalVariableContext()

    type Module = {
        id: string,
        name: string,
        icon: React.ReactNode,
        onclick?: () => void,
        shouldDisable?: () => boolean
    }

    const getGameIcon = () => {
        if (theme === "dark") {
            return clientConfig.SVGIconDark
        } else {
            return clientConfig.SVGIconLight
        }
    }

    const modules: Module[] = [
        {
            id: "challenge_settings",
            name: t("setting"),
            icon: <ReceiptText className="h-4 w-4" />,
        },
        {
            id: "game_settings",
            name: t("base"),
            icon: <Settings className="h-4 w-4" />,
        },
        {
            id: "containers",
            name: t("container"),
            icon: <Package className="h-4 w-4" />,
        },
        {
            id: "submissions",
            name: t("history"),
            icon: <Flag className="h-4 w-4" />,
        },
        {
            id: "tools",
            name: t("challenge_tool"),
            icon: <PocketKnife className="h-4 w-4" />,
        },
    ];

    return (
        <div className="w-16 flex-none flex flex-col gap-4 border-r-1 h-full items-center py-5">
            <img
                className="mb-4"
                src={getGameIcon()}
                width={36}
                height={36}
                data-tooltip-id="my-tooltip"
                data-tooltip-html={"A1CTF"}
                data-tooltip-place="right"
            />
            {modules.map((module, i) => (
                <Button key={i}
                    className={`w-[45px] h-[45px] [&_svg]:size-6 cursor-pointer rounded-xl ${curChoicedModule != module.id ? "hover:bg-foreground/10" : ""}`}
                    variant={curChoicedModule === module.id ? "default" : "ghost"}
                    data-tooltip-id="my-tooltip"
                    data-tooltip-html={module.name}
                    data-tooltip-place="right"
                    onClick={() => {
                        if (module.onclick) {
                            module.onclick()
                        } else {
                            setCurChoicedModule(module.id)
                        }
                    }}
                    disabled={module.shouldDisable ? module.shouldDisable() : false}
                >
                    {module.icon}
                </Button>
            ))}
            <div className="flex-1" />
            <Button className="w-[45px] h-[45px] [&_svg]:size-6 cursor-pointer rounded-xl hover:bg-foreground/10" variant="ghost"
                data-tooltip-id="my-tooltip"
                data-tooltip-html={t("close")}
                data-tooltip-place="right"
                onClick={() => {
                    setSheetOpen(false)
                }}
            >
                <Minimize />
            </Button>
        </div>
    )
}