import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import party from 'party-js';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { useGlobalVariableContext } from 'contexts/GlobalVariableContext';

export function SolvedAnimation({ blood, setBlood, bloodMessage } : { blood: string, setBlood: Dispatch<SetStateAction<string>>, bloodMessage: string }) {

    const divRef = useRef<HTMLDivElement>(null);
    const [shouldAnime, setShouldAnime] = useState(false);

    useEffect(() => {
        if (blood != "") {
            setShouldAnime(true);

            setTimeout(() => {
                if (divRef.current) {
                    party.confetti(divRef.current, {
                        count: 100,  // 增加粒子数量
                        size: 2,
                        spread: 40,
                    });
                }
            }, 300);
        }
        
    }, [blood])

    const { clientConfig } = useGlobalVariableContext()

    const getBloodImage = (blood: string) => {
        switch (blood) {
            case "gold":
                return clientConfig.TrophysGold;
            case "silver":
                return clientConfig.TrophysSilver;
            case "copper":
                return clientConfig.TrophysBronze;
            default:
                return clientConfig.TrophysBronze;
        }
    }

    return (
        <AnimatePresence>
            { shouldAnime && (
                <motion.div ref={divRef} className={`absolute top-0 left-0 w-screen h-screen flex justify-center items-center z-[800] overflow-hidden select-none
                    ${ blood == "gold" ? "bg-yellow-100" : ( blood == "silver" ? "bg-slate-100" : "bg-[#fed7c3]" ) }
                `}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className='absolute right-0 top-0 m-4'>
                        <Button variant="ghost" className='[&_svg]:size-8 text-black w-[50px] h-[50px]'
                            onClick={() => {
                                setBlood("")
                                setShouldAnime(false)
                            }}
                        >
                            <X />
                        </Button>
                    </div>
                    <div className='flex flex-col items-center gap-8'>
                        <img
                            src={getBloodImage(blood)}
                            alt="Gold!"
                            width={350}
                            height={1000}
                            style={{
                                imageRendering: 'pixelated',
                            }}
                            onClick={() => {
                                if (divRef.current) {
                                    const _r = party.confetti(divRef.current, {
                                        count: 100,  // 增加粒子数量
                                        size: 2,
                                        spread: 40,
                                    });
                                }
                            }}
                        />
                        <span className='text-4xl font-bold text-black'>{ bloodMessage }</span>
                    </div>
                </motion.div>
            ) }
        </AnimatePresence>
    )
}