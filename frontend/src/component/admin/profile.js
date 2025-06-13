import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const ProfileSettings = ({ setHeaderProfilePhoto = () => {} }) => {
  const [profileName, setProfileName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  // Use `useRef()` to prevent unnecessary re-renders
  const currentPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);

const token = localStorage.getItem("token");

  // Fetch profile (Runs **only once** when component mounts)
  const fetchProfile = async () => {
    try {
      if (!token) {
        console.error("Token not found");
        return;
      }

      const response = await axios.get("http://82.25.109.28:8000/api/admin/getAdminProfile", {
        headers: { Authorization: `${token}` },
      });

      if (response.data.success) {
        const { name, mobileNo, profilePhoto } = response.data.data;

        setProfileName(name || "");
        setMobileNo(mobileNo || "");

        if (profilePhoto) {
          localStorage.setItem("profilePhoto", profilePhoto);
          setHeaderProfilePhoto(profilePhoto);
        }
      } else {
        showMessage("Failed to fetch profile:", response.data.message);
      }
    } catch (error) {
      showMessage("Error fetching profile:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []); // Runs only **once** when the component mounts

  const handleProfileUpdate = async () => {
    try {
      setProfileMessage(""); // Reset message
  
      if (!profilePhoto) {
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
      formData.append("profilePhoto", profilePhoto);
  
      console.log("Sending Profile Update Request...");
  
      const response = await axios.patch(
        "http://82.25.109.28:8000/api/admin/updateAdminProfile",
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

  //  Prevent unnecessary API calls by using `useRef`
  const handlePasswordUpdate = async () => {
    const currentPassword = currentPasswordRef.current.value;
    const newPassword = newPasswordRef.current.value;

    if (!currentPassword || !newPassword) {
      setPasswordMessage("Please enter current and new password.");
      return;
    }

    try {
      const response = await axios.patch(
        "http://82.25.109.28:8000/api/admin/updateAdminProfile",
        { currentPassword, newPassword },
        { headers: { Authorization: token } }
      );

      if (response.status === 200 && response.data.success) {
        setPasswordMessage("Password updated successfully!");
        currentPasswordRef.current.value = "";
        newPasswordRef.current.value = "";
      } else {
        setPasswordMessage(response.data.message || "Failed to update password.");
      }
    } catch (error) {
      setPasswordMessage("Incorrect current password.");
    }
  };

  const showMessage = (type, text) => {
    if (type === "profile") {
      setProfileMessage(text);
      setTimeout(() => setProfileMessage(""), 3000);
    } else if (type === "password") {
      setPasswordMessage(text);
      setTimeout(() => setPasswordMessage(""), 3000);
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="flex  p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full  max-w-9xl">
        {/* Change Password Section */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md w-full ">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Change Password</h2>
          <div className="mb-4">
            <label className="block text-blue-600 mb-1">Current Password</label>
            <input type="password" className="w-full p-2 border rounded-lg" ref={currentPasswordRef} />
          </div>
          <div className="mb-4 relative">
            <label className="block text-blue-600 mb-1">New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-2 border rounded-lg bg-blue-50"
              ref={newPasswordRef}
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
            <input type="text" className="w-full text-gray-600/75 dark:text-gray-400/75 p-2 border rounded-lg" value={profileName} readOnly />
          </div>
          <div className="mb-4">
            <label className="block text-blue-600 mb-1">Mobile Number</label>
            <input type="text" className="w-full text-gray-600/75 dark:text-gray-400/75 p-2 border rounded-lg" value={mobileNo} readOnly />
          </div>
          <div className="mb-4">
            <label className="block text-blue-600 mb-1">Profile Image</label>
            <input type="file" onChange={(e) => setProfilePhoto(e.target.files[0])} className="w-full" />
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

// import React, { useState } from "react";

// const ProfileSettings = () => {
//   const [currentPassword, setCurrentPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [profileName, setProfileName] = useState("");
//   const [mobileNo, setmobileNo] = useState("");
//   const [, setProfilePhoto] = useState(null);
//   const [showPassword, setShowPassword] = useState(false);

//   const handleFileChange = (e) => {
//     setProfilePhoto(e.target.files[0]);
//   };

//   return (
//     <div className="flex  bg-gray-100 p-4">
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
//             </button>
//           </div>
//           <button className="bg-green-700 text-white py-2 px-4 rounded-lg  hover:bg-green-800">
//              Update
//           </button>
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
//               value={mobileNo}
//               onChange={(e) => setmobileNo(e.target.value)}
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-blue-600 mb-1">Profile Image</label>
//             <input type="file" onChange={handleFileChange} className="w-full" />
//           </div>
//           <button className="bg-green-700 text-white py-2 px-4 rounded-lg hover:bg-green-800">
//             Update
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProfileSettings;


// export default ProfileSettings;