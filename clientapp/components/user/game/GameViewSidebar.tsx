import AvatarUsername from "components/modules/AvatarUsername";
import { A1GameStatus } from "components/modules/game/GameStatusEnum";
import ToggleTheme from "components/ToggleTheme";
import { Button } from "components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "components/ui/dropdown-menu";
import { useGlobalVariableContext } from "contexts/GlobalVariableContext";
import { useGame } from "hooks/UseGame";
import { BowArrow, Cctv, DoorOpen, Info, Settings, UserRoundMinus, UserSearch, WandSparkles, Wrench } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "react-toastify/unstyled";
import { ParticipationStatus, UserRole } from "utils/A1API";

export default function GameViewSidebar(
    {
        curChoicedModule,
        gameID,
    }: {
        curChoicedModule: string,
        gameID: number,
    }
) {
    const { gameInfo, gameStatus, teamStatus } = useGame(gameID)
    const { clientConfig, curProfile, isAdmin, unsetLoginStatus } = useGlobalVariableContext()
    const { t } = useTranslation()
    const { t: gameViewT } = useTranslation("game_view")

    type Module = {
        id: string,
        name: string,
        icon: React.ReactNode,
        onclick?: () => void,
        shouldDisable?: () => boolean
    }

    const modules: Module[] = [
        {
            id: "info",
            name: gameViewT("game_info"),
            icon: <Info className="h-4 w-4" />,
        },
        {
            id: 'challenges',
            name: gameViewT("challenge_list"),
            icon: <BowArrow className="h-4 w-4" />,
            shouldDisable: () => {
                return (gameStatus != A1GameStatus.Running && gameStatus != A1GameStatus.PracticeMode) || teamStatus != ParticipationStatus.Approved
            }
        },
        {
            id: 'scoreboard',
            name: gameViewT("scoreboard.title"),
            icon: <Cctv className="h-4 w-4" />,
            shouldDisable: () => {
                return gameStatus == A1GameStatus.Pending || gameStatus == A1GameStatus.NoSuchGame
            }
        },
        {
            id: 'team',
            name: gameViewT("team_manage"),
            icon: <UserSearch className="h-4 w-4" />,
            shouldDisable: () => {
                return teamStatus == ParticipationStatus.UnLogin
            }
        },
    ];

    if (curProfile.role == UserRole.ADMIN) {
        modules.push({
            id: 'admin',
            name: gameViewT("admin_manage"),
            icon: <Wrench className="h-4 w-4" />,
            onclick: () => {
                navigate(`/admin/games/${gameID}/basic`)
            }
        })
    }

    const navigate = useNavigate()

    const { theme } = useTheme()

    const getGameIcon = () => {
        if (theme === "dark") {
            return gameInfo?.game_icon_dark ?? clientConfig.SVGIconDark
        } else {
            return gameInfo?.game_icon_light ?? clientConfig.SVGIconLight
        }
    }

    const handleLoginOut = () => {
        unsetLoginStatus()
        toast.success(t("login_out_success"))
    }

    return (
        <div className="w-16 h-full border-r-[1px] z-[20] bg-background select-none">
            <div className="flex flex-col w-full h-full gap-4 items-center py-4 pt-5">
                <img
                    className="mb-4"
                    src={getGameIcon()}
                    alt={gameInfo?.name ?? "A1CTF ???????"}
                    width={36}
                    height={36}
                    data-tooltip-id="my-tooltip"
                    data-tooltip-html={gameInfo?.name ?? "A1CTF ???????"}
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
                                navigate(`/games/${gameID}/${module.id}`)
                            }
                        }}
                        disabled={isAdmin() ? false : (module.shouldDisable ? module.shouldDisable() : false)}
                    >
                        {module.icon}
                    </Button>
                ))}
                <div className="flex-1" />
                {teamStatus != ParticipationStatus.UnLogin && teamStatus != ParticipationStatus.UnRegistered && (
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger>
                            <div className="w-[40px] h-[40px] flex-shrink-0 mb-2"
                                data-tooltip-id="my-tooltip"
                                data-tooltip-html={gameInfo?.team_info?.team_name ?? "????"}
                                data-tooltip-place="right"
                            >
                                <AvatarUsername avatar_url={gameInfo?.team_info?.team_avatar} username={gameInfo?.team_info?.team_name || ""} />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="ml-2">
                            <DropdownMenuItem onClick={() => navigate(`/profile/basic`)}>
                                <Settings />
                                <span>{t("settings")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLoginOut}>
                                <UserRoundMinus />
                                <span>{t("login_out")}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                )}
                <ToggleTheme>
                    <Button
                        className={`w-[45px] h-[45px] [&_svg]:size-6 cursor-pointer rounded-xl`}
                        variant="ghost"
                        data-tooltip-id="my-tooltip"
                        data-tooltip-html={gameViewT("switch_theme")}
                        data-tooltip-place="right"
                    >
                        <WandSparkles className="absolute h-[1.2rem] w-[1.2rem]" />
                    </Button>
                </ToggleTheme>
                <Button className="w-[45px] h-[45px] [&_svg]:size-6 cursor-pointer rounded-xl hover:bg-foreground/10" variant="ghost"
                    data-tooltip-id="my-tooltip"
                    data-tooltip-html={gameViewT("exit")}
                    data-tooltip-place="right"
                    onClick={() => {
                        navigate("/games")
                    }}
                >
                    <DoorOpen />
                </Button>
            </div>
        </div>
    )
}