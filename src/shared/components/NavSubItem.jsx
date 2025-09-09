"use client"

const NavSubItem = ({ icon, text, onClick, isActive = false }) => {
  return (
    <div 
      className={`flex items-center px-2 py-2 cursor-pointer transition-colors font-['Poppins'] font-medium rounded-md ${
        isActive 
          ? "bg-[#2a4a61] text-[#4a90e2]" 
          : "hover:bg-[#2a4a61] hover:text-[#4a90e2]"
      }`} 
      onClick={onClick}
    >
      <span className={`mr-3 ${isActive ? "text-[#4a90e2]" : "text-[#d6dade]"}`}>{icon}</span>
      <span className="text-sm">{text}</span>
    </div>
  )
}

export default NavSubItem

