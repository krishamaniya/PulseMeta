import { useState } from "react";
import { FaUser, FaEnvelope, FaMobile, FaLock, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import { BaseUrl } from "../App";


const BaseUrl = "http://localhost:8000/api";

const CreateProfile = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    username: "",
    password: "",
    agree: false,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("Submitting form data:", formData); 
    if (!formData.agree) {
      setErrorMessage("You must agree to the terms & conditions.");
      return;
    }
  
    setLoading(true);
    setErrorMessage("");
  
    try {
      const { data } = await axios.post(`${BaseUrl}/client/registerClient`, formData);
      console.log("API Response:", data); 
      alert("Registration successful! Redirecting to login...");
      navigate("/login");
  
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message); 
      setErrorMessage(error.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/bgg.png')" }}>
      <div className="flex flex-row items-center space-x-8 bg-[#060C32] bg-opacity-50 p-10 rounded-lg ml-10">
        
        {/* Logo Section */}
        <div className="relative w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-lg">
          <img src="/logo1.png" alt="Logo" className="w-24" />
        </div>

        {/* Form Section */}
        <div className="bg-transparent text-white p-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-4">Create Profile</h2>

          {/* Show error message */}
          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField Icon={FaUser} type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
            <InputField Icon={FaEnvelope} type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
            <InputField Icon={FaMobile} type="text" name="mobileNumber" placeholder="Mobile Number" value={formData.mobileNumber} onChange={handleChange} />
            <InputField Icon={FaUserCircle} type="text" name="username" placeholder="Choose Username" value={formData.username} onChange={handleChange} />
            <InputField Icon={FaLock} type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />

            {/* Terms & Conditions */}
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <input type="checkbox" name="agree" checked={formData.agree} onChange={handleChange} className="w-4 h-4" />
              <span>I agree with <span className="text-orange-400">Disclaimer, Terms & Conditions</span></span>
            </div>

            {/* Register Button */}
            <button type="submit" className={`w-80 mt-4 py-3 text-white font-semibold rounded-lg transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`} disabled={loading}>
              {loading ? "Registering..." : "REGISTER"}
            </button>
          </form>

          {/* Back to Login */}
          <p className="mt-4 text-sm text-gray-400 cursor-pointer flex items-center justify-center" onClick={() => navigate("/login")}>
            Back to Login <span className="ml-2">➞</span>
          </p>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ Icon, type, name, placeholder, value, onChange }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-3 text-gray-500" />
    <input type={type} name={name} placeholder={placeholder} value={value} onChange={onChange} required className="w-80 pl-10 pr-4 py-3 rounded-lg bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />
  </div>
);



export default CreateProfile;
