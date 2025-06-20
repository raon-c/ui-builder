// AIDEV-NOTE: ID 생성 유틸리티 - nanoid 기반 짧고 안전한 식별자 생성
// 프로젝트, 화면, 노드 ID 생성에 사용

import { nanoid } from "nanoid";

/**
 * nanoid 생성 (기본 8자리, 커스텀 길이 지원)
 * URL-safe하고 충돌 확률이 낮은 식별자
 *
 * @param length - 생성할 ID 길이 (기본값: 8)
 * @example generateId() // "LK8d3A2B"
 * @example generateId(12) // "LK8d3A2BxYz9"
 */
export function generateId(length = 8): string {
  return nanoid(length);
}

/**
 * 프로젝트 ID 생성 (접두사 포함)
 *
 * @example "proj_LK8d3A2B"
 */
export function generateProjectId(): string {
  return `proj_${nanoid(8)}`;
}

/**
 * 화면 ID 생성 (접두사 포함)
 *
 * @example "scr_x1Y2Z3W4"
 */
export function generateScreenId(): string {
  return `scr_${nanoid(8)}`;
}

/**
 * 노드 ID 생성 (접두사 포함)
 *
 * @example "node_a1B2c3D4"
 */
export function generateNodeId(): string {
  return `node_${nanoid(8)}`;
}

/**
 * 공유 슬러그 생성 (7자리)
 * 읽기 전용 공개 링크용
 *
 * @example "8FgkP2q"
 */
export function generateShareSlug(): string {
  return nanoid(7);
}
