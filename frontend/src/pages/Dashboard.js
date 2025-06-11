import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Sidebar from "../component/Sidebar";
import Header from "../component/Header";
import ManageAccounts from "../component/client/ManageAccounts";
import AddMaster from "../component/client/Addmaster";
import MapChild from "../component/client/Mapchild";
import History from "../component/client/History";
import ProfileSettings from "../component/client/profile";
import Subscription from "../component/client/subscription";
import Webhook from "../component/client/webhook";


const Dashboard = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      // console.log("Restoring Token:", storedToken);
    }
  }, [token,navigate]);/*dfbfncxvmfffmgc remove*/

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar isExpanded={isSidebarExpanded} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarExpanded ? "ml-60" : "ml-20"}`}>
        <Header isSidebarExpanded={isSidebarExpanded} toggleSidebar={toggleSidebar} />

        {/* Add padding to prevent content from going under the fixed header */}
        <div className="p-4 pt-20 overflow-auto h-full">
          <Routes>
            <Route path="*" element={<Navigate to="/dashboard/account" />} />
            <Route path="/account" element={<ManageAccounts />} />
            <Route path="/add" element={<AddMaster />} />
            <Route path="/mapchild" element={<MapChild />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/webhook" element={<Webhook />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
