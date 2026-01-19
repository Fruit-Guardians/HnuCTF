import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { useState } from "react";
import { CapWidget, CapWidgetElement } from '@pitininja/cap-react-widget';
import { AxiosError } from 'axios';

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "components/ui/form"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { api, createSkipGlobalErrorConfig } from "utils/ApiHelper";

import { toast } from 'react-toastify/unstyled';
import { useGlobalVariableContext } from "contexts/GlobalVariableContext";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { useNavigateFrom } from "hooks/NavigateFrom";

export function LoginForm() {
    const { t } = useTranslation("login_form");

    const [token, setToken] = useState<string>("")

    const resetCaptcha = () => {
        const ele = document.getElementsByTagName("cap-widget")[0] as CapWidgetElement
        ele.dispatchEvent("reset")
    }

    const router = useNavigate()

    const { updateProfile, clientConfig } = useGlobalVariableContext()

    const [loading, setLoading] = useState(false)

    const [_navigateFrom, getNavigateFrom] = useNavigateFrom()

    const formSchema = z.object({
        userName: z.string().nonempty(t("username_not_null")),
        password: z.string().nonempty(t("password_not_null"))
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            "userName": "",
            "password": ""
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        api.auth.userLogin({
            username: values.userName,
            password: values.password,
            captcha: token
        }, createSkipGlobalErrorConfig()).then(() => {
            updateProfile(() => {
                router(getNavigateFrom() ?? "/")

                setTimeout(() => {
                    toast.success(t("login_successful"))
                }, 300)
            })
        }).catch((error: AxiosError) => {
            setToken("")
            if (error.response?.status == 401) {
                toast.error(t("login_failed"))
            } else {
                toast.error(t("unknow_error"))
            }
        }).finally(() => {
            setLoading(false)
            resetCaptcha()
        })
    }

    return (
        <Form {...form}>
            <div className="flex flex-col items-center gap-2 text-center mb-10">
                <h1 className="text-2xl font-bold">{t("login_title")}</h1>
                <p className="text-balance text-sm text-muted-foreground">
                    {t("login_hint")}
                </p>
            </div>
            <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                        <FormItem>
                            <div className="h-[20px] items-center flex">
                                <FormLabel>{t("form_account")}</FormLabel>
                            </div>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormDescription>
                                {t("form_account_desc")}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="w-full">
                                <div className="flex items-center h-[40px] w-full">
                                    <Label htmlFor="password">{t("password")}</Label>
                                    <a
                                        onClick={() => {
                                            router("/forget-password")
                                        }}
                                        className="ml-auto text-sm underline-offset-4 hover:underline cursor-pointer"
                                    >
                                        {t("forget_password")}
                                    </a>
                                </div>
                            </FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {clientConfig.captchaEnabled ? (
                    <CapWidget
                        endpoint="/api/cap/"
                        onSolve={(token) => {
                            setToken(token)
                        }}
                        customWaspUrl={
                            "https://cdn.jsdmirror.com/npm/@cap.js/wasm@0.0.6/browser/cap_wasm.min.js"
                        }
                        onError={() => {
                            toast.error(t("cap_err"))
                        }}
                        i18nInitial={t("cap_init")}
                        i18nSolved={t("cap_solved")}
                        i18nError={t("cap_error")}
                        i18nErrorAriaLabel={t("cap_error_aria")}
                        i18nVerifying={t("cap_verifying")}
                        i18nVerifyAriaLabel={t("cap_verify_aria")}
                        i18nVerifyingAriaLabel={t("cap_verifying_aria")}
                        i18nVerifiedAriaLabel={t("cap_verifyed_aria")}
                    />

                ) : <></>}

                <div className='h-0' />
                <Button
                    type="submit"
                    className="transition-all duration-300 w-full"
                    disabled={loading || (clientConfig.captchaEnabled && token == "")}
                    onClick={form.handleSubmit(onSubmit)}
                >{t("login")}</Button>
                <div className="text-center text-sm">
                    {t("dont_have_account")}{" "}
                    <a className="underline underline-offset-4 cursor-pointer" onClick={() => router(`/signup`)}>
                        {t("sign_up_title")}
                    </a>
                </div>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border transition-[border-color] duration-300">
                    <span className="relative z-10 bg-background px-2 text-muted-foreground transition-all duration-300">
                        {t("or_continue_with")}
                    </span>
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <Button variant="outline" className="w-full" disabled>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path
                                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                                fill="currentColor"
                            />
                        </svg>
                        {t("login_with_github")}
                    </Button>
                </div>
            </div>
        </Form>
    )
}
