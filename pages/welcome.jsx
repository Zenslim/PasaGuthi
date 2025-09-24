// pages/welcome.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import { nanoid } from "nanoid";
import Fuse from "fuse.js";

import tharList from "../data/tharList.json";
import skillsList from "../data/skillsList.json";
import regionList from "../data/regionList.json";
import DemographicInline from "../components/DemographicInline";

export default function Welcome() {
  const router = useRouter();

  const [authUser, setAuthUser] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    name: "",
    thar: "",
    gender: "",
    region: "",
    skills: "", // comma-separated input; we’ll convert to text[]
  });

  const [phone, setPhone] = useState("");

  // suggestion state
  const [suggestedThar, setSuggestedThar] = useState([]);
  const [suggestedRegion, setSuggestedRegion] = useState([]);
  const [suggestedSkills, setSuggestedSkills] = useState([]);

  const [confirmedThar, setConfirmedThar] = useState("");
  const [confirmedRegion, setConfirmedRegion] = useState("");
  const [confirmedSkills, setConfirmedSkills] = useState([]);

  const [guthiKey, setGuthiKey] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showDemographic, setShowDemographic] = useState(false);

  // Fuzzy indices
  const tharFuse = useMemo(() => new Fuse(tharList, { keys: ["Thar"], threshold: 0.3 }), []);
  const regionFuse = useMemo(() => new Fuse(regionList, { keys: ["Region"], threshold: 0.3 }), []);
  const skillsFuse = useMemo(() => new Fuse(skillsList, { keys: ["Skill"], threshold: 0.3 }), []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        // must be signed in first
        router.replace("/signin");
        return;
      }
      setAuthUser(data.user);
    })();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "thar") {
      const results = tharFuse.search(value.trim()).map((r) => r.item);
      setSuggestedThar(results);
      setConfirmedThar("");
    }

    if (name === "region") {
      const results = regionFuse.search(value.trim()).map((r) => r.item);
      setSuggestedRegion(results);
      setConfirmedRegion("");
    }

    if (name === "skills") {
      const parts = value.split(",");
      const last = parts[parts.length - 1].trim();
      if (last.length > 0) {
        const results = skillsFuse.search(last).map((r) => r.item.Skill);
        setSuggestedSkills(results);
      } else {
        setSuggestedSkills([]);
      }
    }
  };

  const handleSkillSelect = (skill) => {
    const current = form.skills.split(",").map((s) => s.trim()).filter(Boolean);
    if (!current.includes(skill)) {
      const updated = [...current.slice(0, -1), skill];
      setForm((prev) => ({ ...prev, skills: updated.join(", ") + ", " }));
      setConfirmedSkills(updated);
    }
    setSuggestedSkills([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const finalSkills = form.skills.split(",").map((s) => s.trim()).filter(Boolean);
      setConfirmedSkills(finalSkills);
    }
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
  };

  const skillsToArray = (s) =>
    s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  const validate = () => {
    if (!form.name.trim()) return "Name is required.";
    if (!form.thar.trim()) return "Thar (lineage) is required.";
    if (!form.gender.trim()) return "Please choose how we greet you.";
    if (!form.region.trim()) return "Region is required.";
    if (!form.skills.trim()) return "At least one skill is required.";

    // Respect your rule to restrict to verified Newar thars
    const isKnownThar = tharList.some(
      (t) => t.Thar.toLowerCase() === form.thar.trim().toLowerCase()
    );
    if (!isKnownThar) {
      return "Sorry, Pasaguthi is currently only open to verified Newars. Please pick a verified Thar.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!authUser) return;

  // validate as before...
  const v = validate();
  if (v) { setErr(v); return; }

  try {
    setBusy(true);
    setErr("");

    // compact key
    const keyBase = `${form.name}-${form.thar}-${form.region}`.toLowerCase().replace(/\s+/g, "-");
    const key = `${keyBase}-${Math.random().toString(36).slice(2, 7)}`;
    const skillsArr = form.skills.split(",").map(s => s.trim()).filter(Boolean);

    // IMPORTANT: only include columns that actually exist in profiles
    const payload = {
      id: authUser.id,                  // must equal auth.uid() under RLS
      name: form.name.trim(),
      thar: form.thar.trim(),
      region: form.region.trim(),
      skills: skillsArr,                // text[]
      phone: phone || null,
      guthi_key: key,
      is_public: true,
      updated_at: new Date().toISOString(),
      // remove user_id or gender here if those columns don't exist in your table
    };

    const { data, error, status } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id", ignoreDuplicates: false })
      .select()
      .single();

    if (error) {
      console.error("profiles.upsert error", { status, error, payload });
      setErr(error.message || `Insert/update blocked (HTTP ${status}).`);
      return;
    }

    localStorage.setItem("guthiKey", key);
    setGuthiKey(key);
    setSubmitted(true);
    setShowDemographic(true);
  } catch (e) {
    console.error("submit crash", e);
    setErr(e?.message || "Unexpected error.");
  } finally {
    setBusy(false);
  }
};

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black p-6">
        <div className="text-center">
          <p className="text-lg">Redirecting to sign in…</p>
        </div>
      </div>
    );
  }

  if (submitted && !showDemographic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6 text-center text-black">
        <div>
          <h1 className="text-2xl font-bold">
            🌿 Welcome, {form.name} of the {form.thar} lineage
          </h1>
          <p className="mt-4">Your Guthi Key:</p>
          <code className="text-lg bg-gray-100 p-2 rounded mt-2 inline-block">
            {guthiKey}
          </code>
          <p className="mt-4 text-purple-700 italic">
            🌸 Now let's complete your profile to join the Guthi family.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black p-6">
      {!showDemographic ? (
        <form onSubmit={handleSubmit} onKeyDown={handleKeyPress} className="w-full max-w-md space-y-5">
          <h1 className="text-2xl font-semibold text-center">🌸 PasaGuthi welcomes you.</h1>
          <p className="text-center text-sm text-gray-600 mt-1">
            Step into a living network of memory, meaning, and belonging.
          </p>

          {err && (
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 p-3 text-sm">
              {err}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block font-semibold">🪶 What name do the winds call you by?</label>
            <input
              name="name"
              required
              onChange={handleChange}
              placeholder="e.g., Nabin"
              className="border bg-white text-black p-2 w-full rounded"
            />
          </div>

          {/* Thar */}
          <div>
            <label className="block font-semibold">🌳 Your Thar (Lineage)</label>
            <p className="text-sm text-gray-500 italic mb-1">This binds you to your ancestral tree.</p>
            <input
              name="thar"
              required
              onChange={handleChange}
              value={form.thar}
              placeholder="e.g., Pradhan"
              className="border bg-white text-black p-2 w-full rounded"
            />
            {suggestedThar.length > 0 && (
              <ul className="bg-gray-50 border p-2 text-sm rounded mt-1">
                {suggestedThar.map((t, i) => (
                  <li
                    key={i}
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, thar: t.Thar }));
                      setConfirmedThar(t.Thar);
                      setSuggestedThar([]);
                    }}
                  >
                    {t.Thar}
                  </li>
                ))}
              </ul>
            )}
            {confirmedThar && (
              <p className="mt-2 text-sm text-green-700 italic">
                ✨ Aha, {confirmedThar} —{" "}
                {tharList.find((t) => t.Thar.toLowerCase() === confirmedThar.toLowerCase())?.Meaning}
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block font-semibold">🌸 How shall the Guthi greet you?</label>
            <select
              name="gender"
              required
              onChange={handleChange}
              className="border bg-white text-black p-2 w-full rounded"
            >
              <option value="">Select</option>
              <option value="Male">With respect as Sir</option>
              <option value="Female">With honor as Ma’am</option>
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="block font-semibold">🌍 Where do your roots now breathe?</label>
            <p className="text-sm text-gray-500 italic mb-1">This will blossom with meaning.</p>
            <input
              name="region"
              required
              onChange={handleChange}
              value={form.region}
              placeholder="e.g., Patan, Kathmandu — or Boston, USA"
              className="border bg-white text-black p-2 w-full rounded"
            />
            {suggestedRegion.length > 0 && (
              <ul className="bg-gray-50 border p-2 text-sm rounded mt-1">
                {suggestedRegion.map((r, i) => (
                  <li
                    key={i}
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, region: r.Region }));
                      setConfirmedRegion(r.Region);
                      setSuggestedRegion([]);
                    }}
                  >
                    {r.Region}
                  </li>
                ))}
              </ul>
            )}
            {confirmedRegion && (
              <p className="mt-2 text-sm text-green-700 italic">
                ✨ Aha,{" "}
                {regionList.find((r) => r.Region.toLowerCase() === confirmedRegion.toLowerCase())?.Meaning ||
                  "not yet in our sacred list. You are the first to speak it here."}
              </p>
            )}
          </div>

          {/* Skills */}
          <div>
            <label className="block font-semibold">🤲 What gifts do you offer the Guthi?</label>
            <p className="text-sm text-gray-500 italic mb-1">
              Each gift will be honored with a whisper.
            </p>
            <input
              name="skills"
              required
              onChange={handleChange}
              value={form.skills}
              placeholder="e.g., sculpting, storytelling, healing"
              className="border bg-white text-black p-2 w-full rounded"
            />
            {suggestedSkills.length > 0 && (
              <ul className="bg-gray-50 border p-2 text-sm rounded mt-1">
                {suggestedSkills.map((s, i) => (
                  <li key={i} className="cursor-pointer hover:bg-gray-100" onClick={() => handleSkillSelect(s)}>
                    {s}
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Type a skill and press Enter to confirm — every offering adds to the sacred weave.
            </p>
            {confirmedSkills.length > 0 && (
              <div className="mt-2 space-y-1 text-sm text-green-700 italic">
                {confirmedSkills.map((s, i) => {
                  const match = skillsList.find((k) => k.Skill.toLowerCase() === s.toLowerCase());
                  return (
                    <p key={i}>
                      ✨ Aha, {s} — {match ? match.Meaning : "not yet in our sacred list. You are the first to speak it here."}
                    </p>
                  );
                })}
              </div>
            )}
          </div>

          {/* Phone (OTP recovery only) */}
          <div className="mt-2">
            <label className="block font-semibold">📱 Recovery Number (Optional)</label>
            <input
              type="tel"
              placeholder="+97798XXXXXXX"
              value={phone}
              onChange={handlePhoneChange}
              className="w-full mt-2 p-2 border rounded"
            />
            <p className="text-xs text-gray-500 mt-1">
              Only for recovery of your Guthi Key if forgotten. Not used for marketing.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={busy}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-4 py-2 rounded w-full font-bold"
          >
            {busy ? "Planting…" : "🌿 Plant My Guthi Seed"}
          </button>
        </form>
      ) : (
        <DemographicInline guthiKey={guthiKey} />
      )}
    </div>
  );
}
