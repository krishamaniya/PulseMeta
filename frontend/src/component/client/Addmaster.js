import React, { useState } from "react";
// import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { FaPlus, FaTimes, FaEye, FaEyeSlash, FaCheck ,FaEdit , FaTrash } from "react-icons/fa";

const AddMaster = () => {
  const [accounts] = useState([
    {
      id: 1,
      botName: "123",
      accountNo: "201010101",
      broker: "Exness-demo",
      currency: "USD",
      balance: 0,
      status: "Started",
      publisher: "demo",
    },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    accountNumber: "",
    password: "",
    broker: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div  className="p-6 bg-gray-100">
      {/* Header Section */}
      <div className="bg-white p-4 rounded-md shadow-md mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-grey-800">Add Master Account</h1>
        <button className="bg-sky-900 text-white px-4 py-2 rounded flex items-center" onClick={() => setIsModalOpen(true)}>
          <FaPlus className="mr-2" /> Add
        </button>
      </div>

      {/* Export & Search Section */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-3 mb-4">
          <button className="bg-sky-900  text-white px-4 py-2 rounded-md">CSV</button>
          <button className="bg-sky-900 text-white px-4 py-2 rounded-md">Excel</button>
          <button className="bg-sky-900 text-white px-4 py-2 rounded-md">PDF</button>
        </div>
        <input
          type="text"
          placeholder="Search..."
          className="p-2 border border-gray-300 rounded w-64"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="border px-4 py-2">Bot Name</th>
              <th className="border px-4 py-2">Account No.</th>
              <th className="border px-4 py-2">Broker & Server</th>
              <th className="border px-4 py-2">Currency</th>
              <th className="border px-4 py-2">Required Balance ($)</th>
              <th className="border px-4 py-2">Connect</th>
              <th className="border px-4 py-2">Action</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Publisher</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id} className="text-sm text-center">
                <td className="border px-4 py-2">{account.botName}</td>
                <td className="border px-4 py-2">{account.accountNo}</td>
                <td className="border px-4 py-2">{account.broker}</td>
                <td className="border px-4 py-2">{account.currency}</td>
                <td className="border px-4 py-2">{account.balance}</td>
                <td className="border px-4 py-2">
                  <span className="bg-green-500 text-white px-2 py-1 rounded">Success</span>
                </td>
                <td className="border px-4 py-2 text-center">
                <div className="flex justify-center items-center space-x-4">
                  <button className="text-blue-500 cursor-pointer">
                    <FaEdit className="w-5 h-5" />
                  </button>
                  <button className="text-red-500 hover:text-red-700">
                    <FaTrash className="w-5 h-5" />
                  </button>
                </div>
              </td>

                <td className="border px-4 py-2">
                  <span className="bg-green-500 text-white px-2 py-1 rounded">
                    {account.status}
                  </span>
                </td>
                <td className="border px-4 py-2">{account.publisher}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[600px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Add Account</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 gap-4">
              {/* Account Number */}
              <div className="col-span-1">
                <label className="text-blue-700 text-sm">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              {/* Password with Visibility Toggle */}
              <div className="col-span-1 relative">
                <label className="text-blue-700 text-sm">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-blue-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Broker & Server */}
              <div className="col-span-1">
                <label className="text-blue-700 text-sm">Broker & Server</label>
                <input
                  type="text"
                  name="broker"
                  value={formData.broker}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            {/* Validate Login Button */}
            <div className="flex justify-end mt-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded flex items-center">
                <FaCheck className="mr-2" /> Validate Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMaster;
