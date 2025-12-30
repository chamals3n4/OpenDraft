"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { updateContentStatus, updateContentVisibility } from "../actions";
import { toast } from "sonner";

interface Content {
  id: string;
  title: string;
  status: string;
  visibility: string;
}

interface ContentQuickEditDialogProps {
  content: Content | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContentQuickEditDialog({
  content,
  open,
  onOpenChange,
}: ContentQuickEditDialogProps) {
  const router = useRouter();
  const [status, setStatus] = useState(content?.status || "draft");
  const [visibility, setVisibility] = useState(content?.visibility || "public");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (content) {
      setStatus(content.status);
      setVisibility(content.visibility);
    }
  }, [content]);

  const handleSave = async () => {
    if (!content) return;

    setIsUpdating(true);
    try {
      // Update status if changed
      if (status !== content.status) {
        const statusResult = await updateContentStatus(
          content.id,
          status as any
        );
        if (statusResult.error) {
          toast.error(statusResult.error);
          setIsUpdating(false);
          return;
        }
      }

      // Update visibility if changed
      if (visibility !== content.visibility) {
        const visibilityResult = await updateContentVisibility(
          content.id,
          visibility as any
        );
        if (visibilityResult.error) {
          toast.error(visibilityResult.error);
          setIsUpdating(false);
          return;
        }
      }

      toast.success("Content updated successfully");
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update content");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!content) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Edit</DialogTitle>
          <DialogDescription>
            Update status and visibility for "{content.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Status
            </Label>
            <Select
              value={status}
              onValueChange={(value) => {
                if (value !== null) {
                  setStatus(value);
                }
              }}
            >
              <SelectTrigger id="status" className="h-11 text-base w-full">
                <SelectValue>Select status</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility" className="text-sm font-medium">
              Visibility
            </Label>
            <Select
              value={visibility}
              onValueChange={(value) => {
                if (value !== null) {
                  setVisibility(value);
                }
              }}
            >
              <SelectTrigger id="visibility" className="h-11 text-base w-full">
                <SelectValue>Select visibility</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="members_only">Members Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating && (
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="animate-spin mr-2"
                  strokeWidth={2}
                />
              )}
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
