import type { ContentInput, ValidationResult } from "./content.types";

export function validateTitle(title: string): string | null {
  if (!title?.trim()) {
    return "Title is required";
  }
  return null;
}

export function parseBody(bodyJson: string): {
  body: unknown;
  error: string | null;
} {
  try {
    const body = JSON.parse(bodyJson);
    return { body, error: null };
  } catch {
    return { body: null, error: "Invalid content format" };
  }
}

export function validateBodyForPublish(
  status: string,
  bodyIsEmpty: boolean
): string | null {
  if (status === "published" && bodyIsEmpty) {
    return "Content is required to publish";
  }
  return null;
}

export function validateScheduledDate(
  status: string,
  scheduledAt: string | null
): string | null {
  if (status === "scheduled" && !scheduledAt) {
    return "Schedule date is required for scheduled posts";
  }

  if (status === "scheduled" && scheduledAt) {
    const scheduleDate = new Date(scheduledAt);
    if (scheduleDate <= new Date()) {
      return "Schedule date must be in the future";
    }
  }

  return null;
}

export function validateContent(input: ContentInput): ValidationResult {
  const errors: string[] = [];

  const titleError = validateTitle(input.title);
  if (titleError) errors.push(titleError);

  const bodyError = validateBodyForPublish(input.status, input.bodyIsEmpty);
  if (bodyError) errors.push(bodyError);

  const scheduleError = validateScheduledDate(
    input.status,
    input.scheduledAt ?? null
  );
  if (scheduleError) errors.push(scheduleError);

  return {
    valid: errors.length === 0,
    errors,
  };
}
