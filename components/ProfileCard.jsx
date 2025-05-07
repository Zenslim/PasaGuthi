export default function ProfileCard({ profile, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 relative">
      {profile.photo_url && (
        <img
          src={profile.photo_url}
          alt={profile.name}
          className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-purple-200"
        />
      )}
      <h2 className="text-xl font-semibold text-center text-purple-900">{profile.name}</h2>
      <p className="text-center text-gray-600">{profile.title}</p>
      <p className="text-xs text-center text-gray-500 mb-2">📍 {profile.region}</p>
      <div className="flex flex-wrap justify-center mb-2">
        {profile.skills?.map((skill, i) => (
          <span key={i} className="m-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">{skill}</span>
        ))}
      </div>
      <p className="text-sm italic text-center text-gray-700 mt-2">“{profile.bio}”</p>
      <div className="flex justify-center gap-3 mt-4">
        <button className="bg-green-600 text-white px-3 py-1 rounded-full text-sm hover:bg-green-700">🌸 Honor</button>
        <button className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm hover:bg-indigo-700">🗳️ Nominate</button>
      </div>
      <div className="absolute top-2 right-2 space-x-2 text-sm">
        <button onClick={onEdit} className="text-blue-600 hover:underline">Edit</button>
        <button onClick={onDelete} className="text-red-600 hover:underline">Delete</button>
      </div>
    </div>
  );
}
