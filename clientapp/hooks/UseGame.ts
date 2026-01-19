import { A1GameStatus } from 'components/modules/game/GameStatusEnum';
import dayjs from 'dayjs';
import { randomInt } from 'mathjs';
import useSWR from 'swr'
import { ErrorMessage, ParticipationStatus, UserFullGameInfo } from 'utils/A1API';

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Failed to fetch');
    }
    const json = await res.json();
    return json.data; // Return only the nested data
};

export const useGame = (gameID: number) => {
    const { data: gameInfo, error, mutate: mutateGameInfo, isLoading } = useSWR<UserFullGameInfo, ErrorMessage>(`/api/game/${gameID}`, fetcher, {
        refreshInterval: randomInt(3000, 6000)
    });
    
    const { data: gameStatus = A1GameStatus.NoSuchGame, mutate: mutateGameStatus } = useSWR<A1GameStatus>(
        gameInfo ? `gameStatus-${gameID}` : null,
        () => gameInfo ? getGameStatus(gameInfo) : A1GameStatus.NoSuchGame
    );

    const { data: teamStatus = ParticipationStatus.UnLogin, mutate: mutateTeamStatus } = useSWR<ParticipationStatus>(
        gameInfo ? `teamStatus-${gameID}` : null,
        () => gameInfo?.team_status ?? ParticipationStatus.UnLogin
    );

    if (gameInfo) {
        mutateGameStatus(getGameStatus(gameInfo))
        mutateTeamStatus(gameInfo.team_status)
    }
    
    return { gameInfo, error, mutateGameInfo, isLoading, gameStatus, teamStatus, mutateGameStatus, mutateTeamStatus}
}

export const useGameDescription = (gameID: number) => {
    const { data: gameDescription, error, mutate, isLoading } = useSWR<string, ErrorMessage>(`/api/game/${gameID}/desc`, fetcher);
    return { gameDescription, error, mutate, isLoading }
}

const getGameStatus = (gameInfo: UserFullGameInfo): A1GameStatus => {
    // 检查比赛状态
    if (dayjs() < dayjs(gameInfo.start_time)) {
        // 等待比赛开始
        return A1GameStatus.Pending
    } else if (dayjs() < dayjs(gameInfo.end_time)) {
        // 比赛进行中
        return A1GameStatus.Running
    } else if (dayjs() > dayjs(gameInfo.end_time)) {
        if (!gameInfo.practice_mode) {
            // 比赛已结束，非练习模式
            return A1GameStatus.Ended
        } else {
            // 练习模式
            return A1GameStatus.PracticeMode
        }
    }

    return A1GameStatus.NoSuchGame
}