import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "components/ui/form";
import { SystemSettingsValues } from "./AdminSettingsPage";
import { Mail } from "lucide-react";
import { useState } from "react";
import { api } from "utils/ApiHelper";
import { toast } from 'react-toastify/unstyled';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/ui/select";
import { useTranslation } from "react-i18next";

export const MailSettings = (
    { form }: {
        form: UseFormReturn<SystemSettingsValues>,
    }
) => {

    const { t } = useTranslation("system_settings")
    const [smtpTestTarget, setSmtpTestTarget] = useState("")

    return (
        <>
            <span className="text-2xl font-bold mb-4">{t("email.title")}</span>

            <FormField
                control={form.control}
                name="smtpHost"
                render={({ field }) => (
                    <FormItem>
                        <div className="flex items-center h-[20px]">
                            <FormLabel>{t("email.smtp_host")}</FormLabel>
                            <div className="flex-1" />
                            <FormMessage className="text-[14px]" />
                        </div>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="smtpPort"
                render={({ field }) => (
                    <FormItem>
                        <div className="flex items-center h-[20px]">
                            <FormLabel>{t("email.smtp_port")}</FormLabel>
                            <div className="flex-1" />
                            <FormMessage className="text-[14px]" />
                        </div>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="smtpPortType"
                render={({ field }) => {
                    return (
                        <FormItem>
                            <div className="flex items-center h-[20px]">
                                <FormLabel>{t("email.smtp_port_type.title")}</FormLabel>
                                <div className="flex-1" />
                                <FormMessage className="text-[14px]" />
                            </div>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("email.smtp_port_type.placeholder")} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="none">{t("email.smtp_port_type.none")}</SelectItem>
                                    <SelectItem value="tls">{t("email.smtp_port_type.tls")}</SelectItem>
                                    <SelectItem value="starttls">{t("email.smtp_port_type.starttls")}</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )
                }}
            />

            <FormField
                control={form.control}
                name="smtpName"
                render={({ field }) => (
                    <FormItem>
                        <div className="flex items-center h-[20px]">
                            <FormLabel>{t("email.smtp_sender")}</FormLabel>
                            <div className="flex-1" />
                            <FormMessage className="text-[14px]" />
                        </div>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="smtpUsername"
                render={({ field }) => (
                    <FormItem>
                        <div className="flex items-center h-[20px]">
                            <FormLabel>{t("email.smtp_username")}</FormLabel>
                            <div className="flex-1" />
                            <FormMessage className="text-[14px]" />
                        </div>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="smtpPassword"
                render={({ field }) => (
                    <FormItem>
                        <div className="flex items-center h-[20px]">
                            <FormLabel>{t("email.smtp_password.title")}</FormLabel>
                            <div className="flex-1" />
                            <FormMessage className="text-[14px]" />
                        </div>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormDescription>{t("email.smtp_password.description")}</FormDescription>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="smtpFrom"
                render={({ field }) => (
                    <FormItem>
                        <div className="flex items-center h-[20px]">
                            <FormLabel>{t("email.smtp_address.title")}</FormLabel>
                            <div className="flex-1" />
                            <FormMessage className="text-[14px]" />
                        </div>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormDescription>{t("email.smtp_address.example")}</FormDescription>
                    </FormItem>
                )}
            />

            <div className="flex flex-col gap-2 mt-1">
                <FormLabel>{t("email.smtp_test.title")}</FormLabel>
                <div className="flex gap-4 mt-1">
                    <Input value={smtpTestTarget} onChange={(val) => setSmtpTestTarget(val.target.value)} placeholder={t("email.smtp_test.empty_error")} />
                    <Button
                        onClick={() => {
                            if (!smtpTestTarget) {
                                toast.error(t("email.smtp_test.empty_error"))
                                return
                            }
                            api.system.sendSmtpTestMail({
                                to: smtpTestTarget,
                                type: "test"
                            }).then((_res) => {
                                toast.success(t("email.smtp_test.success"))
                            })
                        }}
                    >
                        <Mail />
                        {t("email.smtp_test.send")}
                    </Button>
                </div>
                <FormDescription>{t("email.smtp_test.description")}</FormDescription>
            </div>
        </>
    );
};

export default MailSettings; 