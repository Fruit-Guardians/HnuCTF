import { Editor } from "@monaco-editor/react"
import { cn } from "lib/utils"
import { useTheme } from "next-themes"
import type { editor } from 'monaco-editor';
import { loader } from '@monaco-editor/react';
import { useEffect } from "react";

import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

export default function ThemedEditor(
    { value, onChange, className, language, disabled = false, options = undefined }: {
        value: string | undefined
        onChange: (value: string | undefined) => void,
        className: string,
        language: string,
        disabled?: boolean,
        options?: editor.IStandaloneEditorConstructionOptions | undefined
    }
) {

    const { theme } = useTheme()

    // for vite
    self.MonacoEnvironment = {
        getWorker(_, label) {
            if (label === 'json') {
                return new jsonWorker();
            }
            if (label === 'css' || label === 'scss' || label === 'less') {
                return new cssWorker();
            }
            if (label === 'html' || label === 'handlebars' || label === 'razor') {
                return new htmlWorker();
            }
            if (label === 'typescript' || label === 'javascript') {
                return new tsWorker();
            }
            return new editorWorker();
        },
    };

    loader.config({ monaco });

    useEffect(() => {
        return () => {
            // 额外清除 .monaco-aria-container 元素
            const aria = document.querySelector(".monaco-aria-container");
            if (aria && aria.parentNode) {
                aria.parentNode.removeChild(aria);
            }
        };
    }, []);
        
    return (
        <div className={cn(`w-full rounded-lg ${disabled ? "pointer-events-none cursor-not-allowed opacity-50" : ""} overflow-hidden shadow-xs border-1 ${theme === "dark" ? "bg-[#1e1e1e]" : "bg-[#ffffff]"}`, className)}>
            <Editor
                height="100%"
                width="100%"
                defaultLanguage={language}
                theme={theme === "dark" ? "vs-dark" : "light"}
                defaultValue={value}
                onChange={onChange}
                options={options}
            />
        </div>
    )
}