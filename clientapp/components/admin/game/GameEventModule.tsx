import { Button } from "components/ui/button"
import { Badge } from "components/ui/badge"
import { MacScrollbar } from "mac-scrollbar"
import { Captions, TriangleAlert, RefreshCw, AlertCircle, CheckCircle2, XCircle, Clock, Flag, Trophy, User, Users, X, Filter, Trash, Copy, Shield, MapPin } from "lucide-react"
import { useParams } from "react-router"
import { useEffect, useState } from "react"
import dayjs from "dayjs"
import { api } from "utils/ApiHelper"
import { AdminSubmitItem, AdminCheatItem } from "utils/A1API"
import { useTheme } from "next-themes"
import { Input } from "components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "components/ui/dialog"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "components/ui/select"
import { Switch } from "components/ui/switch"
import { Label } from "components/ui/label"
import { useTranslation } from "react-i18next"
import { copyWithResult } from "utils/ToastUtil"

export function GameEventModule(
    { GgameID = undefined, GchallengeID = undefined }: {
        GgameID?: number | undefined,
        GchallengeID?: number | undefined
    }
) {
    const getGameID = () => {
        if (!GgameID) {
            const { game_id } = useParams<{ game_id: string }>()
            return parseInt(game_id || '0')
        }
        return GgameID
    }

    const gameId = getGameID()
    const { t } = useTranslation("game_edit")
    const { t: commonT } = useTranslation()
    const [curChoicedType, setCurChoicedType] = useState<string>("submissions")

    // Helper functions for cheats
    const cheatTypeColor = (type: string) => {
        switch (type) {
            case "SubmitSomeonesFlag":
                return "text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-800 dark:bg-red-950"
            case "SubmitWithoutDownloadAttachments":
                return "text-orange-600 border-orange-200 bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:bg-orange-950"
            case "SubmitWithoutStartContainer":
                return "text-yellow-600 border-yellow-200 bg-yellow-50 dark:text-yellow-400 dark:border-yellow-800 dark:bg-yellow-950"
            default:
                return "text-gray-600 border-gray-200 bg-gray-50 dark:text-gray-400 dark:border-gray-800 dark:bg-gray-950"
        }
    }

    const cheatTypeIcon = (type: string) => {
        switch (type) {
            case "SubmitSomeonesFlag":
                return <Shield className="w-3 h-3" />
            case "SubmitWithoutDownloadAttachments":
                return <TriangleAlert className="w-3 h-3" />
            case "SubmitWithoutStartContainer":
                return <AlertCircle className="w-3 h-3" />
            default:
                return <Shield className="w-3 h-3" />
        }
    }

    const cheatTypeText = (type: string) => {
        switch (type) {
            case "SubmitSomeonesFlag":
                return t("events.cheat.someone")
            case "SubmitWithoutDownloadAttachments":
                return t("events.cheat.attachment")
            case "SubmitWithoutStartContainer":
                return t("events.cheat.container")
            default:
                return type
        }
    }

    const [submissions, setSubmissions] = useState<AdminSubmitItem[]>([])
    const [cheats, setCheats] = useState<AdminCheatItem[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const pageSize = 15
    const [total, setTotal] = useState<number>(0)

    // cheats state
    const [cheatsLoading, setCheatsLoading] = useState<boolean>(false)
    const [cheatsCurrentPage, setCheatsCurrentPage] = useState<number>(1)
    const [cheatsTotal, setCheatsTotal] = useState<number>(0)

    const cheatsTotalPages = Math.ceil(cheatsTotal / pageSize)

    // filter state
    const [challengeNames, setChallengeNames] = useState<string[]>([])
    const [teamNames, setTeamNames] = useState<string[]>([])
    const [challengeIds, setChallengeIds] = useState<number[]>([])
    const [teamIds, setTeamIds] = useState<number[]>([])
    type JudgeStatus = "JudgeAC" | "JudgeWA"
    const [judgeStatuses, setJudgeStatuses] = useState<JudgeStatus[]>([])
    const statusOptions: JudgeStatus[] = ["JudgeAC", "JudgeWA"]

    const [recordAutoUpdate, setRecordAutoUpdate] = useState<boolean>(true)

    // 初始化状态管理
    const [isInitialized, setIsInitialized] = useState<boolean>(false)
    const [challengeIdsReady, setChallengeIdsReady] = useState<boolean>(false)
    const [cheatsIdsReady, setCheatsIdsReady] = useState<boolean>(false)

    // cheats filter state
    const [cheatsChallengeNames, setCheatsChallengeNames] = useState<string[]>([])
    const [cheatsTeamNames, setCheatsTeamNames] = useState<string[]>([])
    const [cheatsChallengeIds, setCheatsChallengeIds] = useState<number[]>([])
    const [cheatsTeamIds, setCheatsTeamIds] = useState<number[]>([])
    type CheatType = "SubmitSomeonesFlag" | "SubmitWithoutDownloadAttachments" | "SubmitWithoutStartContainer"
    const [cheatTypes, setCheatTypes] = useState<CheatType[]>([])
    const cheatTypeOptions: CheatType[] = ["SubmitSomeonesFlag", "SubmitWithoutDownloadAttachments", "SubmitWithoutStartContainer"]

    const [curChoicedCategory, setCurChoicedCategory] = useState<string>("teamName")

    const [newChallengeName, setNewChallengeName] = useState("")
    const [newTeamName, setNewTeamName] = useState("")
    const [newChallengeId, setNewChallengeId] = useState<string>("")
    const [newTeamId, setNewTeamId] = useState<string>("")

    // dialog control & temp states
    const [dialogOpen, setDialogOpen] = useState(false)
    const [tempJudgeStatuses, setTempJudgeStatuses] = useState<JudgeStatus[]>([])
    const [tempStartTime, setTempStartTime] = useState<string | undefined>(undefined)
    const [tempEndTime, setTempEndTime] = useState<string | undefined>(undefined)

    const [startTime, setStartTime] = useState<string | undefined>(undefined)
    const [endTime, setEndTime] = useState<string | undefined>(undefined)

    // cheats dialog control & temp states
    const [cheatsDialogOpen, setCheatsDialogOpen] = useState(false)
    const [tempCheatTypes, setTempCheatTypes] = useState<CheatType[]>([])
    const [tempCheatsStartTime, setTempCheatsStartTime] = useState<string | undefined>(undefined)
    const [tempCheatsEndTime, setTempCheatsEndTime] = useState<string | undefined>(undefined)

    const [cheatsStartTime, setCheatsStartTime] = useState<string | undefined>(undefined)
    const [cheatsEndTime, setCheatsEndTime] = useState<string | undefined>(undefined)
    const [cheatsCurChoicedCategory, setCheatsCurChoicedCategory] = useState<string>("teamName")
    const [newCheatsChallengeName, setNewCheatsChallengeName] = useState("")
    const [newCheatsTeamName, setNewCheatsTeamName] = useState("")
    const [newCheatsChallengeId, setNewCheatsChallengeId] = useState<string>("")
    const [newCheatsTeamId, setNewCheatsTeamId] = useState<string>("")

    const { theme } = useTheme()

    const loadSubmissions = async (page: number) => {
        setLoading(true)

        api.admin.adminListGameSubmits(gameId, {
            game_id: gameId,
            size: pageSize,
            offset: (page - 1) * pageSize,
            challenge_names: challengeNames,
            team_names: teamNames,
            challenge_ids: challengeIds,
            team_ids: teamIds,
            judge_statuses: judgeStatuses,
            start_time: startTime && startTime.trim() !== "" ? startTime : undefined,
            end_time: endTime && endTime.trim() !== "" ? endTime : undefined
        }).then((res) => {
            const list = res.data.data || []
            setTotal(res.data.total || 0)
            setSubmissions(list)
        }).finally(() => {
            setLoading(false)
        })
    }

    const loadCheats = async () => {
        setCheatsLoading(true)
        api.admin.adminListGameCheats(gameId, {
            game_id: gameId,
            size: pageSize,
            offset: (cheatsCurrentPage - 1) * pageSize,
            challenge_names: cheatsChallengeNames.length > 0 ? cheatsChallengeNames : undefined,
            team_names: cheatsTeamNames.length > 0 ? cheatsTeamNames : undefined,
            challenge_ids: cheatsChallengeIds.length > 0 ? cheatsChallengeIds : undefined,
            team_ids: cheatsTeamIds.length > 0 ? cheatsTeamIds : undefined,
            cheat_types: cheatTypes.length > 0 ? cheatTypes : undefined,
            start_time: cheatsStartTime,
            end_time: cheatsEndTime,
        }).then((res) => {
            setCheats(res.data.data)
            setCheatsTotal(res.data.total)
        }).finally(() => {
            setCheatsLoading(false)
        })
    }

    // 处理外部传入的challengeID
    useEffect(() => {
        if (GchallengeID) {
            setChallengeIds(prev => {
                const newIds = prev.includes(GchallengeID) ? prev : [...prev, GchallengeID]
                setChallengeIdsReady(true)
                return newIds
            })
            setCheatsChallengeIds(prev => {
                const newIds = prev.includes(GchallengeID) ? prev : [...prev, GchallengeID]
                setCheatsIdsReady(true)
                return newIds
            })
        } else {
            setChallengeIdsReady(true)
            setCheatsIdsReady(true)
        }
    }, [GchallengeID])

    // 统一的初始化逻辑
    useEffect(() => {
        if (gameId && challengeIdsReady && cheatsIdsReady && !isInitialized) {
            loadSubmissions(1)
            loadCheats()
            setIsInitialized(true)
        }
    }, [gameId, challengeIdsReady, cheatsIdsReady, isInitialized])

    // 当作弊记录筛选条件或分页变化时重新加载
    useEffect(() => {
        if (isInitialized) {
            loadCheats()
        }
    }, [cheatsCurrentPage, cheatsChallengeNames, cheatsTeamNames, cheatsChallengeIds, cheatsTeamIds, cheatTypes, cheatsStartTime, cheatsEndTime, isInitialized])

    const statusColor = (status: string) => {
        switch (status) {
            case 'JudgeAC':
                return 'text-green-600'
            case 'JudgeWA':
                return 'text-red-500'
            case 'JudgeError':
            case 'JudgeTimeout':
                return 'text-orange-500'
            case 'JudgeQueueing':
            case 'JudgeRunning':
                return 'text-blue-500'
            default:
                return 'text-muted-foreground'
        }
    }

    const statusIcon = (status: string) => {
        switch (status) {
            case 'JudgeAC':
                return <CheckCircle2 className="w-4 h-4" />
            case 'JudgeWA':
                return <XCircle className="w-4 h-4" />
            default:
                return <AlertCircle className="w-4 h-4" />
        }
    }

    const gotoChallenge = (challengeId: number) => {
        window.open(window.location.origin + `/games/${gameId}/challenges?id=${challengeId}`, '_blank')
    }

    const totalPages = Math.ceil(total / pageSize) || 1

    // 当提交记录筛选条件或分页变化时重新加载
    useEffect(() => {
        if (isInitialized) {
            loadSubmissions(currentPage)
        }
    }, [currentPage, challengeNames, teamNames, judgeStatuses, startTime, endTime, teamIds, challengeIds, isInitialized])

    // 自动更新逻辑
    useEffect(() => {
        let updateInter: NodeJS.Timeout | undefined = undefined
        if (recordAutoUpdate && isInitialized) {
            updateInter = setInterval(() => {
                loadSubmissions(currentPage)
                loadCheats()
            }, 4000)
        }
        return () => {
            if (updateInter) clearInterval(updateInter)
        }
    }, [recordAutoUpdate, isInitialized, currentPage, challengeNames, teamNames, judgeStatuses, startTime, endTime, teamIds, challengeIds, cheatsCurrentPage, cheatsChallengeNames, cheatsTeamNames, cheatsChallengeIds, cheatsTeamIds, cheatTypes, cheatsStartTime, cheatsEndTime])

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between select-none">
                <span className="font-bold text-2xl">{t("events.title")}</span>
                <div className="flex items-center overflow-hidden rounded-3xl border-1">
                    <Button
                        variant={`${curChoicedType === "submissions" ? "default" : "ghost"}`}
                        onClick={() => setCurChoicedType("submissions")}
                        className="rounded-none rounded-l-3xl"
                    >
                        <Captions className="mr-1" />
                        {t("events.submit.title")}
                    </Button>
                    <Button
                        variant={`${curChoicedType === "cheats" ? "default" : "ghost"}`}
                        onClick={() => setCurChoicedType("cheats")}
                        className="rounded-none rounded-r-3xl"
                    >
                        <TriangleAlert className="mr-1" />
                        {t("events.cheat.title")}
                    </Button>
                </div>
            </div>

            {curChoicedType === 'submissions' && (
                <div className="space-y-4">
                    {/* Filter action bar */}
                    <div className="flex flex-wrap gap-1 items-center">
                        {/* Active filter chips */}
                        <div className="flex flex-wrap gap-1 select-none">
                            {challengeNames.map((c, i) => (<Badge key={"c" + i} variant="secondary" className="gap-1">{t("events.filter.challenge")}:{c}<X className="w-3 h-3 cursor-pointer" onClick={() => { setChallengeNames(prev => prev.filter((_, idx) => idx !== i)); setCurrentPage(1) }} /></Badge>))}
                            {challengeIds.map((id, i) => (<Badge key={"cid" + i} variant="secondary" className="gap-1">{t("events.filter.chal_id")}:{id}<X className="w-3 h-3 cursor-pointer" onClick={() => { setChallengeIds(prev => prev.filter((_, idx) => idx !== i)); setCurrentPage(1) }} /></Badge>))}
                            {teamNames.map((tname, i) => (<Badge key={"t" + i} variant="secondary" className="gap-1">{t("events.filter.team")}:{tname}<X className="w-3 h-3 cursor-pointer" onClick={() => { setTeamNames(prev => prev.filter((_, idx) => idx !== i)); setCurrentPage(1) }} /></Badge>))}
                            {teamIds.map((tid, i) => (<Badge key={"tid" + i} variant="secondary" className="gap-1">{t("events.filter.team_id")}:{tid}<X className="w-3 h-3 cursor-pointer" onClick={() => { setTeamIds(prev => prev.filter((_, idx) => idx !== i)); setCurrentPage(1) }} /></Badge>))}
                            {judgeStatuses.map((s, i) => (<Badge key={"s" + i} variant="secondary" className="gap-1">{s.replace('Judge', '')}<X className="w-3 h-3 cursor-pointer" onClick={() => { setJudgeStatuses(prev => prev.filter((_, idx) => idx !== i)); setCurrentPage(1) }} /></Badge>))}
                            {(startTime || endTime) && (
                                <Badge variant="secondary" className="gap-1">{startTime ? dayjs(startTime).format('MM-DD HH:mm') : '...'}<span>-</span>{endTime ? dayjs(endTime).format('MM-DD HH:mm') : '...'}<X className="w-3 h-3 cursor-pointer" onClick={() => { setStartTime(undefined); setEndTime(undefined); setCurrentPage(1) }} /></Badge>
                            )}
                        </div>

                        <Badge variant="secondary" className="gap-[1px] select-none hover:bg-foreground/20"
                            onClick={() => {
                                // copy current filters to temp before open
                                setTempJudgeStatuses([...judgeStatuses])
                                setTempStartTime(startTime)
                                setTempEndTime(endTime)
                                setDialogOpen(true)
                            }}
                        >
                            <Filter className="w-3 h-3 mr-1" />{t("events.filter.add")}
                        </Badge>
                        <Badge variant="secondary" className="gap-[1px] select-none hover:bg-foreground/20"
                            onClick={() => {
                                // copy current filters to temp before open
                                setChallengeNames([])
                                setTeamNames([])
                                setChallengeIds([])
                                setTeamIds([])
                                setJudgeStatuses([])
                                setStartTime(undefined)
                                setEndTime(undefined)
                                setCurrentPage(1)
                            }}
                        >
                            <Trash className="w-3 h-3 mr-1" />{t("events.filter.clear")}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                        <RefreshCw
                            className={`w-4 h-4 cursor-pointer ${loading ? 'animate-spin' : ''}`}
                            onClick={() => { if (!loading) { setCurrentPage(1); loadSubmissions(1) } }}
                        />
                        <span className="text-muted-foreground text-sm select-none">{t("events.submit.count", { count: total })}</span>
                        <div className="flex-1" />
                        <div className="flex items-center space-x-2">
                            <Switch defaultChecked={recordAutoUpdate} onCheckedChange={setRecordAutoUpdate} />
                            <Label>{t("events.auto")}</Label>
                        </div>
                    </div>

                    {submissions.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">{t("events.submit.empty1")}</h3>
                            <p className="text-muted-foreground">{t("events.submit.empty2")}</p>
                        </div>
                    ) : (
                        <MacScrollbar className="flex-1" skin={theme === 'dark' ? 'dark' : 'light'}>
                            <div className="flex flex-col pr-4">
                                {/* Table Header */}
                                <div className="flex items-center gap-4 px-4 py-3 border-b-2 bg-gradient-to-r from-muted/50 to-muted/30 text-sm font-semibold text-foreground sticky top-0 backdrop-blur-sm shadow-sm">
                                    <div className="flex-[1] min-w-0">{t("events.submit.time")}</div>
                                    <div className="flex-[0.5] text-center">{t("events.submit.status")}</div>
                                    <div className="flex-[1] min-w-0">{t("events.submit.user")}</div>
                                    <div className="flex-[1] min-w-0">{t("events.submit.team")}</div>
                                    <div className="flex-[2] min-w-0">{t("events.submit.challenge")}</div>
                                    <div className="flex-[3] min-w-0">{t("events.submit.flag")}</div>
                                </div>
                                {submissions.map((sub, index) => (
                                    <div key={sub.judge_id} className={`flex items-center gap-4 px-4 py-3 border-b border-border/50 hover:bg-accent/60 hover:shadow-sm transition-all duration-200 text-sm w-full ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                                        <div className="flex items-center flex-[1] gap-1 text-muted-foreground min-w-0" title={dayjs(sub.judge_time).format('YYYY-MM-DD HH:mm:ss')}>
                                            <Clock className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{dayjs(sub.judge_time).format('YYYY-MM-DD HH:mm:ss')}</span>
                                        </div>
                                        <div className="flex-[0.5] justify-center flex">
                                            <Badge
                                                variant="outline"
                                                className={`flex items-center gap-1 select-none min-w-0 px-3 py-1 rounded-full font-medium shadow-sm transition-all duration-200 ${statusColor(sub.judge_status)}`}
                                                onClick={() => {
                                                    copyWithResult(JSON.stringify(sub, null, 4), t("events.submit.title"))
                                                }}
                                            >
                                                {statusIcon(sub.judge_status)}
                                                <span className="truncate">{sub.judge_status.replace('Judge', '')}</span>
                                            </Badge>
                                        </div>
                                        <div className="flex items-center flex-[1] gap-1 min-w-0" title={sub.username}>
                                            <User className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{sub.username}</span>
                                        </div>
                                        <div className="flex items-center flex-[1] gap-1 min-w-0" title={sub.team_name}>
                                            <Users className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{sub.team_name}</span>
                                            <Badge
                                                variant="outline"
                                                className="text-xs select-none hover:bg-primary/10 hover:border-primary/30 cursor-pointer transition-all duration-200 rounded-md px-2 py-1 font-mono"
                                                onClick={() => {
                                                    copyWithResult(sub.team_name || "", t("events.filter.team"))
                                                }}
                                            >
                                                #{sub.team_id}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center flex-[2] gap-1 min-w-0" title={sub.challenge_name}>
                                            <Trophy className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{sub.challenge_name}</span>
                                            <Badge
                                                variant="outline"
                                                className="text-xs select-none hover:bg-blue/10 hover:border-blue/30 cursor-pointer transition-all duration-200 rounded-md px-2 py-1 font-mono"
                                                onClick={() => {
                                                    gotoChallenge(sub.challenge_id)
                                                }}
                                            >
                                                #{sub.challenge_id}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center flex-[3] gap-1 font-mono min-w-0" title={sub.flag_content}>
                                            <Flag className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{sub.flag_content}</span>
                                            <Badge
                                                variant="outline"
                                                className="text-xs select-none hover:bg-green/10 hover:border-green/30 cursor-pointer transition-all duration-200 rounded-md p-1.5 hover:scale-105"
                                                onClick={() => {
                                                    copyWithResult(sub.flag_content || "", t("events.submit.flag"))
                                                }}
                                            >
                                                <Copy className="w-3 h-3" />
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </MacScrollbar>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-4 select-none flex-wrap">
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                            >
                                {t("page.prev")}
                            </Button>
                            {Array.from({ length: totalPages }).slice(0, 10).map((_, idx) => {
                                const page = idx + 1
                                if (page > totalPages) return null
                                return (
                                    <Button
                                        key={page}
                                        size="sm"
                                        variant={currentPage === page ? 'default' : 'outline'}
                                        onClick={() => setCurrentPage(page)}
                                        className={`transition-all duration-200 ${currentPage === page ? 'shadow-md' : 'hover:bg-primary/10 hover:border-primary/30'}`}
                                    >
                                        {page}
                                    </Button>
                                )
                            })}
                            {totalPages > 10 && (
                                <span className="text-sm mx-2 text-muted-foreground">...</span>
                            )}
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                            >
                                {t("page.next")}
                            </Button>
                        </div>
                    )}

                    {/* Filter Dialog */}
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>{t("events.filter.title1")}</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-2 mt-4">
                                <h4 className="font-medium">{t("events.filter.select")}</h4>
                                <Select value={curChoicedCategory} onValueChange={(value) => setCurChoicedCategory(value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t("events.filter.select")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="teamName">{t("events.filter.team")}</SelectItem>
                                        <SelectItem value="challengeName">{t("events.filter.challenge")}</SelectItem>
                                        <SelectItem value="judgeStatus">{t("events.filter.status")}</SelectItem>
                                        <SelectItem value="timeRange">{t("events.filter.time")}</SelectItem>
                                        <SelectItem value="challengeId">{t("events.filter.chal_id")}</SelectItem>
                                        <SelectItem value="teamId">{t("events.filter.team_id")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>



                            {/* Challenge names */}
                            {curChoicedCategory === "challengeName" && (
                                <div className="space-y-2">
                                    <h4 className="font-medium">{t("events.filter.challenge")}{t("events.filter.keyword")}</h4>
                                    <Input value={newChallengeName} onChange={(e) => setNewChallengeName(e.target.value)} placeholder={t("events.filter.placeholder")} className="h-8" />
                                </div>
                            )}

                            {/* Team names */}
                            {curChoicedCategory === "teamName" && (
                                <div className="space-y-2 mt-4">
                                    <h4 className="font-medium">{t("events.filter.team")}{t("events.filter.keyword")}</h4>
                                    <Input value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder={t("events.filter.placeholder")} className="h-8" />
                                </div>
                            )}

                            {/* Challenge IDs */}
                            {curChoicedCategory === "challengeId" && (
                                <div className="space-y-2 mt-4">
                                    <h4 className="font-medium">{t("events.filter.chal_id")}</h4>
                                    <Input value={newChallengeId} onChange={(e) => setNewChallengeId(e.target.value)} placeholder={t("events.filter.chal_id")} className="h-8" />
                                </div>
                            )}

                            {/* Team IDs */}
                            {curChoicedCategory === "teamId" && (
                                <div className="space-y-2 mt-4">
                                    <h4 className="font-medium">{t("events.filter.team_id")}</h4>
                                    <Input value={newTeamId} onChange={(e) => setNewTeamId(e.target.value)} placeholder={t("events.filter.team_id")} className="h-8" />
                                </div>
                            )}

                            {/* Status select */}
                            {curChoicedCategory === "judgeStatus" && (
                                <div className="space-y-2 mt-4">
                                    <h4 className="font-medium">{t("events.filter.status")}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {statusOptions.map(st => {
                                            const active = tempJudgeStatuses.includes(st)
                                            return (
                                                <Button key={st} size="sm" variant={active ? "default" : "outline"} onClick={() => {
                                                    setTempJudgeStatuses(prev => active ? prev.filter(s => s !== st) : [...prev, st]);
                                                }}>{st.replace('Judge', '')}</Button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Time range */}
                            {curChoicedCategory === "timeRange" && (
                                <div className="space-y-2 mt-4">
                                    <h4 className="font-medium">{t("events.filter.time")}</h4>
                                    <div className="flex items-center gap-1">
                                        <Input type="datetime-local" value={tempStartTime || ""} onChange={(e) => setTempStartTime(e.target.value || undefined)} className="h-8" />
                                        <span className="px-1">-</span>
                                        <Input type="datetime-local" value={tempEndTime || ""} onChange={(e) => setTempEndTime(e.target.value || undefined)} className="h-8" />
                                    </div>
                                </div>
                            )}

                            <DialogFooter className="mt-6">
                                <Button variant="secondary" onClick={() => setDialogOpen(false)}>{commonT("cancel")}</Button>
                                <Button onClick={() => {
                                    switch (curChoicedCategory) {
                                        case "challengeName":
                                            if (newChallengeName.trim()) { setChallengeNames(prev => [...prev, newChallengeName.trim()]); setNewChallengeName(""); }
                                            break;
                                        case "teamName":
                                            if (newTeamName.trim()) { setTeamNames(prev => [...prev, newTeamName.trim()]); setNewTeamName(""); }
                                            break
                                        case "challengeId":
                                            const num1 = parseInt(newChallengeId.trim());
                                            if (!isNaN(num1)) { setChallengeIds(prev => prev.includes(num1) ? prev : [...prev, num1]); setNewChallengeId(""); }
                                            break
                                        case "teamId":
                                            const num2 = parseInt(newTeamId.trim());
                                            if (!isNaN(num2)) { setTeamIds(prev => prev.includes(num2) ? prev : [...prev, num2]); setNewTeamId(""); }
                                            break
                                        case "judgeStatus":
                                            setJudgeStatuses(tempJudgeStatuses);
                                            break
                                        case "timeRange":
                                            setStartTime(tempStartTime);
                                            setEndTime(tempEndTime);
                                            break
                                    }
                                    setCurrentPage(1)
                                    setDialogOpen(false)
                                }}>{commonT("confirm")}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            {curChoicedType === 'cheats' && (
                <div className="space-y-4">
                    {/* Filter action bar */}
                    <div className="flex flex-wrap gap-1 items-center">
                        {/* Active filter chips */}
                        <div className="flex flex-wrap gap-1 select-none">
                            {cheatsChallengeNames.map((c, i) => (<Badge key={"c" + i} variant="secondary" className="gap-1">{t("events.filter.challenge")}:{c}<X className="w-3 h-3 cursor-pointer" onClick={() => { setCheatsChallengeNames(prev => prev.filter((_, idx) => idx !== i)); setCheatsCurrentPage(1) }} /></Badge>))}
                            {cheatsChallengeIds.map((id, i) => (<Badge key={"cid" + i} variant="secondary" className="gap-1">{t("events.filter.chal_id")}:{id}<X className="w-3 h-3 cursor-pointer" onClick={() => { setCheatsChallengeIds(prev => prev.filter((_, idx) => idx !== i)); setCheatsCurrentPage(1) }} /></Badge>))}
                            {cheatsTeamNames.map((tname, i) => (<Badge key={"t" + i} variant="secondary" className="gap-1">{t("events.filter.team")}:{tname}<X className="w-3 h-3 cursor-pointer" onClick={() => { setCheatsTeamNames(prev => prev.filter((_, idx) => idx !== i)); setCheatsCurrentPage(1) }} /></Badge>))}
                            {cheatsTeamIds.map((tid, i) => (<Badge key={"tid" + i} variant="secondary" className="gap-1">{t("events.filter.team_id")}:{tid}<X className="w-3 h-3 cursor-pointer" onClick={() => { setCheatsTeamIds(prev => prev.filter((_, idx) => idx !== i)); setCheatsCurrentPage(1) }} /></Badge>))}
                            {cheatTypes.map((s, i) => (<Badge key={"s" + i} variant="secondary" className="gap-1">{cheatTypeText(s)}<X className="w-3 h-3 cursor-pointer" onClick={() => { setCheatTypes(prev => prev.filter((_, idx) => idx !== i)); setCheatsCurrentPage(1) }} /></Badge>))}
                            {(cheatsStartTime || cheatsEndTime) && (
                                <Badge variant="secondary" className="gap-1">{cheatsStartTime ? dayjs(cheatsStartTime).format('MM-DD HH:mm') : '...'}<span>-</span>{cheatsEndTime ? dayjs(cheatsEndTime).format('MM-DD HH:mm') : '...'}<X className="w-3 h-3 cursor-pointer" onClick={() => { setCheatsStartTime(undefined); setCheatsEndTime(undefined); setCheatsCurrentPage(1) }} /></Badge>
                            )}
                        </div>

                        <Badge variant="secondary" className="gap-[1px] select-none hover:bg-foreground/20"
                            onClick={() => {
                                // copy current filters to temp before open
                                setTempCheatTypes([...cheatTypes])
                                setTempCheatsStartTime(cheatsStartTime)
                                setTempCheatsEndTime(cheatsEndTime)
                                setCheatsDialogOpen(true)
                            }}
                        >
                            <Filter className="w-3 h-3 mr-1" />{t("events.filter.add")}
                        </Badge>
                        <Badge variant="secondary" className="gap-[1px] select-none hover:bg-foreground/20"
                            onClick={() => {
                                // copy current filters to temp before open
                                setCheatsChallengeNames([])
                                setCheatsTeamNames([])
                                setCheatsChallengeIds([])
                                setCheatsTeamIds([])
                                setCheatTypes([])
                                setCheatsStartTime(undefined)
                                setCheatsEndTime(undefined)
                                setCheatsCurrentPage(1)
                            }}
                        >
                            <Trash className="w-3 h-3 mr-1" />{t("events.filter.clear")}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                        <RefreshCw
                            className={`w-4 h-4 cursor-pointer ${cheatsLoading ? 'animate-spin' : ''}`}
                            onClick={() => { if (!cheatsLoading) { setCheatsCurrentPage(1); loadCheats() } }}
                        />
                        <span className="text-muted-foreground text-sm select-none">{t("events.cheat.count", { count: cheatsTotal })}</span>
                    </div>

                    {cheats.length === 0 ? (
                        <div className="text-center py-12">
                            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">{t("events.cheat.empty1")}</h3>
                            <p className="text-muted-foreground">{t("events.cheat.empty2")}</p>
                        </div>
                    ) : (
                        <MacScrollbar className="flex-1" skin={theme === 'dark' ? 'dark' : 'light'}>
                            <div className="flex flex-col pr-4">
                                {/* Table Header */}
                                <div className="flex items-center gap-3 px-4 py-3 border-b-2 bg-gradient-to-r from-muted/50 to-muted/30 text-sm font-semibold text-foreground sticky top-0 backdrop-blur-sm shadow-sm">
                                    <div className="flex-[1] min-w-0">{t("events.cheat.time")}</div>
                                    <div className="flex-[1] text-center">{t("events.cheat.type")}</div>
                                    <div className="flex-[1] min-w-0">{t("events.submit.user")}</div>
                                    <div className="flex-[1] min-w-0">{t("events.submit.team")}</div>
                                    <div className="flex-[2] min-w-0">{t("events.submit.challenge")}</div>
                                    <div className="flex-[2] min-w-0">{t("events.cheat.info")}</div>
                                    <div className="flex-[1] min-w-0">{t("events.cheat.ip")}</div>
                                </div>
                                {cheats.map((cheat, index) => (
                                    <div key={cheat.cheat_id} className={`flex items-center gap-3 px-4 py-3 border-b border-border/50 hover:bg-accent/60 hover:shadow-sm transition-all duration-200 text-sm w-full ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                                        <div className="flex items-center flex-[1] gap-1 text-muted-foreground min-w-0" title={dayjs(cheat.cheat_time).format('YYYY-MM-DD HH:mm:ss')}>
                                            <Clock className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{dayjs(cheat.cheat_time).format('YYYY-MM-DD HH:mm:ss')}</span>
                                        </div>
                                        <div className="flex-[1] justify-center flex">
                                            <Badge
                                                variant="outline"
                                                className={`flex items-center gap-1 select-none min-w-0 px-3 py-1 rounded-full font-medium shadow-sm transition-all duration-200 ${cheatTypeColor(cheat.cheat_type)}`}
                                            >
                                                {cheatTypeIcon(cheat.cheat_type)}
                                                <span className="truncate">{cheatTypeText(cheat.cheat_type)}</span>
                                            </Badge>
                                        </div>
                                        <div className="flex items-center flex-[1] gap-1 min-w-0" title={cheat.username}>
                                            <User className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{cheat.username}</span>
                                        </div>
                                        <div className="flex items-center flex-[1] gap-1 min-w-0" title={cheat.team_name}>
                                            <Users className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{cheat.team_name}</span>
                                            <Badge
                                                variant="outline"
                                                className="text-xs select-none hover:bg-primary/10 hover:border-primary/30 cursor-pointer transition-all duration-200 rounded-md px-2 py-1 font-mono"
                                                onClick={() => {
                                                    copyWithResult(cheat.team_name, t("events.filter.team"))
                                                }}
                                            >
                                                #{cheat.team_id}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center flex-[2] gap-1 min-w-0" title={cheat.challenge_name}>
                                            <Trophy className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{cheat.challenge_name}</span>
                                            <Badge
                                                variant="outline"
                                                className="text-xs select-none hover:bg-blue/10 hover:border-blue/30 cursor-pointer transition-all duration-200 rounded-md px-2 py-1 font-mono"
                                                onClick={() => {
                                                    gotoChallenge(cheat.challenge_id)
                                                }}
                                            >
                                                #{cheat.challenge_id}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center flex-[2] gap-1 min-w-0">
                                            {(() => {
                                                if (cheat.cheat_type === "SubmitSomeonesFlag" && cheat.extra_data && typeof cheat.extra_data === 'object') {
                                                    const extraData = cheat.extra_data as any;
                                                    if (extraData.relevant_team && extraData.relevant_teamname) {
                                                        return (
                                                            <div className="flex items-center gap-1"
                                                                data-tooltip-content={t("events.cheat.flag")}
                                                                data-tooltip-id="my-tooltip"
                                                                data-tooltip-place="bottom"
                                                            >
                                                                <Users className="w-4 h-4 flex-shrink-0" />
                                                                <span className="truncate" title={extraData.relevant_teamname}>{extraData.relevant_teamname}</span>
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs select-none hover:bg-orange/10 hover:border-orange/30 cursor-pointer transition-all duration-200 rounded-md px-2 py-1 font-mono"
                                                                    onClick={() => {
                                                                        copyWithResult(extraData.relevant_teamname || "", t("events.filter.team"))
                                                                    }}
                                                                >
                                                                    #{extraData.relevant_team}
                                                                </Badge>
                                                            </div>
                                                        );
                                                    }
                                                }
                                                const extraData = JSON.stringify(cheat.extra_data)
                                                return (
                                                    <>
                                                        <span className="truncate text-muted-foreground" title={extraData}>{extraData}</span>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs select-none hover:bg-purple/10 hover:border-purple/30 cursor-pointer transition-all duration-200 rounded-md p-1.5 hover:scale-105"
                                                            onClick={() => {
                                                                copyWithResult(extraData || "", t("events.cheat.title"))
                                                            }}
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                        </Badge>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                        {cheat.submiter_ip && (
                                            <div className="flex items-center flex-[1] gap-1 font-mono min-w-0" title={cheat.submiter_ip}>
                                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                                <span className="truncate">{cheat.submiter_ip}</span>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs select-none hover:bg-cyan/10 hover:border-cyan/30 cursor-pointer transition-all duration-200 rounded-md p-1.5 hover:scale-105"
                                                    onClick={() => {
                                                        copyWithResult(cheat.submiter_ip || "", t("events.cheat.ip"))
                                                    }}
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </MacScrollbar>
                    )}

                    {/* Pagination */}
                    {cheatsTotalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-4 select-none flex-wrap">
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={cheatsCurrentPage === 1}
                                onClick={() => setCheatsCurrentPage(prev => prev - 1)}
                                className="hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                            >
                                {t("page.prev")}
                            </Button>
                            {Array.from({ length: cheatsTotalPages }).slice(0, 10).map((_, idx) => {
                                const page = idx + 1
                                if (page > cheatsTotalPages) return null
                                return (
                                    <Button
                                        key={page}
                                        size="sm"
                                        variant={cheatsCurrentPage === page ? 'default' : 'outline'}
                                        onClick={() => setCheatsCurrentPage(page)}
                                        className={`transition-all duration-200 ${cheatsCurrentPage === page ? 'shadow-md' : 'hover:bg-primary/10 hover:border-primary/30'}`}
                                    >
                                        {page}
                                    </Button>
                                )
                            })}
                            {cheatsTotalPages > 10 && (
                                <span className="text-sm mx-2 text-muted-foreground">...</span>
                            )}
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={cheatsCurrentPage === cheatsTotalPages}
                                onClick={() => setCheatsCurrentPage(prev => prev + 1)}
                                className="hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                            >
                                {t("page.next")}
                            </Button>
                        </div>
                    )}

                    {/* Filter Dialog */}
                    <Dialog open={cheatsDialogOpen} onOpenChange={setCheatsDialogOpen}>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>{t("events.filter.title2")}</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-2 mt-4">
                                <h4 className="font-medium">{t("events.filter.select")}</h4>
                                <Select value={cheatsCurChoicedCategory} onValueChange={(value) => setCheatsCurChoicedCategory(value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t("events.filter.select")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="teamName">{t("events.filter.team")}</SelectItem>
                                        <SelectItem value="challengeName">{t("events.filter.challenge")}</SelectItem>
                                        <SelectItem value="cheatType">{t("events.cheat.type")}</SelectItem>
                                        <SelectItem value="timeRange">{t("events.filter.time")}</SelectItem>
                                        <SelectItem value="challengeId">{t("events.filter.chal_id")}</SelectItem>
                                        <SelectItem value="teamId">{t("events.filter.team_id")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Challenge names */}
                            {cheatsCurChoicedCategory === "challengeName" && (
                                <div className="space-y-2">
                                    <h4 className="font-medium">{t("events.filter.challenge")}{t("events.filter.keyword")}</h4>
                                    <Input value={newCheatsChallengeName} onChange={(e) => setNewCheatsChallengeName(e.target.value)} placeholder={t("events.filter.placeholder")} className="h-8" />
                                </div>
                            )}

                            {/* Team names */}
                            {cheatsCurChoicedCategory === "teamName" && (
                                <div className="space-y-2 mt-4">
                                    <h4 className="font-medium">{t("events.filter.team")}{t("events.filter.keyword")}</h4>
                                    <Input value={newCheatsTeamName} onChange={(e) => setNewCheatsTeamName(e.target.value)} placeholder={t("events.filter.placeholder")} className="h-8" />
                                </div>
                            )}

                            {/* Challenge IDs */}
                            {cheatsCurChoicedCategory === "challengeId" && (
                                <div className="space-y-2 mt-4">
                                    <h4 className="font-medium">{t("events.filter.chal_id")}</h4>
                                    <Input value={newCheatsChallengeId} onChange={(e) => setNewCheatsChallengeId(e.target.value)} placeholder={t("events.filter.chal_id")} className="h-8" />
                                </div>
                            )}

                            {/* Team IDs */}
                            {cheatsCurChoicedCategory === "teamId" && (
                                <div className="space-y-2 mt-4">
                                    <h4 className="font-medium">{t("events.filter.team_id")}</h4>
                                    <Input value={newCheatsTeamId} onChange={(e) => setNewCheatsTeamId(e.target.value)} placeholder={t("events.filter.team_id")} className="h-8" />
                                </div>
                            )}

                            {/* Cheat Type select */}
                            {cheatsCurChoicedCategory === "cheatType" && (
                                <div className="space-y-2 mt-4">
                                    <h4 className="font-medium">{t("events.cheat.type")}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {cheatTypeOptions.map(ct => {
                                            const active = tempCheatTypes.includes(ct)
                                            return (
                                                <Button key={ct} size="sm" variant={active ? "default" : "outline"} onClick={() => {
                                                    setTempCheatTypes(prev => active ? prev.filter(s => s !== ct) : [...prev, ct]);
                                                }}>{cheatTypeText(ct)}</Button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Time range */}
                            {cheatsCurChoicedCategory === "timeRange" && (
                                <div className="space-y-2 mt-4">
                                    <h4 className="font-medium">{t("events.filter.time")}</h4>
                                    <div className="flex items-center gap-1">
                                        <Input type="datetime-local" value={tempCheatsStartTime || ""} onChange={(e) => setTempCheatsStartTime(e.target.value || undefined)} className="h-8" />
                                        <span className="px-1">-</span>
                                        <Input type="datetime-local" value={tempCheatsEndTime || ""} onChange={(e) => setTempCheatsEndTime(e.target.value || undefined)} className="h-8" />
                                    </div>
                                </div>
                            )}

                            <DialogFooter className="mt-6">
                                <Button variant="secondary" onClick={() => setCheatsDialogOpen(false)}>{commonT("cancel")}</Button>
                                <Button onClick={() => {
                                    switch (cheatsCurChoicedCategory) {
                                        case "challengeName":
                                            if (newCheatsChallengeName.trim()) { setCheatsChallengeNames(prev => [...prev, newCheatsChallengeName.trim()]); setNewCheatsChallengeName(""); }
                                            break;
                                        case "teamName":
                                            if (newCheatsTeamName.trim()) { setCheatsTeamNames(prev => [...prev, newCheatsTeamName.trim()]); setNewCheatsTeamName(""); }
                                            break
                                        case "challengeId":
                                            const num1 = parseInt(newCheatsChallengeId.trim());
                                            if (!isNaN(num1)) { setCheatsChallengeIds(prev => prev.includes(num1) ? prev : [...prev, num1]); setNewCheatsChallengeId(""); }
                                            break
                                        case "teamId":
                                            const num2 = parseInt(newCheatsTeamId.trim());
                                            if (!isNaN(num2)) { setCheatsTeamIds(prev => prev.includes(num2) ? prev : [...prev, num2]); setNewCheatsTeamId(""); }
                                            break
                                        case "cheatType":
                                            setCheatTypes(tempCheatTypes);
                                            break
                                        case "timeRange":
                                            setCheatsStartTime(tempCheatsStartTime);
                                            setCheatsEndTime(tempCheatsEndTime);
                                            break
                                    }
                                    setCheatsCurrentPage(1)
                                    setCheatsDialogOpen(false)
                                }}>{commonT("confirm")}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
        </div>
    )
}