import React from "react";

export default function ProfileCard({ profile }) {
  const {
    name, thar, title, region, bio, photo_url,
    skills = [], guthi_roles = [], language = [],
    diaspora_node
  } = profile;

  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 hover:shadow-lg transition duration-200">
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={photo_url || "https://placehold.co/100x100"}
          alt={name}
          className="w-16 h-16 rounded-full border border-purple-300 object-cover"
        />
        <div>
          <h3 className="text-lg font-bold text-purple-800">{name}</h3>
          <p className="text-sm text-gray-500">{thar}</p>
          <p className="text-xs text-gray-400">{title} • {region}</p>
        </div>
      </div>

      <p className="text-sm text-gray-700 italic mb-3">
        “{bio || 'This soul has not spoken their essence yet.'}”
      </p>

      <div className="flex flex-wrap gap-2 mt-2">
        {skills.map((skill, i) => (
          <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
            {skill}
          </span>
        ))}
      </div>

      {guthi_roles.length > 0 && (
        <div className="mt-2">
          <h4 className="text-xs text-gray-500 uppercase mt-2 mb-1">Guthi Roles</h4>
          <div className="flex flex-wrap gap-2">
            {guthi_roles.map((role, i) => (
              <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {role}
              </span>
            ))}
          </div>
        </div>
      )}

      {language.length > 0 && (
        <div className="mt-2">
          <h4 className="text-xs text-gray-500 uppercase mt-2 mb-1">Languages</h4>
          <div className="flex flex-wrap gap-2">
            {language.map((lang, i) => (
              <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      {diaspora_node && (
        <div className="mt-3 text-xs text-blue-600">🌍 Diaspora Member</div>
      )}

      <div className="flex justify-between mt-4">
        <button className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full hover:bg-yellow-200">
          🌺 Honor
        </button>
        <button className="bg-pink-100 text-pink-800 text-xs px-3 py-1 rounded-full hover:bg-pink-200">
          📩 Nominate
        </button>
      </div>
    </div>
  );
}
