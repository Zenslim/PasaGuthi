export default function PublicProfileCard({ name, thar, photo, region }) {
  return (
    <div className="p-4 border rounded-xl shadow bg-white dark:bg-gray-900 text-center w-full max-w-xs mx-auto">
      <img
        src={photo || "/default-avatar.png"}
        alt={name}
        className="w-24 h-24 rounded-full mx-auto object-cover"
      />
      <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">{name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">{thar}</p>
      <p className="text-xs text-gray-400 dark:text-gray-400 italic mt-1">{region}</p>
    </div>
  );
}
