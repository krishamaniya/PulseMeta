import { useState } from "react";


const Subscription = () => {
  const [accountData] = useState([
    {
      username: "Demo",
      status: "Active",
      regdOn: "10-03-25",
      validUpto: "17-03-25",
      subscription: "Active",
      payment: "Pay Now",
      primeMember: "No",
      trade: false,
    },
  ]);
   
  return (
    // <div className="flex-1 p-10 bg-grey-100">
    <div className="p-6 bg-gray-100">
  {/* Header */}
      <div className="bg-white p-4 rounded-md shadow-md mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-grey-800">Manage Accounts</h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="border px-4 py-2"><input type="checkbox" className="form-checkbox" /></th>
              <th className="border px-4 py-2">Username</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Regd. on</th>
              <th className="border px-4 py-2">Valid Upto</th>
              <th className="border px-4 py-2">Subscription</th>
              <th className="border px-4 py-2">Payment</th>
              <th className="border px-4 py-2">Prime Member</th>
            </tr>
          </thead>
          <tbody>
            {accountData.map((account, index) => (
              <tr key={index} className="text-sm text-center">
                <td className="border px-4 py-2">
                  <input type="checkbox" className="form-checkbox" />
                </td>

                <td className="border px-4 py-2">{account.username}</td>
                <td className="border px-4 py-2">
                  <span className="bg-green-500 text-white px-2 py-1 rounded">
                    {account.status}
                  </span>
                </td>
                <td className="border px-4 py-2">{account.regdOn}</td>
                <td className="border px-4 py-2">{account.validUpto}</td>
                <td className="border px-4 py-2">
                  <span className="bg-green-500 text-white px-2 py-1 rounded">
                    {account.subscription}
                  </span>
                </td>
                <td className="border px-4 py-2">
                  <span className="bg-green-500 text-white px-2 py-1 rounded">
                    {account.payment}
                  </span>
                </td>
                <td className="border px-4 py-2">
                  <span className="bg-red-500 text-white px-2 py-1 rounded">
                    {account.primeMember}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
</div>
);
};

export default Subscription;
  