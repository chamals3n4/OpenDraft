"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { updateSettings, type SettingsFormState } from "./actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

const initialState: SettingsFormState = { error: null, success: false };

export function SettingsForm() {
  const [state, action, isPending] = useActionState(
    updateSettings,
    initialState
  );

  return (
    <form action={action} className="space-y-8">
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

      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">General</h2>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="site_name">Site Name</FieldLabel>
            <Input
              id="site_name"
              name="site_name"
              required
              disabled={isPending}
            />
            <FieldDescription>
              The name of your site, displayed in the header and browser tab
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="site_description">Site Description</FieldLabel>
            <Textarea
              id="site_description"
              name="site_description"
              rows={3}
              disabled={isPending}
            />
            <FieldDescription>
              A short description for SEO and social sharing
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="site_url">Site URL</FieldLabel>
            <Input
              id="site_url"
              name="site_url"
              type="url"
              disabled={isPending}
            />
            <FieldDescription>
              The public URL of your blog (used for generating links)
            </FieldDescription>
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="site_logo">Logo URL</FieldLabel>
              <Input
                id="site_logo"
                name="site_logo"
                type="url"
                placeholder="https://example.com/logo.png"
                disabled={isPending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="site_favicon">Favicon URL</FieldLabel>
              <Input
                id="site_favicon"
                name="site_favicon"
                type="url"
                placeholder="https://example.com/favicon.ico"
                disabled={isPending}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="posts_per_page">Posts Per Page</FieldLabel>
            <Input
              id="posts_per_page"
              name="posts_per_page"
              type="number"
              min={1}
              max={50}
              className="w-24"
              disabled={isPending}
            />
            <FieldDescription>
              Number of posts to show per page on the blog listing
            </FieldDescription>
          </Field>
        </FieldGroup>
      </div>

      {/* comments settings */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Comments</h2>
        <FieldGroup>
          <Field>
            <div className="flex items-center justify-between">
              <div>
                <FieldLabel htmlFor="comments_enabled">
                  Enable Comments
                </FieldLabel>
                <FieldDescription>
                  Allow visitors to leave comments on posts
                </FieldDescription>
              </div>
              <Switch
                id="comments_enabled"
                name="comments_enabled"
                disabled={isPending}
              />
            </div>
          </Field>

          <Field>
            <div className="flex items-center justify-between">
              <div>
                <FieldLabel htmlFor="comments_moderation">
                  Require Moderation
                </FieldLabel>
                <FieldDescription>
                  Comments must be approved before appearing publicly
                </FieldDescription>
              </div>
              <Switch
                id="comments_moderation"
                name="comments_moderation"
                disabled={isPending}
              />
            </div>
          </Field>
        </FieldGroup>
      </div>

      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Social Links</h2>
        <FieldGroup>
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="social_twitter">Twitter/X</FieldLabel>
              <Input
                id="social_twitter"
                name="social_twitter"
                placeholder="https://twitter.com/username"
                disabled={isPending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="social_facebook">Facebook</FieldLabel>
              <Input
                id="social_facebook"
                name="social_facebook"
                placeholder="https://facebook.com/page_id"
                disabled={isPending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="social_instagram">Instagram</FieldLabel>
              <Input
                id="social_instagram"
                name="social_instagram"
                placeholder="https://instagram.com/username"
                disabled={isPending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="social_github">GitHub</FieldLabel>
              <Input
                id="social_github"
                name="social_github"
                placeholder="https://github.com/username"
                disabled={isPending}
              />
            </Field>
          </div>
        </FieldGroup>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} size="lg">
          {isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
