import PageHeader from "components/A1Headers"
import { ChangeGames } from "components/ChangeGames";
import SafeComponent from "components/SafeComponent";

export default function Games() {

    return (
        <div className="p-0 h-screen flex flex-col">
            <PageHeader />
            <div className="w-full flex-1 overflow-hidden"> 
                <SafeComponent animation={false}>
                    <>
                        {/* <FancyBackground /> */}
                        <ChangeGames />
                    </>
                </SafeComponent>
            </div>
        </div>
    );
}
