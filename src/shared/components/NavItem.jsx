"use client"

const NavItem = ({ icon, text, onClick, hasSubmenu = false, isOpen = false, isActive = false, chevron = null }) => {
  return (
    <div
      className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-[#2a4a61] hover:text-[#4a90e2] transition-colors font-['Poppins'] font-medium rounded-md ${
        isOpen || isActive ? "bg-[#2a4a61] text-[#4a90e2] border-l-4 border-[#4a90e2]" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <span className={`mr-3 ${isOpen || isActive ? "text-[#4a90e2]" : "text-[#d6dade]"}`}>{icon}</span>
        <span>{text}</span>
      </div>
      {hasSubmenu && chevron}
    </div>
  )
}

export default NavItem

