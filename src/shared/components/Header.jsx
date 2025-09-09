"use client"

import UserDropdown from "./UserDropdown"

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-end">
        <UserDropdown />
      </div>
    </header>
  )
}

export default Header
