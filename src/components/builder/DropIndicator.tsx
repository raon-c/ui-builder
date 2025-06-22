"use client";

// AIDEV-NOTE: 드롭될 위치를 시각적으로 표시하는 인디케이터 컴포넌트
// 드래그 중일 때 드롭 가능한 위치에 파란색 라인으로 표시

interface DropIndicatorProps {
  isVisible: boolean;
  position: "top" | "bottom" | "inside";
}

export function DropIndicator({ isVisible, position }: DropIndicatorProps) {
  if (!isVisible) return null;

  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "absolute -top-2 left-0 right-0 h-1 bg-blue-500 rounded-full z-50 shadow-lg shadow-blue-500/50 animate-pulse";
      case "bottom":
        return "absolute -bottom-2 left-0 right-0 h-1 bg-blue-500 rounded-full z-50 shadow-lg shadow-blue-500/50 animate-pulse";
      case "inside":
        return "absolute inset-0 border-2 border-blue-500 border-dashed bg-blue-50/30 rounded-md z-40 animate-pulse";
      default:
        return "";
    }
  };

  return (
    <div className={getPositionClasses()}>
      {position === "inside" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
            여기에 놓기
          </div>
        </div>
      )}
    </div>
  );
}
