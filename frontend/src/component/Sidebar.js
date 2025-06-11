import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaChevronDown,
  FaChevronRight,
  FaCloudUploadAlt,
  FaHouseUser,
  FaTrashRestore,
  FaUserCircle,
  FaRedRiver,
  FaMapMarkedAlt,
  FaHackerrank     
} from "react-icons/fa";

// Define menu items for Admin
const AdminMenuItems = [
  {
    label: "Home",
    icon: <FaHouseUser  size={22} />,
    link: "/admindashboard/home",
  },
  {
    label: "Delete Client",
    icon: <FaTrashRestore  size={19} />,
    link: "/admindashboard/delete",
  },
];

// Define menu items for Client
const ClientMenuItems = [
  {
    label: "Account",
    icon: <FaUserCircle  size={24} />,
    link: "/dashboard/account",
  },
  {
    label: "Copy Trading",
    icon: <FaRedRiver  size={24} />,
    subMenu: [
      {
        label: "Add Master",
        link: "/dashboard/add",
        icon: <FaCloudUploadAlt size={20} />,
      },
      {
        label: "Map Child",
        link: "/dashboard/mapchild",
        icon: <FaMapMarkedAlt  size={20} />,
      },
    ],
  },
  {
    label: "History",
    icon: <FaHackerrank  size={24} />,
    link: "/dashboard/history",
  },
];

const Sidebar = ({ isExpanded, userRole }) => {
  const [openMenu, setOpenMenu] = useState(null);

  // Toggle Submenu
  const toggleSubMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  
  // Determine which menu to display based on role
  const menuItems = userRole === "admin" ? AdminMenuItems  : ClientMenuItems;

  return (
    <div
      className={`${
        isExpanded ? "w-60" : "w-20"
      } fixed top-0 left-0 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white h-screen flex flex-col py-4 transition-all duration-300 z-50`}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="relative w-14 h-14 bg-white rounded-full overflow-hidden mx-auto my-4">
          <img src="/logo1.png" alt="Logo" className="w-full h-full object-cover" />
        </div>

        {/* Sidebar Links */}
        <div className="flex flex-col space-y-4 flex-grow">
          {menuItems.map((menuItem, index) => (
            <div key={index} className="flex flex-col">
              {/* If there's a submenu, show a button */}
              {menuItem.subMenu ? (
                <>
                  <button
                    onClick={() => toggleSubMenu(menuItem.label)}
                    className="flex items-center justify-between px-4 py-2 w-full text-left hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      {menuItem.icon}
                      {isExpanded && <span className="ml-2">{menuItem.label}</span>}
                    </div>
                    {isExpanded && (openMenu === menuItem.label ? <FaChevronDown /> : <FaChevronRight />)}
                  </button>

                  {/* Submenu Items */}
                  {openMenu === menuItem.label && (
                    <div className="flex flex-col bg-gray-700 px-4">
                      {menuItem.subMenu.map((subMenuItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subMenuItem.link}
                          className="flex items-center py-2 hover:text-gray-300"
                        >
                          {subMenuItem.icon}
                          {isExpanded && <span className="ml-2">{subMenuItem.label}</span>}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                // If no submenu, show a direct link
                <Link to={menuItem.link} className="flex items-center px-4 py-2 hover:bg-gray-700">
                  {menuItem.icon}
                  {isExpanded && <span className="ml-2">{menuItem.label}</span>}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
