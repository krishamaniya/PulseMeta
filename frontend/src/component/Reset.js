import { useState } from "react";
import {  FaLock } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const BaseUrl = "http://82.25.109.28:8000/api";

const ResetPasswordForm = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${BaseUrl}/client/resetPassword`, {
        token,  
        newPassword,
        confirmPassword,
      });
  
      setMessage(res.data.message);
      if (res.data.success) {
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      console.error("Reset Password API Error:", error.response?.data || error); // Log error details
      setMessage(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="flex items-center justify-center min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/bgg.png')" }}>
         <div className="flex flex-row items-center space-x-8 bg-[#060C32] bg-opacity-50 p-10 rounded-lg ml-10">
           <div className="relative w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-lg">
             <img src="/logo1.png" alt="Logo" className="w-24" />
           </div>
           <div className="bg-transparent text-white p-8 rounded-lg text-center">
             <h2 className="text-xl pb-4">Reset Password</h2>
   
             {/* Email Input */}
             <div className="mb-4 relative">
               <FaLock className="absolute left-3 top-3 text-gray-500" />
               <input
                 type="text"
                 placeholder="Enter New Password"
                 value={newPassword}
                 onChange={(e) => setNewPassword(e.target.value)}
                 className="w-80 pl-10 pr-4 py-3 rounded-lg bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
               />
             </div>

             <div className="mb-4 relative">
               <FaLock className="absolute left-3 top-3 text-gray-500" />
               <input
                 type="password"
                 placeholder="Confirm Password"
                 value={confirmPassword}
                 onChange={(e) => setConfirmPassword(e.target.value)}
                 className="w-80 pl-10 pr-4 py-3 rounded-lg bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
               />
             </div>
        
        {/* Reset Button */}
        <button
          className={`w-80 mt-6 py-3 text-white font-semibold rounded-lg transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
          onClick={handleResetPassword}
          disabled={loading}
        >
          {loading ? "Updating..." : "Reset Password"}
        </button>
        
        {/* Success/Error Message */}
        <p className="mt-4 text-green-400">{message}</p>
        
        {/* Back to Login */}
        <p className="mt-4 text-sm text-gray-400 cursor-pointer flex items-center justify-center" onClick={() => navigate("/login")}>
          Back to Login <span className="ml-2">➞</span>
        </p>
      </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
