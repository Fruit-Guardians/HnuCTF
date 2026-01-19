import PageHeader from "components/A1Headers";
import SafeComponent from "components/SafeComponent"
import { VersionView } from "components/VersionView";

export default function Home() {

    return (
        <div className="p-0 h-screen flex flex-col">
            <PageHeader />
            <main className="flex flex-1 overflow-hidden">
                <div className="w-full">
                    <SafeComponent animation={false}>
                        <VersionView />
                    </SafeComponent>
                </div>
            </main>
        </div>
    );
}