import { UserDetailGameChallenge, UserSimpleGameChallenge } from 'utils/A1API';
import { useTransition, animated } from '@react-spring/web';
import { useState, useRef } from 'react';
import { SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from 'components/ui/sidebar';
import { ChevronDown } from 'lucide-react';
import { Button } from 'components/ui/button';
import { ChallengeCard } from 'components/ChallengeCard';
import { challengeCategoryColorMap, challengeCategoryIcons } from 'utils/ClientAssets';
import { ChallengeSolveStatus } from 'components/user/game/ChallengesView';
import { useGlobalVariableContext } from 'contexts/GlobalVariableContext';

export default function CategoryChallenges({
    category,
    gameID,
    challengeList,
    curChallenge,
    observeItem,
    visibleItems,
    handleChangeChallenge,
    challengeSolveStatusList
}: {
    category: string,
    gameID: number,
    challengeList: UserSimpleGameChallenge[],
    curChallenge: UserDetailGameChallenge | undefined,
    observeItem: (el: HTMLElement, category: string, id: string) => void,
    visibleItems: Record<string, Record<string, boolean>>,
    handleChangeChallenge: (id: number) => React.MouseEventHandler<HTMLDivElement>,
    challengeSolveStatusList: Record<string, ChallengeSolveStatus>
}) {
    const colorMap: { [key: string]: string } = challengeCategoryColorMap;
    const cateIcon: { [key: string]: any } = challengeCategoryIcons;

    let shouldExtend = false

    if (curChallenge) {
        shouldExtend = curChallenge?.category?.toString().toLocaleLowerCase() == category
    }

    const [categoryFolded, setCategoryFolded] = useState(!shouldExtend);
    const contentRef = useRef<HTMLDivElement>(null);

    const { isAdmin } = useGlobalVariableContext()

    const transitions = useTransition(!categoryFolded, {
        from: { 
            opacity: 0, 
            height: 0,
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            marginTop: 0,
            marginBottom: 0
        },
        enter: { 
            opacity: 1, 
            height: contentRef.current?.scrollHeight || 'auto',
            paddingTop: 8, // 对应 p-2 的垂直 padding
            paddingBottom: 8,
            paddingLeft: 8,
            paddingRight: 8,
            marginTop: 0,
            marginBottom: 0
        },
        leave: { 
            opacity: 0, 
            height: 0,
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            marginTop: 0,
            marginBottom: 0
        },
        config: {
            mass: 1,
            tension: 210,
            friction: 20,
            clamp: false
        },
    });

    return (
        <div className="mb-2">
            {/* Sidebar Group Label */}
            <SidebarGroupLabel className="text-[0.9em] transition-colors duration-300 h-10">
                <div className="flex items-center w-full" onClick={() => {
                    setCategoryFolded(!categoryFolded);
                }}>
                    <div className="flex items-center justify-center gap-2 transition-colors duration-300"
                        style={{
                            color: (!categoryFolded || curChallenge?.category?.toString() === category) ? colorMap[category.toLowerCase()] : ""
                        }}
                    >
                        {cateIcon[category.toLowerCase()]}
                        <span className="font-bold text-[1.1em]">{category} ({ isAdmin() ? challengeList.length : challengeList.filter((e) => e.visible).length })</span>
                    </div>
                    <div className="flex-1" />
                    <div className="justify-end">
                        <Button variant={"ghost"} size={"icon"}>
                            <ChevronDown className={`transition-transform duration-300 ${categoryFolded ? "" : "rotate-180"}`} />
                        </Button>
                    </div>
                </div>
            </SidebarGroupLabel>
            
            <SidebarGroupContent>
                <SidebarMenu className="">
                    <div ref={contentRef}>
                        {transitions((style, item) => item && (
                            <animated.div
                                className={`flex flex-col gap-3 overflow-hidden ${categoryFolded ? "pointer-events-none" : ""}`}
                                style={{
                                    ...style,
                                    // willChange: 'opacity, height'
                                }}
                            >
                                {/* Render all ChallengeItems for this category */}
                                {challengeList.map((challenge, index) => (
                                    <div
                                        key={index}
                                        ref={(el) => observeItem(el!, category, challenge.challenge_id?.toString() || "")}
                                    >
                                        {(visibleItems[category]?.[challenge?.challenge_id ?? 0]) ? (
                                            <ChallengeCard
                                                type={challenge.category?.toLocaleLowerCase() || "None"}
                                                name={challenge?.challenge_name ?? "None"}
                                                solved={challenge?.solve_count ?? 0}
                                                score={challenge?.cur_score ?? 0}
                                                rank={3}
                                                gameID={gameID}
                                                visible={challenge?.visible ?? false}
                                                belongStage={challenge.belong_stage}
                                                choiced={curChallenge?.challenge_id == challenge.challenge_id}
                                                onClick={handleChangeChallenge(challenge?.challenge_id ?? 0)}
                                                status={challengeSolveStatusList[challenge?.challenge_id ?? 0].solved}
                                            />
                                        ) : (
                                            <div className="h-[100px]"></div>
                                        )}
                                    </div>
                                ))}
                            </animated.div>
                        ))}
                    </div>
                </SidebarMenu>
            </SidebarGroupContent>
        </div>
    );
}