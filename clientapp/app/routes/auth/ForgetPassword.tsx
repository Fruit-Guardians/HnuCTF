import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { CheckCheck, Send } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify/unstyled";
import { api } from "utils/ApiHelper";

export default function ForgetPassword() {

    const [email, setEmail] = useState("")
    const [sended, setSended] = useState(false)
    const { t } = useTranslation("verify")

    const handleForgetPassword = () => {
        if (!email) {
            toast.error(t("empty_email"))
            return
        }
        api.user.sendForgetPasswordEmail({
            email: email
        }).then(() => {
            setSended(true)
        })
    }

    return (
        <div className="w-screen h-screen flex items-center justify-center select-none">

            {!sended ? (
                <div className="w-full flex flex-col p-8 border-1 bg-background/40 z-[5] rounded-2xl max-w-lg gap-4">
                    <span className="text-xl font-bold">{t("find_password")}</span>
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground">{t("input_email")}</span>
                        <Input placeholder={t("empty_email")} value={email} onChange={(e) => setEmail(e.target.value)}></Input>
                    </div>
                    <div className="flex justify-end">
                        <Button variant="outline"
                            onClick={handleForgetPassword}
                        >
                            <Send />
                            {t("send_email")}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="w-full flex flex-col p-8 border-1 bg-background/40 z-[5] rounded-2xl max-w-lg gap-4 items-center justify-center">
                    <CheckCheck size={64} />
                    <span className="text-xl text-muted-foreground">{t("sent_email")}</span>
                </div>
            )}
        </div>
    )
}