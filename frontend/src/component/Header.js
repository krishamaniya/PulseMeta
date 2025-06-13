// import { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaUser, FaSignOutAlt, FaLink, FaBars } from "react-icons/fa";
// import { IoMdNotificationsOutline } from "react-icons/io";
// import axios from "axios";

// const Header = ({ isSidebarExpanded, toggleSidebar }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   // const loc = useLocation();
//   const [isNotificationOpen, setIsNotificationOpen] = useState(false);
//   const [userRole, setUserRole] = useState(null);
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();
//   const notificationRef = useRef(null);
//   const profileRef = useRef(null);

//   const BaseUrl = "http://82.25.109.28:8000/api";

//   const getUser = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const role = localStorage.getItem("role");
  
//       if (!token || !role) {
//         console.error("Token or role is missing");
//         navigate("/login");
//         return;
//       }
  
//       let apiPath;
//       if (role.toLowerCase() === "admin") {
//         apiPath = `${BaseUrl}/admin/getAdminProfile`;
//       } else if (role.toLowerCase() === "client") {
//         apiPath = `${BaseUrl}/client/getClientProfile`;
//       } else {
//         console.error("Invalid role detected");
//         return;
//       }
  
//       const response = await axios.get(apiPath, {
//         headers: {
//           Authorization: token,
//         },
//       });
  
//       if (!response.data || !response.data.data) {
//         console.error("Invalid user data received");
//         return;
//       }
  
//       setUser(response.data.data);
//       setUserRole(response.data.data.role.toLowerCase()); //  Update userRole state
  
//       // Store user details
//       localStorage.setItem("role", response.data.data.role);
//       localStorage.setItem("user", response.data.data._id);
//     } catch (error) {
//       console.error("Error fetching user data:", error);
//     }
//   };
  
//   useEffect(() => {
//     getUser();
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("role");
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   return (
//     <div
//       className={`fixed top-0 left-0 bg-white shadow-md p-4 flex justify-between items-center z-50 transition-all duration-300 ${
//         isSidebarExpanded ? "w-[calc(100%-15rem)] ml-60" : "w-[calc(100%-5rem)] ml-20"
//       }`}
//     >
//       {/* Left Section: Sidebar Toggle Button & Dashboard Title */}
//       <div className="flex items-center space-x-4">
//         <button onClick={toggleSidebar} className="text-gray-700 focus:outline-none">
//           <FaBars size={24} />
//         </button>
//         <h1 className="text-xl font-bold text-orange-600">Dashboard</h1>
//       </div>

//       {/* Right Section: Notifications & Profile */}
//       <div className="flex items-center space-x-6 relative">
//         {/* Notification Icon */}
//         <div className="relative" ref={notificationRef}>
//           <div
//             className="cursor-pointer text-gray-700 flex items-center"
//             onClick={() => setIsNotificationOpen(!isNotificationOpen)}
//           >
//             <IoMdNotificationsOutline size={24} />
//             <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
//               3
//             </span>
//           </div>
//         </div>

//         {/* Profile Section */}
//         <div className="relative" ref={profileRef}>
//           <div
//             className="flex items-center space-x-2 cursor-pointer"
//             onClick={() => setIsOpen(!isOpen)}
//           >
//             <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300">
//               <img
//                 src={user?.profilePhoto || "https://via.placeholder.com/150"}
//                 alt="User"
//                 className="w-full h-full object-cover"
//               />
//             </div>
//             <div className="text-gray-700">
//               <p className="font-semibold">{user?.username || "Loading..."}</p>
//               <p className="text-xs text-gray-500">{user?.email || "Loading..."}</p>
//             </div>
//           </div>

//           {/* Profile Dropdown */}
//           {isOpen && (
//             <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg p-2 z-50">
//               <div className="p-2 space-y-2">
//                 {/* Profile Option */}
//                 <div
//                   className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
//                   onClick={() => navigate("/dashboard/profile")}
//                 >
//                   <FaUser className="text-gray-600" />
//                   <span>Profile</span>
//                 </div>

//                 {/* Show Subscription & Webhook Only for Clients */}
//                 {userRole === "client" &&(
//                   <>
//                     <div
//                       className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
//                       onClick={() => navigate("/dashboard/subscription")}
//                     >
//                       <FaLink className="text-gray-600" />
//                       <span>Subscription</span>
//                     </div>

//                     <div
//                       className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
//                       onClick={() => navigate("/dashboard/webhook")}
//                     >
//                       <FaLink className="text-gray-600" />
//                       <span>Webhook</span>
//                     </div>
//                   </>
//                 )}

//                 {/* Logout Button */}
//                 <div
//                   className="flex items-center space-x-2 text-red-500 cursor-pointer hover:bg-gray-100 p-2 rounded"
//                   onClick={handleLogout}
//                 >
//                   <FaSignOutAlt />
//                   <span>Logout</span>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Header;

import { useState, useEffect, useRef ,useCallback } from "react";
import { useNavigate , useLocation } from "react-router-dom";
import { FaUser, FaSignOutAlt, FaLink, FaBars } from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io";
import axios from "axios";

const Header = ({ isSidebarExpanded, toggleSidebar }) => {
  const [isOpen, setIsOpen] = useState(false);
  const loc = useLocation();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [role, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(localStorage.getItem("profilePhoto"));

  const navigate = useNavigate();
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const BaseUrl = "http://82.25.109.28:8000/api";

  const getUser = useCallback(async () => { 
    try {
      const role = localStorage.getItem("role");
      let apiPath;

      if (role.toLowerCase() === "admin") {
        apiPath = `${BaseUrl}/admin/getAdminProfile`;
      } else if (role.toLowerCase() === "client") {
        apiPath = `${BaseUrl}/client/getClientProfile`;
      } else {
        return;
      }
      const response = await axios.get(apiPath, {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      });
      if (response.data.data) {
      setUser(response.data.data);
      setUserRole(response.data.data.role.toLowerCase());

        // Update Profile Photo in Local Storage
        if (response.data && response.data.data.profilePhoto) {
          const updatedPhoto = `http://82.25.109.28:8000${response.data.data.profilePhoto}`;

          //Update profile photo for **both admin & client**
          localStorage.setItem("profilePhoto", updatedPhoto);
          setProfilePhoto(updatedPhoto);

          //Dispatch storage event so all components update
          window.dispatchEvent(new Event("storage"));
        }
    }
    // if (["/admindashboard", "/dashboard"].includes(loc.pathname)) {
    //   if (response.data.data.role === "admin") {
    //     navigate("/admindashboard");
    //   } else {
    //     navigate("/dashboard");
    //   }
    // }
        if (loc.pathname === "/admindashboard" || loc.pathname === "/dashboard") {
        if (response.data.data.role === "admin") {
          localStorage.setItem("role", response.data.data.role);
          localStorage.setItem("user", response.data.data._id);
          navigate("/admindashboard");
        } else {
          localStorage.setItem("role", response.data.data.role);
          localStorage.setItem("user", response.data.data._id);
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, [navigate, loc.pathname]);

  useEffect(() => {
    getUser();
  
    const handleStorageChange = () => {
      const updatedPhoto = localStorage.getItem("profilePhoto");
      if (updatedPhoto) {
        setProfilePhoto(updatedPhoto);
      }
    };
  
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  },[]);
  
  useEffect(() => {
    const updateProfilePhoto = () => {
      const storedPhoto = localStorage.getItem("profilePhoto");
      if (storedPhoto) {
        setProfilePhoto(storedPhoto);
      }
    };
  
    // Listen for changes in profile photo
    window.addEventListener("storage", updateProfilePhoto);
  
    return () => {
      window.removeEventListener("storage", updateProfilePhoto);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("profilePhoto");
    navigate("/login");
  };

  return (
    <div
      className={`fixed top-0 left-0 bg-white shadow-md p-4 flex justify-between items-center z-50 transition-all duration-300 ${
        isSidebarExpanded ? "w-[calc(100%-15rem)] ml-60" : "w-[calc(100%-5rem)] ml-20"
      }`}
    >
      {/* Left Section: Sidebar Toggle Button & Dashboard Title */}
      <div className="flex items-center space-x-4">
        <button onClick={toggleSidebar} className="text-gray-700 focus:outline-none">
          <FaBars size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Right Section: Notifications & Profile */}
      <div className="flex items-center space-x-6 relative">
        {/* Notification Icon */}
        <div className="relative" ref={notificationRef}>
          <div
            className="cursor-pointer text-gray-700 flex items-center"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          >
            <IoMdNotificationsOutline size={24} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
              3
            </span>
          </div>

          {/* Notification Box */}
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg p-2 z-50">
              <p className="text-sm text-gray-700 p-2">No new notifications</p>
            </div>
          )}
        </div>

        {/* Profile Section */}
        <div className="relative" ref={profileRef}>
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300">
              <img
                  src={
                    user && user.profilePhoto
                    ? user.profilePhoto.startsWith("http")?user.profilePhoto:`http://82.25.109.28:8000${user.profilePhoto}`: "https://via.placeholder.com/150"
                  }
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-gray-700">
              <p className="font-semibold">{user?.username || "Loading..."}</p>
              <p className="text-xs text-gray-500">{user?.email || "Loading..."}</p>
            </div>
          </div>

          {/* Profile Dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg p-2 z-50">
              <div className="p-2 space-y-2">
                {/* Profile Option */}
                <div
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
                  onClick={() => {
                    if (role === "admin") {
                      navigate("/admindashboard/profile"); // Admin profile page
                    } else {
                      navigate("/dashboard/profile"); // Client profile page
                    }
                    setIsOpen(false);
                  }}
                >
                  <FaUser className="text-gray-600" />
                  <span>Profile</span>
                </div>

                {/* Subscription & Webhook for Clients */}
                {role === "client" && (
                  <>
                    <div
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
                      onClick={() => {
                        navigate("/dashboard/subscription");
                        setIsOpen(false);
                      }}
                    >
                      <FaLink className="text-gray-600" />
                      <span>Subscription</span>
                    </div>

                    <div
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
                      onClick={() => {
                        navigate("/dashboard/webhook");
                        setIsOpen(false);
                      }}
                    >
                      <FaLink className="text-gray-600" />
                      <span>Webhook</span>
                    </div>
                  </>
                )}

                {/* Logout Button */}
                <div
                  className="flex items-center space-x-2 text-red-500 cursor-pointer hover:bg-gray-100 p-2 rounded"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;



