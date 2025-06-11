import React from "react";

const Mapchild = ({ data }) => {
  return (
    <div  className="p-6 bg-gray-100">
      <div className="bg-white p-4 rounded-md shadow-md mb-4 flex justify-between items-center">
              <h1 className="text-xl font-bold text-grey-800">Select Master Account</h1>
            </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.map((item, index) => (
          <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-sky-900 text-white text-center py-3 text-lg font-semibold">
              {item.title || "undefined"}
            </div>

            {/* Client Code */}
            <div className="p-4 text-center">
              <p className="text-blue-600 font-medium">ClientCode</p>
              <p className="text-gray-600">{item.clientCode || "undefined"}</p>
            </div>

            {/* Pair/Symbol */}
            <div className="p-4 text-center border-t">
              <p className="text-blue-600 font-medium">Pair/Symbol</p>
              <p className="text-gray-600">{item.pairSymbol || "undefined"}</p>
            </div>

            {/* Button */}
            <div className="p-4 text-center border-t">
              <button className="bg-sky-900 text-white px-4 py-2 rounded">
                Link Child
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Sample Data
const sampleData = [
  { title: "Account 1", clientCode: "ABC123", pairSymbol: "EUR/USD" },
  { title: "Account 2", clientCode: "XYZ456", pairSymbol: "GBP/JPY" },
  { title: "Account 3", clientCode: "LMN789", pairSymbol: "AUD/CAD" },
];

const App = () => {
  return <Mapchild data={sampleData} />;
};

export default App;
