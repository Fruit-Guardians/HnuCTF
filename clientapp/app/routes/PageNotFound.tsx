import SafeComponent from "components/SafeComponent";
import { Button } from "components/ui/button";
import { Accessibility, House } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

export default function NotFound() {
    const { t } = useTranslation();

    const navigator = useNavigate();

    return (
        <div className="p-0 h-screen flex flex-col">
            <main className="flex flex-1 items-center justify-center">
                <SafeComponent animation={false}>
                    <div className="flex flex-col items-center justify-center gap-6 select-none">
                        <div className="flex gap-2 items-center">
                            <Accessibility size={128} />
                            <h1 className="text-9xl font-bold">404</h1>
                        </div>
                        <p className="text-2xl">{t('page_not_found')}</p>
                        <Button variant={"default"} onClick={() => {
                            navigator("/")
                        }}>
                            <House />
                            {t('back_to_home')}
                        </Button>
                    </div>
                </SafeComponent>
            </main>
        </div>
    );
} 