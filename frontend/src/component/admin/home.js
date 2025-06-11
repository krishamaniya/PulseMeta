import { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaSort } from "react-icons/fa";

const Home = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Unauthorized: No token provided");
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:8000/api/client/getAllClients", {
        headers: {
          Authorization: `${token}`,
        },
      });

      const activeClients = response.data.clients.filter((client) => !client.isDelete);
      setClients(activeClients);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching clients");
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:8000/api/client/updateClientStatus",
        { id, isActive: !currentStatus },
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setClients((prevClients) =>
        prevClients.map((client) =>
          client._id === id ? { ...client, isActive: !currentStatus } : client
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const deleteClient = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:8000/api/client/updateClientDeleteStatus",
        { id, isDelete: true },
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setClients((prevClients) => prevClients.filter((client) => client._id !== id));
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("Failed to delete client");
    }
  };

  const sortedClients = [...clients].sort((a, b) => {
    return sortOrder === "asc"
      ? a.price - b.price
      : b.price - a.price;
  });

  const filteredClients = sortedClients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100 p-6">
      <div className="w-full bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Client List</h1>
        </div>
        <div className="flex space-x-2 pb-5">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border px-3 py-2 rounded-md"
            />
            <button
              className="bg-sky-900 text-white px-4 py-2 rounded-md flex items-center"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              <FaSort className="mr-2" /> Sort by Price ({sortOrder})
            </button>
          </div>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Mobile Number</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Username</th>
                  {/* <th className="border border-gray-300 px-4 py-2 text-left">Payment</th> */}
                  {/* <th className="border border-gray-300 px-4 py-2 text-left">Duration</th> */}
                {/* <th className="border border-gray-300 px-4 py-2 text-left">Regd.on</th> */}
                {/* <th className="border border-gray-300 px-4 py-2 text-left">Valid Upto</th> */}
                  <th className="border border-gray-300 px-4 py-2 text-left">Status</th>


                </tr>
              </thead>
              <tbody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <tr key={client._id} className="hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-2">{client.name}</td>
                      <td className="border border-gray-300 px-4 py-2">{client.email}</td>
                      <td className="border border-gray-300 px-4 py-2">{client.mobileNumber}</td>
                      <td className="border border-gray-300 px-4 py-2">{client.username}</td>
                      {/* <td className="border border-gray-300 px-4 py-2">{client.price}</td> */}
                      {/* <td className="border border-gray-300 px-4 py-2">{client.price}</td> */}
                      {/* <td className="border border-gray-300 px-4 py-2">{client.price}</td> */}
                      {/* <td className="border border-gray-300 px-4 py-2">{client.price}</td> */}
                      <td className="border border-gray-300 px-4 py-2 flex items-center gap-2">
                        <button
                          onClick={() => toggleStatus(client._id, client.isActive)}
                          className={`bg-sky-900 px-4 py-1 text-white rounded-md ${client.isActive ? "bg-blue-500" : "bg-red-500"}`}
                        >
                          {client.isActive ? "Active" : "Inactive"}
                        </button>
                        <button
                          onClick={() => deleteClient(client._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500 py-4">
                      No clients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
