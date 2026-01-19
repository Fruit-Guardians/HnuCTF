import { Upload } from "lucide-react";
import { useRef } from "react";

export default function ImageUploader(
    { 
        src, 
        onChange, 
        backgroundTheme = "light",
        size = 112,
        imageFit = "object-cover"
    } : { 
        src: string, 
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
        backgroundTheme?: "light" | "dark",
        size?: number,
        imageFit?: string
    }
) {

    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className={`border-2 mt-2 aspect-square rounded-xl group relative overflow-hidden ${backgroundTheme == "light" ? "bg-white" : "bg-black"}`}
            style={{
                width: size
            }}
            onClick={() => {
                fileInputRef.current?.click();
            }}
        >
            {src && (
                <img src={src} alt="比赛图标" className={`w-full h-full ${imageFit}`} />
            )}
            <div className={`w-full h-full absolute top-0 left-0 opacity-0 group-hover:opacity-80 bg-white transition-opacity duration-300 flex items-center justify-center`}>
                <Upload size={48} className="text-black" />
            </div>
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={onChange}
            />
        </div>
    )
}