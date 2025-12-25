import { requireRole } from "@/lib/auth";
import { getSettings } from "./actions";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  await requireRole(["admin"]);

  const settings = await getSettings();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 px-6 lg:px-10">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your site settings and preferences.
        </p>
      </div>

      <div className="max-w-3xl">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
