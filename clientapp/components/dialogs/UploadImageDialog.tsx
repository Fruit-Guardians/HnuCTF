import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "components/ui/dialog"


import { useRef, useState } from "react";
import { toast } from 'react-toastify/unstyled';
import { Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { api } from "utils/ApiHelper";


export const UploadImageDialog: React.FC<{ updateTeam?: () => void, id?: number, game_id?: number, type: "team" | "person",  children: React.ReactNode }> = ({ updateTeam, id, game_id, type, children }) => {

    const [isOpen, setIsOpen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { t } = useTranslation("upload_image", { 
        useSuspense: false  // 禁用 Suspense 模式
    })

    const handleUpload = () => {
        fileInputRef.current?.click();
    }

    const handleFileChange = (event: any) => {
        const file = event.target.files[0];
        if (type == "team" && id) {
            api.team.uploadTeamAvatar(game_id ?? 0, {
                avatar: file,
            }).then(() => {
                toast.success(t("set_avatar_success"))

                if (updateTeam) updateTeam()
                setTimeout(() => {
                    setIsOpen(false)
                }, 200)
            })
        }
        if (type == "person") {
            api.user.uploadUserAvatar({
                avatar: file
            }).then(() => {
                toast.success(t("set_avatar_success"))
                setTimeout(() => {
                    setIsOpen(false)
                    if (updateTeam) updateTeam()
                }, 200)
            })
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(status) => {
            setIsOpen(status)
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px] select-none"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>{ t("choose_image") }</DialogTitle>
                </DialogHeader>
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: "none" }} // 隐藏文件选择框
                    onChange={handleFileChange}
                />
                <div className="w-full h-[200px] border-2 border-dashed rounded-xl flex items-center justify-center" onClick={handleUpload} >
                    <Upload size={50} className="opacity-35"/>
                </div>
            </DialogContent>
        </Dialog>
    )
}