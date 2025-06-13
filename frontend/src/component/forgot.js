import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BaseUrl = "http://82.25.109.28:8000/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [generatedCaptcha, setGeneratedCaptcha] = useState(generateCaptcha());
  const [loading, setLoading] = useState(false);

  function generateCaptcha() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  const handleForgotPassword = async () => {
    if (captcha !== generatedCaptcha) {
      alert("Incorrect Captcha!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BaseUrl}/client/forgotPassword`, { email });
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send reset link.");
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
          <h2 className="text-xl pb-4">Trouble logging in?</h2>

          {/* Email Input */}
          <div className="mb-4 relative">
            <FaUser className="absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-80 pl-10 pr-4 py-3 rounded-lg bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Captcha Section */}
          <div className="mb-4 flex flex-col items-center">
            <div className="bg-blue-200 text-blue-900 font-bold text-2xl p-2 w-full text-center rounded-md">
              {generatedCaptcha}
            </div>
            <div className="relative pt-4">
              <FaLock className="absolute left-3 bottom-4 text-gray-500" />
              <input
                type="text"
                placeholder="Enter Above Captcha"
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value)}
                className="w-80 pl-10 pr-4 py-3 rounded-lg bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Reset Button */}
          <button
            className={`w-80 mt-6 py-3 text-white font-semibold rounded-lg transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
            onClick={handleForgotPassword}
            disabled={loading}
          >
            {loading ? "Sending..." : "RESET"}
          </button>

          {/* Back to Login */}
          <p className="mt-4 text-sm text-gray-400 cursor-pointer flex items-center justify-center" onClick={() => navigate("/login")}>
            Back to Login <span className="ml-2">➞</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
