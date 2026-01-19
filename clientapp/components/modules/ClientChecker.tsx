import { useGlobalVariableContext } from "contexts/GlobalVariableContext"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router"
import { toast } from "react-toastify/unstyled"
import { UserRole } from "utils/A1API"

export default function () {

    const { curProfile, clientConfig, checkLoginStatus } = useGlobalVariableContext()
    const navigate = useNavigate()
    const location = useLocation()
    const { t } = useTranslation()

    const titleMap = {
        "/login": { title: "登录" },
        "/games/\\d+/info": { title: "比赛详情" },
        "/games/\\d+/challenges": { title: "比赛题目" },
        "/games/\\d+/scoreboard": { title: "排行榜" },
        "/games/\\d+/team": { title: "队伍管理" },
        "/games": { title: "比赛列表" },
        "/about": { title: "关于" },
        "/signup": { title: "注册" },
        "/version": { title: "版本信息" },
        "/forget-password": { title: "忘记密码" },
        "/reset-password": { title: "重置密码" },
        "/email-verify": { title: "邮箱验证" },

        // 管理后台
        "/admin/games": { title: "比赛管理" },
        "/admin/challenges": { title: "题目管理" },
        "/admin/users": { title: "用户管理" },
        "/admin/logs": { title: "系统日志" },
        "/admin/system/[a-zA-Z0-9\\-_]+": { title: "系统设置" },
    }

    const unLoginAllowedPage = [
        "/",
        "/login",
        "/signup",
        "/games",
        "/about",
        "/version",
        "/games/\\d+/info",
        "/games/\\d+/scoreboard",
        "/email-verify",
        "/forget-password",
        "/reset-password"
    ]

    const adminPagePrefix = "/admin"
    const adminPageRoles = [UserRole.ADMIN, UserRole.MONITOR]

    useEffect(() => {
        if (!checkLoginStatus()) {
            let matched = false

            unLoginAllowedPage.forEach((key) => {
                const regex = new RegExp(`^${key}$`)
                if (regex.test(location.pathname)) {
                    matched = true
                    return
                }
            })

            if (!matched) {
                navigate("/login")
                toast.error(t("login_first"))
            }
        }
    }, [location.pathname])

    useEffect(() => {
        // 普通用户禁止访问管理后台
        if (location.pathname.startsWith(adminPagePrefix)) {
            if (!curProfile.role) return

            if (!adminPageRoles.includes(curProfile.role)) {
                navigate("/404")
            }
        }
    }, [curProfile.role, location.pathname])

    useEffect(() => {
        const suffix = clientConfig.systemName
        let matched = false

        Object.keys(titleMap).forEach((key) => {
            const regex = new RegExp(`^${key}$`)
            if (regex.test(location.pathname)) {
                document.title = titleMap[key as (keyof typeof titleMap)].title + " - " + suffix
                matched = true
                return
            }
        })

        if (!matched) {
            document.title = suffix
        }
    }, [clientConfig, location.pathname])

    return <></>
}