import { Medal } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "./ui/button";

import { GameScoreboardData, TeamScore, UserSimpleGameChallenge } from "utils/A1API";
import AvatarUsername from "./modules/AvatarUsername";

export function ScoreTableMobile ({ scoreBoardModel, setShowUserDetail, challenges: _challenges }: { scoreBoardModel: GameScoreboardData, setShowUserDetail: Dispatch<SetStateAction<TeamScore>>, challenges: Record<string, UserSimpleGameChallenge[]> }) {

    const [pageLines, setPageLines] = useState(10)

    const [scoreboardItems, setScoreBoardItems] = useState<TeamScore[]>([])
    const [curPageData, setCurPageData] = useState<TeamScore[]>([])
    const [curPage, setCurPage] = useState(1)
    const [totalPage, setTotalPage] = useState(0)

    const handleChangeView = () => {
        const pageLines = Math.floor((window.innerHeight * 0.8 - 8) / 48) - 4;
        setPageLines(pageLines)
    }

    useEffect(() => {

        const pageLines = Math.floor((window.innerHeight * 0.8 - 8) / 48) - 4;
        setPageLines(pageLines)

        setScoreBoardItems(scoreBoardModel.teams || [])
        setTotalPage(Math.ceil(scoreBoardModel.teams!.length / pageLines))

        const curPageStart = pageLines * (curPage - 1)
        const pageData: TeamScore[] = [];

        for (let i = curPageStart; i < Math.min(curPageStart + pageLines, scoreBoardModel.teams?.length || 0); i++) {
            pageData.push(scoreBoardModel.teams![i])
        }
        
        setCurPageData(pageData)

        window.addEventListener("resize", handleChangeView)

        return () => {
            window.removeEventListener("resize", handleChangeView)
        }
    }, [scoreBoardModel])

    useEffect(() => {
        setTotalPage(Math.ceil(scoreboardItems.length / pageLines))
        const curPageStart = pageLines * (curPage - 1)
        const pageData: TeamScore[] = [];

        for (let i = curPageStart; i < Math.min(curPageStart + pageLines, scoreboardItems.length); i++) {
            pageData.push(scoreboardItems[i])
        }
        
        setCurPageData(pageData)
    }, [scoreboardItems, curPage, pageLines])


    const getRankIcon = (rank: number) => {
        if (rank == 1) return (<Medal className="stroke-[#FFB02E]" />)
        else if (rank == 2) return (<Medal className="stroke-[#BEBEBE]" />)
        else if (rank == 3) return (<Medal className="stroke-[#D3883E]"/>)
        else return (
            <span>{ rank }</span>
        )
    }

    return (
        
        <div className="flex flex-col w-full h-full gap-4 pt-4">
            <div className="flex w-full flex-1 overflow-hidden">
                <div id="left-container" className="min-w-[200px] flex-none overflow-hidden w-full">
                    <div className="flex flex-col overflow-hidden w-full">
                        <div className={`w-full border-b-2 h-12 transition-[border-color] duration-300 flex items-center justify-center`}>
                            <span className="font-bold">Rank</span>
                        </div>
                        { curPageData[0] && curPageData.map((item, index) => (
                            <div className={`w-full border-b-2 transition-[border-color] duration-300 h-12 flex items-center justify-center`} key={`name-${index}`}>
                                <div className="flex w-full gap-2 overflow-hidden items-center">
                                    <div className="flex items-center">
                                        <div className="w-[40px] flex-none flex justify-center select-none">
                                            { getRankIcon(item.rank || 0) }
                                        </div>
                                        <AvatarUsername avatar_url={item.team_avatar} username={item.team_name ?? ""} size={32} fontSize={14} />
                                    </div>
                                    <div className="flex-1 overflow-hidden select-none">
                                        <a className="text-nowrap text-ellipsis overflow-hidden hover:underline focus:underline" data-tooltip-id="challengeTooltip" data-tooltip-html={ `<div class='text-sm'>${item.team_name} - ${ item.score } pts</div>` } 
                                            onClick={() => {
                                                setShowUserDetail(item || {})
                                            }}
                                        >{ item.team_name }</a>
                                    </div>
                                    <div className="justify-end gap-1">
                                        <span>{ item.score }</span>
                                        <span className="text-gray-500">pts</span>
                                    </div>
                                </div>
                            </div>
                        )) }
                    </div>
                </div>
            </div>
            <div className="flex w-full items-center justify-center gap-2 select-none">
                { totalPage > 7 ? (
                    <>
                        <Button size={"icon"} variant={ curPage == 1 ? "default" : "ghost" } onClick={() => { setCurPage(1) }} >1</Button>
                        { curPage > 3 ? (
                            <>
                                <span>…</span>
                                { curPage <= totalPage - 4 ? (
                                    <>
                                        <Button size={"icon"} variant="ghost" onClick={() => { setCurPage(curPage - 1) }}>{ curPage - 1 }</Button>
                                        <Button size={"icon"} variant="default" onClick={() => { setCurPage(curPage) }}>{ curPage }</Button>
                                        <Button size={"icon"} variant="ghost" onClick={() => { setCurPage(curPage + 1) }}>{ curPage + 1 }</Button>
                                    </>
                                ) : (
                                    <>
                                        
                                    </>
                                ) }
                            </>
                        ) : (
                            <>
                                <Button size={"icon"} variant={ curPage == 2 ? "default" : "ghost" } onClick={() => { setCurPage(2) }}>2</Button>
                                <Button size={"icon"} variant={ curPage == 3 ? "default" : "ghost" } onClick={() => { setCurPage(3) }}>3</Button>
                                <Button size={"icon"} variant={ curPage == 4 ? "default" : "ghost" } onClick={() => { setCurPage(4) }}>4</Button>
                                <Button size={"icon"} variant={ curPage == 5 ? "default" : "ghost" }onClick={() => { setCurPage(5) }}>5</Button>
                            </>
                        ) }
                        
                        { curPage <= totalPage - 4 ? (
                            <>
                                <span>…</span>
                                <Button size={"icon"} variant="ghost" onClick={() => { setCurPage(totalPage) }}>{ totalPage }</Button>
                            </>
                        ) : (
                            <>
                                <Button size={"icon"} variant={ curPage == totalPage - 4 ? "default" : "ghost"} onClick={() => { setCurPage(totalPage - 4) }}>{ totalPage - 4 }</Button>
                                <Button size={"icon"} variant={ curPage == totalPage - 3 ? "default" : "ghost"} onClick={() => { setCurPage(totalPage - 3) }}>{ totalPage - 3 }</Button>
                                <Button size={"icon"} variant={ curPage == totalPage - 2 ? "default" : "ghost"} onClick={() => { setCurPage(totalPage - 2) }}>{ totalPage - 2 }</Button>
                                <Button size={"icon"} variant={ curPage == totalPage - 1 ? "default" : "ghost"} onClick={() => { setCurPage(totalPage - 1) }}>{ totalPage - 1 }</Button>
                                <Button size={"icon"} variant={ curPage == totalPage ? "default" : "ghost"} onClick={() => { setCurPage(totalPage) }}>{ totalPage }</Button>
                            </>
                        ) }
                    </>
                ) : (
                    <>
                        { totalPage > 0 && Array.from({ length: totalPage }).fill(0).map((e, index) => (
                            <Button size={"icon"} key={`pageX-${index + 1}`} variant={ curPage == index + 1 ? "default" : "ghost"} onClick={() => { setCurPage(index + 1) }}>{ index + 1 }</Button>
                        )) }
                    </>
                ) }
                
            </div>
        </div>
    )
}