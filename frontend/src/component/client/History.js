import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const History = () => {
  const [selectedAccount, setSelectedAccount] = useState("");
  const [accounts, setConnectedAccounts] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [historyData, setHistoryData] = useState([]);
  const [selectedAccountNumber, setSelectedAccountNumber] = useState("");
  const [summaryData, setSummaryData] = useState({
    totalPL: 0,
    deposit: 0,
    withdrawal: 0,
    swap: 0,
    commission: 0,
  });
  const [loading, setLoading] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      setAccountsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please login to view accounts");
          return;
        }
        
        const decoded = jwtDecode(token);
        const userId = decoded.id;
        
        const response = await axios.get(
          `http://localhost:8000/api/connect/getAllConnectedId/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },  
          }
        );

        const result = response.data.data || [];
        setConnectedAccounts(result);
        if (result.length > 0) {
          setSelectedAccount(result[0].connectId);
          setSelectedAccountNumber(result[0].user);
        }
      } catch (err) {
        setError("Failed to load connected accounts.");
      } finally {
        setAccountsLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleAccountChange = (e) => {
    const selectedId = e.target.value;
    setSelectedAccount(selectedId);
    const account = accounts.find(acc => acc.connectId === selectedId);
    if (account) {
      setSelectedAccountNumber(account.user);
    }
  };

  const handleSearch = async () => {
    if (!selectedAccount || !fromDate || !toDate) {
      setError("Please select an account and date range.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8000/api/connect/history",
        {
          accountNumber: selectedAccount,
          fromDate,
          toDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const orders = response?.data?.data?.orders;
      if (!orders || !Array.isArray(orders)) {
        setError("No valid order history found.");
        setHistoryData([]);
        return;
      }

      setHistoryData(orders);

      const summary = orders.reduce(
        (acc, order) => {
          acc.totalPL += order.profit || 0;
          if (order.type?.toLowerCase().includes("deposit")) acc.deposit += order.profit || 0;
          if (order.type?.toLowerCase().includes("withdrawal")) acc.withdrawal += order.profit || 0;
          acc.swap += order.swap || 0;
          acc.commission += order.commission || 0;
          return acc;
        },
        {
          totalPL: 0,
          deposit: 0,
          withdrawal: 0,
          swap: 0,
          commission: 0,
        }
      );

      setSummaryData(summary);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch trade history");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (historyData.length === 0) {
      setError("No data to export");
      return;
    }

    setExportLoading(true);
    try {
      const headers = [
        "Account", "Symbol", "Type", "Volume", "Price", 
        "SL", "TP", "Profit", "Order ID", "Open Time"
      ];

      const csvData = [
        headers.join(","),
        ...historyData.map(item => [
          item.accountNumber || selectedAccountNumber || "",
          item.symbol || "",
          item.type || "",
          item.volume || "",
          item.price || "",
          item.sl || "",
          item.tp || "",
          item.profit != null ? item.profit.toFixed(2) : "",
          item.orderId || "",
          item.openTime || ""
        ].map(field => `"${field}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `trade_history_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError("Failed to export CSV");
    } finally {
      setExportLoading(false);
    }
  };

  const exportToExcel = () => {
    if (historyData.length === 0) {
      setError("No data to export");
      return;
    }

    setExportLoading(true);
    try {
      const data = historyData.map(item => ({
        Account: item.accountNumber || selectedAccountNumber || "",
        Symbol: item.symbol || "",
        Type: item.type || "",
        Volume: item.volume || "",
        Price: item.price || "",
        SL: item.sl || "",
        TP: item.tp || "",
        Profit: item.profit != null ? item.profit.toFixed(2) : "",
        "Order ID": item.orderId || "",
        "Open Time": item.openTime || ""
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Trade History");
      XLSX.writeFile(workbook, `trade_history_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      setError("Failed to export Excel");
    } finally {
      setExportLoading(false);
    }
  };

const exportToPDF = () => {
  if (historyData.length === 0) {
    setError("No data to export");
    return;
  }

  setExportLoading(true);
  try {
    // Initialize jsPDF
    const doc = new jsPDF();
    
    // Add title
    doc.text("Trade History Report", 14, 15);
    
    // Prepare data
    const headers = [
      "Account", "Symbol", "Type", "Volume", "Price", 
      "SL", "TP", "Profit", "Order ID", "Open Time"
    ];
    
    const data = historyData.map(item => [
      item.accountNumber || selectedAccountNumber || "-",
      item.symbol || "-",
      item.type || "-",
      item.volume || "-",
      item.price || "-",
      item.sl || "-",
      item.tp || "-",
      item.profit != null ? item.profit.toFixed(2) : "-",
      item.orderId || "-",
      item.openTime || "-"
    ]);

    // Use autoTable plugin
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 20,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        valign: "middle"
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold"
      }
    });

    doc.save(`trade_history_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (err) {
    setError("Failed to export PDF: " + err.message);
  } finally {
    setExportLoading(false);
  }
};  

  return (
    <div className="p-6 bg-gray-100">
      <div className="bg-white p-4 rounded-md shadow-md mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Trade History</h1>
        <div className="flex space-x-2">
          <button
            onClick={exportToCSV}
            disabled={historyData.length === 0 || exportLoading}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center transition-colors"
          >
            {exportLoading ? "Exporting..." : "CSV"}
          </button>
          <button
            onClick={exportToExcel}
            disabled={historyData.length === 0 || exportLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center transition-colors"
          >
            {exportLoading ? "Exporting..." : "Excel"}
          </button>
          <button
            onClick={exportToPDF}
            disabled={historyData.length === 0 || exportLoading}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center transition-colors"
          >
            {exportLoading ? "Exporting..." : "PDF"}
          </button>
        </div>
      </div>

      <div className="bg-white p-4 shadow-md flex flex-wrap gap-6 items-center">
        <div className="flex flex-col">
          <label className="text-blue-900 font-semibold">Select Account :</label>
          <select
            className="border border-gray-300 p-3 min-w-80 rounded-md"
            value={selectedAccount}
            onChange={handleAccountChange}
            disabled={accountsLoading}
          >
            {accountsLoading ? (
              <option>Loading accounts...</option>
            ) : (
              <>
                <option value="">-- Select Account --</option>
                {accounts.map((acc) => (
                  <option key={acc.connectId} value={acc.connectId}>
                    {acc.user}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-blue-900 font-semibold">Date From :</label>
          <input
            type="date"
            className="border border-gray-300 p-2 rounded-md min-w-80"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-blue-900 font-semibold">Date To :</label>
          <input
            type="date"
            className="border border-gray-300 p-2 rounded-md min-w-80"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <button
          className="bg-sky-900 hover:bg-sky-800 text-white px-4 py-2 rounded-md transition-colors"
          disabled={loading || !selectedAccount}
          onClick={handleSearch}
        >
          {loading ? "Loading..." : "Search"}
        </button>

        <div className="bg-sky-900 text-white p-5 min-w-80 rounded-lg w-72 shadow-md">
          {["totalPL", "deposit", "withdrawal", "swap", "commission"].map(
            (field) => (
              <p key={field} className="text-md font-semibold flex justify-between">
                <span>{field.charAt(0).toUpperCase() + field.slice(1)} :</span>
                <span>{summaryData[field].toFixed(2)}</span>
              </p>
            )
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto bg-white shadow-md pt-5 mt-4">
        {loading ? (
          <div className="p-4 text-center">Loading data...</div>
        ) : (
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                {[
                  "Account", "Symbol", "Type", "Volume", "Price", 
                  "SL", "TP", "Profit", "Order ID", "Open Time"
                ].map((header) => (
                  <th key={header} className="border px-4 py-2 text-left">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historyData.length > 0 ? (
                historyData.map((trade, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{trade.accountNumber || selectedAccountNumber || "-"}</td>
                    <td className="border px-4 py-2">{trade.symbol || "-"}</td>
                    <td className="border px-4 py-2">{trade.type || "-"}</td>
                    <td className="border px-4 py-2">{trade.volume || "-"}</td>
                    <td className="border px-4 py-2">{trade.price || "-"}</td>
                    <td className="border px-4 py-2">{trade.sl || "-"}</td>
                    <td className="border px-4 py-2">{trade.tp || "-"}</td>
                    <td
                      className={`border px-4 py-2 ${
                        trade.profit > 0
                          ? "text-green-600"
                          : trade.profit < 0
                          ? "text-red-600"
                          : ""
                      }`}
                    >
                      {trade.profit != null ? trade.profit.toFixed(2) : "-"}
                    </td>
                    <td className="border px-4 py-2">{trade.orderId || "-"}</td>
                    <td className="border px-4 py-2">{trade.openTime || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    {error || "No trades found for the selected period"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default History;




// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const History = () => {
//   const [selectedAccount, setSelectedAccount] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [historyData, setHistoryData] = useState([]);
//   const [summaryData, setSummaryData] = useState({
//     totalPL: 0,
//     deposit: 0,
//     withdrawal: 0,
//     swap: 0,
//     commission: 0,
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [accounts, setAccounts] = useState([]);
//   const [accountsLoading, setAccountsLoading] = useState(true);

//   useEffect(() => {
//     const fetchAccounts = async () => {
//       try {
//         const res = await axios.get("http://localhost:8000/api/connect/getAllConnectedId");
//         if (res.data.success) {
//           setAccounts(res.data.data);
//         } else {
//           setError("Failed to load accounts.");
//         }
//       } catch (err) {
//         setError("Failed to fetch accounts: " + (err.response?.data?.message || err.message));
//       } finally {
//         setAccountsLoading(false);
//       }
//     };

//     fetchAccounts();
//   }, []);

//   const fetchHistoryData = async () => {
//     if (!selectedAccount || !fromDate || !toDate) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const res = await axios.post("http://localhost:8000/api/connect/history", {
//         accountNumber: selectedAccount,
//         fromDate,
//         toDate,
//       });

//       console.log("Trade history response:", res.data);

//       if (res.data.success && res.data.data) {
//         const { orders = [], summary = {} } = res.data.data;

//         if (Array.isArray(orders)) {
//           setHistoryData(orders);
//           setSummaryData({
//             totalPL: summary.totalPL || 0,
//             deposit: summary.deposit || 0,
//             withdrawal: summary.withdrawal || 0,
//             swap: summary.swap || 0,
//             commission: summary.commission || 0,
//           });
//         } else {
//           setError("Invalid data format received for orders.");
//           setHistoryData([]);
//         }
//       } else {
//         setError(res.data.message || "Failed to load trade history.");
//         setHistoryData([]);
//       }
//     } catch (err) {
//       setError("Error fetching trade history: " + (err.response?.data?.message || err.message));
//       setHistoryData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderAccountUser = (id) => {
//     const acc = accounts.find((a) => a.connectId === id);
//     return acc ? acc.user : id;
//   };

//   return (
//     <div className="p-6 bg-gray-100">
//       <div className="bg-white p-4 rounded-md shadow mb-4">
//         <h1 className="text-xl font-bold text-gray-800">Trade History</h1>
//       </div>

//       {/* Filters */}
//       <div className="bg-white p-4 shadow flex flex-wrap gap-6 items-end">
//         <div>
//           <label className="block font-semibold text-blue-900 mb-1">Select Account:</label>
//           <select
//             className="border border-gray-300 p-2 rounded-md min-w-64"
//             value={selectedAccount}
//             onChange={(e) => setSelectedAccount(e.target.value)}
//           >
//             <option value="">-- Select Account --</option>
//             {accounts.map((acc) => (
//               <option key={acc.connectId} value={acc.connectId}>
//                 {acc.user}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block font-semibold text-blue-900 mb-1">From Date:</label>
//           <input
//             type="date"
//             className="border border-gray-300 p-2 rounded-md min-w-64"
//             value={fromDate}
//             onChange={(e) => setFromDate(e.target.value)}
//           />
//         </div>

//         <div>
//           <label className="block font-semibold text-blue-900 mb-1">To Date:</label>
//           <input
//             type="date"
//             className="border border-gray-300 p-2 rounded-md min-w-64"
//             value={toDate}
//             onChange={(e) => setToDate(e.target.value)}
//           />
//         </div>

//         <button
//           className="bg-blue-600 text-white px-5 py-2 rounded-md"
//           disabled={!selectedAccount || !fromDate || !toDate || loading}
//           onClick={fetchHistoryData}
//         >
//           {loading ? "Loading..." : "Search"}
//         </button>

//         {/* Summary Box */}
//         <div className="bg-blue-100 text-blue-900 p-4 rounded-md min-w-64">
//           {["totalPL", "deposit", "withdrawal", "swap", "commission"].map((key) => (
//             <div key={key} className="flex justify-between">
//               <span className="capitalize">{key}:</span>
//               <span>{Number(summaryData[key] || 0).toFixed(2)}</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Error */}
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
//           {error}
//         </div>
//       )}

//       {/* Table */}
//       <div className="overflow-x-auto bg-white mt-6 shadow-md rounded-md">
//         <table className="min-w-full text-sm text-left">
//           <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
//             <tr>
//               {[
//                 "Name", "Account", "Symbol", "Type", "Volume",
//                 "Price", "SL", "TP", "Profit", "Order ID", "Open Time"
//               ].map((head) => (
//                 <th key={head} className="px-4 py-2 border">{head}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {historyData.length > 0 ? (
//               historyData.map((trade, idx) => (
//                 <tr key={idx} className="hover:bg-gray-50">
//                   <td className="px-4 py-2 border">{renderAccountUser(selectedAccount)}</td>
//                   <td className="px-4 py-2 border">{selectedAccount}</td>
//                   <td className="px-4 py-2 border">{trade.symbol || "-"}</td>
//                   <td className="px-4 py-2 border">{trade.type}</td>
//                   <td className="px-4 py-2 border">{trade.volume}</td>
//                   <td className="px-4 py-2 border">{trade.price}</td>
//                   <td className="px-4 py-2 border">{trade.sl}</td>
//                   <td className="px-4 py-2 border">{trade.tp}</td>
//                   <td className={`px-4 py-2 border ${trade.profit > 0 ? "text-green-600" : trade.profit < 0 ? "text-red-600" : ""}`}>
//                     {Number(trade.profit || 0).toFixed(2)}
//                   </td>
//                   <td className="px-4 py-2 border">{trade.orderId}</td>
//                   <td className="px-4 py-2 border">{trade.openTime ? new Date(trade.openTime).toLocaleString() : "-"}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={11} className="text-center py-4 text-gray-600">
//                   {loading ? "Loading trades..." : "No trades found for selected filters."}
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default History;

