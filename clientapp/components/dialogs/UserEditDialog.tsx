import { Button } from "components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "components/ui/dialog"
import { Input } from "components/ui/input"

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
import { useEffect, useState } from "react";
import { Textarea } from "../ui/textarea";
import { api } from "utils/ApiHelper";
import { toast } from 'react-toastify/unstyled';
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { AdminListUserItem, UserRole } from "utils/A1API";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useTranslation } from "react-i18next"

interface UserEditDialogProps {
    user: AdminListUserItem;
    updateUsers: () => void;
    children: React.ReactNode;
}

export const UserEditDialog: React.FC<UserEditDialogProps> = ({
    user,
    updateUsers,
    children
}) => {

    const { t } = useTranslation("user_manage")

    const formSchema = z.object({
        userName: z.string().min(2, {
            message: t("edit.name_error"),
        }),
        realName: z.string().optional(),
        studentId: z.string().optional(),
        phone: z.string().optional(),
        slogan: z.string().optional(),
        email: z.string().email({
            message: t("edit.email_error"),
        }),
        role: z.enum(["ADMIN", "USER", "MONITOR"])
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            userName: user.user_name || "",
            realName: user.real_name || "",
            studentId: user.student_id || "",
            phone: user.phone || "",
            slogan: user.slogan || "",
            email: user.email || "",
            role: user.role
        },
    });

    const resetValue = () => {
        form.setValue("userName", user.user_name || "");
        form.setValue("realName", user.real_name || "");
        form.setValue("studentId", user.student_id || "");
        form.setValue("phone", user.phone || "");
        form.setValue("slogan", user.slogan || "");
        form.setValue("email", user.email || "");
        form.setValue("role", user.role);
    };

    useEffect(() => {
        resetValue();
    }, [user]);

    const [isOpen, setIsOpen] = useState(false);
    const [submitDisabled, setSubmitDisabled] = useState(false);

    function onSubmit(values: z.infer<typeof formSchema>) {
        setSubmitDisabled(true);
        api.admin.adminUpdateUser({
            user_id: user.user_id,
            user_name: values.userName,
            real_name: values.realName || null,
            student_id: values.studentId || null,
            phone: values.phone || null,
            slogan: values.slogan || null,
            email: values.email || null,
            avatar: user.avatar || null,
            role: values.role as UserRole
        }).then(() => {
            toast.success(t("edit.success"));
            updateUsers();
            setSubmitDisabled(false);
            setIsOpen(false);
        }).catch((_) => {
            setSubmitDisabled(false);
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={(status) => {
            if (status) resetValue();
            setIsOpen(status);
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px] select-none"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>{t("edit.title")} - {user.user_name || ""}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="flex w-full items-center gap-8">
                            <div className="flex-1">
                                <FormField
                                    control={form.control}
                                    name="userName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("username")}</FormLabel>
                                            <FormControl>
                                                <Input placeholder="username" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                {t("edit.username")}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Avatar className="select-none w-20 h-20 mr-4">
                                {user.avatar ? (
                                    <>
                                        <AvatarImage src={user.avatar || "#"} alt="@avatar"
                                            className={`rounded-2xl`}
                                        />
                                        <AvatarFallback><Skeleton className="h-20 w-20 rounded-full" /></AvatarFallback>
                                    </>
                                ) : (
                                    <div className='w-full h-full bg-foreground/80 flex items-center justify-center rounded-2xl'>
                                        <span className='text-background text-xl'> {user.user_name?.substring(0, 2)} </span>
                                    </div>
                                )}
                            </Avatar>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="realName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("realname")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("edit.default_name")} {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="studentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("student_id")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="202301010101" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("phone")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="13800138000" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("email")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="user@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="slogan"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("slogan")}</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder={t("edit.slogan")} {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("role.title")}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t("edit.role")} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="USER">{t("role.user")}</SelectItem>
                                            <SelectItem value="MONITOR">{t("role.monitor")}</SelectItem>
                                            <SelectItem value="ADMIN">{t("role.admin")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        {t("edit.role_description")}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="transition-all duration-300" disabled={submitDisabled}>{t("save")}</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}; 