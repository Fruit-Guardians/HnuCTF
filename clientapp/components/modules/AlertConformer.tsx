import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "components/ui/alert-dialog"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { cn } from "lib/utils"
import { Asterisk, MessageCircleQuestion, ShieldCheck, TriangleAlert } from "lucide-react"
import { randomInt } from "mathjs"
import { ReactNode, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify/unstyled"

export default function AlertConformer(
    {
        children,
        title = "",
        description = "",
        type = "default",
        descriptionClassName,
        onConfirm,
        onCancel,
    }: {
        children: ReactNode,
        title?: string,
        description?: string,
        type?: "critical" | "danger" | "default",
        onConfirm?: () => void,
        descriptionClassName?: string,
        onCancel?: () => void
    }
) {
    const { t } = useTranslation()

    const [ curStep, setCurStep ] = useState<number>(0)

    const [ randomedChallenge, setRandomedChallenge ] = useState<{
        challenge: string,
        answer: number
    }>()

    const [ isOpen, setIsOpen ] = useState<boolean>(false)

    const [answer, setAnswer] = useState<string>()

    return (
        <AlertDialog
            open={isOpen}
            onOpenChange={(isOpen) => {
                if (isOpen) {
                    setCurStep(0);
                    setAnswer("");
                    const num1 = randomInt(200, 1000), num2 = randomInt(200, 1000);
                    setRandomedChallenge({
                        challenge: `${num1} * ${num2} = ?`,
                        answer: num1 * num2
                    });
                }
                setIsOpen(isOpen);
            }}
        >
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent className="select-none">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        <div
                            className={`flex gap-2 items-center ${type == "danger" || type == "critical" ? "text-red-500" : ""}`}
                        >
                            { type == "default" ? <Asterisk size={30} /> : <TriangleAlert size={30} /> }
                            {title}
                        </div>
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        { type != "critical" ? description : (
                            curStep === 0 ? (
                                <div className="flex gap-2 items-center text-red-500 py-3 justify-center">
                                    <span className={cn("font-bold text-xl", descriptionClassName)}>{description}</span>
                                </div>
                            ) : curStep == 1 ? (
                                <div className="flex flex-col gap-4 items-center py-3">
                                    <div className="flex gap-2 items-center text-red-500 font-bold text-lg">
                                        <ShieldCheck />
                                        <span>{t("complete_math_question")}</span>
                                    </div>
                                    <span className="text-2xl px-3 select-text py-2 rounded-md bg-foreground/5 border">{ randomedChallenge?.challenge }</span>
                                    <Input value={answer} onChange={(e) => setAnswer(e.target.value)} />
                                </div>
                            ) : (
                                <div className="flex gap-2 items-center text-red-500 py-3 justify-center">
                                    <span className="font-bold text-xl">{t("final_confirm")}</span>
                                </div>
                            )
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        className="cursor-pointer"
                        onClick={() => {
                            if (onCancel) onCancel()  
                        }}
                    >{t("cancel")}</AlertDialogCancel>
                    <Button
                        onClick={() => {
                            if (type == "critical") {
                                if (curStep == 0) {
                                    setCurStep(curStep + 1)
                                } else if (curStep == 1) {
                                    if (answer == randomedChallenge?.answer.toString()) {
                                        setCurStep(curStep + 1)
                                    } else {
                                        toast.error(t("answer_incorrect"))
                                    }
                                } else {
                                    if (onConfirm) onConfirm();
                                    setIsOpen(false);
                                }
                            } else {
                                if (onConfirm) onConfirm();
                                setIsOpen(false);
                            }
                        }}
                        className={`${type == "danger" || type == "critical" ? "bg-destructive hover:bg-destructive/90 cursor-pointer" : ""}`}
                    >{t("continue")}</Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}