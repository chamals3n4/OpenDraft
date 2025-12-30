"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  createTag,
  updateTag,
  deleteTag,
  type Tag,
  type TagFormState,
} from "./actions";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import slugify from "slugify";

interface TagSheetProps {
  tag?: Tag | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactElement;
}

const initialState: TagFormState = { error: null, success: false };

export function TagSheet({ tag, open, onOpenChange, trigger }: TagSheetProps) {
  const isEdit = !!tag;

  const [createState, createAction, isCreating] = useActionState(
    createTag,
    initialState
  );
  const [updateState, updateAction, isUpdating] = useActionState(
    updateTag,
    initialState
  );
  const [isDeleting, startDeleteTransition] = useTransition();

  const state = isEdit ? updateState : createState;
  const isPending = isEdit ? isUpdating : isCreating;

  const [internalOpen, setInternalOpen] = useState(false);
  const [name, setName] = useState(tag?.name || "");
  const [slug, setSlug] = useState(tag?.slug || "");
  const [slugEditable, setSlugEditable] = useState(!!tag?.slug);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  useEffect(() => {
    if (tag) {
      setName(tag.name);
      setSlug(tag.slug);
      setSlugEditable(true);
      setShowDeleteConfirm(false);
    } else {
      setName("");
      setSlug("");
      setSlugEditable(false);
    }
  }, [tag]);

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        setIsOpen(false);
        if (!isEdit) {
          setName("");
          setSlug("");
          setSlugEditable(false);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.success, setIsOpen, isEdit]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);

    if (!slugEditable) {
      setSlug(
        slugify(newName, {
          lower: true,
          strict: true,
          trim: true,
        })
      );
    }
  };

  const handleDelete = () => {
    if (!tag) return;
    startDeleteTransition(async () => {
      const result = await deleteTag(tag.id);
      if (result.success) {
        setIsOpen(false);
      }
    });
  };

  const sheetContent = (
    <SheetContent className="overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <SheetHeader>
        <SheetTitle>{isEdit ? "Edit Tag" : "Add New Tag"}</SheetTitle>
        <SheetDescription>
          {isEdit
            ? "Update tag details."
            : "Create a new tag for labeling content."}
        </SheetDescription>
      </SheetHeader>
      <form
        action={isEdit ? updateAction : createAction}
        className="flex flex-col gap-4 px-4 pb-4"
      >
        {isEdit && <input type="hidden" name="id" value={tag.id} />}
        <FieldGroup>
          {state.error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          {state.success && (
            <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-600 dark:text-emerald-400">
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  strokeWidth={2}
                  className="size-4"
                />
                {state.message}
              </div>
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="React"
              value={name}
              onChange={handleNameChange}
              required
              disabled={isPending || state.success}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="slug">Slug</FieldLabel>
            <div className="flex gap-2">
              <Input
                id="slug"
                name="slug"
                type="text"
                placeholder="react"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                disabled={!slugEditable || isPending || state.success}
                className="flex-1"
              />
              {!slugEditable && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSlugEditable(true)}
                  disabled={isPending || state.success}
                >
                  Edit
                </Button>
              )}
            </div>
            <FieldDescription>URL-friendly identifier</FieldDescription>
          </Field>

          <Button
            type="submit"
            className="mt-2"
            disabled={isPending || state.success || isDeleting}
          >
            {isPending
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
              ? "Save Changes"
              : "Create Tag"}
          </Button>
        </FieldGroup>
      </form>

      {isEdit && (
        <div className="px-4 pb-4 mt-auto border-t pt-4">
          {!showDeleteConfirm ? (
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isPending || isDeleting}
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
              Delete Tag
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Are you sure? This will remove the tag from all content.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </SheetContent>
  );

  if (trigger) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger render={trigger} />
        {sheetContent}
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {sheetContent}
    </Sheet>
  );
}
