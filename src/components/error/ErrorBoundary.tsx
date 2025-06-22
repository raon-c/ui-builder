"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// AIDEV-NOTE: 에러 경계 시스템 - 다중 라이브러리 시스템 및 빌더 컴포넌트의 안전한 에러 처리

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  resetOnPropsChange?: boolean;
}

/**
 * 다중 라이브러리 시스템을 위한 에러 경계 컴포넌트
 * 에러 발생 시 안전한 폴백 UI 제공 및 자동 복구 기능
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // 에러 로깅
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // 커스텀 에러 핸들러 호출
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 성능 모니터링을 위한 에러 정보 수집
    this.collectErrorMetrics(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // props 변경 시 에러 상태 리셋
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }
  }

  /**
   * 에러 메트릭 수집 (성능 모니터링용)
   */
  private collectErrorMetrics(error: Error, errorInfo: ErrorInfo) {
    const metrics = {
      timestamp: Date.now(),
      errorName: error.name,
      errorMessage: error.message,
      componentStack: errorInfo.componentStack,
      errorBoundaryName: "MultiLibraryErrorBoundary",
      retryCount: this.state.retryCount,
    };

    // 로컬 스토리지에 에러 메트릭 저장 (개발자 디버깅용)
    if (typeof window !== "undefined") {
      try {
        const existingMetrics = localStorage.getItem("ui-builder-error-metrics");
        const metricsArray = existingMetrics ? JSON.parse(existingMetrics) : [];
        metricsArray.push(metrics);

        // 최근 100개 에러만 유지
        if (metricsArray.length > 100) {
          metricsArray.splice(0, metricsArray.length - 100);
        }

        localStorage.setItem("ui-builder-error-metrics", JSON.stringify(metricsArray));
      } catch {
        // localStorage 접근 실패 시 무시
      }
    }
  }

  /**
   * 에러 상태 리셋 및 재시도
   */
  private resetErrorBoundary = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1,
      });
    }
  };

  /**
   * 자동 복구 시도
   */
  private attemptAutoRecovery = () => {
    // 5초 후 자동으로 재시도
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetErrorBoundary();
    }, 5000);
  };

  /**
   * 에러 정보를 개발자 도구로 복사
   */
  private copyErrorToClipboard = async () => {
    const { error, errorInfo } = this.state;
    const errorReport = {
      error: {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
      },
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
      console.log("Error report copied to clipboard");
    } catch {
      console.log("Failed to copy error report");
    }
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const { children, fallback, maxRetries = 3 } = this.props;

    if (hasError) {
      // 커스텀 폴백이 제공된 경우
      if (fallback) {
        return fallback;
      }

      // 최대 재시도 횟수 도달 시
      if (retryCount >= maxRetries) {
        return (
          <div className="p-6 max-w-md mx-auto">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <div>
                <h3 className="font-semibold mb-2">시스템 오류 발생</h3>
                <p className="text-sm mb-4">
                  다중 라이브러리 시스템에서 복구할 수 없는 오류가 발생했습니다. 페이지를 새로고침하거나 관리자에게
                  문의해주세요.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => window.location.reload()} className="text-xs">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    페이지 새로고침
                  </Button>
                  <Button size="sm" variant="outline" onClick={this.copyErrorToClipboard} className="text-xs">
                    오류 정보 복사
                  </Button>
                </div>
              </div>
            </Alert>
          </div>
        );
      }

      // 재시도 가능한 에러 상태
      return (
        <div className="p-6 max-w-md mx-auto">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <div>
              <h3 className="font-semibold mb-2">일시적 오류</h3>
              <p className="text-sm mb-4">
                컴포넌트 로딩 중 문제가 발생했습니다. 다시 시도해보세요. ({retryCount}/{maxRetries} 재시도)
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={this.resetErrorBoundary} className="text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  다시 시도 ({maxRetries - retryCount}회 남음)
                </Button>
                <Button size="sm" variant="outline" onClick={this.attemptAutoRecovery} className="text-xs">
                  자동 복구 (5초)
                </Button>
              </div>
            </div>
          </Alert>
        </div>
      );
    }

    return children;
  }
}

/**
 * 다중 라이브러리 시스템 전용 에러 경계
 */
export function MultiLibraryErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      maxRetries={2}
      resetOnPropsChange={true}
      onError={(error, errorInfo) => {
        // 다중 라이브러리 관련 에러 특별 처리
        if (error.message.includes("multi-library") || error.message.includes("adapter")) {
          console.warn("Multi-library system error detected:", error);
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
