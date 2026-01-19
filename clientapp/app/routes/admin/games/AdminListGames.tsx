import SafeComponent from "components/SafeComponent"
import { AdminHeader } from "components/admin/AdminHeader";
import { AdminGameManagePage } from "components/admin/GameManagePage";

export default function AdminListGames () {

    return (
        <div className="p-0 h-screen flex flex-col">
            <SafeComponent animation={false}>
                <AdminHeader />
                <main className="flex flex-1 overflow-hidden">
                    <div className="w-full">
                        <AdminGameManagePage />
                    </div>
                </main>
            </SafeComponent>
        </div>
    );
}