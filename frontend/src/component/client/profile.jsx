// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const ProfileSettings = ({ setHeaderProfilePhoto }) => {
//   const [currentPassword, setCurrentPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [profileName, setProfileName] = useState("");
//   const [mobileNumber, setMobileNumber] = useState("");
//   const [profileImage, setProfileImage] = useState(null);
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [profileMessage, setProfileMessage] = useState(""); 
//   const [passwordMessage, setPasswordMessage] = useState(""); 

//   const token = localStorage.getItem("token");


//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         if (!token) {
//           return;
//         }

//         const response = await axios.get("http://82.25.109.28:8000/api/client/getClientProfile", {
//           headers: { Authorization: token },
//         });

//         const { name, mobileNumber, password, profilePhoto } = response.data;

//         setProfileName(name || "");
//         setMobileNumber(mobileNumber || "");
//         setCurrentPassword(password || "");
//         if (profilePhoto) {
//           localStorage.setItem("profilePhoto", profilePhoto);
//           setHeaderProfilePhoto(profilePhoto);
//         }
//       } catch (error) {
//         console.error("Error fetching profile:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, [token,setHeaderProfilePhoto]);

//   //Handle Image Selection
//   const handleFileChange = (e) => {
//     setProfileImage(e.target.files[0]);
//   };

//   //Show Message Below the Clicked Button
//   const showMessage = (type, text) => {
//     if (type === "profile") {
//       setProfileMessage(text);
//       setTimeout(() => setProfileMessage(""), 3000);
//     } else if (type === "password") {
//       setPasswordMessage(text);
//       setTimeout(() => setPasswordMessage(""), 3000);
//     }
//   };

//   //Update Profile API Call
//  const handleProfileUpdate = async () => {
//   try {
//     setProfileMessage(""); // Reset message

//     const formData = new FormData();
//     // formData.append("name", profileName);
//     // formData.append("mobileNumber", mobileNumber);
//     if (profileImage) {
//       formData.append("profilePhoto", profileImage);
//     }

//     const response = await axios.patch("http://82.25.109.28:8000/api/client/updateClientProfile", formData, {
//       headers: {
//         Authorization: token,
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     console.log("Profile Update Response:", response.data);

//     if (response.status === 200 && response.data.success) {
//       showMessage("profile", "Profile updated successfully!");

//       //Update Local Storage Immediately
//       if (response.data.client.profilePhoto) {
//         const updatedPhoto = response.data.client.profilePhoto;
//         localStorage.setItem("profilePhoto", updatedPhoto);

//         //Dispatch storage event to auto-refresh Header
//         window.dispatchEvent(new Event("storage"));

//         //Update state to trigger re-render
//         setHeaderProfilePhoto(updatedPhoto);
//       }
//     } else {
//       // If response exists but success is false
//       showMessage("profile", `Failed to update profile - ${response.data.message}`);
//     }
    
//   } catch (error) {
//     console.error("Update Error:", error);
//        // Ensure error is only displayed if it truly exists
//       //  const errorMessage = error.response?.data?.message || "Server error";
//       //  showMessage("profile", `Failed to profilephoto update profile - ${errorMessage}`);
     
//   }
  
// };

//  // Update Password API Call
//  const handlePasswordUpdate = async () => {
//   try {
//     if (!currentPassword || !newPassword) {
//       showMessage("password", "Please enter current and new password.");
//       return;
//     }

//     const response = await axios.patch(
//       "http://82.25.109.28:8000/api/client/updateClientProfile",
//       { currentPassword, newPassword },
//       { headers: { Authorization: token } }
//     );

//     if (response.status === 200 && response.data.success) {
//       showMessage("password", "Password updated successfully!");
//       setCurrentPassword(""); // Clear input
//       setNewPassword(""); // Clear input
//     } else {
//       showMessage("password", response.data.message || "Failed to update password.");
//     }
//   } catch (error) {
//     showMessage("password", "Incorrect current password.");
//   }
// };

//   if (loading) return <p>Loading profile...</p>;

//   return (
//     <div className="flex bg-gray-100 p-4">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-9xl">
//         {/* Change Password Section */}
//         <div className="bg-white p-6 rounded-lg shadow-md w-full">
//           <h2 className="text-xl font-bold text-blue-900 mb-4">Change Password</h2>
//           <div className="mb-4">
//             <label className="block text-blue-600 mb-1">Current Password</label>
//             <input
//               type="password"
//               className="w-full p-2 border rounded-lg"
//               value={currentPassword}
//               onChange={(e) => setCurrentPassword(e.target.value)}
//             />
//           </div>
//           <div className="mb-4 relative">
//             <label className="block text-blue-600 mb-1">New Password</label>
//             <input
//               type={showPassword ? "text" : "password"}
//               className="w-full p-2 border rounded-lg bg-blue-50"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//             />
//             <button
//               type="button"
//               className="absolute right-3 top-9 text-gray-500"
//               onClick={() => setShowPassword(!showPassword)}
//             >
//               {showPassword ? "Hide" : "Show"}
//             </button>
//           </div>
//           <button
//             onClick={handlePasswordUpdate}
//             className="bg-green-700 text-white py-2 px-4 rounded-lg hover:bg-green-800"
//           >
//             Update Password
//           </button>
//           {/*Message below the password update button */}
//           {passwordMessage && <p className="text-green-700 mt-2">{passwordMessage}</p>}
//         </div>

//         {/* Profile Settings Section */}
//         <div className="bg-white p-6 rounded-lg shadow-md w-full">
//           <h2 className="text-xl font-bold text-blue-900 mb-4">Profile Setting</h2>
//           <div className="mb-4">
//             <label className="block text-blue-600 mb-1">Profile Name</label>
//             <input
//               type="text"
//               className="w-full p-2 border rounded-lg"
//               value={profileName}
//               onChange={(e) => setProfileName(e.target.value)}
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-blue-600 mb-1">Mobile Number</label>
//             <input
//               type="text"
//               className="w-full p-2 border rounded-lg"
//               value={mobileNumber}
//               onChange={(e) => setMobileNumber(e.target.value)}
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-blue-600 mb-1">Profile Image</label>
//             <input type="file" onChange={handleFileChange} className="w-full" />
//           </div>
//           <button
//             onClick={handleProfileUpdate}
//             className="bg-green-700 text-white py-2 px-4 rounded-lg hover:bg-green-800"
//           >
//             Update Profile
//           </button>
//           {/*Message below the profile update button */}
//           {profileMessage && <p className="text-green-700 mt-2">{profileMessage}</p>}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProfileSettings;


import React, { useState, useEffect } from "react";
import axios from "axios";
  
const ProfileSettings = ({ setHeaderProfilePhoto  = () => {} }) =>{
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileName, setProfileName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [profileImage, setProfilePhoto] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token not found");
          return;
        }
    
        const response = await axios.get("http://82.25.109.28:8000/api/client/getClientProfile", {
          headers: {
            authorization: `${token}`
          },
        });
    
        if (response.data.success) {
          const { name, mobileNumber, profilePhoto } = response.data.data;
    
          setProfileName(name || ""); // Set name but make it read-only
          setMobileNumber(mobileNumber || ""); // Set mobile number but make it read-only
    
          if (profilePhoto) {
            localStorage.setItem("profilePhoto", profilePhoto);
            setHeaderProfilePhoto(profilePhoto);
          }
        } else {
          console.error("Failed to fetch profile:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching profile:", error.response?.data || error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [setHeaderProfilePhoto]);

  // Handle Image Selection
  const handleFileChange = (e) => {
    setProfilePhoto(e.target.files[0]);
  };

  // Show Message Below the Clicked Button
  const showMessage = (type, text) => {
    if (type === "profile") {
      setProfileMessage(text);
      setTimeout(() => setProfileMessage(""), 3000);
    } else if (type === "password") {
      setPasswordMessage(text);
      setTimeout(() => setPasswordMessage(""), 3000);
    }
  };

  // Update Profile API Call (Only for Profile Image)
  const handleProfileUpdate = async () => {
    try {
      setProfileMessage(""); // Reset message
  
      if (!profileImage) {
        showMessage("profile", "No new profile image selected.");
        return;
      }
  
      // Get the token properly
      const token = localStorage.getItem("token");
      if (!token) {
        showMessage("profile", "Authentication error: No token found.");
        return;
      }
  
      // Prepare FormData
      const formData = new FormData();
      formData.append("profilePhoto", profileImage);
  
      console.log("Sending Profile Update Request...");
  
      const response = await axios.patch(
        "http://82.25.109.28:8000/api/client/updateClientProfile",
        formData,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      console.log("API Response:", response.data); // Debugging Log
  
      if (response.status === 200 && response.data.success) {
        showMessage("profile", "Profile updated successfully!");
  
        if (response.data.client?.profilePhoto) {
          const updatedPhoto = `http://82.25.109.28:8000${response.data.client.profilePhoto}`;
        
          // Update State Immediately
          setHeaderProfilePhoto(updatedPhoto);
          setProfilePhoto(updatedPhoto);
        
          // Store the new profile photo in localStorage
          localStorage.setItem("profilePhoto", updatedPhoto);
        
          // Trigger storage event to update Header component
          window.dispatchEvent(new Event("storage"));
        }
        
      } else {
        showMessage("profile", `Failed to update profile - ${response.data.message}`);
      }
    } catch (error) {
      console.error("Update Error:", error.response?.data || error);
  
      // Display more detailed error messages
      if (error.response) {
        showMessage("profile", `Error: ${error.response.data.message || "Something went wrong"}`);
      } else {
        showMessage("profile", "Failed to update profile image.");
      }
    }
  };
  

  // Update Password API Call
  const handlePasswordUpdate = async () => {
    try {
      if (!currentPassword || !newPassword) {
        showMessage("password", "Please enter current and new password.");
        return;
      }

      const response = await axios.patch(
        "http://82.25.109.28:8000/api/client/updateClientProfile",
        { currentPassword, newPassword },
        { headers: { Authorization: token } }
      );

      if (response.status === 200 && response.data.success) {
        showMessage("password", "Password updated successfully!");
        setCurrentPassword(""); // Clear input
        setNewPassword(""); // Clear input
      } else {
        showMessage("password", response.data.message || "Failed to update password.");
      }
    } catch (error) {
      showMessage("password", "Incorrect current password.");
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="flex p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-9xl">
        {/* Change Password Section */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md w-full">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Change Password</h2>
          <div className="mb-4">
            <label className="block text-blue-600 mb-1">Current Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded-lg"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="mb-4 relative">
            <label className="block text-blue-600 mb-1">New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-2 border rounded-lg bg-blue-50"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <button
            onClick={handlePasswordUpdate}
            className="bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
          >
            Update Password
          </button>
          {passwordMessage && <p className="text-red-700 mt-2">{passwordMessage}</p>}
        </div>

        {/* Profile Settings Section */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md w-full">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Profile Settings</h2>
          <div className="mb-4">
            <label className="block text-blue-600 mb-1">Profile Name</label>
            <input
              type="text"
              className="w-full text-gray-600/75 dark:text-gray-400/75 p-2 border rounded-lg cursor-not-allowed"
              value={profileName}
              readOnly
            />
          </div>
          <div className="mb-4">
            <label className="block text-blue-600 mb-1">Mobile Number</label>
            <input
              type="text"
              className="w-full text-gray-600/75 dark:text-gray-400/75 p-2 border rounded-lg cursor-not-allowed"
              value={mobileNumber}
              readOnly
            />
          </div>
          <div className="mb-4">
            <label className="block text-blue-600 mb-1">Profile Image</label>
            <input type="file" onChange={handleFileChange} className="w-full" />
          </div>
          <button
            onClick={handleProfileUpdate}
            className="bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
          >
            Update Profile
          </button>
          {profileMessage && <p className="text-red-700 mt-2">{profileMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
