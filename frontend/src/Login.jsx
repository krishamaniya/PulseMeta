// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaUser, FaLock } from "react-icons/fa";
// import { ToastContainer, toast } from "react-toastify";
// import axios from "axios";

// const BaseUrl = "http://localhost:8000/api"; // Update if needed

// const Login = () => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [eyelock, setEyelock] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const role = localStorage.getItem("role");
//     if (token && role) {
//       if (role === "admin") {
//         navigate("/pages/admindashboard");
//       } else if (role === "client") {
//         navigate("/dashboard");
//       }
//     }
//   }, [navigate]);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       let response;
//       let role;

//       // Attempt admin login
//       try {
//         response = await axios.post(`${BaseUrl}/admin/adminlogin`, { username, password });
//         role = "admin";
//       } catch (adminError) {
//         // If admin login fails, attempt client login
//         try {
//           response = await axios.post(`${BaseUrl}/client/clientlogin`, { username, password });
//           role = "client";
//         } catch (clientError) {
//           toast.error("Invalid username or password");
//           return;
//         }
//       }

//       if (response?.data?.token) {
//         localStorage.setItem("token", response.data.token);
//         localStorage.setItem("role", role);

//         toast.success("Login Successful");
//         navigate(role === "admin" ? "/admindashboard" : "/dashboard");
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Login failed");
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#040e05] to-[#0e1a3b]">
//       <div className="flex flex-col items-center space-y-8">
//         <div className="relative w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-lg">
//           <img alt="Logo" className="w-24"/>
//         </div>

//         <div className="bg-transparent text-white p-8 rounded-lg text-center">
//           <h2 className="text-xl font-semibold mb-4">Login</h2>

//           <form onSubmit={handleLogin} className="space-y-4">
//             <div className="relative">
//               <FaUser className="absolute left-3 top-3 text-gray-500" />
//               <input
//                 type="text"
//                 placeholder="User Name"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 className="w-80 pl-10 pr-4 py-3 rounded-lg bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//             </div>
//             <div className="relative">
//               <FaLock className="absolute left-3 top-3 text-gray-500" />
//               <input
//                 type={eyelock ? "text" : "password"}
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-80 pl-10 pr-4 py-3 rounded-lg bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//               <span className="absolute right-3 top-3 cursor-pointer" onClick={() => setEyelock(!eyelock)}>
//                 <i className={eyelock ? "bi-eye" : "bi bi-eye-slash"}></i>
//               </span>
//             </div>

//             <button type="submit" className="w-80 mt-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition">
//               LOGIN
//             </button>
//           </form>

//           <p className="mt-4 text-sm text-gray-400">Forgot Username or Password?</p>
//           <p className="mt-4 text-orange-500 cursor-pointer" onClick={() => navigate("/register")}>Create Profile ➞</p>
//         </div>
//       </div>
//       <ToastContainer position="bottom-right" />
//     </div>
//   );
// };

// export default Login;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import axios from "axios";

const BaseUrl = "http://localhost:8000/api"; 

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [eyelock, setEyelock] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) {
      if (role === "admin") {
        navigate("/admindashboard");
      } else if (role === "client") {
        navigate("/dashboard");
      }else {
        console.error("Invalid role requird");
      }
    }
  }, [navigate]);

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    let response;
    let role;

    try {
      response = await axios.post(`${BaseUrl}/admin/adminlogin`, { username, password });
      role = "admin";
    } catch (adminError) {
      try {
        response = await axios.post(`${BaseUrl}/client/clientlogin`, { username, password });
        role = "client";
      } catch (clientError) {
        toast.error("Invalid username or password");
        return;
      }
    }

    console.log("Response data:", response.data);

    if (!response.data.token) {
      toast.error("No token received");
      return;
    }

    // console.log("Saving token to localStorage:", response.data.token);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("role", role);
    // console.log("Token in localStorage:", localStorage.getItem("token"));

    toast.success("Login Successful");
    navigate(role === "admin" ? "/admindashboard" : "/dashboard");
  } catch (error) {
    toast.error(error.response?.data?.message || "Login failed");
  }
};



  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   try {
  //     let response;
  //     let role;

  //     // Attempt admin login
  //       try {
  //         response = await axios.post(`${BaseUrl}/admin/adminlogin`, { username, password });
  //         role = "admin";
  //       } catch (adminError) {
  //         // If admin login fails, attempt client login
  //         try {
  //           response = await axios.post(`${BaseUrl}/client/clientlogin`, { username, password });
  //           role = "client";
  //         } catch (clientError) {
  //           toast.error("Invalid username or password");
  //           return;
  //         }
  //       }
      
  //     toast.success("Login Successful");
  //     navigate(role === "admin" ? "/admindashboard" : "/dashboard");

  //     if (response?.data?.token) {
  //       localStorage.setItem("token", response.data.token);
  //       // console.log(localStorage.getItem("token"));
  //       localStorage.setItem("role", role);
  //     }
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || "Login failed");
  //   }
  // };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/bgg.png')" }}
    >
      <div className="flex flex-row items-center space-x-8 bg-[#060C32] bg-opacity-50 p-10 rounded-lg ml-10">
        
        {/* Logo Section */}
        <div className="relative w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-lg">
          <img src="/logo1.png" alt="Logo" className="w-24" />
        </div>

        {/* Login Form */}
        <div className="bg-transparent text-white p-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-4 text-center">Login</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="User Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-80 pl-10 pr-4 py-3 rounded-lg bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-500" />
              <input
                type={eyelock ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-80 pl-10 pr-10 py-3 rounded-lg bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <span className="absolute right-3 top-3 cursor-pointer text-gray-600" onClick={() => setEyelock(!eyelock)}>
                {eyelock ? <AiFillEye size={20} /> : <AiFillEyeInvisible size={20} />}
              </span>
            </div>

            <button type="submit" className="w-80 mt-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition">
              LOGIN
            </button>
          </form>

          {/* Forgot Password & Create Profile Links */}
          <p className="mt-4 text-sm text-gray-400 text-center cursor-pointer hover:text-white" onClick={() => navigate("/resetpassword")}>
            Forgot Username or Password?
          </p>
          <p className="mt-4 text-gray-400 cursor-pointer text-center hover:text-white" onClick={() => navigate("/createprofile")}>
            Create Profile ➞
          </p>
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default Login;



// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaUser, FaLock } from "react-icons/fa";
// import { ToastContainer, toast } from "react-toastify";
// import axios from "axios";

// const BaseUrl = "http://localhost:8000/api"; // Update if needed

// const Login = () => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [eyelock, setEyelock] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const role = localStorage.getItem("role");
//     if (token && role) {
//       if (role === "admin") {
//         navigate("/pages/admindashboard");
//       } else if (role === "client") {
//         navigate("/dashboard");
//       }
//     }
//   }, [navigate]);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       let response;
//       let role;

//       // Attempt admin login
//       try {
//         response = await axios.post(`${BaseUrl}/admin/adminlogin`, { username, password });
//         role = "admin";
//       } catch (adminError) {
//         // If admin login fails, attempt client login
//         try {
//           response = await axios.post(`${BaseUrl}/client/clientlogin`, { username, password });
//           role = "client";
//         } catch (clientError) {
//           toast.error("Invalid username or password");
//           return;
//         }
//       }

//       if (response?.data?.token) {
//         localStorage.setItem("token", response.data.token);
//         localStorage.setItem("role", role);

//         toast.success("Login Successful");
//         navigate(role === "admin" ? "/admindashboard" : "/dashboard");
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Login failed");
//     }
//   };

//   return (
   
//     <div
//       className="flex items-center justify-center min-h-screen bg-cover bg-center"
//       style={{ backgroundImage: "url('/111.png')" }}
//     >
//       <div className="flex flex-col-2 items-center space-y-8 bg-white bg-opacity-10  p-10 rounded-lg">
//         <div className="relative w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-lg">
//           <img src="/logoo.png" alt="Logo" className="w-24" />
//         </div>

//         <div className="bg-transparent text-white p-8 rounded-lg text-center">
//           <h2 className="text-xl font-semibold mb-4">Login</h2>
        

//           <form onSubmit={handleLogin} className="space-y-4">
//             <div className="relative">
//               <FaUser className="absolute left-3 top-3 text-gray-500" />
//               <input
//                 type="text"
//                 placeholder="User Name"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 className="w-80 pl-10 pr-4 py-3 rounded-lg bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//             </div>
//             <div className="relative">
//               <FaLock className="absolute left-3 top-3 text-gray-500" />
//               <input
//                 type={eyelock ? "text" : "password"}
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-80 pl-10 pr-4 py-3 rounded-lg bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//               <span className="absolute right-3 top-3 cursor-pointer" onClick={() => setEyelock(!eyelock)}>
//                 <i className={eyelock ? "bi-eye" : "bi bi-eye-slash"}></i>
//               </span>
//             </div>

//             <button type="submit" className="w-80 mt-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition">
//               LOGIN
//             </button>
//           </form>

//           <p className="mt-4 text-sm text-gray-400">Forgot Username or Password?</p>
//           <p className="mt-4 text-white-500 cursor-pointer" onClick={() => navigate("/register")}>Create Profile ➞</p>
//         </div>
//       </div>
//       <ToastContainer position="bottom-right" />
//     </div>
//   );
// };

// export default Login;

