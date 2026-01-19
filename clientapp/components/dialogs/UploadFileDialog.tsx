import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "components/ui/dialog"

import { Button } from "components/ui/button"
import { Progress } from "components/ui/progress"
import { useRef, useState, useCallback } from "react";
import { AxiosProgressEvent } from "axios";
import { toast } from 'react-toastify/unstyled';
import { Upload, File, CheckCircle, AlertCircle } from "lucide-react";
import { api, createSkipGlobalErrorConfig, ErrorMessage } from "utils/ApiHelper";
import { cn } from "lib/utils";

interface UploadFileDialogProps {
    onUploadSuccess?: (fileId: string, fileName: string) => void;
    children: React.ReactNode;
    acceptTypes?: string;
    maxSize?: number; // 最大文件大小，单位MB
}

interface UploadState {
    uploading: boolean;
    progress: number;
    speed: number;
    fileName: string;
    fileSize: number;
    status: 'idle' | 'uploading' | 'success' | 'error';
    errorMessage?: string;
}

export const UploadFileDialog: React.FC<UploadFileDialogProps> = ({
    onUploadSuccess,
    children,
    acceptTypes = "*/*",
    maxSize = 100 // 默认100MB
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [uploadState, setUploadState] = useState<UploadState>({
        uploading: false,
        progress: 0,
        speed: 0,
        fileName: '',
        fileSize: 0,
        status: 'idle'
    });
    const [isDragOver, setIsDragOver] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const startTimeRef = useRef<number>(0);
    const uploadedBytesRef = useRef<number>(0);

    const resetUploadState = useCallback(() => {
        setUploadState({
            uploading: false,
            progress: 0,
            speed: 0,
            fileName: '',
            fileSize: 0,
            status: 'idle'
        });
    }, []);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatSpeed = (bytesPerSecond: number): string => {
        return formatFileSize(bytesPerSecond) + '/s';
    };

    const formatTimeRemaining = (speed: number, remainingBytes: number): string => {
        if (speed === 0) return '计算中...';
        const secondsRemaining = remainingBytes / speed;
        if (secondsRemaining < 60) {
            return `剩余 ${Math.ceil(secondsRemaining)} 秒`;
        } else if (secondsRemaining < 3600) {
            return `剩余 ${Math.ceil(secondsRemaining / 60)} 分钟`;
        } else {
            return `剩余 ${Math.ceil(secondsRemaining / 3600)} 小时`;
        }
    };

    const validateFile = (file: File): boolean => {
        if (file.size > maxSize * 1024 * 1024) {
            toast.error(`文件大小不能超过 ${maxSize}MB`);
            return false;
        }
        return true;
    };

    const handleFileUpload = async (file: File) => {
        if (!validateFile(file)) return;

        setUploadState({
            uploading: true,
            progress: 0,
            speed: 0,
            fileName: file.name,
            fileSize: file.size,
            status: 'uploading'
        });

        startTimeRef.current = Date.now();
        uploadedBytesRef.current = 0;

        try {
            const response = await api.file.uploadFile(
                { file },
                createSkipGlobalErrorConfig({
                    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                        if (progressEvent.total) {
                            const percentCompleted = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            
                            // 计算上传速度
                            const currentTime = Date.now();
                            const timeElapsed = (currentTime - startTimeRef.current) / 1000; // 秒
                            const bytesUploaded = progressEvent.loaded;
                            const speed = timeElapsed > 0 ? bytesUploaded / timeElapsed : 0;

                            setUploadState(prev => ({
                                ...prev,
                                progress: percentCompleted,
                                speed: speed
                            }));
                        }
                    }
                })
            );

            setUploadState(prev => ({
                ...prev,
                uploading: false,
                status: 'success'
            }));
            
            if (onUploadSuccess) {
                onUploadSuccess(response.data.file_id, file.name);
            }

            // 延迟关闭对话框
            setTimeout(() => {
                setIsOpen(false);
                resetUploadState();
            }, 1500);

        } catch (error: any) {
            setUploadState(prev => ({
                ...prev,
                uploading: false,
                status: 'error',
                errorMessage: '上传失败'
            }));

            if (error.response?.status) {
                const errorMessage: ErrorMessage = error.response.data as ErrorMessage;
                toast.error(errorMessage.message);
                setUploadState(prev => ({
                    ...prev,
                    errorMessage: errorMessage.message
                }));
            } else {
                toast.error("上传失败，请重试");
            }
        }
    };

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    }, []);

    const handleClose = () => {
        if (!uploadState.uploading) {
            setIsOpen(false);
            resetUploadState();
        }
    };

    const getStatusIcon = () => {
        switch (uploadState.status) {
            case 'success':
                return <CheckCircle className="w-8 h-8 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-8 h-8 text-red-500" />;
            case 'uploading':
                return <Upload className="w-8 h-8 text-blue-500 animate-pulse" />;
            default:
                return <Upload className="w-8 h-8 text-muted-foreground" />;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent 
                className="sm:max-w-[525px] select-none"
                onInteractOutside={(e) => uploadState.uploading && e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        上传附件
                    </DialogTitle>
                </DialogHeader>

                <input
                    type="file"
                    ref={fileInputRef}
                    accept={acceptTypes}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />

                <div className="space-y-4">
                    {uploadState.status === 'idle' && (
                        <div
                            className={cn(
                                "w-full h-[200px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200",
                                isDragOver 
                                    ? "border-primary bg-primary/10 scale-[1.02]" 
                                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                            )}
                            onClick={handleFileSelect}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <Upload 
                                size={48} 
                                className={cn(
                                    "mb-4 transition-all duration-200",
                                    isDragOver ? "text-primary scale-110" : "opacity-40"
                                )}
                            />
                            <p className={cn(
                                "text-center transition-colors",
                                isDragOver ? "text-primary font-medium" : "text-muted-foreground"
                            )}>
                                {isDragOver ? "释放以上传文件" : "点击选择文件或拖拽文件到此处"}
                            </p>
                            <p className="text-sm text-muted-foreground/70 mt-2">
                                最大文件大小: {maxSize}MB
                                {acceptTypes !== "*/*" && (
                                    <span className="block mt-1">
                                        支持格式: {acceptTypes}
                                    </span>
                                )}
                            </p>
                        </div>
                    )}

                    {uploadState.status !== 'idle' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 border rounded-lg">
                                <File className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{uploadState.fileName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatFileSize(uploadState.fileSize)}
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    {getStatusIcon()}
                                </div>
                            </div>

                            {uploadState.status === 'uploading' && (
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span>上传进度</span>
                                        <span className="font-medium">{uploadState.progress}%</span>
                                    </div>
                                    <Progress value={uploadState.progress} className="h-3" />
                                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                                        <div className="space-y-1">
                                            <div>上传速度: {formatSpeed(uploadState.speed)}</div>
                                            <div>
                                                {formatTimeRemaining(
                                                    uploadState.speed, 
                                                    uploadState.fileSize * (100 - uploadState.progress) / 100
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <div>
                                                {formatFileSize(uploadState.fileSize * uploadState.progress / 100)} / {formatFileSize(uploadState.fileSize)}
                                            </div>
                                            <div className="text-primary">
                                                {uploadState.progress === 100 ? '正在处理...' : '上传中...'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {uploadState.status === 'success' && (
                                <div className="text-center py-4">
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                                    <p className="text-green-600 font-medium">上传成功！</p>
                                </div>
                            )}

                            {uploadState.status === 'error' && (
                                <div className="text-center py-4">
                                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                                    <p className="text-red-600 font-medium">
                                        {uploadState.errorMessage || '上传失败'}
                                    </p>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="mt-3"
                                        onClick={resetUploadState}
                                    >
                                        重新上传
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <Button 
                        variant="outline" 
                        onClick={handleClose}
                        disabled={uploadState.uploading}
                    >
                        {uploadState.status === 'success' ? '完成' : '取消'}
                    </Button>
                    {uploadState.status === 'idle' && (
                        <Button onClick={handleFileSelect}>
                            选择文件
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}; 