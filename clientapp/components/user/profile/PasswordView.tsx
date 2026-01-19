import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "components/ui/form"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { toast } from 'react-toastify/unstyled';
import { useTranslation } from "react-i18next";
import { Save } from "lucide-react";
import { api } from "utils/ApiHelper";

export function PasswordView() {

    const { t } = useTranslation("change_password")

    const formSchema = z.object({
        originalPassword: z.string().min(6, t("form_password_length")),
        newPassword: z.string()
            .min(6, t("form_password_length"))
            .regex(/[0-9]/, t("form_password_number"))
            .regex(/[a-z]/, t("form_password_lower"))
            .regex(/[A-Z]/, t("form_password_upper"))
            .regex(/[^a-zA-Z0-9]/, t("form_password_special")),
        confirmPassword: z.string().min(6, t("form_password_length"))
    }).refine(data => data.newPassword === data.confirmPassword, {
        message: t("form_password_confirm"),
        path: ["confirmPassword"] // 这将使错误信息关联到 confirmPassword 字段
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            originalPassword: "",
            newPassword: "",
            confirmPassword: ""
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        api.user.changePassword({
            old_password: values.originalPassword,
            new_password: values.newPassword
        }).then(() => {
            toast.success(t("change_password_success"))
        })
    }

    return (
        <Form {...form}>
            <div className="space-y-8">
                <FormField
                    control={form.control}
                    name="originalPassword"
                    render={({ field }) => (
                        <FormItem>
                            <div className="h-[20px] flex items-center">
                                <FormLabel>{t("form_original_password")}</FormLabel>
                            </div>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                            <div className="h-[20px] flex items-center">
                                <FormLabel>{t("form_new_password")}</FormLabel>
                            </div>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <div className="h-[20px] flex items-center">
                                <FormLabel>{t("form_confirm_password")}</FormLabel>
                            </div>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button variant="outline"
                    onClick={form.handleSubmit(onSubmit)}
                >
                    <Save />
                    {t("form_title_change_your_password")}
                </Button>
            </div>
        </Form>
    )
}