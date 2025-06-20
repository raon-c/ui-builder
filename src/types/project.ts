// AIDEV-NOTE: Project 관련 핵심 타입 정의 - ARCHITECTURE.md §5.2 기반
// 기획자를 위한 노코드 빌더의 프로젝트 데이터 구조

import { z } from "zod";

/**
 * 컴포넌트 변형(Variant)과 동적 State를 구분해 보관
 * @example { variant: "primary", state: { disabled: true, loading: false } }
 */
export interface NodeStyle {
  /** 컴포넌트 시각·정책적 변형 옵션 (예: primary, secondary, ghost) */
  variant?: string;
  /** 사용자 인터랙션/비즈니스 로직에 따른 동적 상태 (예: disabled, error, loading) */
  state?: Record<string, boolean>;
}

/**
 * 노드 메타데이터 - 편집기 전용 정보
 */
export interface NodeMeta {
  /** true이면 캔버스에서 선택/편집 불가 */
  locked?: boolean;
  /** 프리뷰에서 비노출 (기획서 주석용) */
  hidden?: boolean;
  /** 간단 메모 */
  note?: string;
}

/**
 * 캔버스에 배치된 단일 UI 요소
 * 트리 구조의 최소 단위로 type, props, children을 가짐
 */
export interface CanvasNode {
  /** nanoid(8) 고유 식별자 */
  id: string;
  /** 어댑터에 등록된 컴포넌트 타입 (예: "Button", "Input", "Card") */
  type: string;
  /** 디자인 라이브러리로 전달되는 실제 props */
  props: Record<string, unknown>;
  /** Variant / State 분리 저장 */
  style?: NodeStyle;
  /** 자식 노드들 */
  children: CanvasNode[];
  /** 편집기 내부 편의 정보 (저장 시 optional) */
  meta?: NodeMeta;
}

/**
 * 사용자 플로우를 구성하는 개별 페이지
 * 하나의 최상위 CanvasNode 루트 노드를 가짐
 */
export interface Screen {
  /** nanoid(8) 고유 식별자 */
  id: string;
  /** 화면 이름 */
  name: string;
  /** 대시보드·네비게이션 정렬용 순서 */
  order: number;
  /** 미래형 반응형 대비 뷰포트 타입 */
  viewport: "desktop" | "tablet" | "mobile";
  /** 배경색 (Hex 또는 preset key) */
  background?: string;
  /** 항상 루트(Container) 노드 1개 */
  content: CanvasNode;
}

/**
 * 협업자 정보
 */
export interface Collaborator {
  /** e-mail hash 또는 user id */
  id: string;
  /** 사용자 이름 */
  name: string;
  /** 권한 레벨 */
  role: "owner" | "editor" | "viewer";
}

/**
 * 프로젝트 설정
 */
export interface ProjectSettings {
  /** 현재 적용된 어댑터 key (예: "shadcn", "mui") */
  designLibrary: string;
  /** 다크모드 등 글로벌 스타일 preset */
  theme?: string;
  /** 읽기 전용 공개 링크 slug (7자리) */
  shareSlug?: string;
}

/**
 * 하나의 기획 문서를 구성하는 최상위 단위
 * 여러 화면(Screen)을 포함하며 프로젝트 메타데이터를 관리
 */
export interface Project {
  /** 데이터 구조 버전 - 마이그레이션 기준 */
  schemaVersion: number;
  /** nanoid(8) 고유 식별자 */
  id: string;
  /** 프로젝트 이름 */
  name: string;
  /** 사용자가 명시적으로 찍는 문서 버전 (Semantic optional) */
  version: string;
  /** 화면 목록 */
  screens: Screen[];
  /** 협업자 목록 (optional) */
  collaborators?: Collaborator[];
  /** 프로젝트 설정 */
  settings: ProjectSettings;
  /** 생성 일시 (ISO 8601) */
  createdAt: string;
  /** 수정 일시 (ISO 8601) */
  updatedAt: string;
}

// AIDEV-NOTE: Zod 스키마 정의 - 런타임 타입 검증 및 폼 생성용
// PRD 요구사항에 따른 컴포넌트 variant/state 표준 반영

/**
 * NodeStyle Zod 스키마
 */
export const nodeStyleSchema = z.object({
  variant: z.string().optional(),
  state: z.record(z.boolean()).optional(),
});

/**
 * NodeMeta Zod 스키마
 */
export const nodeMetaSchema = z.object({
  locked: z.boolean().optional(),
  hidden: z.boolean().optional(),
  note: z.string().optional(),
});

/**
 * CanvasNode Zod 스키마 (재귀 구조)
 */
export const canvasNodeSchema: z.ZodType<CanvasNode> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    type: z.string().min(1),
    props: z.record(z.unknown()),
    style: nodeStyleSchema.optional(),
    children: z.array(canvasNodeSchema),
    meta: nodeMetaSchema.optional(),
  }),
);

/**
 * Screen Zod 스키마
 */
export const screenSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  order: z.number().int().min(0),
  viewport: z.enum(["desktop", "tablet", "mobile"]),
  background: z.string().optional(),
  content: canvasNodeSchema,
});

/**
 * Collaborator Zod 스키마
 */
export const collaboratorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.enum(["owner", "editor", "viewer"]),
});

/**
 * ProjectSettings Zod 스키마
 */
export const projectSettingsSchema = z.object({
  designLibrary: z.string().min(1),
  theme: z.string().optional(),
  shareSlug: z.string().length(7).optional(),
});

/**
 * Project Zod 스키마
 */
export const projectSchema = z.object({
  schemaVersion: z.number().int().min(1),
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  screens: z.array(screenSchema),
  collaborators: z.array(collaboratorSchema).optional(),
  settings: projectSettingsSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// 타입 추론을 위한 export
export type NodeStyleSchema = z.infer<typeof nodeStyleSchema>;
export type NodeMetaSchema = z.infer<typeof nodeMetaSchema>;
export type CanvasNodeSchema = z.infer<typeof canvasNodeSchema>;
export type ScreenSchema = z.infer<typeof screenSchema>;
export type CollaboratorSchema = z.infer<typeof collaboratorSchema>;
export type ProjectSettingsSchema = z.infer<typeof projectSettingsSchema>;
export type ProjectSchema = z.infer<typeof projectSchema>;
