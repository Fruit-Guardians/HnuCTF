import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
    // 主页
    route("", "routes/A1CTFMainPage.tsx"),

    // 比赛页面
    route("games", "routes/games/UserGameList.tsx"),
    route("games/:id/:module?", "routes/games/[id]/UserGameView.tsx"),

    // 关于页面
    route("about", "routes/about/SystemAboutPage.tsx"),

    // 版本信息
    route("version", "routes/version/SystemVersionPage.tsx"),

    // 个人设置
    route("profile/:action", "routes/profile/UserProfileSettings.tsx"),

    // 账户验证模块
    route("login", "routes/auth/UserLoginPage.tsx"),
    route("signup", "routes/auth/UserSignupPage.tsx"),
    route("email-verify", "routes/auth/EmailVerify.tsx"),
    route("forget-password", "routes/auth/ForgetPassword.tsx"),
    route("reset-password", "routes/auth/ResetPassword.tsx"),

    // 管理页面
    route("admin", "routes/admin/AdminPageMain.tsx"),

    // 用户管理
    route("admin/users", "routes/admin/users/AdminUserManage.tsx"),

    // 赛题管理
    route("admin/challenges", "routes/admin/challenges/AdminGetChallengeList.tsx"),
    route("admin/challenges/:challenge_id", "routes/admin/challenges/[challenge_id]/AdminChallengeManage.tsx"),
    route("admin/challenges/create", "routes/admin/challenges/create/AdminCreateChallenge.tsx"),

    // 比赛管理
    route("admin/games", "routes/admin/games/AdminListGames.tsx"),
    route("admin/games/create", "routes/admin/games/create/CreateGame.tsx"),
    route("admin/games/:game_id/:action", "routes/admin/games/[game_id]/GameSettings.tsx"),
    route("admin/games/:game_id/score-adjustments", "routes/admin/games/[game_id]/ScoreAdjustment.tsx"),
    
    // 系统日志
    route("admin/logs", "routes/admin/logs/SystemLogs.tsx"),

    // 系统设置
    route("admin/system/:action", "routes/admin/system/AdminSettingsPage.tsx"),
    
    // 捕获所有其他路径并重定向
    route("*", "routes/PageNotFound.tsx"),
] satisfies RouteConfig;
