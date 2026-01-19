import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, WandSparkles, MonitorCog } from 'lucide-react'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "components/ui/dropdown-menu"
import { Button } from "components/ui/button"

import React from 'react';
import { useGlobalVariableContext } from 'contexts/GlobalVariableContext';
import { useTranslation } from 'react-i18next';
import { Loader2 } from "lucide-react";

const ThemeSwitcher = (
    { children }: { children?: React.ReactNode }
) => {

    const { clientConfig, updateClientConfg } = useGlobalVariableContext()

    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()
    const { t } = useTranslation()

    const { i18n } = useTranslation()
    const currentLang = i18n.language
    const languages = [
        { code: "zh", label: "简", enabled: true },
        { code: "zh-HK", label: "繁", enabled: true },
        { code: "en", label: "En", enabled: true },
    ]

    const [loadingLang, setLoadingLang] = useState<string | null>(null)
    const handleChangeLanguage = async (lng: string) => {
        if (loadingLang || i18n.language === lng) return
        setLoadingLang(lng)
        try {
            await i18n.changeLanguage(lng)
        } finally {
            setLoadingLang(null)
        }
    }

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="outline" size="icon">
                <WandSparkles className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Toggle theme</span>
            </Button>
        )
    }

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                {children ? children : (
                    <Button variant="outline" size="icon">
                        <WandSparkles className="h-[1.2rem] w-[1.2rem]" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>外观设置</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">主题模式</span>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={theme === 'light' ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1"
                            onClick={() => setTheme('light')}
                        >
                            <Sun className="h-4 w-4 mr-2" />
                            亮色
                        </Button>
                        <Button
                            variant={theme === 'dark' ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1"
                            onClick={() => setTheme('dark')}
                        >
                            <Moon className="h-4 w-4 mr-2" />
                            深色
                        </Button>
                    </div>
                    <div className="mt-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start px-2"
                            onClick={() => setTheme('system')}
                        >
                            <MonitorCog className="h-4 w-4 mr-2" />
                            使用系统颜色
                        </Button>
                    </div>
                </div>

                <DropdownMenuSeparator />

                <div className="p-2">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">语言选择</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {languages.map(({ code, label, enabled }) => (
                            <Button
                                key={code}
                                variant={currentLang === code ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleChangeLanguage(code)}
                                disabled={!!loadingLang || !enabled}
                                className="w-full"
                            >
                                {loadingLang === code ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <span>{label}</span>
                                )}
                            </Button>
                        ))}
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default React.memo(ThemeSwitcher)
