// pages/_check-supabase.jsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function CheckSupabase() {
  const [state, setState] = useState({ ok: null, msg: "Checking…" });

  useEffect(() => {
    (async () => {
      try {
        // trivial read from the public view
        const { data, error } = await supabase
          .from("guthyars_public")
          .select("user_id")
          .limit(1);

        if (error) {
          setState({ ok: false, msg: `Error: ${error.message}` });
        } else {
          setState({ ok: true, msg: `OK: got ${data?.length ?? 0} rows` });
        }
      } catch (e) {
        setState({ ok: false, msg: `Crash: ${e.message || "unknown"}` });
      }
    })();
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "linear-gradient(#0f172a, #000)",
      color: "white",
      padding: 24
    }}>
      <pre style={{
        background: "rgba(255,255,255,.06)",
        border: "1px solid rgba(255,255,255,.15)",
        borderRadius: 12,
        padding: 16,
        maxWidth: 800,
        width: "100%",
        fontSize: 16
      }}>
        {state.ok === null ? "Checking Supabase…" : state.msg}
      </pre>
    </div>
  );
}
