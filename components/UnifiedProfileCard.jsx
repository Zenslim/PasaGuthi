
import React from "react";

export default function UnifiedProfileCard({ profile, currentUser, onEdit, onDelete }) {
  const isOwner = currentUser?.uid === profile.uid;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 relative max-w-sm mx-auto">
      {profile.photo_url && (
        <img
          src={profile.photo_url}
          alt={profile.name}
          className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-purple-300 shadow"
        />
      )}
      <h2 className="text-2xl font-bold text-center text-purple-900">
        {profile.name || profile.firstName}
      </h2>
      {profile.thar && (
        <p className="text-center text-sm text-purple-600 italic mb-1">
          {profile.thar} — Lineage of Honor
        </p>
      )}
      {profile.role && (
        <p className="text-center text-indigo-700 text-sm">{profile.role}</p>
      )}
      <p className="text-xs text-center text-gray-500 mb-2">📍 {profile.region}</p>

      <div className="flex flex-wrap justify-center mb-2">
        {profile.skills?.map((skill, i) => (
          <span key={i} className="m-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
            {skill}
          </span>
        ))}
      </div>

      {profile.bio && (
        <p className="text-sm italic text-center text-gray-700 mt-2">“{profile.bio}”</p>
      )}

      <div className="flex justify-center gap-3 mt-4">
        {isOwner ? (
          <>
            <button onClick={onEdit} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm hover:bg-blue-700">Edit</button>
            <button onClick={onDelete} className="bg-red-600 text-white px-3 py-1 rounded-full text-sm hover:bg-red-700">Delete</button>
          </>
        ) : (
          <>
            <button className="bg-green-600 text-white px-3 py-1 rounded-full text-sm hover:bg-green-700">🌸 Honor</button>
            <button className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm hover:bg-indigo-700">🗳️ Nominate</button>
          </>
        )}
      </div>
    </div>
  );
}
