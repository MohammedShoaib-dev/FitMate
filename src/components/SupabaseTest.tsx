import { useState } from "react";
import { testConnection } from "@/integrations/supabase/client";

export default function SupabaseTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function run() {
    setLoading(true);
    try {
      const res = await testConnection();
      setResult(res);
    } catch (err) {
      setResult({ ok: false, error: err });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 border rounded">
      <button
        onClick={run}
        className="px-3 py-1 rounded bg-sky-500 text-white disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Checking…" : "Test Supabase Connection"}
      </button>

      {result && (
        <pre className="mt-3 text-sm bg-gray-900 text-white p-2 rounded">{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}
