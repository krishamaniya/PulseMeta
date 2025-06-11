import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Createprofile from "./component/Createprofile";
import ResetPassword from "./component/forgot";
import ResetPasswordForm from "./component/Reset";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";

const PrivateRoute = ({ element, role }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  

  if (!token) return <Navigate to="/" />;
  if (role && userRole !== role) return <Navigate to="/" />;

  return element;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard/*" element={<PrivateRoute element={<Dashboard />} role="client" />} />
        <Route path="/admindashboard/*" element={<PrivateRoute element={<AdminDashboard />} role="admin" />} />
        <Route path="/createprofile" element={<Createprofile/>}/>
        <Route path="/resetpassword" element={<ResetPassword/>}/>
        <Route path="/resetpasswordform/:token" element={<ResetPasswordForm/>}/>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router> 
  );
}

export default App;

// export const BaseUrl = process.env.REACT_APP_API_URL;



// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import Login from "./Login";
// import Dashboard from "./pages/Dashboard";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/dashboard/*" element={<Dashboard />} />
//         {/* Redirect unknown routes to login */}
//         <Route path="*" element={<Navigate to="/" />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;


// import Dashboard from "./pages/Dashboard";

// function App() {
//   return <Dashboard />;
// }

// export default App;


// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import Dashboard from "./pages/Dashboard";


// function App() {
//   return (
//     <>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/dashboard" element={<Dashboard />}>
//           </Route>
//         </Routes>
//       </BrowserRouter>
//     </>
//   );
// }

// export default App;