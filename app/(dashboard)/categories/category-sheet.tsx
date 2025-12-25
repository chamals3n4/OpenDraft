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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
  type CategoryFormState,
} from "./actions";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import slugify from "slugify";

interface CategorySheetProps {
  category?: Category | null;
  categories: Category[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const initialState: CategoryFormState = { error: null, success: false };

export function CategorySheet({
  category,
  categories,
  open,
  onOpenChange,
  trigger,
}: CategorySheetProps) {
  const isEdit = !!category;

  const [createState, createAction, isCreating] = useActionState(
    createCategory,
    initialState
  );
  const [updateState, updateAction, isUpdating] = useActionState(
    updateCategory,
    initialState
  );
  const [isDeleting, startDeleteTransition] = useTransition();

  const state = isEdit ? updateState : createState;
  const isPending = isEdit ? isUpdating : isCreating;

  const [internalOpen, setInternalOpen] = useState(false);
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [slugEditable, setSlugEditable] = useState(!!category?.slug);
  const [selectedParent, setSelectedParent] = useState<string>(
    category?.parent_id || ""
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const availableParents = categories.filter((c) => c.id !== category?.id);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setSlugEditable(true);
      setSelectedParent(category.parent_id || "");
      setShowDeleteConfirm(false);
    } else {
      setName("");
      setSlug("");
      setSlugEditable(false);
      setSelectedParent("");
    }
  }, [category]);

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        setIsOpen(false);
        if (!isEdit) {
          setName("");
          setSlug("");
          setSlugEditable(false);
          setSelectedParent("");
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

  const handleParentChange = (value: string | null) => {
    setSelectedParent(value || "");
  };

  const handleDelete = () => {
    if (!category) return;
    startDeleteTransition(async () => {
      const result = await deleteCategory(category.id);
      if (result.success) {
        setIsOpen(false);
      }
    });
  };

  const sheetContent = (
    <SheetContent className="overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <SheetHeader>
        <SheetTitle>{isEdit ? "Edit Category" : "Add New Category"}</SheetTitle>
        <SheetDescription>
          {isEdit
            ? "Update category details."
            : "Create a new category for organizing content."}
        </SheetDescription>
      </SheetHeader>
      <form
        action={isEdit ? updateAction : createAction}
        className="flex flex-col gap-4 px-4 pb-4"
      >
        {isEdit && <input type="hidden" name="id" value={category.id} />}
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
              placeholder="Technology"
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
                placeholder="technology"
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

          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              name="description"
              placeholder="A brief description of this category..."
              defaultValue={category?.description || ""}
              disabled={isPending || state.success}
              rows={3}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="parentId">Parent Category</FieldLabel>
            <Select
              name="parentId"
              value={selectedParent}
              onValueChange={handleParentChange}
              disabled={isPending || state.success}
            >
              <SelectTrigger id="parentId">
                <SelectValue placeholder="None (top-level)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None (top-level)</SelectItem>
                {availableParents.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>Optional parent for hierarchy</FieldDescription>
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
              : "Create Category"}
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
              Delete Category
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Are you sure? This cannot be undone.
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
