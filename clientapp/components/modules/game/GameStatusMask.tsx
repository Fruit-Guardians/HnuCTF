import { Button } from "components/ui/button";
import { ParticipationStatus } from "utils/A1API";
import { motion } from "framer-motion";
import { TriangleAlert, Undo2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useGame } from "hooks/UseGame";

export default function GameStatusMask({ gameID } : { gameID: number }) {

    const {
        teamStatus, 
        isLoading
    } = useGame(gameID)

    const { t } = useTranslation('challenge_view');

    const navigate = useNavigate()

    if (isLoading) return <></>

    return (
        <>
            {teamStatus == ParticipationStatus.Banned && (
                <motion.div
                    className={`absolute top-0 left-0 w-screen h-screen flex items-center justify-center z-[40]`}
                    initial={{
                        backgroundColor: "rgb(239 68 68 / 0)",
                        backdropFilter: "blur(0px)"
                    }}
                    animate={{
                        backgroundColor: "rgb(239 68 68 / 0.9)",
                        backdropFilter: "blur(16px)"
                    }}
                    transition={{
                        duration: 0.5
                    }}
                >
                    <div className="flex flex-col items-center gap-6 select-none">
                        <div className="flex flex-col items-center gap-6 text-white">
                            <TriangleAlert size={120} />
                            <span className="text-3xl">{t("you_have_be_banned")}</span>
                        </div>
                        <Button variant="secondary" onClick={() => {
                                navigate(`/games`)
                        }}><Undo2 />{t("back_to_main")}</Button>
                    </div>
                </motion.div>
            )}
        </>
    )
}