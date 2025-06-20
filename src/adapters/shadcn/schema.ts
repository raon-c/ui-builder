// AIDEV-NOTE: shadcn/ui 컴포넌트 스키마 정의 - Zod 기반 런타임 검증
// 모든 설치된 컴포넌트의 실제 variants와 PRD 표준을 반영

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
 * Input 컴포넌트 스키마
 */
export const inputSchema = z.object({
  type: z
    .enum(["text", "email", "password", "number", "tel", "url", "search"])
    .default("text"),
  placeholder: z.string().optional().default(""),
  disabled: z.boolean().optional().default(false),
  readOnly: z.boolean().optional().default(false),
  required: z.boolean().optional().default(false),
  value: z.string().optional().default(""),
});

/**
 * Card 컴포넌트 스키마
 */
export const cardSchema = z.object({
  // Card는 주로 컨테이너 역할이므로 기본적인 props만 정의
  className: z.string().optional().default(""),
});

/**
 * CardHeader 컴포넌트 스키마
 */
export const cardHeaderSchema = z.object({
  className: z.string().optional().default(""),
});

/**
 * CardTitle 컴포넌트 스키마
 */
export const cardTitleSchema = z.object({
  children: z.string().default("Card Title"),
  className: z.string().optional().default(""),
});

/**
 * CardDescription 컴포넌트 스키마
 */
export const cardDescriptionSchema = z.object({
  children: z.string().default("Card description"),
  className: z.string().optional().default(""),
});

/**
 * CardContent 컴포넌트 스키마
 */
export const cardContentSchema = z.object({
  className: z.string().optional().default(""),
});

/**
 * Select 컴포넌트 스키마
 */
export const selectSchema = z.object({
  placeholder: z.string().default("Select an option"),
  disabled: z.boolean().optional().default(false),
  required: z.boolean().optional().default(false),
  value: z.string().optional().default(""),
});

/**
 * SelectTrigger 컴포넌트 스키마
 */
export const selectTriggerSchema = z.object({
  size: z.enum(["sm", "default"]).default("default"),
  className: z.string().optional().default(""),
});

/**
 * Checkbox 컴포넌트 스키마
 */
export const checkboxSchema = z.object({
  checked: z.boolean().optional().default(false),
  disabled: z.boolean().optional().default(false),
  required: z.boolean().optional().default(false),
});

/**
 * Switch 컴포넌트 스키마
 */
export const switchSchema = z.object({
  checked: z.boolean().optional().default(false),
  disabled: z.boolean().optional().default(false),
});

/**
 * Badge 컴포넌트 스키마
 */
export const badgeSchema = z.object({
  children: z.string().default("Badge"),
  variant: z
    .enum(["default", "secondary", "destructive", "outline"])
    .default("default"),
  asChild: z.boolean().optional().default(false),
});

/**
 * Avatar 컴포넌트 스키마
 */
export const avatarSchema = z.object({
  className: z.string().optional().default(""),
});

/**
 * AvatarImage 컴포넌트 스키마
 */
export const avatarImageSchema = z.object({
  src: z.string().default(""),
  alt: z.string().default("Avatar"),
});

/**
 * AvatarFallback 컴포넌트 스키마
 */
export const avatarFallbackSchema = z.object({
  children: z.string().default("A"),
});

/**
 * Label 컴포넌트 스키마
 */
export const labelSchema = z.object({
  children: z.string().default("Label"),
  htmlFor: z.string().optional().default(""),
});

// =============================================================================
// Field Metadata for Property Editor
// =============================================================================

/**
 * Button 필드 메타데이터
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
 * Input 필드 메타데이터
 */
export const inputFieldMetadata: ComponentFieldMetadata[] = [
  {
    key: "type",
    label: "입력 타입",
    description: "입력 필드의 타입",
    inputType: "select",
    options: [
      { label: "텍스트", value: "text" },
      { label: "이메일", value: "email" },
      { label: "비밀번호", value: "password" },
      { label: "숫자", value: "number" },
      { label: "전화번호", value: "tel" },
      { label: "URL", value: "url" },
      { label: "검색", value: "search" },
    ],
    group: "content",
    order: 1,
  },
  {
    key: "placeholder",
    label: "플레이스홀더",
    description: "입력 필드의 힌트 텍스트",
    inputType: "text",
    group: "content",
    order: 2,
  },
  {
    key: "value",
    label: "기본값",
    description: "입력 필드의 기본값",
    inputType: "text",
    group: "content",
    order: 3,
  },
  {
    key: "disabled",
    label: "비활성화",
    description: "입력 필드를 비활성화",
    inputType: "boolean",
    group: "behavior",
    order: 4,
  },
  {
    key: "readOnly",
    label: "읽기 전용",
    description: "입력 필드를 읽기 전용으로 설정",
    inputType: "boolean",
    group: "behavior",
    order: 5,
  },
  {
    key: "required",
    label: "필수 입력",
    description: "필수 입력 필드로 설정",
    inputType: "boolean",
    group: "behavior",
    order: 6,
  },
];

/**
 * Badge 필드 메타데이터
 */
export const badgeFieldMetadata: ComponentFieldMetadata[] = [
  {
    key: "children",
    label: "뱃지 텍스트",
    description: "뱃지에 표시될 텍스트",
    inputType: "text",
    group: "content",
    order: 1,
  },
  {
    key: "variant",
    label: "스타일 변형",
    description: "뱃지의 시각적 스타일",
    inputType: "select",
    options: [
      { label: "기본 (Primary)", value: "default" },
      { label: "보조 (Secondary)", value: "secondary" },
      { label: "위험 (Destructive)", value: "destructive" },
      { label: "외곽선 (Outline)", value: "outline" },
    ],
    group: "style",
    order: 2,
  },
];

/**
 * Checkbox 필드 메타데이터
 */
export const checkboxFieldMetadata: ComponentFieldMetadata[] = [
  {
    key: "checked",
    label: "체크 상태",
    description: "체크박스의 기본 체크 상태",
    inputType: "boolean",
    group: "content",
    order: 1,
  },
  {
    key: "disabled",
    label: "비활성화",
    description: "체크박스를 비활성화",
    inputType: "boolean",
    group: "behavior",
    order: 2,
  },
  {
    key: "required",
    label: "필수 선택",
    description: "필수 선택 항목으로 설정",
    inputType: "boolean",
    group: "behavior",
    order: 3,
  },
];

/**
 * Switch 필드 메타데이터
 */
export const switchFieldMetadata: ComponentFieldMetadata[] = [
  {
    key: "checked",
    label: "스위치 상태",
    description: "스위치의 기본 상태",
    inputType: "boolean",
    group: "content",
    order: 1,
  },
  {
    key: "disabled",
    label: "비활성화",
    description: "스위치를 비활성화",
    inputType: "boolean",
    group: "behavior",
    order: 2,
  },
];

/**
 * Avatar 필드 메타데이터
 */
export const avatarFieldMetadata: ComponentFieldMetadata[] = [
  {
    key: "src",
    label: "이미지 URL",
    description: "아바타 이미지 URL",
    inputType: "text",
    group: "content",
    order: 1,
  },
  {
    key: "alt",
    label: "대체 텍스트",
    description: "이미지 대체 텍스트",
    inputType: "text",
    group: "content",
    order: 2,
  },
  {
    key: "fallback",
    label: "폴백 텍스트",
    description: "이미지 로드 실패 시 표시될 텍스트",
    inputType: "text",
    group: "content",
    order: 3,
  },
];

/**
 * Label 필드 메타데이터
 */
export const labelFieldMetadata: ComponentFieldMetadata[] = [
  {
    key: "children",
    label: "라벨 텍스트",
    description: "라벨에 표시될 텍스트",
    inputType: "text",
    group: "content",
    order: 1,
  },
  {
    key: "htmlFor",
    label: "연결된 요소 ID",
    description: "라벨이 연결될 폼 요소의 ID",
    inputType: "text",
    group: "behavior",
    order: 2,
  },
];

// =============================================================================
// Component Props Schemas
// =============================================================================

/**
 * Button 컴포넌트 props 스키마
 */
export const buttonPropsSchema: ComponentPropsSchema = {
  type: "Button",
  schema: buttonSchema,
  fields: buttonFieldMetadata,
};

/**
 * Input 컴포넌트 props 스키마
 */
export const inputPropsSchema: ComponentPropsSchema = {
  type: "Input",
  schema: inputSchema,
  fields: inputFieldMetadata,
};

/**
 * Badge 컴포넌트 props 스키마
 */
export const badgePropsSchema: ComponentPropsSchema = {
  type: "Badge",
  schema: badgeSchema,
  fields: badgeFieldMetadata,
};

/**
 * Checkbox 컴포넌트 props 스키마
 */
export const checkboxPropsSchema: ComponentPropsSchema = {
  type: "Checkbox",
  schema: checkboxSchema,
  fields: checkboxFieldMetadata,
};

/**
 * Switch 컴포넌트 props 스키마
 */
export const switchPropsSchema: ComponentPropsSchema = {
  type: "Switch",
  schema: switchSchema,
  fields: switchFieldMetadata,
};

/**
 * Avatar 컴포넌트 props 스키마
 */
export const avatarPropsSchema: ComponentPropsSchema = {
  type: "Avatar",
  schema: avatarSchema,
  fields: avatarFieldMetadata,
};

/**
 * Label 컴포넌트 props 스키마
 */
export const labelPropsSchema: ComponentPropsSchema = {
  type: "Label",
  schema: labelSchema,
  fields: labelFieldMetadata,
};

// 타입 추론
export type ButtonProps = z.infer<typeof buttonSchema>;
export type InputProps = z.infer<typeof inputSchema>;
export type CardProps = z.infer<typeof cardSchema>;
export type BadgeProps = z.infer<typeof badgeSchema>;
export type CheckboxProps = z.infer<typeof checkboxSchema>;
export type SwitchProps = z.infer<typeof switchSchema>;
export type AvatarProps = z.infer<typeof avatarSchema>;
export type LabelProps = z.infer<typeof labelSchema>;
