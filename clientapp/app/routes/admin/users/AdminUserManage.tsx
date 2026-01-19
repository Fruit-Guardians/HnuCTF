import SafeComponent from "components/SafeComponent"
import { AdminHeader } from "components/admin/AdminHeader";
import { UserManageView } from "components/admin/UserManageView";

export default function Home () {

    return (
        <div className="p-0 h-screen flex flex-col">
            <SafeComponent animation={false}>
                <AdminHeader />
                <main className="flex flex-1 overflow-hidden">
                    <div className="w-full flex justify-center">
                        <UserManageView />
                    </div>
                </main>
            </SafeComponent>
        </div>
    );
}