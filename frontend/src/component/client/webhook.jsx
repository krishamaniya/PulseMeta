import React, { useState } from "react";

const WebhookSettings = () => {
  const [digitalKey, setDigitalKey] = useState("demo");
  const [webhookURL, setWebhookURL] = useState("https://example.com/webhook");
  const [urlInput, setUrlInput] = useState("");
  const [jsonCommand, setJsonCommand] = useState("");
  const [client, setClient] = useState("All");
  const [data, setData] = useState([]); 
  const [totalOrders, setTotalOrders] = useState(0);

  const generateWebhookKey = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/webhook/generateKey");
      const data = await response.json();
      setDigitalKey(data.digitalKey);
      console.log("New Webhook Key:", data.digitalKey);
    } catch (error) {
      console.error("Error generating key:", error);
    }
  };
  
  const handleShow = () => {
    // API call logic goes here (fetch data)
    console.log("Fetching data for client:", client);
  };

  return (
    <div className="p-6 bg-gray-100">
      {/* Header */}
      <div className="bg-white p-4 rounded-md shadow-md mb-4 flex justify-between items-center">
       <h2 className="text-xl font-bold text-grey-800">Webhook Setting</h2>
      </div>

      <div className="bg-white p-6 shadow-md rounded-b-lg">
        {/* Digital Key Section */}
        <div className="mb-4">
          <label className="block font-semibold">Digital Key</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={digitalKey}
              // readOnly
              className="border w-3/4 p-2 rounded-md"
            />
            <button onClick={generateWebhookKey} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              Generate
            </button>
          </div>
        </div>

        {/* Webhook Syntax Section */}
        <div className="border-t pt-4">
          <h2 className="text-red-600 font-bold text-lg">Syntaxes for Webhook Commands</h2>
          <ul className="mt-2 space-y-2">
            <li>
              <span className="font-semibold text-blue-600">Webhook URL:</span>{" "}
              <span className="text-gray-600">{webhookURL}</span>
            </li>
            <li className="font-semibold text-blue-600">Example:</li>
            <ul className="ml-6 list-disc text-gray-700">
              <li>
                <span className="text-green-600 font-semibold">Buy Order:</span>{" "}
                {`{digitalKey: "${digitalKey}", command: "BUY, SYMBOL, QUANTITY"}`}
              </li>
              <li>
                <span className="text-orange-600 font-semibold">Square Off Buy Order:</span>{" "}
                {`{digitalKey: "${digitalKey}", command: "SQUARE_OFF_BUY"}`}
              </li>
              <li>
                <span className="text-red-600 font-semibold">Sell Order:</span>{" "}
                {`{digitalKey: "${digitalKey}", command: "SELL, SYMBOL, QUANTITY"}`}
              </li>
              <li>
                <span className="text-orange-600 font-semibold">Square Off Sell Order:</span>{" "}
                {`{digitalKey: "${digitalKey}", command: "SQUARE_OFF_SELL"}`}
              </li>
            </ul>
          </ul>
        </div>

        {/* Command Testing Section */}
        <div className="border-t pt-4 mt-4">
          <h2 className="text-blue-600 font-bold text-lg">Check Your Commands Below</h2>

          <div className="mt-3">
            <label className="block font-semibold text-blue-700">URL</label>
            <input
              type="text"
              className="border w-full p-2 rounded-md"
              placeholder="Enter Webhook URL..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
          </div>

          <div className="mt-3">
            <label className="block font-semibold text-blue-700">JSON to Text Command</label>
            <input
              type="text"
              className="border w-full p-2 rounded-md"
              placeholder="Enter JSON Command..."
              value={jsonCommand}
              onChange={(e) => setJsonCommand(e.target.value)}
            />
          </div>

          <button className="mt-4 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">
            Test
          </button>
        </div>
      </div>
 

<div className="bg-white p-4 mt-6 shadow-md rounded-lg flex justify-between items-center">
  <div className="flex items-center space-x-4">
    <label className="text-blue-600 font-bold">Client</label>
    <select
      className="border w-96 px-3 py-2 rounded-md"
      value={client}
      onChange={(e) => setClient(e.target.value)}
    >
      <option value="All">All</option>
      <option value="Client1">Client 1</option>
      <option value="Client2">Client 2</option>
    </select>
    <button
      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
      onClick={handleShow}
    >
      Show
    </button>
  </div>
  <div className="text-blue-600 font-bold text-lg">Total Orders: {totalOrders}</div>
</div>

{/* Table Section */}
<div className="bg-white mt-6 p-4 shadow-md rounded-lg">
  {/* Export & Search Controls */}
  <div className="flex justify-between items-center mb-4">
    <div className="space-x-2">
      <button className="bg-blue-500 text-white px-3 py-1 rounded-md">CSV</button>
      <button className="bg-blue-500 text-white px-3 py-1 rounded-md">Excel</button>
      <button className="bg-blue-500 text-white px-3 py-1 rounded-md">PDF</button>
    </div>
    <input
      type="text"
      placeholder="Search..."
      className="border px-3 py-1 rounded-md"
    />
  </div>

  {/* Data Table */}
  <div className="overflow-x-auto">
    <table className="min-w-full border border-gray-300">
      <thead className="bg-gray-100 text-blue-600">
        <tr>
          <th className="border px-4 py-2">Code</th>
          <th className="border px-4 py-2">Request</th>
          <th className="border px-4 py-2">Response</th>
          <th className="border px-4 py-2">Time</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan="4" className="text-center text-gray-500 py-4">
              No data available in table
            </td>
          </tr>
        ) : (
          data.map((item, index) => (
            <tr key={index} className="text-center">
              <td className="border px-4 py-2">{item.code}</td>
              <td className="border px-4 py-2">{item.request}</td>
              <td className="border px-4 py-2">{item.response}</td>
              <td className="border px-4 py-2">{item.time}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>
</div>
);
};

export default WebhookSettings;




