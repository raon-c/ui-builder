"use client";

// AIDEV-NOTE: 성능 모니터링 시스템 - 사용자 피드백 개선을 위한 메트릭 수집

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  category: "adapter" | "render" | "interaction" | "storage" | "network";
  details?: Record<string, any>;
}

export interface PerformanceReport {
  sessionId: string;
  timestamp: number;
  userAgent: string;
  metrics: PerformanceMetric[];
  errors: Array<{
    name: string;
    message: string;
    timestamp: number;
    category: string;
  }>;
  summary: {
    totalInteractions: number;
    averageRenderTime: number;
    slowestOperations: PerformanceMetric[];
    errorRate: number;
  };
}

/**
 * 성능 모니터링 및 메트릭 수집 클래스
 * 사용자 경험 개선을 위한 데이터 수집
 */
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private errors: Array<{ name: string; message: string; timestamp: number; category: string }> = [];
  private sessionId: string;
  private readonly maxMetrics = 1000;
  private readonly maxErrors = 100;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeWebVitals();
  }

  /**
   * 세션 ID 생성
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Web Vitals 초기화
   */
  private initializeWebVitals() {
    if (typeof window === "undefined") return;

    // Performance Observer 설정
    if ("PerformanceObserver" in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordWebVital(entry);
          }
        });

        observer.observe({ entryTypes: ["navigation", "paint", "largest-contentful-paint"] });
      } catch (error) {
        console.warn("Failed to initialize performance observer:", error);
      }
    }
  }

  /**
   * Web Vital 메트릭 기록
   */
  private recordWebVital(entry: PerformanceEntry) {
    const metric: PerformanceMetric = {
      name: entry.name,
      value: entry.startTime,
      timestamp: Date.now(),
      category: "render",
      details: {
        entryType: entry.entryType,
        duration: entry.duration,
      },
    };

    this.addMetric(metric);
  }

  /**
   * 메트릭 추가
   */
  addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);

    // 메트릭 수 제한
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.splice(0, this.metrics.length - this.maxMetrics);
    }
  }

  /**
   * 에러 기록
   */
  recordError(name: string, message: string, category: string = "general") {
    this.errors.push({
      name,
      message,
      timestamp: Date.now(),
      category,
    });

    // 에러 수 제한
    if (this.errors.length > this.maxErrors) {
      this.errors.splice(0, this.errors.length - this.maxErrors);
    }
  }

  /**
   * 어댑터 로딩 성능 측정
   */
  measureAdapterLoad<T>(namespace: string, operation: () => Promise<T>): Promise<T> {
    const startTime = performance.now();

    return operation().then(
      (result) => {
        const duration = performance.now() - startTime;
        this.addMetric({
          name: `adapter-load-${namespace}`,
          value: duration,
          timestamp: Date.now(),
          category: "adapter",
          details: { namespace, success: true },
        });
        return result;
      },
      (error) => {
        const duration = performance.now() - startTime;
        this.addMetric({
          name: `adapter-load-${namespace}`,
          value: duration,
          timestamp: Date.now(),
          category: "adapter",
          details: { namespace, success: false, error: error.message },
        });
        this.recordError("AdapterLoadError", error.message, "adapter");
        throw error;
      },
    );
  }

  /**
   * 렌더링 성능 측정
   */
  measureRender(componentName: string, renderFn: () => void) {
    const startTime = performance.now();

    try {
      renderFn();
      const duration = performance.now() - startTime;

      this.addMetric({
        name: `render-${componentName}`,
        value: duration,
        timestamp: Date.now(),
        category: "render",
        details: { componentName, success: true },
      });
    } catch (error) {
      const duration = performance.now() - startTime;

      this.addMetric({
        name: `render-${componentName}`,
        value: duration,
        timestamp: Date.now(),
        category: "render",
        details: { componentName, success: false, error: (error as Error).message },
      });

      this.recordError("RenderError", (error as Error).message, "render");
      throw error;
    }
  }

  /**
   * 사용자 상호작용 측정
   */
  measureInteraction(actionName: string, interactionFn: () => void | Promise<void>) {
    const startTime = performance.now();

    try {
      const result = interactionFn();

      if (result instanceof Promise) {
        return result.then(
          () => {
            const duration = performance.now() - startTime;
            this.addMetric({
              name: `interaction-${actionName}`,
              value: duration,
              timestamp: Date.now(),
              category: "interaction",
              details: { actionName, success: true },
            });
          },
          (error) => {
            const duration = performance.now() - startTime;
            this.addMetric({
              name: `interaction-${actionName}`,
              value: duration,
              timestamp: Date.now(),
              category: "interaction",
              details: { actionName, success: false, error: error.message },
            });
            this.recordError("InteractionError", error.message, "interaction");
            throw error;
          },
        );
      } else {
        const duration = performance.now() - startTime;
        this.addMetric({
          name: `interaction-${actionName}`,
          value: duration,
          timestamp: Date.now(),
          category: "interaction",
          details: { actionName, success: true },
        });
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      this.addMetric({
        name: `interaction-${actionName}`,
        value: duration,
        timestamp: Date.now(),
        category: "interaction",
        details: { actionName, success: false, error: (error as Error).message },
      });
      this.recordError("InteractionError", (error as Error).message, "interaction");
      throw error;
    }
  }

  /**
   * 성능 보고서 생성
   */
  generateReport(): PerformanceReport {
    const now = Date.now();
    const renderMetrics = this.metrics.filter((m) => m.category === "render");
    const interactionMetrics = this.metrics.filter((m) => m.category === "interaction");

    // 느린 작업 찾기 (상위 5개)
    const slowestOperations = [...this.metrics].sort((a, b) => b.value - a.value).slice(0, 5);

    // 평균 렌더링 시간 계산
    const averageRenderTime =
      renderMetrics.length > 0 ? renderMetrics.reduce((sum, m) => sum + m.value, 0) / renderMetrics.length : 0;

    // 에러율 계산
    const totalOperations = this.metrics.length;
    const errorRate = totalOperations > 0 ? (this.errors.length / totalOperations) * 100 : 0;

    return {
      sessionId: this.sessionId,
      timestamp: now,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      metrics: [...this.metrics],
      errors: [...this.errors],
      summary: {
        totalInteractions: interactionMetrics.length,
        averageRenderTime,
        slowestOperations,
        errorRate,
      },
    };
  }

  /**
   * 로컬 스토리지에 보고서 저장
   */
  saveReportToStorage() {
    if (typeof window === "undefined") return;

    try {
      const report = this.generateReport();
      const existingReports = localStorage.getItem("ui-builder-performance-reports");
      const reports = existingReports ? JSON.parse(existingReports) : [];

      reports.push(report);

      // 최근 10개 보고서만 유지
      if (reports.length > 10) {
        reports.splice(0, reports.length - 10);
      }

      localStorage.setItem("ui-builder-performance-reports", JSON.stringify(reports));
    } catch (error) {
      console.warn("Failed to save performance report:", error);
    }
  }

  /**
   * 성능 경고 체크
   */
  checkPerformanceWarnings(): Array<{ type: string; message: string; severity: "low" | "medium" | "high" }> {
    const warnings: Array<{ type: string; message: string; severity: "low" | "medium" | "high" }> = [];

    // 렌더링 성능 체크
    const renderMetrics = this.metrics.filter((m) => m.category === "render");
    const slowRenders = renderMetrics.filter((m) => m.value > 16); // 60fps 기준

    if (slowRenders.length > renderMetrics.length * 0.3) {
      warnings.push({
        type: "slow-render",
        message: `렌더링이 느립니다. ${slowRenders.length}개의 컴포넌트가 16ms를 초과했습니다.`,
        severity: "medium",
      });
    }

    // 어댑터 로딩 성능 체크
    const adapterMetrics = this.metrics.filter((m) => m.category === "adapter");
    const slowAdapterLoads = adapterMetrics.filter((m) => m.value > 1000); // 1초 초과

    if (slowAdapterLoads.length > 0) {
      warnings.push({
        type: "slow-adapter-load",
        message: `어댑터 로딩이 느립니다. ${slowAdapterLoads.length}개의 어댑터가 1초를 초과했습니다.`,
        severity: "high",
      });
    }

    // 에러율 체크
    if (this.errors.length > this.metrics.length * 0.1) {
      warnings.push({
        type: "high-error-rate",
        message: `에러율이 높습니다. 총 ${this.errors.length}개의 에러가 발생했습니다.`,
        severity: "high",
      });
    }

    return warnings;
  }

  /**
   * 메트릭 초기화
   */
  clearMetrics() {
    this.metrics = [];
    this.errors = [];
  }
}

// 전역 성능 모니터 인스턴스
export const performanceMonitor = new PerformanceMonitor();

/**
 * 성능 측정 데코레이터
 */
export function measurePerformance(category: PerformanceMetric["category"]) {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const startTime = performance.now();

      try {
        const result = method.apply(this, args);

        if (result instanceof Promise) {
          return result.then(
            (value) => {
              const duration = performance.now() - startTime;
              performanceMonitor.addMetric({
                name: `${target.constructor.name}.${propertyName}`,
                value: duration,
                timestamp: Date.now(),
                category,
                details: { className: target.constructor.name, methodName: propertyName, success: true },
              });
              return value;
            },
            (error) => {
              const duration = performance.now() - startTime;
              performanceMonitor.addMetric({
                name: `${target.constructor.name}.${propertyName}`,
                value: duration,
                timestamp: Date.now(),
                category,
                details: {
                  className: target.constructor.name,
                  methodName: propertyName,
                  success: false,
                  error: error.message,
                },
              });
              performanceMonitor.recordError("MethodError", error.message, category);
              throw error;
            },
          );
        } else {
          const duration = performance.now() - startTime;
          performanceMonitor.addMetric({
            name: `${target.constructor.name}.${propertyName}`,
            value: duration,
            timestamp: Date.now(),
            category,
            details: { className: target.constructor.name, methodName: propertyName, success: true },
          });
          return result;
        }
      } catch (error) {
        const duration = performance.now() - startTime;
        performanceMonitor.addMetric({
          name: `${target.constructor.name}.${propertyName}`,
          value: duration,
          timestamp: Date.now(),
          category,
          details: {
            className: target.constructor.name,
            methodName: propertyName,
            success: false,
            error: (error as Error).message,
          },
        });
        performanceMonitor.recordError("MethodError", (error as Error).message, category);
        throw error;
      }
    };

    return descriptor;
  };
}
