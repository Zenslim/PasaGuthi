// components/ProfileCard.jsx
export default function ProfileCard({ profile }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 hover:shadow-lg transition duration-200">
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={profile.photo_url || "https://placehold.co/100x100"}
          alt={profile.name}
          className="w-16 h-16 rounded-full border border-purple-300 object-cover"
        />
        <div>
          <h3 className="text-lg font-bold text-purple-800">{profile.name}</h3>
          <p className="text-sm text-gray-500">{profile.title || "—"}</p>
          <p className="text-xs text-gray-400">{profile.region || "—"}</p>
        </div>
      </div>
      <p className="text-sm text-gray-700 italic mb-3">
        {profile.bio || "No bio provided."}
      </p>
      {profile.skills?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {profile.skills.map((skill, i) => (
            <span
              key={i}
              className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
      {profile.diaspora_node && (
        <div className="mt-3 text-xs text-blue-600">🌏 Diaspora Node</div>
      )}
    </div>
  );
}
