// AIDEV-NOTE: shadcn/ui 컴포넌트 스키마 정의 - Zod 기반 런타임 검증
// Button 컴포넌트의 실제 variants와 PRD 표준을 반영

import { z } from "zod";
import type {
  ComponentFieldMetadata,
  ComponentPropsSchema,
} from "@/types/component";

/**
 * Button 컴포넌트 스키마
 * shadcn/ui button.tsx의 실제 variants와 일치
 */
export const buttonSchema = z.object({
  // 기본 props
  children: z.string().default("Button"),
  disabled: z.boolean().optional().default(false),

  // shadcn/ui 고유 variants
  variant: z
    .enum(["default", "destructive", "outline", "secondary", "ghost", "link"])
    .default("default"),
  size: z.enum(["default", "sm", "lg", "icon"]).default("default"),

  // 추가 props
  asChild: z.boolean().optional().default(false),
  type: z.enum(["button", "submit", "reset"]).optional().default("button"),
});

/**
 * Button 필드 메타데이터
 * 속성 편집기에서 사용할 UI 정보
 */
export const buttonFieldMetadata: ComponentFieldMetadata[] = [
  {
    key: "children",
    label: "버튼 텍스트",
    description: "버튼에 표시될 텍스트",
    inputType: "text",
    group: "content",
    order: 1,
  },
  {
    key: "variant",
    label: "스타일 변형",
    description: "버튼의 시각적 스타일",
    inputType: "select",
    options: [
      { label: "기본 (Primary)", value: "default" },
      { label: "보조 (Secondary)", value: "secondary" },
      { label: "위험 (Destructive)", value: "destructive" },
      { label: "외곽선 (Outline)", value: "outline" },
      { label: "고스트 (Ghost)", value: "ghost" },
      { label: "링크 (Link)", value: "link" },
    ],
    group: "style",
    order: 2,
  },
  {
    key: "size",
    label: "크기",
    description: "버튼의 크기",
    inputType: "select",
    options: [
      { label: "작게 (Small)", value: "sm" },
      { label: "기본 (Default)", value: "default" },
      { label: "크게 (Large)", value: "lg" },
      { label: "아이콘 (Icon)", value: "icon" },
    ],
    group: "style",
    order: 3,
  },
  {
    key: "disabled",
    label: "비활성화",
    description: "버튼을 비활성화 상태로 설정",
    inputType: "boolean",
    group: "behavior",
    order: 4,
  },
  {
    key: "type",
    label: "버튼 타입",
    description: "HTML 버튼 타입",
    inputType: "select",
    options: [
      { label: "일반 버튼", value: "button" },
      { label: "제출 (Submit)", value: "submit" },
      { label: "초기화 (Reset)", value: "reset" },
    ],
    group: "behavior",
    order: 5,
  },
];

/**
 * Button 컴포넌트 props 스키마
 */
export const buttonPropsSchema: ComponentPropsSchema = {
  type: "Button",
  schema: buttonSchema,
  fields: buttonFieldMetadata,
};

// 타입 추론
export type ButtonProps = z.infer<typeof buttonSchema>;
