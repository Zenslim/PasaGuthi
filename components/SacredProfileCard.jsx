
import React from "react";

export default function SacredProfileCard({ profile }) {
  const {
    firstName,
    thar,
    role,
    region,
    bio,
    skills = [],
    karma,
    reflections = [],
    photo_url,
  } = profile;

  const reflectionCount = Array.isArray(reflections) ? reflections.length : reflections || 0;
  const guthyarRank = (firstName?.length || 1) * (karma || 1) % 1088;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-3xl shadow-xl text-center relative">
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full border-4 border-amber-400 shadow-lg animate-pulse bg-white">
        <img
          src={photo_url || "/icons/guthi-flame.svg"}
          alt="Guthi Flame"
          className="w-full h-full object-cover rounded-full"
        />
      </div>

      <div className="pt-20">
        <h2 className="text-3xl font-bold text-purple-900">{firstName}</h2>
        {thar && (
          <p className="text-sm italic text-purple-600 mb-2">
            {thar} — Lineage of Honor
          </p>
        )}
        {role && <p className="text-md text-indigo-800">{role}</p>}
        {region && (
          <p className="text-sm text-gray-500 mb-4">📍 {region}</p>
        )}

        {bio && (
          <p className="text-md italic text-gray-700 mb-4">“{bio}”</p>
        )}

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {skills.map((skill, i) => (
            <span key={i} className="bg-purple-100 text-purple-800 px-3 py-1 text-xs rounded-full">
              {skill}
            </span>
          ))}
        </div>

        <div className="bg-gray-100 rounded-xl p-4 text-left space-y-2">
          <p><strong>🔥 Karma Points:</strong> {karma || 0}</p>
          <p><strong>📝 Reflections Submitted:</strong> {reflectionCount}</p>
          <p><strong>🌕 Moonline Rank:</strong> You are the {guthyarRank}th Guthyar this moon.</p>

          <div className="mt-3">
            <p className="text-sm text-blue-800 font-medium cursor-pointer hover:underline">
              🕊️ Why are you proud to be Newar?
            </p>
          </div>

          <div className="mt-4">
            <p className="text-sm font-semibold text-gray-800">🌿 Active Projects:</p>
            <ul className="list-disc list-inside text-sm text-green-800 pl-4">
              <li>Healing Circle</li>
              <li>Temple Cleanup Drive</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
