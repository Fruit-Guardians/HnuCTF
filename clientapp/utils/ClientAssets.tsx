import { Binary, Bitcoin, Bot, Bug, FileSearch, Github, GlobeLock, HardDrive, MessageSquareLock, Rabbit, Radar, ShieldCheck, Smartphone, SquareCode } from "lucide-react"

export const challengeCategoryColorMap : { [key: string]: string } = {
    "all": "rgb(32, 201, 151)",
    "misc": "rgb(32, 201, 151)",
    "crypto": "rgb(132, 94, 247)",
    "pwn": "rgb(255, 107, 107)",
    "web": "rgb(51, 154, 240)",
    "reverse": "rgb(252, 196, 25)",
    "forensics": "rgb(92, 124, 250)",
    "hardware": "rgb(208, 208, 208)",
    "mobile": "rgb(240, 101, 149)",
    "ppc": "rgb(34, 184, 207)",
    "ai": "rgb(148, 216, 45)",
    "pentest": "rgb(204, 93, 232)",
    "osint": "rgb(255, 146, 43)",
    "blockchain": "rgb(75, 192, 192)"
};

export const challengeCategoryIcons : { [key: string]: any } = {
    "all": <Rabbit size={23} />,
    "misc": <Radar size={23} />,
    "crypto": <MessageSquareLock size={23} />,
    "pwn": <Bug size={23} />,
    "web": <GlobeLock size={23} />,
    "reverse": <Binary size={23} />,
    "forensics": <FileSearch size={23} />,
    "blockchain": <Bitcoin size={21} />,
    "hardware": <HardDrive size={23} />,
    "mobile": <Smartphone size={23} />,
    "ppc": <SquareCode size={23} />,
    "ai": <Bot size={23} />,
    "pentest": <ShieldCheck size={23} />,
    "osint": <Github size={23} />
};