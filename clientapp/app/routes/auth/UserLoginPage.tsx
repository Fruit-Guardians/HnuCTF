import { WandSparkles } from "lucide-react"
import { MacScrollbar } from "mac-scrollbar"
import { useTheme } from "next-themes"
import ThemeSwitcher from "components/ToggleTheme"
import { useGlobalVariableContext } from "contexts/GlobalVariableContext";
import { useNavigate } from "react-router";
import { Button } from "components/ui/button"
import { LoginForm } from "components/forms/LoginForm";

export default function LoginPageMain() {

    const { clientConfig, getSystemLogo } = useGlobalVariableContext()
    const navigate = useNavigate()
    const { theme } = useTheme()

    return (
        <div className="h-screen overflow-hidden select-none">
            <MacScrollbar className="w-full h-full" skin={theme === "dark" ? "dark" : "light"}>
                <div className="min-h-screen flex flex-col p-6 md:p-10 lg:w-[50vw] w-screen">
                    <div className="flex gap-2 justify-between flex-shrink-0">
                        <div onClick={() => {
                            navigate(`/`)
                        }} className="flex items-center gap-2 font-medium">
                            <img
                                src={getSystemLogo()}
                                alt={clientConfig.SVGAltData}
                                width={40}
                                height={40}
                            />
                            <span className="font-bold text-lg">{clientConfig.systemName} SSO</span>
                        </div>
                        <ThemeSwitcher>
                            <Button variant="outline" size="icon">
                                <WandSparkles />
                            </Button>
                        </ThemeSwitcher>
                    </div>
                    <div className="flex-1 flex items-center justify-center py-8">
                        <div className="w-full max-w-[400px]">
                            <LoginForm />
                        </div>
                    </div>
                </div>
                <div className="absolute hidden bg-muted lg:block left-[50vw] top-0 w-[50vw] h-full pointer-events-none">
                    <img
                        src={clientConfig.DefaultBGImage}
                        alt="Image"
                        width={4000}
                        height={2000}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                </div>
            </MacScrollbar>
        </div>
    )
}