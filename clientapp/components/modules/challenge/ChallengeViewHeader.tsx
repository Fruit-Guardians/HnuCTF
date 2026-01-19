import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "components/ui/dropdown-menu"

import { SidebarTrigger } from "components/ui/sidebar"
import { Button } from "components/ui/button"
import { AppWindow, Bath, Cable, Loader2, PackageOpen } from "lucide-react"


import { Badge } from "components/ui/badge"
import { useEffect, useState } from "react";
import { GameNotice, NoticeCategory } from "utils/A1API";
import { useTranslation } from "react-i18next";
import { Skeleton } from "components/ui/skeleton";

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "components/ui/tooltip"
import GameTimeCounter from "../game/GameTimeCounter"
import { useGame } from "hooks/UseGame"

const ChallengesViewHeader = (
    {
        gameID,
        setNoticeOpened,
        notices,
        wsStatus,
        loadingVisible
    }: {
        gameID: number,
        setNoticeOpened: (arg0: boolean) => void,
        notices: GameNotice[],
        wsStatus: "connecting" | "connected" | "disconnected" | "ingore",
        loadingVisible: boolean
    },
) => {

    const { gameStatus, gameInfo, isLoading } = useGame(gameID)

    const { t } = useTranslation('challenge_view');
    const [wsStatusTooltipVisible, setWsStatusTooltipVisible] = useState(wsStatus != "ingore" ? true : false)
    const [newNoticesCount, setNewNoticesCount] = useState(notices.filter((e) => e.notice_category == NoticeCategory.NewAnnouncement).length || 0)

    const getWsStatusClassName = () => {
        switch (wsStatus) {
            case "connecting":
                return "animate-pulse text-yellow-500"
            case "connected":
                return "text-green-500"
            case "disconnected":
                return "text-red-500"
        }
    }

    useEffect(() => {
        if (wsStatus == "connected") {
            setTimeout(() => {
                setWsStatusTooltipVisible(false)
            }, 2000)
        } else {
            if (wsStatus != "ingore") setWsStatusTooltipVisible(true)
        }
    }, [wsStatus])

    useEffect(() => {
        const count = notices.filter((e) => e.notice_category == NoticeCategory.NewAnnouncement).length
        if (newNoticesCount !== count) {
            setNewNoticesCount(count)
        }
    }, [notices])

    if (isLoading) return <></>

    return (
        <div className="h-[70px] flex items-center pl-4 pr-4 z-20 w-full bg-transparent border-b-[1px] transition-[border-color] duration-300 flex-none">
            <div className="flex items-center min-w-0 h-[32px]">
                <SidebarTrigger className="transition-colors duration-300" />
                {/* <span className="font-bold ml-3">{ challenge.category } - { challenge.title }</span> */}
                {!loadingVisible ? (
                    <span className="font-bold ml-1 text-ellipsis overflow-hidden text-nowrap transition-colors duration-300">
                        {gameInfo?.name}
                    </span>
                ) : (
                    <Skeleton className="h-6 w-[250px] bg-foreground/10" />
                )}
            </div>
            <div className="flex-1" />
            <div id="rightArea" className="justify-end flex h-ful gap-[6px] lg:gap-[10px] items-center pointer-events-auto">
                {!loadingVisible ? (
                    <>
                        <GameTimeCounter
                            gameID={gameID}
                        />
                        {gameStatus == "running" ? (
                            <Tooltip open={wsStatusTooltipVisible} onOpenChange={(state) => {
                                if (wsStatus == "connected") {
                                    setWsStatusTooltipVisible(state)
                                }
                            }}>
                                <TooltipTrigger asChild>
                                    <div className="flex h-7 items-center justify-center">
                                        <Cable className={`${getWsStatusClassName()} transition-colors duration-300`} />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent className="select-none">
                                    <div className="flex flex-col gap-[4px]">
                                        <div className="flex items-center gap-[6px]">
                                            <Bath className="w-4 h-4" />
                                            <span className="font-bold">A1 Notice Service</span>
                                        </div>
                                        <div className="flex items-center w-full justify-center">
                                            {
                                                wsStatus == "connecting" ? (
                                                    <div className="flex gap-[4px] items-center text-yellow-500">
                                                        <Loader2 className="animate-spin w-4 h-4" />
                                                        <p>Connecting</p>
                                                    </div>
                                                ) : wsStatus == "connected" ? (
                                                    <p className="text-green-500">Connected</p>
                                                ) : (
                                                    <p className="text-red-300">Disconnected</p>
                                                )
                                            }
                                        </div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        ) : <></>}
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="lg:hidden" size="icon">
                                    <AppWindow />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="mr-4 mt-2">
                                <div className="w-full h-full flex flex-col gap-1">
                                    <DropdownMenuItem>
                                        <GameTimeCounter
                                            gameID={gameID}
                                        />
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setNoticeOpened(true)} disabled={notices.length == 0}>
                                        <PackageOpen />
                                        <span>{t("open_notices")}</span>
                                        {newNoticesCount > 0 ? <Badge variant="destructive" className="p-0 pl-1 pr-1">{newNoticesCount}</Badge> : <></>}
                                    </DropdownMenuItem>
                                </div>

                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="outline" className="select-none hidden lg:flex" onClick={() => setNoticeOpened(true)} disabled={notices.length == 0}>
                            <div className="flex items-center gap-1">
                                <PackageOpen />
                                <span>{t("open_notices")}</span>
                                {newNoticesCount > 0 ? <Badge variant="destructive" className="p-0 pl-1 pr-1 text-white">{newNoticesCount}</Badge> : <></>}
                            </div>
                        </Button>
                        {/* <Button size="icon" variant="outline" onClick={testFunction}><FlaskConical /></Button> */}
                    </>
                ) : (
                    <Skeleton className="h-10 w-[450px] bg-foreground/10" />
                )}
            </div>
        </div>
    )
}

export default ChallengesViewHeader