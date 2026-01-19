import PageHeader from "components/A1Headers"
import SafeComponent from "components/SafeComponent";
import { ProfileView } from "components/ProfileView";

export default function Profile() {

    return (
        <div className="p-0 h-screen flex flex-col">
            <PageHeader />
            <main className="flex w-full flex-1 overflow-hidden">
                <SafeComponent animation={false}>
                    <ProfileView />
                </SafeComponent>
            </main>
        </div>
    );
}
