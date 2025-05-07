
import React from "react";

export default function UnifiedProfileCard({ profile, currentUser, onEdit, onDelete }) {
  const isOwner = currentUser?.uid === profile.uid;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 relative max-w-sm mx-auto text-center">
      <div className="w-24 h-24 mx-auto rounded-full border-4 border-purple-300 shadow mb-4">
        <img
          src={profile.photo_url || "/icons/guthi-flame.svg"}
          alt={profile.name}
          className="w-full h-full object-cover rounded-full"
        />
      </div>

      <h2 className="text-2xl font-bold text-purple-800">
        {profile.name || profile.firstName}
      </h2>
      {profile.thar && (
        <p className="text-sm italic text-purple-600">
          {profile.thar} — Lineage of Honor
        </p>
      )}
      {profile.role && <p className="text-md text-indigo-700">{profile.role}</p>}
      {profile.region && (
        <p className="text-sm text-gray-500 mb-3">📍 {profile.region}</p>
      )}

      {profile.skills && profile.skills.length > 0 && (
        <div className="flex flex-wrap justify-center mb-3">
          {profile.skills.map((skill, i) => (
            <span key={i} className="m-1 px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
              {skill}
            </span>
          ))}
        </div>
      )}

      {profile.bio && (
        <p className="text-sm italic text-gray-700 mb-4">“{profile.bio}”</p>
      )}

      <div className="flex justify-center gap-3 mt-4">
        {isOwner ? (
          <>
            <button onClick={onEdit} className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm hover:bg-blue-700">Edit</button>
            <button onClick={onDelete} className="bg-red-600 text-white px-4 py-1 rounded-full text-sm hover:bg-red-700">Delete</button>
          </>
        ) : (
          <>
            <button className="bg-green-600 text-white px-4 py-1 rounded-full text-sm hover:bg-green-700">🌸 Honor</button>
            <button className="bg-indigo-700 text-white px-4 py-1 rounded-full text-sm hover:bg-indigo-800">🗳️ Nominate</button>
          </>
        )}
      </div>
    </div>
  );
}
