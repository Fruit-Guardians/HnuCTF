import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "components/ui/form";
import { Input } from "components/ui/input";
import { useGlobalVariableContext } from "contexts/GlobalVariableContext";
import { BadgeAlert, BadgeCheck, MailPlus, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from 'react-toastify/unstyled';
import { api } from "utils/ApiHelper";
import { z } from "zod"

export default function EmailSettings() {

    const { curProfile, setCurProfile } = useGlobalVariableContext()
    const { t } = useTranslation("change_email")

    const MailOperationSchema = z.object({
        email: z.string().email({
            message: t("please_input_vaild_email")
        })
    })

    const form = useForm<z.infer<typeof MailOperationSchema>>({
        resolver: zodResolver(MailOperationSchema),
        defaultValues: {
            email: curProfile.email ?? ""
        },
    })

    useEffect(() => {
        form.reset(curProfile as any)
    }, [curProfile])

    function onSubmit(values: z.infer<typeof MailOperationSchema>) {
        api.user.updateEmailAddress({
            email: values.email
        }).then(() => {
            toast.success(t("update_email_success"))
            setCurProfile((prev) => ({
                ...prev,
                ["email"]: values.email,
                ["email_verified"]: false
            }))
        })
    }

    function sendVerifyEmail() {
        api.user.sendVerifyEmail().then(() => {
            toast.success(t("sending_verification"))
        })
    }

    return (
        <Form {...form}>
            <div className="space-y-8">
                <div className="space-y-2">
                    <div className="h-[20px] flex items-center">
                        <span className="text-sm font-bold">{t("email_address")}</span>
                    </div>
                    <div className="flex items-center gap-4 mb-1 w-full">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormControl>
                                        <div className="w-full grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
                                            <Input {...field}
                                                className={!curProfile.email_verified
                                                    ? "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/40"
                                                    : "border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/40"
                                                }
                                            />
                                            <Button variant="outline"
                                                onClick={form.handleSubmit(onSubmit)}
                                            >
                                                <Save />
                                                {t("save")}
                                            </Button>
                                            <Button variant="outline"
                                                onClick={sendVerifyEmail}
                                            >
                                                <MailPlus />
                                                {t("resend")}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <span className="text-muted-foreground text-sm">{t("description")}</span>
                    <div className="w-full rounded-md overflow-hidden mt-4">
                        {curProfile.email_verified ? (
                            <div className="flex items-center justify-center gap-3 py-4 bg-green-500/40">
                                <BadgeCheck size={30} />
                                <span className="font-bold text-xl">{t("verifed")}</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-3 py-4 bg-red-500/40">
                                <BadgeAlert size={30} />
                                <span className="font-bold text-xl">{t("not_verifed")}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Form>
    )
}