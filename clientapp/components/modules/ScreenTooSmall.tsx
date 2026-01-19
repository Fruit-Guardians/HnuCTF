import { FerrisWheel } from "lucide-react";

export default function ScreenTooSmall() {
    return (
        <div className="absolute top-0 left-0 w-screen h-screen bg-background flex items-center justify-center z-[100] overflow-hidden select-none">
            <div className="flex flex-col items-center">
                <FerrisWheel size={110} className="mb-8" />
                <span className="font-bold text-xl mb-4">抱歉，该页面还没有适配移动端</span>
                <span className="text-lg font-bold">用电脑试试吧 ๐•ᴗ•๐</span>
            </div>
        </div>
    )
}