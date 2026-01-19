import { AdminHeader } from "components/admin/AdminHeader";
import { AdminSystemLogs } from "components/admin/AdminSystemLogs";

export default function Home () {

    return (
        <div className="w-screen h-screen overflow-hidden">
            <AdminHeader />
            <div className="overflow-hidden w-full h-full">
                <AdminSystemLogs />
            </div>
        </div>
    );
}