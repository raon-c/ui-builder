"use client";

// AIDEV-NOTE: 프로젝트 Import/Export 관리 컴포넌트
// JSON 내보내기/가져오기, 스키마 검증, 버전 호환성 관리

import {
  AlertTriangle,
  CheckCircle,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProjectStore } from "@/store/projectStore";
import type { Project } from "@/types/project";
import { projectSchema } from "@/types/project";

interface ImportExportManagerProps {
  project: Project;
}

interface ImportResult {
  success: boolean;
  project?: Project;
  errors?: string[];
  warnings?: string[];
}

export function ImportExportManager({ project }: ImportExportManagerProps) {
  const { createProject, updateProject } = useProjectStore();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [exportedJson, setExportedJson] = useState("");
  const [importJson, setImportJson] = useState("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // JSON 내보내기
  const handleExport = () => {
    try {
      const exportData = {
        ...project,
        exportedAt: new Date().toISOString(),
        exportVersion: "1.0.0",
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      setExportedJson(jsonString);
      setIsExportDialogOpen(true);
    } catch (error) {
      console.error("Export failed:", error);
      alert("내보내기에 실패했습니다.");
    }
  };

  // JSON 파일로 다운로드
  const handleDownload = () => {
    try {
      const blob = new Blob([exportedJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.name.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("다운로드에 실패했습니다.");
    }
  };

  // 클립보드에 복사
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportedJson);
      alert("클립보드에 복사되었습니다!");
    } catch (error) {
      console.error("Copy failed:", error);
      alert("클립보드 복사에 실패했습니다.");
    }
  };

  // 파일에서 가져오기
  const handleFileImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setImportJson(content);
        setIsImportDialogOpen(true);
      }
    };
    reader.readAsText(file);
  };

  // JSON 가져오기 및 검증
  const handleImport = async () => {
    if (!importJson.trim()) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      // JSON 파싱
      let parsedData: any;
      try {
        parsedData = JSON.parse(importJson);
      } catch (error) {
        setImportResult({
          success: false,
          errors: ["유효하지 않은 JSON 형식입니다."],
        });
        return;
      }

      // 스키마 검증
      const validationResult = projectSchema.safeParse(parsedData);

      if (!validationResult.success) {
        const errors = validationResult.error.issues.map(
          (issue) => `${issue.path.join(".")}: ${issue.message}`,
        );
        setImportResult({
          success: false,
          errors: ["스키마 검증 실패:", ...errors],
        });
        return;
      }

      const importedProject = validationResult.data;
      const warnings: string[] = [];

      // 버전 호환성 검사
      if (importedProject.schemaVersion !== 1) {
        warnings.push(
          `스키마 버전 불일치 (가져온 버전: ${importedProject.schemaVersion}, 현재 버전: 1)`,
        );
      }

      // 중복 ID 검사 및 해결
      const { projects } = useProjectStore.getState();
      const existingProject = projects.find((p) => p.id === importedProject.id);

      if (existingProject) {
        warnings.push(
          "동일한 ID의 프로젝트가 이미 존재합니다. 새로운 ID로 생성됩니다.",
        );
      }

      setImportResult({
        success: true,
        project: importedProject,
        warnings: warnings.length > 0 ? warnings : undefined,
      });
    } catch (error) {
      setImportResult({
        success: false,
        errors: [
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
        ],
      });
    } finally {
      setIsImporting(false);
    }
  };

  // 가져오기 확정
  const handleConfirmImport = async () => {
    if (!importResult?.success || !importResult.project) return;

    try {
      const { projects } = useProjectStore.getState();
      const existingProject = projects.find(
        (p) => p.id === importResult.project!.id,
      );

      if (existingProject) {
        // 기존 프로젝트 업데이트 또는 새 프로젝트로 생성
        const shouldReplace = confirm(
          "동일한 ID의 프로젝트가 존재합니다. 덮어쓰시겠습니까?\n" +
            "취소를 누르면 새로운 프로젝트로 생성됩니다.",
        );

        if (shouldReplace) {
          await updateProject(importResult.project.id, {
            ...importResult.project,
            updatedAt: new Date().toISOString(),
          });
        } else {
          // 새 ID로 생성
          await createProject(
            `${importResult.project.name} (가져옴)`,
            "가져온 프로젝트",
          );
        }
      } else {
        // 새 프로젝트로 생성
        await createProject(importResult.project.name, "가져온 프로젝트");
      }

      setIsImportDialogOpen(false);
      setImportJson("");
      setImportResult(null);
      alert("프로젝트를 성공적으로 가져왔습니다!");
    } catch (error) {
      console.error("Import confirmation failed:", error);
      alert("프로젝트 가져오기에 실패했습니다.");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            가져오기/내보내기
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            JSON으로 내보내기
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleFileImport}>
            <Upload className="h-4 w-4 mr-2" />
            파일에서 가져오기
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            JSON 텍스트 가져오기
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />

      {/* 내보내기 다이얼로그 */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>프로젝트 내보내기</DialogTitle>
            <DialogDescription>
              프로젝트 데이터가 JSON 형식으로 내보내졌습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>JSON 데이터</Label>
              <Textarea
                value={exportedJson}
                readOnly
                className="h-64 font-mono text-xs"
                placeholder="내보내진 JSON 데이터가 여기에 표시됩니다..."
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCopyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              복사
            </Button>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              파일 다운로드
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 가져오기 다이얼로그 */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>프로젝트 가져오기</DialogTitle>
            <DialogDescription>
              JSON 형식의 프로젝트 데이터를 붙여넣어 주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>JSON 데이터</Label>
              <Textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                className="h-48 font-mono text-xs"
                placeholder="프로젝트 JSON 데이터를 여기에 붙여넣으세요..."
              />
            </div>

            {/* 검증 결과 */}
            {importResult && (
              <div
                className={`p-4 rounded-lg border ${
                  importResult.success
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {importResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={`font-medium ${
                      importResult.success ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {importResult.success ? "검증 성공" : "검증 실패"}
                  </span>
                </div>

                {importResult.errors && (
                  <div className="space-y-1">
                    {importResult.errors.map((error, index) => (
                      <div
                        key={`error-${index}-${error.slice(0, 20)}`}
                        className="text-sm text-red-700"
                      >
                        • {error}
                      </div>
                    ))}
                  </div>
                )}

                {importResult.warnings && (
                  <div className="space-y-1 mt-2">
                    <div className="text-sm font-medium text-yellow-800">
                      경고:
                    </div>
                    {importResult.warnings.map((warning, index) => (
                      <div
                        key={`warning-${index}-${warning.slice(0, 20)}`}
                        className="text-sm text-yellow-700"
                      >
                        • {warning}
                      </div>
                    ))}
                  </div>
                )}

                {importResult.success && importResult.project && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <div className="text-sm">
                      <strong>프로젝트:</strong> {importResult.project.name}
                      <br />
                      <strong>화면 수:</strong>{" "}
                      {importResult.project.screens.length}개<br />
                      <strong>버전:</strong> {importResult.project.version}
                      <br />
                      <strong>생성일:</strong>{" "}
                      {new Date(
                        importResult.project.createdAt,
                      ).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsImportDialogOpen(false);
                setImportJson("");
                setImportResult(null);
              }}
            >
              취소
            </Button>
            {!importResult && (
              <Button
                onClick={handleImport}
                disabled={!importJson.trim() || isImporting}
              >
                {isImporting ? "검증 중..." : "검증"}
              </Button>
            )}
            {importResult?.success && (
              <Button onClick={handleConfirmImport}>가져오기</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
