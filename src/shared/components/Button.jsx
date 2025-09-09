const Button = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;