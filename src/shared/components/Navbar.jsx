import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "@/shared/contexts/AuthContext"
import { ROLES } from "../utils/rolePermissions"
import { usePermissions } from "../hooks/usePermissions"
import { getNavigationStructure } from "../utils/navigationPermissions"
import NavItem from "./NavItem"
import NavSubItem from "./NavSubItem"
import logo from "../../assets/logo.png"
import {
  ChevronDown,
  LayoutDashboard,
  GraduationCap,
  Calendar,
  Users,
  Settings,
  Award,
  Star,
  TrendingUp,
  MessageSquare,
  CalendarCheck,
  BookOpenText,
  ShieldCheck,
  ClipboardCheck,
  ClipboardList,
  UserCog,
  Paperclip,
  TestTubes,
  Gauge,
  ListChecks,
  Menu,
  X,
} from "lucide-react"

const Navbar = () => {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const { userPermissions, loading: permissionsLoading } = usePermissions()
  const [openSections, setOpenSections] = useState({
    formacion: false,
    programacion: false,
    progreso: false,
    configuracion: false,
  })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Obtener estructura de navegación basada en permisos
  const navigationStructure = getNavigationStructure(userPermissions, user?.role)
  
  // Debug logs para aprendices
  if (user?.role === ROLES.APPRENTICE) {
    console.log('🔍 DEBUG APPRENTICE NAVBAR:')
    console.log('User:', user)
    console.log('User permissions:', userPermissions)
    console.log('Permissions loading:', permissionsLoading)
    console.log('Navigation structure:', navigationStructure)
  }

  // Función para obtener el icono por nombre
  const getIcon = (iconName, size = 18) => {
    const icons = {
      LayoutDashboard: <LayoutDashboard size={size} />,
      GraduationCap: <GraduationCap size={size} />,
      ClipboardList: <ClipboardList size={size} />,
      UserCog: <UserCog size={size} />,
      Users: <Users size={size} />,
      BookOpenText: <BookOpenText size={size} />,
      Paperclip: <Paperclip size={size} />,
      TestTubes: <TestTubes size={size} />,
      CalendarCheck: <CalendarCheck size={size} />,
      ClipboardCheck: <ClipboardCheck size={size} />,
      Award: <Award size={size} />,
      ListChecks: <ListChecks size={size} />,
      TrendingUp: <TrendingUp size={size} />,
      MessageSquare: <MessageSquare size={size} />,
      ShieldCheck: <ShieldCheck size={size} />,
      Calendar: <Calendar size={size} />,
      Gauge: <Gauge size={size} />,
      Settings: <Settings size={size} />
    }
    return icons[iconName] || <LayoutDashboard size={size} />
  }

  const handleLogoClick = () => {
    if (user?.role === ROLES.APPRENTICE) {
      navigate("/aprendiz/inicio")
    } else {
      navigate("/dashboard")
    }
  }

  const toggleSection = (section) => {
    setOpenSections((prev) => {
      const newState = {
        formacion: false,
        programacion: false,
        progreso: false,
        configuracion: false,
      }
      newState[section] = !prev[section]
      return newState
    })
  }

  const handleNavigation = (path) => {
    navigate(path)
    // Cerrar menú móvil después de navegar
    setIsMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Si no hay usuario, no mostrar navbar
  if (!user) return null

  // Mostrar loading mientras se cargan los permisos
  if (permissionsLoading) {
    return (
      <>
        {/* Desktop Loading */}
        <div className="hidden lg:flex h-screen w-56 bg-[#1f384c] text-white flex-col flex-shrink-0 shadow-lg">
          <div className="p-4 flex items-center shrink-0">
            <img src={logo || "/placeholder.svg"} alt="Wordzy Logo" className="h-8 w-8 mr-2" />
            <h1 className="text-xl font-bold font-['Poppins']">WORDZY</h1>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </div>

        {/* Mobile Loading */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#1f384c] text-white p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src={logo || "/placeholder.svg"} alt="Wordzy Logo" className="h-8 w-8 mr-2" />
              <h1 className="text-xl font-bold font-['Poppins']">WORDZY</h1>
            </div>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        </div>
      </>
    )
  }

  const userRole = user.role

  // Renderizar contenido del menú
  const renderMenuContent = (isMobile = false) => {
    const containerClasses = isMobile 
      ? "text-sm font-['Poppins'] font-medium space-y-1" 
      : "mt-4 text-sm flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#3a5d7a] scrollbar-track-[#1f384c] hover:scrollbar-thumb-[#4a6d8a] font-['Poppins'] font-medium"

    return (
      <div className={containerClasses}>
        {!isMobile && (
          <div className="px-4 py-3 mb-2">
            <h2 className="text-[#8fa3b3] text-sm font-semibold uppercase tracking-wider font-['Poppins'] border-b border-[#2a4a64] pb-2">MENÚ</h2>
          </div>
        )}

        {/* Elementos standalone */}
        {navigationStructure.standalone.map((item, index) => (
          <NavItem
            key={index}
            icon={getIcon(item.icon)}
            text={item.label}
            onClick={() => handleNavigation(item.route)}
          />
        ))}

        {/* Sección Formación */}
        {navigationStructure.sections.formacion?.hasItems && (
          <div>
            <NavItem
              icon={<GraduationCap size={18} />}
              text="Formación"
              hasSubmenu={true}
              isOpen={openSections.formacion}
              onClick={() => toggleSection("formacion")}
              chevron={
                <ChevronDown size={16} className={`transition-transform ${openSections.formacion ? "rotate-180" : ""}`} />
              }
            />

            {openSections.formacion && (
              <div className="ml-4 border-l border-[#3a5d7a] pl-4 py-1 space-y-1">
                {navigationStructure.sections.formacion.items.map((item, index) => (
                  <NavSubItem
                    key={index}
                    icon={getIcon(item.icon, 16)}
                    text={item.label}
                    onClick={() => handleNavigation(item.route)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sección Programación */}
        {navigationStructure.sections.programacion?.hasItems && (
          <div>
            <NavItem
              icon={<Calendar size={18} />}
              text="Programación"
              hasSubmenu={true}
              isOpen={openSections.programacion}
              onClick={() => toggleSection("programacion")}
              chevron={
                <ChevronDown
                  size={16}
                  className={`transition-transform ${openSections.programacion ? "rotate-180" : ""}`}
                />
              }
            />

            {openSections.programacion && (
              <div className="ml-4 border-l border-[#707fdd] pl-4">
                {navigationStructure.sections.programacion.items.map((item, index) => (
                  <NavSubItem
                    key={index}
                    icon={getIcon(item.icon, 16)}
                    text={item.label}
                    onClick={() => handleNavigation(item.route)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sección Progreso */}
        {navigationStructure.sections.progreso?.hasItems && (
          <div>
            <NavItem
              icon={<Gauge size={18} />}
              text="Progreso"
              hasSubmenu={true}
              isOpen={openSections.progreso}
              onClick={() => toggleSection("progreso")}
              chevron={
                <ChevronDown size={16} className={`transition-transform ${openSections.progreso ? "rotate-180" : ""}`} />
              }
            />

            {openSections.progreso && (
              <div className="ml-4 border-l border-[#707fdd] pl-4">
                {navigationStructure.sections.progreso.items.map((item, index) => (
                  <NavSubItem
                    key={index}
                    icon={getIcon(item.icon, 16)}
                    text={item.label}
                    onClick={() => handleNavigation(item.route)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sección Configuración */}
        {navigationStructure.sections.configuracion?.hasItems && (
          <div>
            <NavItem
              icon={<Settings size={18} />}
              text="Configuración"
              hasSubmenu={true}
              isOpen={openSections.configuracion}
              onClick={() => toggleSection("configuracion")}
              chevron={
                <ChevronDown
                  size={16}
                  className={`transition-transform ${openSections.configuracion ? "rotate-180" : ""}`}
                />
              }
            />

            {openSections.configuracion && (
              <div className="ml-4 border-l border-[#707fdd] pl-4">
                {navigationStructure.sections.configuracion.items.map((item, index) => (
                  <NavSubItem
                    key={index}
                    icon={getIcon(item.icon, 16)}
                    text={item.label}
                    onClick={() => handleNavigation(item.route)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Navbar responsive
  return (
    <>
      {/* Desktop Navbar - Oculto en móvil */}
      <div className="hidden lg:flex h-screen w-56 bg-[#1f384c] text-white flex-col flex-shrink-0 shadow-lg">
        {/* Logo */}
        <div
          className="p-4 flex items-center shrink-0 cursor-pointer hover:bg-[#2a4a64] transition-colors"
          onClick={handleLogoClick}
        >
          <img src={logo || "/placeholder.svg"} alt="Wordzy Logo" className="h-8 w-8 mr-2" />
          <h1 className="text-xl font-bold font-['Poppins']">WORDZY</h1>
        </div>

        {/* Menú dinámico */}
        {renderMenuContent(false)}
      </div>

      {/* Mobile Header - Visible solo en móvil */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#1f384c] text-white shadow-lg">
        <div className="flex items-center justify-between p-4">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleLogoClick}
          >
            <img src={logo || "/placeholder.svg"} alt="Wordzy Logo" className="h-8 w-8 mr-2" />
            <h1 className="text-xl font-bold font-['Poppins']">WORDZY</h1>
          </div>

          {/* Hamburger Button */}
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg hover:bg-[#2a4a64] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-50"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X size={24} className="text-white" />
            ) : (
              <Menu size={24} className="text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={toggleMobileMenu} />
      )}

      {/* Mobile Menu Sidebar */}
      <div className={`lg:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-[#1f384c] text-white z-50 transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } shadow-2xl`}>
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a4a64]">
          <div
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleLogoClick}
          >
            <img src={logo || "/placeholder.svg"} alt="Wordzy Logo" className="h-8 w-8 mr-2" />
            <h1 className="text-xl font-bold font-['Poppins']">WORDZY</h1>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg hover:bg-[#2a4a64] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-50"
            aria-label="Close menu"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Mobile Menu Content */}
        <div className="p-4 overflow-y-auto h-full pb-20">
          <div className="mb-4">
            <h2 className="text-[#8fa3b3] text-sm font-semibold uppercase tracking-wider font-['Poppins'] border-b border-[#2a4a64] pb-2 mb-4">MENÚ</h2>
          </div>
          {renderMenuContent(true)}
        </div>
      </div>

      {/* Spacer for mobile content */}
      <div className="lg:hidden h-16"></div>
    </>
  )
}

export default Navbar
