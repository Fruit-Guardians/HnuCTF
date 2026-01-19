import React, { createContext, useContext, useState, useRef } from 'react';

// 定义Canvas状态类型
interface CanvasState {
  gridOffset: { x: number; y: number };
  rotationAngle: number;
  hoveredSquare: { x: number; y: number } | null;
  imageRotations: Map<string, number>;
  lastTimestamp: number;
}

// 定义图片缓存类型
interface ImageCache {
  [key: string]: HTMLImageElement | null;
}

// 定义Context类型
interface CanvasContextType {
  canvasState: CanvasState;
  imageCache: ImageCache;
  loadedImages: Set<string>;
  getImage: (src: string) => HTMLImageElement | null;
  loadImage: (src: string) => Promise<HTMLImageElement>;
  updateGridOffset: (x: number, y: number) => void;
  updateRotationAngle: (angle: number) => void;
  updateHoveredSquare: (position: { x: number; y: number } | null) => void;
  updateImageRotation: (key: string, angle: number) => void;
  updateTimestamp: (timestamp: number) => void;
  initializeRandomRotations: (rows: number, cols: number) => void;
}

// 创建Context
const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

// 创建Provider组件
export const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 使用useRef保存Canvas状态，避免不必要的重新渲染
  const canvasStateRef = useRef<CanvasState>({
    gridOffset: { x: 0, y: 0 },
    rotationAngle: 0,
    hoveredSquare: null,
    imageRotations: new Map<string, number>(),
    lastTimestamp: 0,
  });

  // 图片缓存管理
  const imageCacheRef = useRef<ImageCache>({});
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // 获取已加载的图片
  const getImage = (src: string): HTMLImageElement | null => {
    return imageCacheRef.current[src] || null;
  };

  // 加载图片并缓存
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      // 如果图片已经加载，直接返回缓存
      if (imageCacheRef.current[src]) {
        resolve(imageCacheRef.current[src] as HTMLImageElement);
        return;
      }

      // 创建新图片
      const img = new Image();
      img.onload = () => {
        // 缓存图片
        imageCacheRef.current[src] = img;
        // 更新已加载图片集合
        setLoadedImages(prev => {
          const newSet = new Set(prev);
          newSet.add(src);
          return newSet;
        });
        resolve(img);
      };
      img.onerror = (err) => {
        console.error(`图片加载失败: ${src}`, err);
        reject(err);
      };
      img.src = src;
    });
  };

  // 提供对Canvas状态的更新方法
  const updateGridOffset = (x: number, y: number) => {
    canvasStateRef.current.gridOffset = { x, y };
  };

  const updateRotationAngle = (angle: number) => {
    canvasStateRef.current.rotationAngle = angle;
  };

  const updateHoveredSquare = (position: { x: number; y: number } | null) => {
    canvasStateRef.current.hoveredSquare = position;
  };

  const updateImageRotation = (key: string, angle: number) => {
    canvasStateRef.current.imageRotations.set(key, angle);
  };

  const updateTimestamp = (timestamp: number) => {
    canvasStateRef.current.lastTimestamp = timestamp;
  };

  const initializeRandomRotations = (rows: number, cols: number) => {
    const newRotations = new Map<string, number>();
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const key = `${x}-${y}`;
        const randomAngle = Math.random() * 360 * Math.PI / 180; // 随机角度（弧度）
        newRotations.set(key, randomAngle);
      }
    }
    canvasStateRef.current.imageRotations = newRotations;
  };

  // 创建Context值
  const contextValue: CanvasContextType = {
    canvasState: canvasStateRef.current,
    imageCache: imageCacheRef.current,
    loadedImages,
    getImage,
    loadImage,
    updateGridOffset,
    updateRotationAngle,
    updateHoveredSquare,
    updateImageRotation,
    updateTimestamp,
    initializeRandomRotations,
  };

  return (
    <CanvasContext.Provider value={contextValue}>
      {children}
    </CanvasContext.Provider>
  );
};

// 创建自定义Hook，方便在组件中使用Context
export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};