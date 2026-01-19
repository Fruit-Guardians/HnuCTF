import { UserGameSimpleInfo } from "utils/A1API";
import React, { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

interface TransitionContextType {
    isChangingGame: boolean;
    curSwitchingGame: UserGameSimpleInfo;
    posterData: string;
    setIsChangingGame: Dispatch<SetStateAction<boolean>>;
    setCurSwitchingGame: Dispatch<SetStateAction<UserGameSimpleInfo>>;
    setPosterData: Dispatch<SetStateAction<string>>;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export const useGameSwitchContext = () => {
    const context = useContext(TransitionContext);
    if (!context) {
        throw new Error("useGameSwitchContext must be used within a TransitionProvider");
    }
    return context;
};

export const GameSwitchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isChangingGame, setIsChangingGame] = useState(false);
    const [curSwitchingGame, setCurSwitchingGame] = useState<UserGameSimpleInfo>({
        game_id: 0,
        name: "error",
        summary: "none",
        poster: "#",
        start_time: "none",
        end_time: "none",
        visible: false,
    })

    const [posterData, setPosterData] = useState("")

    return (
        <TransitionContext.Provider value={{ isChangingGame, curSwitchingGame, posterData, setIsChangingGame, setCurSwitchingGame, setPosterData }}>
            {children}
        </TransitionContext.Provider>
    );
};

