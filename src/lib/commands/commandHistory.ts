// AIDEV-NOTE: Command History 관리자 - Undo/Redo 스택 관리 및 히스토리 상태 추적
// 메모리 최적화를 위한 히스토리 크기 제한과 압축 기능 포함

import type { Command, CommandHistory } from "./types";

/**
 * Command History 구현체
 */
export class CommandHistoryImpl implements CommandHistory {
  public undoStack: Command[] = [];
  public redoStack: Command[] = [];
  public readonly maxHistorySize: number;

  private listeners: Set<() => void> = new Set();

  constructor(maxHistorySize: number = 100) {
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * 명령 실행 및 히스토리에 추가
   */
  execute(command: Command): void {
    try {
      // 명령 실행
      command.execute();

      // undo 스택에 추가
      this.undoStack.push(command);

      // redo 스택 초기화 (새 명령 실행 시 redo 불가)
      this.redoStack = [];

      // 히스토리 크기 제한
      this.trimHistory();

      // 리스너들에게 변경 알림
      this.notifyListeners();
    } catch (error) {
      console.error("Command execution failed:", error);
      throw error;
    }
  }

  /**
   * 실행 취소
   */
  undo(): boolean {
    if (!this.canUndo()) {
      return false;
    }

    try {
      const command = this.undoStack.pop()!;
      command.undo();

      // redo 스택에 추가
      this.redoStack.push(command);

      // 리스너들에게 변경 알림
      this.notifyListeners();

      return true;
    } catch (error) {
      console.error("Undo failed:", error);
      return false;
    }
  }

  /**
   * 다시 실행
   */
  redo(): boolean {
    if (!this.canRedo()) {
      return false;
    }

    try {
      const command = this.redoStack.pop()!;
      command.execute();

      // undo 스택에 추가
      this.undoStack.push(command);

      // 리스너들에게 변경 알림
      this.notifyListeners();

      return true;
    } catch (error) {
      console.error("Redo failed:", error);
      return false;
    }
  }

  /**
   * 히스토리 초기화
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.notifyListeners();
  }

  /**
   * 실행 취소 가능 여부
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * 다시 실행 가능 여부
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * 히스토리 상태 반환
   */
  getHistoryState() {
    return {
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
      currentPosition: this.undoStack.length,
      totalCommands: this.undoStack.length + this.redoStack.length,
    };
  }

  /**
   * 최근 N개의 명령 반환 (히스토리 UI용)
   */
  getRecentCommands(count: number = 10): Command[] {
    return this.undoStack.slice(-count).reverse();
  }

  /**
   * 특정 위치로 이동 (히스토리 UI에서 특정 지점 클릭 시)
   */
  goToPosition(targetPosition: number): boolean {
    const currentPosition = this.undoStack.length;

    if (targetPosition === currentPosition) {
      return true; // 이미 해당 위치
    }

    try {
      if (targetPosition < currentPosition) {
        // 뒤로 이동 (undo)
        const undoCount = currentPosition - targetPosition;
        for (let i = 0; i < undoCount; i++) {
          if (!this.undo()) {
            return false;
          }
        }
      } else {
        // 앞으로 이동 (redo)
        const redoCount = targetPosition - currentPosition;
        for (let i = 0; i < redoCount; i++) {
          if (!this.redo()) {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Failed to go to position:", error);
      return false;
    }
  }

  /**
   * 변경 리스너 등록
   */
  addListener(listener: () => void): () => void {
    this.listeners.add(listener);

    // 리스너 제거 함수 반환
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 히스토리 압축 (메모리 최적화)
   */
  private trimHistory(): void {
    if (this.undoStack.length > this.maxHistorySize) {
      // 오래된 명령들 제거
      const removeCount = this.undoStack.length - this.maxHistorySize;
      this.undoStack.splice(0, removeCount);
    }

    // redo 스택도 제한 (일반적으로 undo보다 작게)
    const maxRedoSize = Math.floor(this.maxHistorySize / 2);
    if (this.redoStack.length > maxRedoSize) {
      const removeCount = this.redoStack.length - maxRedoSize;
      this.redoStack.splice(0, removeCount);
    }
  }

  /**
   * 리스너들에게 변경 알림
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error("History listener error:", error);
      }
    });
  }

  /**
   * 메모리 사용량 정보 (디버깅용)
   */
  getMemoryInfo() {
    const undoMemory = this.undoStack.length;
    const redoMemory = this.redoStack.length;
    const totalMemory = undoMemory + redoMemory;

    return {
      undoCommands: undoMemory,
      redoCommands: redoMemory,
      totalCommands: totalMemory,
      memoryUsage: `${totalMemory}/${this.maxHistorySize}`,
      utilizationPercent: Math.round((totalMemory / this.maxHistorySize) * 100),
    };
  }
}

/**
 * 전역 Command History 인스턴스
 */
export const commandHistory = new CommandHistoryImpl(100); 