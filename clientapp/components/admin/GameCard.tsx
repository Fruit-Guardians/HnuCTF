import AlertConformer from "components/modules/AlertConformer";
import ImageLoader from "components/modules/ImageLoader";
import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import { Checkbox } from "components/ui/checkbox";
import { Label } from "components/ui/label";
import { useGlobalVariableContext } from "contexts/GlobalVariableContext";
import dayjs from "dayjs";
import { FastAverageColor } from "fast-average-color";
import { EyeClosed, Calendar, Settings, Calculator, Trash2, Pause, Play, Square, Plane } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "react-toastify/unstyled";
import { KeyedMutator } from "swr";
import { UserGameSimpleInfo } from "utils/A1API";
import { api } from "utils/ApiHelper";

export default function GameCard(
    { game, refreshGameList }: {
        game: UserGameSimpleInfo,
        refreshGameList: KeyedMutator<UserGameSimpleInfo[]>,
    }
) {

    const { t } = useTranslation("game_manage")

    const { clientConfig, updateClientConfg } = useGlobalVariableContext()

    const [gameActivityMode, setGameActivityModeActived] = useState<boolean>((clientConfig.gameActivityMode && clientConfig.gameActivityMode == game.game_id.toString()) || false)

    useEffect(() => {
        setGameActivityModeActived((clientConfig.gameActivityMode && clientConfig.gameActivityMode == game.game_id.toString()) || false)
    }, [clientConfig.gameActivityMode])

    const navigate = useNavigate()

    // 获取比赛状态
    const getGameStatus = (game: UserGameSimpleInfo) => {
        const now = dayjs()
        const start = dayjs(game.start_time)
        const end = dayjs(game.end_time)

        if (now.isBefore(start)) {
            return { text: t("ready"), variant: "secondary", icon: <Pause className="h-3 w-3" /> }
        } else if (now.isAfter(start) && now.isBefore(end)) {
            return { text: t("running"), variant: "default", icon: <Play className="h-3 w-3" /> }
        } else {
            return { text: t("end"), variant: "destructive", icon: <Square className="h-3 w-3" /> }
        }
    }

    const status = getGameStatus(game);

    const [primeColor, setPrimeColor] = useState<string>()

    return (
        <div
            className="group relative h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-transform duration-300 hover:scale-[1.02] bg-card border border-border/50"
        >
            <>
                {/* Background Image */}
                <div className="absolute top-0 left-0 w-full h-full select-none">
                    <ImageLoader
                        text={false}
                        src={game.poster || clientConfig.DefaultBGImage}
                        primaryColor={primeColor}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onLoad={(e) => {
                            const fac = new FastAverageColor();
                            const container = e.target as HTMLImageElement;

                            fac.getColorAsync(container)
                                .then((color: any) => {
                                    const brightness = 0.2126 * color.value[0] + 0.7152 * color.value[1] + 0.0722 * color.value[2];
                                    const brightColor = brightness > 128 ? "black" : "white";
                                    setPrimeColor(brightColor)
                                })
                                .catch((e: any) => {
                                    console.error("fac.getColorAsync error:", e);
                                });
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between" style={{ color: primeColor || "white" }}>
                    {/* Top Section */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <Badge
                                variant={status.variant as any}
                                className="backdrop-blur-sm select-none bg-background/20 border-white/20 text-white shadow-lg"
                            >
                                <div className="flex gap-1 items-center justify-center">
                                    {status.icon}
                                    {status.text}
                                </div>
                            </Badge>
                            {!game.visible && (
                                <Badge variant="outline" className="backdrop-blur-sm select-none bg-background/20 border-white/20 text-white">
                                    <div className="flex gap-1   items-center justify-center">
                                        <EyeClosed className="h-3 w-3" />
                                        {t("hide")}
                                    </div>
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col justify-center">
                        <h3 className="text-2xl font-bold mb-2 line-clamp-2 text-white drop-shadow-lg">
                            {game.name}
                        </h3>
                        {game.summary && (
                            <p className="text-lg text-white/90 line-clamp-2 drop-shadow-md">
                                {game.summary}
                            </p>
                        )}
                    </div>

                    {/* Bottom Section */}
                    <div className="flex justify-between items-end select-none">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-white/90">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    {dayjs(game.start_time).format("MM/DD HH:mm")}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-white/90">
                                <span className="text-sm">{t("to")}</span>
                                <span className="text-sm font-medium">
                                    {dayjs(game.end_time).format("MM/DD HH:mm")}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <div className="h-9 flex items-center flex-none">
                                <Label className="hover:bg-accent/50 flex gap-3 rounded-lg border h-9 items-center px-3 backdrop-blur-lg has-[[aria-checked=true]]:border-blue-600 text-white has-[[aria-checked=true]]:text-blue-500 has-[[aria-checked=true]]:bg-blue-50/80 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950 transition-[background-color] duration-300"
                                    data-tooltip-content={t("race_mode")}
                                    data-tooltip-id="my-tooltip"
                                    data-tooltip-place="bottom"
                                >
                                    <Checkbox
                                        id="toggle-2"
                                        checked={gameActivityMode}
                                        onCheckedChange={() => {
                                            if (gameActivityMode) {
                                                updateClientConfg("gameActivityMode", "")
                                                api.system.updateSystemSettings({
                                                    "gameActivityMode": ""
                                                })
                                            } else {
                                                updateClientConfg("gameActivityMode", game.game_id.toString())
                                                api.system.updateSystemSettings({
                                                    "gameActivityMode": game.game_id.toString()
                                                })
                                            }
                                        }}
                                        className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                                    />
                                    <div className="grid gap-1.5 font-normal">
                                        <p className="text-sm leading-none font-medium">
                                            {t("enable_race")}
                                        </p>
                                    </div>
                                </Label>
                            </div>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="backdrop-blur-sm bg-white/20 hover:bg-white/30 border-white/20 text-white h-9 w-9 p-0"
                                onClick={() => window.open(`/games/${game.game_id}/info`)}
                                data-tooltip-content={t("goto")}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-place="bottom"
                            >
                                <Plane className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="backdrop-blur-sm bg-white/20 hover:bg-white/30 border-white/20 text-white h-9 w-9 p-0"
                                onClick={() => navigate(`/admin/games/${game.game_id}/events`)}
                                data-tooltip-content={t("edit")}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-place="bottom"
                            >
                                <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="backdrop-blur-sm bg-white/20 hover:bg-white/30 border-white/20 text-white h-9 w-9 p-0"
                                onClick={() => navigate(`/admin/games/${game.game_id}/score-adjustments`)}
                                data-tooltip-content={t("adjust")}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-place="bottom"
                            >
                                <Calculator className="h-4 w-4" />
                            </Button>
                            <AlertConformer
                                title={t("alert_title")}
                                description={t("delete_description", { name: game.name })}
                                onConfirm={() => {
                                    api.admin.deleteGame(game.game_id).then((res) => {
                                        toast.success(res.data.message)
                                        setTimeout(() => refreshGameList(), 500)
                                    })
                                }}
                                type="critical"
                                descriptionClassName="text-md"
                            >
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="backdrop-blur-sm bg-red-500/30 hover:bg-red-500/50 border-red-500/20 text-white h-9 w-9 p-0"
                                    data-tooltip-content={t("remove")}
                                    data-tooltip-id="my-tooltip"
                                    data-tooltip-place="bottom"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertConformer>
                        </div>
                    </div>
                </div>
            </>
        </div>
    )
}