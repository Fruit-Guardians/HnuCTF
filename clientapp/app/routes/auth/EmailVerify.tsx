import { Button } from "components/ui/button";
import { BadgeCheck, BadgePercent, BadgeX, House } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import { api, createSkipGlobalErrorConfig } from "utils/ApiHelper";

export default function EmailVerify() {
    const [search, _] = useSearchParams()
    const code = search.get("code")
    const { t } = useTranslation("verify")

    if (!search.has("code") || code?.trim().length == 0) {
        return (
            <div className="w-screen h-screen flex items-center justify-center">
                <span className="font-bold text-2xl">{t("miss_code")}</span>
            </div>
        )
    }

    const [emailVerifyStatus, setEmailVerifyStatus] = useState("verifying")

    const navigate = useNavigate()

    useEffect(() => {
        api.user.verifyEmailCode({
            code: code ?? ""
        }, createSkipGlobalErrorConfig()).then((_res) => {
            setEmailVerifyStatus("verified")
        }).catch((_res) => {
            setEmailVerifyStatus("error")
        })
    }, [code])

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center select-none gap-8">
            {emailVerifyStatus == "verified" ? (
                <div className="flex flex-col items-center justify-center gap-4 text-green-500">
                    <BadgeCheck size={64} />
                    <span className="font-bold text-3xl">{t("email_verified")}</span>
                </div>
            ) : emailVerifyStatus == "error" ? (
                <div className="flex flex-col items-center justify-center gap-4 text-red-400">
                    <BadgeX size={64} />
                    <span className="font-bold text-3xl">{t("invalid_code")}</span>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-4">
                    <BadgePercent size={64} />
                    <span className="font-bold text-3xl">{t("email_verifying")}</span>
                </div>
            )}
            <Button variant="outline"
                onClick={() => {
                    navigate("/")
                }}
            >
                <House />
                {t("home")}
            </Button>
        </div>
    )
}