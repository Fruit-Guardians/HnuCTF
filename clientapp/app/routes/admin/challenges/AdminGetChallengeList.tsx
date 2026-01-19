import SafeComponent from "components/SafeComponent"
import { AdminHeader } from "components/admin/AdminHeader";
import { ChallengesManageView } from "components/admin/ChallengesManageView";

export default function Home () {

    return (
        <div className="p-0 h-screen flex flex-col">
            <SafeComponent animation={false}>
                <AdminHeader />
                <main className="flex flex-1 overflow-hidden">
                    <div className="w-full">
                        <ChallengesManageView />
                    </div>
                </main>
            </SafeComponent>
        </div>
    );
}