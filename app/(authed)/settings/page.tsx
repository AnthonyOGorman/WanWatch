import { SettingsForm } from "@/components/settings/settings-form";

export default function SettingsPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold text-text">Settings</h1>
      <div className="text-sm text-muted">Control polling interval and retention.</div>
      <div className="pt-3">
        <SettingsForm />
      </div>
    </div>
  );
}

