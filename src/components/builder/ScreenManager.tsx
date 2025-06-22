"use client";

// AIDEV-NOTE: 화면 관리 컴포넌트 - 화면 추가/삭제/이름변경/순서변경/복사 기능
// 드래그 앤 드롭으로 화면 순서 변경, 컨텍스트 메뉴로 화면 관리

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, Edit, GripVertical, Monitor, MoreVertical, Plus, Smartphone, Tablet, Trash2 } from "lucide-react";
import { useId, useState } from "react";
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
import { useProjectStore } from "@/store/projectStore";
import type { Project, Screen } from "@/types/project";

interface ScreenManagerProps {
  project: Project;
  selectedScreenId: string | null;
  onScreenSelect: (screenId: string) => void;
}

interface ScreenItemProps {
  screen: Screen;
  isSelected: boolean;
  onSelect: () => void;
  onRename: (id: string, newName: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

// 뷰포트 아이콘 매핑
const viewportIcons = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
};

export function ScreenManager({ project, selectedScreenId, onScreenSelect }: ScreenManagerProps) {
  const { addScreen, updateScreen, deleteScreen, reorderScreens, duplicateScreen } = useProjectStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newScreenName, setNewScreenName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const screenNameId = useId();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // 화면 추가
  const handleAddScreen = async () => {
    if (!newScreenName.trim()) return;

    setIsLoading(true);
    try {
      await addScreen(project.id, newScreenName.trim());
      setNewScreenName("");
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to add screen:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 화면 이름 변경
  const handleRenameScreen = async (screenId: string, newName: string) => {
    if (!newName.trim()) return;

    try {
      await updateScreen(project.id, screenId, { name: newName.trim() });
    } catch (error) {
      console.error("Failed to rename screen:", error);
    }
  };

  // 화면 복사
  const handleDuplicateScreen = async (screenId: string) => {
    try {
      await duplicateScreen(project.id, screenId);
    } catch (error) {
      console.error("Failed to duplicate screen:", error);
    }
  };

  // 화면 삭제
  const handleDeleteScreen = async (screenId: string) => {
    if (project.screens.length <= 1) {
      alert("최소 하나의 화면은 유지되어야 합니다.");
      return;
    }

    if (confirm("정말로 이 화면을 삭제하시겠습니까?")) {
      try {
        await deleteScreen(project.id, screenId);

        // 삭제된 화면이 현재 선택된 화면이면 첫 번째 화면으로 이동
        if (selectedScreenId === screenId && project.screens.length > 1) {
          const remainingScreen = project.screens.find((s) => s.id !== screenId);
          if (remainingScreen) {
            onScreenSelect(remainingScreen.id);
          }
        }
      } catch (error) {
        console.error("Failed to delete screen:", error);
      }
    }
  };

  // 드래그 앤 드롭으로 화면 순서 변경
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = project.screens.findIndex((s) => s.id === active.id);
    const newIndex = project.screens.findIndex((s) => s.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      try {
        await reorderScreens(project.id, oldIndex, newIndex);
      } catch (error) {
        console.error("Failed to reorder screens:", error);
      }
    }
  };

  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">화면 목록</h3>
        <Button variant="outline" size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-3 w-3 mr-1" />
          추가
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={project.screens.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {project.screens.map((screen) => (
              <ScreenItem
                key={screen.id}
                screen={screen}
                isSelected={selectedScreenId === screen.id}
                onSelect={() => onScreenSelect(screen.id)}
                onRename={handleRenameScreen}
                onDuplicate={handleDuplicateScreen}
                onDelete={handleDeleteScreen}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* 화면 추가 다이얼로그 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 화면 추가</DialogTitle>
            <DialogDescription>새로운 화면의 이름을 입력해주세요.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor={screenNameId}>화면 이름</Label>
              <Input
                id={screenNameId}
                value={newScreenName}
                onChange={(e) => setNewScreenName(e.target.value)}
                placeholder="예: 로그인 화면"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading) {
                    handleAddScreen();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setNewScreenName("");
              }}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button onClick={handleAddScreen} disabled={!newScreenName.trim() || isLoading}>
              {isLoading ? "추가 중..." : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ScreenItem({ screen, isSelected, onSelect, onRename, onDuplicate, onDelete }: ScreenItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renamingValue, setRenamingValue] = useState(screen.name);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: screen.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const ViewportIcon = viewportIcons[screen.viewport] || Monitor;

  const handleRenameSubmit = () => {
    if (renamingValue.trim() && renamingValue !== screen.name) {
      onRename(screen.id, renamingValue.trim());
    }
    setIsRenaming(false);
    setRenamingValue(screen.name);
  };

  const handleRenameCancel = () => {
    setIsRenaming(false);
    setRenamingValue(screen.name);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 px-2 py-2 rounded-lg border transition-colors ${
        isSelected
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background border-transparent hover:bg-muted"
      }`}
    >
      {/* 드래그 핸들 */}
      <button
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-background/10 rounded"
        aria-label="화면 순서 변경"
      >
        <GripVertical className="h-3 w-3" />
      </button>

      {/* 뷰포트 아이콘 */}
      <ViewportIcon className="h-3 w-3 flex-shrink-0" />

      {/* 화면 이름 */}
      <div className="flex-1 min-w-0">
        {isRenaming ? (
          <Input
            value={renamingValue}
            onChange={(e) => setRenamingValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRenameSubmit();
              } else if (e.key === "Escape") {
                handleRenameCancel();
              }
            }}
            className="h-6 text-xs"
            autoFocus
          />
        ) : (
          <button onClick={onSelect} className="w-full text-left text-sm truncate">
            {screen.name}
          </button>
        )}
      </div>

      {/* 더보기 메뉴 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => setIsRenaming(true)}>
            <Edit className="h-3 w-3 mr-2" />
            이름 변경
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDuplicate(screen.id)}>
            <Copy className="h-3 w-3 mr-2" />
            복사
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onDelete(screen.id)} className="text-destructive focus:text-destructive">
            <Trash2 className="h-3 w-3 mr-2" />
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
