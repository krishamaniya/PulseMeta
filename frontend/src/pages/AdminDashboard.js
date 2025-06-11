import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Sidebar from "../component/Sidebar";
import Header from "../component/Header";
import Profile from "../component/admin/profile";
import Home from "../component/admin/home";
import DeletedClients from "../component/admin/delete";

const AdminDashboard = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role"); // Assuming you store the role in localStorage

    if (!token) {
      navigate("/");
    } else {
      setUserRole(role); // Set the user role from localStorage
    }
  }, [navigate]);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar with dynamic userRole */}
      {userRole && <Sidebar isExpanded={isSidebarExpanded} userRole={userRole} />}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarExpanded ? "ml-60" : "ml-20"}`}>
        <Header isSidebarExpanded={isSidebarExpanded} toggleSidebar={toggleSidebar} />

        {/* Add padding to prevent content from going under the fixed header */}
        <div className="p-4 pt-20 overflow-auto h-full">
          <Routes>
            <Route path="*" element={<Navigate to="/admindashboard/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/delete" element={<DeletedClients/>}/>
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
