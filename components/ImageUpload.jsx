
// ImageUpload.jsx — Upload image for visual journaling

export default function ImageUpload({ onUpload }) {
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onUpload({ name: file.name, data: reader.result });
      reader.readAsDataURL(file);
    }
  };

  return (
    <label className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded cursor-pointer">
      📷 Add Image
      <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
    </label>
  );
}
