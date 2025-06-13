import { useState, useEffect } from "react";
import axios from "axios";
import { FaSort } from "react-icons/fa";

const DeletedClients = () => {
  const [deletedClients, setDeletedClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    fetchDeletedClients();
  }, []);

  const fetchDeletedClients = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://82.25.109.28:8000/api/client/getDeletedClients", {
        headers: { Authorization: `${token}` },
      });
      setDeletedClients(response.data.clients);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching deleted clients");
      setLoading(false);
    }
  };

  const restoreClient = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://82.25.109.28:8000/api/client/updateClientDeleteStatus",
        { id, isDelete: false }, 
        { headers: { Authorization: `${token}` } }
      );
      setDeletedClients((prev) => prev.filter((client) => client._id !== id));
    } catch (error) {
      console.error("Error restoring client:", error);
      alert("Failed to restore client");
    }
  };

  const sortedClients = [...deletedClients].sort((a, b) =>
    sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
  );

  const filteredClients = sortedClients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center bg-gray-100 p-6">
      <div className="w-full bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Deleted Clients</h1>
          <div className="flex space-x-4">
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
              <FaSort className="mr-2" /> Sort by Name ({sortOrder})
            </button>
          </div>
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
                  <th className="border px-4 py-2 text-left">Name</th>
                  <th className="border px-4 py-2 text-left">Email</th>
                  <th className="border px-4 py-2 text-left">Mobile Number</th>
                  <th className="border px-4 py-2 text-left">Username</th>
                  <th className="border px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <tr key={client._id} className="hover:bg-gray-100">
                      <td className="border px-4 py-2">{client.name}</td>
                      <td className="border px-4 py-2">{client.email}</td>
                      <td className="border px-4 py-2">{client.mobileNumber}</td>
                      <td className="border px-4 py-2">{client.username}</td>
                      <td className="border px-4 py-2">
                        <button
                          onClick={() => restoreClient(client._id)}
                          className="px-4 py-1 text-white rounded-md bg-red-500 hover:bg-green-500"
                        >
                           Restore
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-gray-500 py-4">
                      No deleted clients found
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

export default DeletedClients;
