import React, { createContext, useContext, useEffect, useRef, useState, ReactNode, Dispatch, SetStateAction } from "react";
import { browserName } from "react-device-detect";
import { UserProfile, UserRole } from "utils/A1API";
import { api, createSkipGlobalErrorConfig } from "utils/ApiHelper";
import axios from 'axios';
import { useTheme } from "next-themes";

import useLocalStorage from "use-local-storage-state";
import { useNavigate } from "react-router";
import { useCookies } from "react-cookie";

interface ClientConfig {
    FancyBackGroundIconWhite: string;
    FancyBackGroundIconBlack: string;
    DefaultBGImage: string;
    SVGIconLight: string;
    SVGIconDark: string;
    SVGAltData: string;
    TrophysGold: string;
    TrophysSilver: string;
    TrophysBronze: string;
    SchoolLogo: string;
    SchoolSmallIcon: string;
    SchoolUnionAuthText: string;
    BGAnimation: boolean;
    AboutUS: string;
    systemName: string;
    systemLogo: string;
    systemFavicon: string;
    systemSlogan: string;
    systemFooter: string;
    systemICP: string;
    systemOrganization: string;
    systemOrganizationURL: string;
    themeColor: string;
    darkModeDefault: boolean;
    allowUserTheme: boolean;
    defaultLanguage: string;
    captchaEnabled: boolean;
    updateVersion: string;

    fancyBackGroundIconWidth: number;
    fancyBackGroundIconHeight: number;

    // 全局比赛模式
    gameActivityMode: string | undefined;
}

interface GlobalVariableContextType {
    curProfile: UserProfile;
    updateProfile: (callback?: () => void) => void;
    serialOptions: React.MutableRefObject<echarts.SeriesOption[]>;
    clientConfig: ClientConfig;
    updateClientConfg: (key: keyof ClientConfig, value: any) => void;
    isDarkMode: boolean;
    setIsDarkMode: (isDark: boolean) => void;
    refreshClientConfig: () => Promise<void>;
    checkLoginStatus: () => boolean;
    unsetLoginStatus: () => void;
    getSystemLogo: () => string;
    getSystemLogoDefault: () => string;
    isAdmin: () => boolean;
    setCurProfile: Dispatch<SetStateAction<UserProfile>>;
    localStorageUID: string | undefined;
}

const globalVariableContext = createContext<GlobalVariableContextType | undefined>(undefined);

export const useGlobalVariableContext = () => {
    const context = useContext(globalVariableContext);
    if (!context) {
        throw new Error("useGlobalVariableContext must be used within a GlobalVariableContextProvider");
    }
    return context;
};

export const GlobalVariableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const [localStorageClientConfig, setLocalStorageClientConfig] = useLocalStorage<ClientConfig>("clientconfig")
    const [localStorageUID, setLocalStorageUID, { removeItem: removeUID }] = useLocalStorage<string>("uid")
    const [_cookies, _setCookie, removeCookie] = useCookies(["a1token"])
    const navigate = useNavigate()

    const [curProfile, setCurProfile] = useState<UserProfile>({} as UserProfile)

    const { theme, systemTheme, setTheme } = useTheme()

    const defaultClientConfig: ClientConfig = {
        FancyBackGroundIconWhite: "/images/ctf_white.png",
        FancyBackGroundIconBlack: "/images/ctf_black.png",
        DefaultBGImage: "/images/defaultbg.jpg",
        SVGIconLight: "/images/A1natas.svg",
        SVGIconDark: "/images/A1natas_white.svg",
        SVGAltData: "A1natas",
        TrophysGold: "/images/trophys/gold_trophy.png",
        TrophysSilver: "/images/trophys/silver_trophy.png",
        TrophysBronze: "/images/trophys/copper_trophy.png",
        SchoolLogo: "/images/A1natas.svg",
        SchoolSmallIcon: "/images/A1natas.svg",
        SchoolUnionAuthText: "Union Auth",
        BGAnimation: false,
        systemName: 'A1CTF',
        systemLogo: '',
        systemFavicon: '',
        systemSlogan: 'A Modern CTF Platform',
        systemFooter: '© 2025 A1CTF Team',
        systemICP: '',
        systemOrganization: 'A1CTF',
        systemOrganizationURL: 'https://github.com/carbofish/A1CTF',
        themeColor: 'blue',
        darkModeDefault: true,
        allowUserTheme: true,
        defaultLanguage: 'zh-CN',
        AboutUS: "A1CTF Platform",
        captchaEnabled: false,
        updateVersion: '',
        fancyBackGroundIconWidth: 241.2,
        fancyBackGroundIconHeight: 122.39,

        gameActivityMode: undefined,
    }

    const [clientConfig, setClientConfig] = useState<ClientConfig>({} as ClientConfig)
    const [isDarkMode, setIsDarkMode] = useState<boolean>(defaultClientConfig.darkModeDefault);

    const updateClientConfg = (key: keyof ClientConfig, value: any) => {
        setClientConfig((prevConfig) => ({
            ...prevConfig,
            [key]: value
        }))
        setLocalStorageClientConfig({ ...clientConfig, [key]: value })
    }

    const serialOptions = useRef<echarts.SeriesOption[]>([])

    const updateProfile = (callback?: () => void) => {
        api.user.getUserProfile().then((res) => {
            setCurProfile(res.data.data)
            setLocalStorageUID(res.data.data.user_id)
        }, createSkipGlobalErrorConfig()).catch((_) => {
            removeUID()
        }).finally(() => {
            if (callback) callback()
        })
    }

    const checkLoginStatus = () => {
        return localStorageUID != undefined
    }

    const unsetLoginStatus = () => {
        // 删掉 localStorage 里的 UID
        removeUID()
        // 删掉 token
        removeCookie("a1token")
        navigate("/")
    }

    const getSystemLogo = () => {
        if (theme == "light") return clientConfig.SVGIconLight
        else return clientConfig.SVGIconDark
    }

    const getSystemLogoDefault = () => {
        if (theme == "light") return "/images/A1natas.svg"
        else return "/images/A1natas_white.svg"
    }

    useEffect(() => {
        // if (!curProfile.user_id && localStorageUID) {
        if (localStorageUID) {
            api.user.getUserProfile().then((res) => {
                setCurProfile(res.data.data)
                setLocalStorageUID(res.data.data.user_id)
            }, createSkipGlobalErrorConfig()).catch((_) => {
                removeUID()
            })
        }

        if (localStorageClientConfig) {
            setClientConfig(localStorageClientConfig)
        }

        refreshClientConfig()
    }, [])

    // 获取客户端配置
    const fetchClientConfig = async () => {
        try {
            const response = await axios.get('/api/client-config');
            if (response.data && response.data.code === 200) {

                // 初始化没有客户端配置的情况
                if (!localStorageClientConfig) {
                    if (response.data.data.BGAnimation && browserName.includes("Chrome")) {
                        response.data.data.BGAnimation = true
                    } else {
                        response.data.data.BGAnimation = false
                    }
                    setClientConfig(response.data.data);
                    setLocalStorageClientConfig(response.data.data)
                    return
                }

                if (response.data.data.updateVersion && response.data.data.updateVersion == localStorageClientConfig.updateVersion) {
                    return
                }

                if (browserName.includes("Chrome")) {
                    response.data.data.BGAnimation = true
                }

                response.data.data.BGAnimation = localStorageClientConfig.BGAnimation

                setClientConfig(response.data.data);
                setLocalStorageClientConfig(response.data.data)

                // 如果用户未手动设置主题，则使用配置的默认主题
                if (!localStorage.getItem('theme-preference')) {
                    setIsDarkMode(response.data.data.darkModeDefault);
                }
            }
        } catch (error) {
            console.error('获取客户端配置失败:', error);
        }
    };

    // 刷新客户端配置
    const refreshClientConfig = async () => {
        await fetchClientConfig();
    };

    // 更新主题
    const updateTheme = (isDark: boolean) => {
        setIsDarkMode(isDark);
        localStorage.setItem('theme-preference', isDark ? 'dark' : 'light');

        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // 组件挂载时获取配置
    useEffect(() => {
        // 检查用户偏好
        const savedTheme = localStorage.getItem('theme-preference');
        if (savedTheme) {
            setIsDarkMode(savedTheme === 'dark');
        }

        if (theme == "system") {
            setTheme(systemTheme as "dark" | "light")
        }

    }, []);

    const isAdmin = () => {
        return curProfile.role == UserRole.ADMIN
    }

    // 监听暗色模式变化
    useEffect(() => {
        updateTheme(isDarkMode);
    }, [isDarkMode]);

    return (
        <globalVariableContext.Provider value={{ 
            curProfile, 
            updateProfile, 
            serialOptions, 
            clientConfig, 
            updateClientConfg, 
            isDarkMode, 
            setIsDarkMode, 
            refreshClientConfig, 
            checkLoginStatus, 
            unsetLoginStatus, 
            getSystemLogo, 
            getSystemLogoDefault, 
            isAdmin,
            localStorageUID,
            setCurProfile
        }}>
            {children}
        </globalVariableContext.Provider>
    );
};

export default globalVariableContext;
