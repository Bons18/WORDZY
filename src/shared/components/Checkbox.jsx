const Checkbox = ({ label, ...props }) => {
  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        {...props}
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
};

export default Checkbox;