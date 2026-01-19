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
import { UploadImageDialog } from "components/dialogs/UploadImageDialog"
import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar"
import { Skeleton } from "components/ui/skeleton"
import { Input } from "components/ui/input"
import { useTranslation } from "react-i18next"
import { useGlobalVariableContext } from "contexts/GlobalVariableContext"
import { useEffect } from "react"
import { toast } from 'react-toastify/unstyled';
import { api } from "utils/ApiHelper"
import { Button } from "components/ui/button"
import { Save } from "lucide-react"

export default function UserBaiscInfo() {

    const { t } = useTranslation("profile_settings")
    const { curProfile, updateProfile } = useGlobalVariableContext()

    const EditUserBaiscProfileSchema = z.object({
        userName: z.string().min(2, {
            message: t("form_username_error")
        }),
        phone: z.string().optional(),
        studentNumber: z.string(),
        realName: z.string(),
        desc: z.string()
    })

    const form = useForm<z.infer<typeof EditUserBaiscProfileSchema>>({
        resolver: zodResolver(EditUserBaiscProfileSchema),
        defaultValues: {
            userName: "",
            phone: "",
            studentNumber: "",
            realName: "",
            desc: ""
        },
    })

    useEffect(() => {
        form.setValue("userName", curProfile.username || "")
        form.setValue("phone", curProfile.phone || "")
        form.setValue("studentNumber", curProfile.student_number || "")
        form.setValue("realName", curProfile.realname || "")
        form.setValue("desc", curProfile.slogan || "")
    }, [curProfile])

    function onSubmit(values: z.infer<typeof EditUserBaiscProfileSchema>) {
        api.user.updateUserProfile({
            "username": values.userName,
            "realname": values.realName,
            "student_number": values.studentNumber,
            "slogan": values.desc,
            "phone": values.phone
        }).then(() => {
            toast.success(t("save_profile_success"))
        })
    }

    return (
        <Form {...form}>
            <div className="space-y-8 pb-10">
                <div className="flex gap-10">
                    <div className="flex-1">
                        <FormField
                            control={form.control}
                            name="userName"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="h-[20px] flex items-center">
                                        <FormLabel>
                                            {t("form_username_label")}
                                        </FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        {t("form_username_desc")}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex h-full items-center">
                        <UploadImageDialog type="person" updateTeam={updateProfile} >
                            <Avatar className="select-none w-20 h-20">
                                {curProfile.avatar ? (
                                    <>
                                        <AvatarImage src={curProfile.avatar || "#"} alt="@shadcn"
                                            className={`rounded-2xl`}
                                        />
                                        <AvatarFallback><Skeleton className="h-20 w-20 rounded-full" /></AvatarFallback>
                                    </>
                                ) : (
                                    <div className='w-full h-full bg-foreground/80 flex items-center justify-center rounded-2xl'>
                                        <span className='text-background text-xl'> {curProfile.username?.substring(0, 2)} </span>
                                    </div>
                                )}
                            </Avatar>
                        </UploadImageDialog>
                    </div>
                </div>
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <div className="h-[20px] flex items-center">
                                <FormLabel>{t("form_phone_label")}</FormLabel>
                            </div>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormDescription>
                                {t("form_phone_desc")}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="realName"
                    render={({ field }) => (
                        <FormItem>
                            <div className="h-[20px] flex items-center">
                                <FormLabel>{t("form_realname_label")}</FormLabel>
                            </div>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormDescription>
                                {t("form_realname_desc")}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="studentNumber"
                    render={({ field }) => (
                        <FormItem>
                            <div className="h-[20px] flex items-center">
                                <FormLabel>{t("form_student_number_label")}</FormLabel>
                            </div>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormDescription>
                                {t("form_student_number_desc")}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="desc"
                    render={({ field }) => (
                        <FormItem>
                            <div className="h-[20px] flex items-center">
                                <FormLabel>{t("form_desc_label")}</FormLabel>
                            </div>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormDescription>
                                {t("form_desc_desc")}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button variant={"outline"}
                    onClick={form.handleSubmit(onSubmit)}
                >
                    <Save />
                    {t("submit")}
                </Button>
            </div>
        </Form>
    )
}