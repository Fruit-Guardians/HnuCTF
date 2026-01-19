import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "components/ui/button";
import { Loader2, Mail, SendHorizonal, X } from "lucide-react";

import {
    animated,
    useTransition,
} from '@react-spring/web'
import { UserDetailGameChallenge } from "utils/A1API";
import { api } from "utils/ApiHelper";
import { toast } from 'react-toastify/unstyled';
import { ChallengeSolveStatus } from "components/user/game/ChallengesView";
import { useTranslation } from "react-i18next";

const SubmitFlagView = ({ curChallenge, gameID, setChallengeSolved, challengeSolveStatusList: _challengeSolveStatusList, visible, setVisible }: { curChallenge: UserDetailGameChallenge | undefined, gameID: number, setChallengeSolved: (id: number) => void, challengeSolveStatusList: Record<number, ChallengeSolveStatus>, visible: boolean, setVisible: Dispatch<SetStateAction<boolean>> }) => {

    const { t } = useTranslation("challenge_view");
    const [flag, setFlag] = useState<string>("");
    const [judgeing, setJudgeing] = useState(false);
    const [borderRed, setBorderRed] = useState(false);

    const transitions = useTransition(visible, {
        from: {
            opacity: 0,
            backdropFilter: 'blur(0px)',
            transform: 'translateY(40px)'
        },
        enter: {
            opacity: 1,
            backdropFilter: 'blur(4px)',
            transform: 'translateY(0)'
        },
        leave: {
            opacity: 0,
            backdropFilter: 'blur(0px)',
            transform: 'translateY(40px)'
        },
        config: { tension: 220, friction: 20 }
    });

    useEffect(() => {
        setFlag("")
    }, [visible])

    const handleSubmitFlag = () => {
        setJudgeing(true)
        api.user.userGameSubmitFlag(gameID, curChallenge?.challenge_id ?? 0, { flag: flag })
            .then((res) => {
                if (res.status == 200) {
                    const judgeingInter = setInterval(() => {
                        api.user.userGameJudgeResult(gameID, res.data.data.judge_id)
                            .then((res2) => {
                                if (res2.status == 200) {
                                    if (res2.data.data.judge_status == "JudgeAC") {
                                        setVisible(false)
                                        setJudgeing(false)
                                        clearInterval(judgeingInter)

                                        setTimeout(() => {
                                            setChallengeSolved(curChallenge?.challenge_id || 0)
                                        }, 200)

                                    } else if (res2.data.data.judge_status == "JudgeWA") {
                                        toast.error(t("flag_error"));
                                        setBorderRed(true)
                                        setJudgeing(false)
                                        clearInterval(judgeingInter)
                                    } else if (res2.data.data.judge_status == "JudgeError" || res2.data.data.judge_status == "JudgeTimeout") {
                                        toast.error(t("judge_error"));
                                        setJudgeing(false)
                                        clearInterval(judgeingInter)
                                    }
                                } else {
                                    toast.error(t("unknow_error"));
                                    setJudgeing(false)
                                    clearInterval(judgeingInter)
                                }
                            })
                    }, 1000)
                }
            }
            ).catch(() => {
                setJudgeing(false)
            });
    }

    return (
        <>
            {/* 模态框动画 */}
            {transitions((style, item) =>
                item && (
                    <div className="absolute h-screen w-screen top-0 left-0 z-40 select-none overflow-hidden">
                        {/* 背景模糊层 */}
                        <animated.div
                            style={{
                                opacity: style.opacity,
                                backdropFilter: style.backdropFilter
                            }}
                            className="absolute w-full h-full bg-black/20"
                            onClick={() => setVisible(false)}
                        />

                        {/* 内容层 */}
                        <animated.div
                            style={{
                                opacity: style.opacity,
                                transform: style.transform
                            }}
                            className="absolute w-full h-full flex items-center justify-center"
                        >
                            <div className="w-[50%] flex flex-col gap-6 p-10 h-[290px] bg-background/80 border-4 border-foreground/60 rounded-lg shadow-[0.5em_0.5em_0_0_#121212bb] dark:shadow-[0.5em_0.5em_0_0_#9a9a9abb]">
                                <div className="flex gap-6 items-center">
                                    <Mail size={48} />
                                    <span className="font-bold text-3xl">{t("submit_flag_title")}</span>
                                </div>

                                <input
                                    className={`${borderRed ? "border-red-600 text-red-600" : ""} flex w-full bg-transparent px-3 shadow-sm transition-colors duration-300 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 h-[50px] border-foreground rounded-lg border-4 text-xl font-bold py-0 focus-visible:border-blue-400 focus-visible:text-blue-400`}
                                    placeholder={t("submit_flag_placeholder")}
                                    value={flag}
                                    onFocus={() => setBorderRed(false)}
                                    onChange={(e) => setFlag(e.target.value)}
                                />

                                <div className="flex gap-6">
                                    <Button
                                        className="h-[50px] rounded-lg transition-all duration-300 p-0 border-4 px-4 py-4 border-red-400 text-red-400 bg-background hover:border-red-600 hover:text-red-600 hover:bg-red-400/10 [&_svg]:size-[32px]"
                                        onClick={() => setVisible(false)}
                                        disabled={judgeing}
                                    >
                                        <div className="flex gap-4 items-center">
                                            <X />
                                            <span className="font-bold text-xl">{t("submit_flag_close")}</span>
                                        </div>
                                    </Button>
                                    <Button className="h-[50px] rounded-lg transition-all duration-300 p-0 border-4 px-4 py-4 border-blue-400 text-blue-400 bg-background hover:border-blue-400 hover:text-blue-400 hover:bg-blue-400/10 [&_svg]:size-[32px]"
                                        onClick={handleSubmitFlag}
                                        disabled={judgeing}
                                    >
                                        {judgeing ? (
                                            <div className="flex gap-4 items-center">
                                                <Loader2 className="animate-spin" />
                                                <span className="font-bold text-xl">{t("submit_flag_judge")}</span>
                                            </div>
                                        ) : (
                                            <div className="flex gap-4 items-center">
                                                <SendHorizonal />
                                                <span className="font-bold text-xl">{t("submit_flag_check")}</span>
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </animated.div>
                    </div>
                )
            )}
        </>
    )
}

export default SubmitFlagView;