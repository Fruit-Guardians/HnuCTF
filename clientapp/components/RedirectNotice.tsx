import { AnimatePresence, motion } from "framer-motion";
import { FileWarning } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";

export function RedirectNotice({ redirectURL, setRedirectURL } : { redirectURL: string, setRedirectURL: Dispatch<SetStateAction<string>> }) {

    const { t } = useTranslation('challenge_view');

    return (
        <AnimatePresence>
            { redirectURL && (
                <motion.div
                    className="absolute top-0 left-0 w-screen h-screen z-[100] flex items-center justify-center overflow-hidden"
                    initial={{
                        backdropFilter: "blur(0px)",
                        opacity: 0
                    }}
                    animate={{
                        backdropFilter: "blur(8px)",
                        opacity: 1
                    }}
                    exit={{
                        backdropFilter: "blur(0px)",
                        opacity: 0
                    }}
                    transition={{
                        duration: 0.3
                    }}
                >
                    <div className="flex flex-col justify-center items-center gap-4 overflow-hidden">
                        <FileWarning size={80} />
                        <div className="flex p-4 overflow-hidden">
                            <span className="text-sm lg:text-xl font-bold">{ t("ready_redirect") } {redirectURL}</span>
                        </div>
                        <span className="text-xl font-bold text-red-400">{ t("check_security") }</span>
                        <div className="flex w-full justify-center gap-4">
                            <Button variant="destructive" className="w-[90px]" onClick={() => {
                                window.open(redirectURL)
                                setRedirectURL("")
                            }}>{ t("continue_redirect") }</Button>
                            <Button variant="ghost" className="w-[90px]" onClick={() => setRedirectURL("")}>{ t("cancel_redirect") }</Button>
                        </div>
                    </div>
                </motion.div>
            ) }
        </AnimatePresence>
    )
}