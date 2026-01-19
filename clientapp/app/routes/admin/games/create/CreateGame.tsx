import SafeComponent from "components/SafeComponent"
import { CreateGameView } from "components/admin/CreateGameView";

export default function CreateGame () {

    return (
        <div className="p-0 h-screen flex flex-col">
            <SafeComponent animation={false}>
                <CreateGameView />
            </SafeComponent>
        </div>
    );
}