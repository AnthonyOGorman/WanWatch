import { LogsView } from "@/components/logs/logs-view";

export default function LogsPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold text-text">Logs</h1>
      <div className="text-sm text-muted">Search and export polling history.</div>
      <div className="pt-3">
        <LogsView />
      </div>
    </div>
  );
}

