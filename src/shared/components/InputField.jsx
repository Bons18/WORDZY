const InputField = ({ label, icon, rightIcon, className = "", ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#64748B] mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]">
            {icon}
          </div>
        )}
        <input
          className={`w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-lg
            ${icon ? 'pl-12' : ''} ${rightIcon ? 'pr-12' : ''}
            focus:outline-none focus:border-[#1F384C] focus:ring-1 focus:ring-[#1F384C]
            text-[#1F384C] placeholder-[#94A3B8] ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightIcon}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputField;