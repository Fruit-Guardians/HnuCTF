import { Button } from "components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "components/ui/dialog"

import { Dispatch, SetStateAction } from "react";
import { CircleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

export type DialogOption = { 
    onConfirm?: () => void, onCancel?: () => void, isOpen: boolean, message: string, title?: string
}

export type DialogSettings = {
    settings: DialogOption;
    setSettings: Dispatch<SetStateAction<DialogOption>>
}

export const ConfirmDialog: React.FC<DialogSettings> = ({ settings: {
    onConfirm, onCancel, isOpen, message, title = "Are you sure"
}, setSettings }) => {

    const { t } = useTranslation("teams", { 
        useSuspense: false  // 禁用 Suspense 模式
    })

    const setIsOpen = (status: boolean) => {
        setSettings((prev) => (
            {
                ...prev,
                isOpen: status
            }
        ))
    }

    return (
        <Dialog open={isOpen} onOpenChange={(status) => {
            setIsOpen(status)
            if (!status) {
                if (onCancel) onCancel()
            }
        }}>
            <DialogTrigger asChild>

            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px] select-none"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>{ title }</DialogTitle>
                </DialogHeader>
                <div className="w-full flex gap-2 items-center">
                    <CircleAlert className="stroke-red-500" /> 
                    <span>{ message }</span>
                </div>
                <div className="flex gap-2">
                    <div className="flex-1" />
                    <Button variant="destructive"
                        onClick={() => {
                            setIsOpen(false)
                            if (onConfirm) onConfirm()
                        }}
                    >{ t("continue_button") }</Button>
                    <Button variant="secondary"
                        onClick={() => {
                            setIsOpen(false)
                            if (onCancel) onCancel()
                        }}
                    >{ t("cancel_button") }</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}