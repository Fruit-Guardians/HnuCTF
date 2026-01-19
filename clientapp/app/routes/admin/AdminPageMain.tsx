import SafeComponent from "components/SafeComponent"
import { AdminHeader } from "components/admin/AdminHeader";
import { useGlobalVariableContext } from "contexts/GlobalVariableContext";
import { useTranslation } from "react-i18next";

export default function AdminPageMain() {
    const { t } = useTranslation("admin")
    const { curProfile } = useGlobalVariableContext()

    return (
        <div className="p-0 h-screen flex flex-col">
            <main className="flex flex-1 overflow-hidden">
                <div className="w-full">
                    <SafeComponent animation={false}>
                        <AdminHeader />
                        <div className="w-full h-full p-8 flex flex-col items-center justify-center gap-2">
                            <span className="text-5xl font-bold">{t("welcome", { name: curProfile?.username ?? "" })}</span>
                        </div>
                    </SafeComponent>
                </div>
            </main>
        </div>
    );
}