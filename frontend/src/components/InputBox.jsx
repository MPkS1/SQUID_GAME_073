// components/InputBox.jsx

export function InputBox({ value, onChange, placeholder = "Paste email, SMS, or message here..." }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Message Content
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
      />
      <p className="text-xs text-gray-500 mt-2">
        {value.length} characters
      </p>
    </div>
  );
}
