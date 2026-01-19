import { Shell } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function DeleteAccount() {
    const { t } = useTranslation("profile_settings")

    return (
        <div className="w-full h-full items-center justify-center flex gap-2 pb-10">
            <Shell size={40} />
            <span className="font-bold text-2xl">{t("developing")}</span>
        </div>
    )
}