import logo from "../../assets/logo.png"

const Logo = () => {
  return (
    <div className="flex items-center">
      <img src={logo} alt="Wordzy Logo" className="h-12 w-auto" />
    </div>
  );
};

export default Logo;