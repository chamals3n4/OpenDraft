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
  createUser,
  updateUser,
  deleteUser,
  type CreateUserFormState,
  type UpdateUserFormState,
} from "./actions";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ViewIcon,
  ViewOffSlashIcon,
  Copy01Icon,
  CheckmarkCircle02Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";

interface User {
  id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  role: string;
  status: string;
}

interface UserSheetProps {
  user?: User | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactElement;
}

const createInitialState: CreateUserFormState = { error: null, success: false };
const updateInitialState: UpdateUserFormState = { error: null, success: false };

export function UserSheet({
  user,
  open,
  onOpenChange,
  trigger,
}: UserSheetProps) {
  const isEdit = !!user;

  const [createState, createAction, isCreating] = useActionState(
    createUser,
    createInitialState
  );
  const [updateState, updateAction, isUpdating] = useActionState(
    updateUser,
    updateInitialState
  );
  const [isDeleting, startDeleteTransition] = useTransition();

  const state = isEdit ? updateState : createState;
  const isPending = isEdit ? isUpdating : isCreating;

  const [internalOpen, setInternalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user?.role || "contributor");
  const [selectedStatus, setSelectedStatus] = useState(
    user?.status || "active"
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
      setSelectedStatus(user.status);
      setShowDeleteConfirm(false);
    } else {
      setSelectedRole("contributor");
      setSelectedStatus("active");
    }
  }, [user]);

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        setIsOpen(false);
        if (!isEdit) {
          setSelectedRole("contributor");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.success, setIsOpen, isEdit]);

  const handleRoleChange = (value: string | null) => {
    if (value) setSelectedRole(value);
  };

  const handleStatusChange = (value: string | null) => {
    if (value) setSelectedStatus(value);
  };

  const handleCopyPassword = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (!user) return;
    startDeleteTransition(async () => {
      const result = await deleteUser(user.id);
      if (result.success) {
        setIsOpen(false);
      }
    });
  };

  const sheetContent = (
    <SheetContent className="overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <SheetHeader>
        <SheetTitle>{isEdit ? "Edit User" : "Add New User"}</SheetTitle>
        <SheetDescription>
          {isEdit
            ? "Update user details and permissions."
            : "Create a new user account."}
        </SheetDescription>
      </SheetHeader>
      <form
        action={isEdit ? updateAction : createAction}
        className="flex flex-col gap-4 px-4 pb-4"
      >
        {isEdit && <input type="hidden" name="userId" value={user.id} />}
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
            <FieldLabel htmlFor="displayName">Display Name</FieldLabel>
            <Input
              id="displayName"
              name="displayName"
              type="text"
              placeholder="Reshika Tharindi"
              defaultValue={user?.display_name || ""}
              required
              disabled={isPending || state.success}
            />
          </Field>

          {!isEdit && (
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="hello@example.com"
                required
                disabled={isPending || state.success}
              />
            </Field>
          )}

          {!isEdit && (
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isPending || state.success}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <HugeiconsIcon
                      icon={showPassword ? ViewOffSlashIcon : ViewIcon}
                      strokeWidth={2}
                      className="size-4"
                    />
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyPassword}
                  disabled={isPending || state.success}
                >
                  <HugeiconsIcon
                    icon={copied ? CheckmarkCircle02Icon : Copy01Icon}
                    strokeWidth={2}
                    className="size-4"
                  />
                </Button>
              </div>
            </Field>
          )}

          <Field>
            <FieldLabel htmlFor="role">Role</FieldLabel>
            <Select
              name="role"
              value={selectedRole}
              onValueChange={handleRoleChange}
              disabled={isPending || state.success}
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contributor">Contributor</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {isEdit && (
            <Field>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <Select
                name="status"
                value={selectedStatus}
                onValueChange={handleStatusChange}
                disabled={isPending || state.success}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}

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
              : "Create User"}
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
              Delete User
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
