import { Button } from "components/ui/button";
import { Users, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from 'react-toastify/unstyled';
import { api } from "utils/ApiHelper";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from 'components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from 'components/ui/dialog';
import { Input } from "components/ui/input";

export default function ChallengeTools(
    { gameID, challengeID }: {
        gameID: number,
        challengeID: number
    }
) {

    // 删除解题记录相关状态
    const [isDeleteTeamSolveOpen, setIsDeleteTeamSolveOpen] = useState(false)
    const [currentChallengeId, setCurrentChallengeId] = useState(0)
    const [teamSearchTerm, setTeamSearchTerm] = useState('')
    const [teamSearchResults, setTeamSearchResults] = useState<{ team_id: number; team_name: string }[]>([])
    const [isSearchingTeams, setIsSearchingTeams] = useState(false)
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)

    // 清空解题记录确认对话框状态
    const [isClearSolvesAlertOpen, setIsClearSolvesAlertOpen] = useState(false)
    const [clearSolvesChallengeId, setClearSolvesChallengeId] = useState(0)

    // 搜索队伍
    const searchTeams = useCallback(async (searchTerm: string) => {
        if (!searchTerm.trim()) {
            setTeamSearchResults([]);
            return;
        }

        setIsSearchingTeams(true);
        api.admin.adminListTeams({
            game_id: gameID,
            size: 50,
            offset: 0,
            search: searchTerm
        }).then((res) => {
            const teamList = res.data.data?.map((team: any) => ({
                team_id: team.team_id,
                team_name: team.team_name
            })) || [];

            setTeamSearchResults(teamList);
        }).finally(() => {
            setIsSearchingTeams(false);
        })
    }, [gameID]);

    useEffect(() => {
        if (teamSearchTerm) {
            searchTeams(teamSearchTerm)
        }
    }, [teamSearchTerm])

    // 删除特定队伍的解题记录
    const handleDeleteTeamSolve = (challengeId: number) => {
        setCurrentChallengeId(challengeId);
        setIsDeleteTeamSolveOpen(true);
        setTeamSearchTerm('');
        setTeamSearchResults([]);
        setSelectedTeamId(null);
    };

    // 清空所有解题记录
    const handleClearAllSolves = (challengeId: number) => {
        setClearSolvesChallengeId(challengeId);
        setIsClearSolvesAlertOpen(true);
    };

    // 确认清空所有解题记录
    const confirmClearAllSolves = async () => {
        api.admin.deleteChallengeSolves(gameID, clearSolvesChallengeId, {}).then(() => {
            toast.success('已清空所有解题记录');
            setIsClearSolvesAlertOpen(false);
        })
    };

    // 确认删除特定队伍的解题记录
    const confirmDeleteTeamSolve = async () => {
        if (!selectedTeamId) {
            toast.error('请选择一个队伍');
            return;
        }

        api.admin.deleteChallengeSolves(gameID, currentChallengeId, {
            team_id: selectedTeamId
        }).then(() => {
            toast.success('已删除队伍解题记录');
            setIsDeleteTeamSolveOpen(false);
        })
    };

    return (
        <>

            {/* 删除队伍解题记录对话框 */}
            < Dialog open={isDeleteTeamSolveOpen} onOpenChange={setIsDeleteTeamSolveOpen} >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>删除队伍解题记录</DialogTitle>
                        <DialogDescription>
                            选择要删除解题记录的队伍
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">搜索队伍</label>
                            <Input
                                placeholder="输入队伍名称..."
                                value={teamSearchTerm}
                                onChange={(e) => setTeamSearchTerm(e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        {teamSearchResults.length > 0 && (
                            <div className="border rounded-md max-h-60 overflow-y-auto">
                                {teamSearchResults.map((team) => (
                                    <div
                                        key={team.team_id}
                                        className={`p-3 cursor-pointer hover:bg-muted transition-colors ${selectedTeamId === team.team_id ? 'bg-primary/10 border-primary' : ''
                                            }`}
                                        onClick={() => setSelectedTeamId(team.team_id)}
                                    >
                                        <div className="font-medium">{team.team_name}</div>
                                        <div className="text-sm text-muted-foreground">ID: {team.team_id}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {isSearchingTeams && (
                            <div className="text-center py-4 text-muted-foreground">
                                搜索中...
                            </div>
                        )}

                        {teamSearchTerm && teamSearchResults.length === 0 && !isSearchingTeams && (
                            <div className="text-center py-4 text-muted-foreground">
                                未找到匹配的队伍
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsDeleteTeamSolveOpen(false)}>
                            取消
                        </Button>
                        <Button
                            onClick={confirmDeleteTeamSolve}
                            disabled={!selectedTeamId}
                            variant="destructive"
                        >
                            确认删除
                        </Button>
                    </div>
                </DialogContent>
            </Dialog >

            {/* 清空解题记录确认对话框 */}
            < AlertDialog open={isClearSolvesAlertOpen} onOpenChange={setIsClearSolvesAlertOpen} >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认清空解题记录</AlertDialogTitle>
                        <AlertDialogDescription>
                            确定要清空这道题的所有解题记录吗？此操作不可撤销！
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsClearSolvesAlertOpen(false)}>
                            取消
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={confirmClearAllSolves} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            确认清空
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog >

            <div className="flex flex-col gap-2 pt-5">
                <span className="text-lg font-bold">解题记录操作</span>
                <div className="flex gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 bg-foreground/10 hover:hover:bg-yellow-500/10 hover:text-yellow-600 transition-all duration-200"
                        onClick={() => handleDeleteTeamSolve(challengeID)}
                        title="删除队伍解题记录"
                        type="button"
                    >
                        <Users className="h-4 w-4 mr-1" />
                        删除队伍解题记录
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 bg-foreground/10 hover:hover:bg-orange-500/10 hover:text-orange-600 transition-all duration-200"
                        onClick={() => handleClearAllSolves(challengeID)}
                        title="清空所有解题记录"
                        type="button"
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        清空所有解题记录
                    </Button>
                </div>
            </div>
        </>
    )
}