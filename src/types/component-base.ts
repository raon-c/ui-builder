// AIDEV-NOTE: Component 기본 타입 정의
// 빌더에서 사용하는 핵심 컴포넌트 타입들

import type { ComponentType } from "react";
import type { z } from "zod";

/**
 * 빌더에서 지원하는 컴포넌트 타입 목록
 * 새로운 컴포넌트 추가 시 이 타입에 추가해야 함
 */
export type BuilderComponentType =
  // Layout
  | "Container"
  | "Grid"
  | "Flex"
  | "Card"
  | "Modal"
  | "Drawer"
  | "Tabs"
  // Basic
  | "Text"
  | "Heading"
  | "Button"
  | "Link"
  | "Divider"
  | "Icon"
  // Form
  | "Input"
  | "Textarea"
  | "Select"
  | "Radio"
  | "Checkbox"
  | "Switch"
  | "NumberInput"
  | "DatePicker"
  | "Label"
  // Data Display
  | "Table"
  | "Tag"
  | "Badge"
  | "Avatar"
  // Feedback
  | "Alert"
  | "Toast"
  | "Spinner"
  | "Progress";

/**
 * 컴포넌트 카테고리 분류
 */
export type ComponentCategory = "Layout" | "Basic" | "Form" | "DataDisplay" | "Feedback";

/**
 * 컴포넌트 메타데이터
 * 빌더 UI에서 컴포넌트를 표시하고 관리하기 위한 정보
 */
export interface ComponentMetadata {
  /** 컴포넌트 타입 식별자 */
  type: BuilderComponentType;
  /** 사용자에게 표시되는 이름 */
  displayName: string;
  /** 컴포넌트 설명 */
  description: string;
  /** 카테고리 분류 */
  category: ComponentCategory;
  /** 아이콘 이름 (Lucide React 아이콘) */
  icon: string;
  /** 기본 props 값 */
  defaultProps: Record<string, unknown>;
  /** 자식 노드를 가질 수 있는지 여부 */
  canHaveChildren: boolean;
  /** 드래그 가능 여부 */
  draggable: boolean;
  /** 삭제 가능 여부 */
  deletable: boolean;
}

/**
 * 컴포넌트 속성 스키마
 * Zod 스키마를 기반으로 동적 폼 생성 및 런타임 검증
 */
export interface ComponentPropsSchema {
  /** 컴포넌트 타입 */
  type: BuilderComponentType;
  /** 속성 검증 스키마 (Zod) */
  schema: z.ZodSchema;
  /** UI 폼 생성을 위한 필드 메타데이터 */
  fields: ComponentFieldMetadata[];
}

/**
 * 폼 필드 메타데이터
 * 속성 편집기에서 각 필드를 어떻게 렌더링할지 정의
 */
export interface ComponentFieldMetadata {
  /** 필드 키 (props의 키와 일치) */
  key: string;
  /** 사용자에게 표시되는 라벨 */
  label: string;
  /** 필드 설명 (툴팁) */
  description?: string;
  /** 입력 타입 */
  inputType: "text" | "textarea" | "number" | "boolean" | "select" | "color" | "slider";
  /** select 타입일 경우 선택 옵션 */
  options?: Array<{ label: string; value: string | number | boolean }>;
  /** 필드 그룹 (탭 분리용) */
  group?: "content" | "style" | "behavior" | "advanced";
  /** 필드 순서 */
  order?: number;
}

/**
 * 스타일 변형 정의
 * PRD의 Variant & State 표준을 반영
 */
export interface StyleVariant {
  /** 변형 이름 (예: variant, size, color) */
  name: string;
  /** 사용자에게 표시되는 라벨 */
  label: string;
  /** 기본값 */
  defaultValue: string | number | boolean;
  /** 가능한 값들 */
  options: Array<{
    label: string;
    value: string | number | boolean;
    description?: string;
  }>;
}

/**
 * 컴포넌트 상태 정의
 * 동적 상태 (hover, active, disabled, error 등)
 */
export interface ComponentState {
  /** 상태 이름 */
  name: string;
  /** 사용자에게 표시되는 라벨 */
  label: string;
  /** 상태 타입 */
  type: "boolean" | "string" | "number";
  /** 기본값 */
  defaultValue: boolean | string | number;
  /** 설명 */
  description?: string;
}

/**
 * React 컴포넌트 래퍼
 * 실제 디자인 라이브러리 컴포넌트를 감싸는 인터페이스
 */
export interface ComponentWrapper {
  /** 컴포넌트 타입 */
  type: BuilderComponentType;
  /** 실제 React 컴포넌트 */
  component: ComponentType<Record<string, unknown>>;
  /** 메타데이터 */
  metadata: ComponentMetadata;
  /** 속성 스키마 */
  propsSchema: ComponentPropsSchema;
  /** 스타일 변형 정의 */
  variants?: StyleVariant[];
  /** 상태 정의 */
  states?: ComponentState[];
}
