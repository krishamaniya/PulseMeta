import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaPlus, FaCheck, FaEye, FaEdit } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import io from 'socket.io-client';

const ManageAccounts = () => {  
  const [socket , setSocket] = useState(null);
  const socketRef = useRef(null);
  const activeWebSockets = useRef({});
  const [isOpen, setIsOpen] = useState(false);
  const [serverList, setServerList] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [accountData, setAccountData] = useState([]); 
  const [loading, setLoading] = useState(false);  
  const [validating, setValidating] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [recentlyUpdated, setRecentlyUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [connectId, setConnectId] = useState(null); // Store connectId after validation
  const [liveData, setLiveData] = useState({});
  const refreshIntervalRef = useRef(null);
  const eventSources = useRef({}); // For SSE connections
  const formDataInitialState = {
    accountNumber: "",
    password: "",
    server: "",
    name: "",
    comment: "Same As Master",
    customComment: "",
    mode: "Manual"
  };
const [formData, setFormData] = useState(formDataInitialState);
const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
const [symbols, setSymbols] = useState([]);
const [loadingSymbols, setLoadingSymbols] = useState(false);
const [currentAccount, setCurrentAccount] = useState(null);
const [isCloseTradeModalOpen, setIsCloseTradeModalOpen] = useState(false);
const [openTrades, setOpenTrades] = useState([]);
const [selectedTrades, setSelectedTrades] = useState([]);
const [closeAllTrades, setCloseAllTrades] = useState(false);
const [closeTradeForm, setCloseTradeForm] = useState({
    symbol: '',
    operation: 'buy'
  });
const [orderForm, setOrderForm] = useState({
  symbol: 'EURUSD',
  operation: 'buy',
  volume: 0.1,
  stopLoss: 0,
  takeProfit: 0,
  comment: ''
});

  
  useEffect(() => {
    const refreshInterval = 500000; // 5 seconds

    fetchAllAccounts(); // initial load

    refreshIntervalRef.current = setInterval(() => {
      fetchAllAccounts(); // silent background refresh
    }, refreshInterval);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const toggleModal = () => setIsOpen(!isOpen);

   const startWebSocketConnection = async (connectId) => {
    try {
      const response = await axios.post(
        'http://82.25.109.28:8000/api/connect/startwebsocket',
        { connectId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`WebSocket started for ${connectId}:`, response.data);
      return true;
    } catch (error) {
      console.error(`Failed to start WebSocket for ${connectId}:`, error);
      return false;
    }
  };

  const fetchLiveAccountData = (connectId) => {
    if (eventSources.current[connectId]) {
      eventSources.current[connectId].close();
    }

    const eventSource = new EventSource(
      `http://82.25.109.28:8000/api/connect/getMT5liveAccountSummary/${connectId}`
    );

    eventSources.current[connectId] = eventSource;

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.updateType === "api" || data.updateType === "database") {
        setLiveData(prev => ({
          ...prev,
          [connectId]: {
            ...prev[connectId],
            ...data.data,
            lastUpdated: new Date().toISOString()
          }
        }));
      }
    };

    eventSource.onerror = (error) => {
      console.error(`SSE Error for ${connectId}:`, error);
      setTimeout(() => fetchLiveAccountData(connectId), 5000);
    };
  };


  //  const fetchLiveAccountData = (connectId) => {
  //   if (eventSources.current[connectId]) {
  //     eventSources.current[connectId].close();
  //   }

  //   const eventSource = new EventSource(
  //     `http://82.25.109.28:8000/api/connect/getMT5liveAccountSummary/${connectId}`,
  //     // {
  //     //   headers: {
  //     //     Authorization: `Bearer ${localStorage.getItem('token')}`
  //     //   }
  //     // }
  //   );

  //   eventSources.current[connectId] = eventSource;

  //   eventSource.onmessage = (event) => {
  //     const data = JSON.parse(event.data);
  //     if (data.updateType === "api" || data.updateType === "database") {
  //       setLiveData(prev => ({
  //         ...prev,
  //         [connectId]: {
  //           ...prev[connectId],
  //           ...data.data,
  //           lastUpdated: new Date().toISOString()
  //         }
  //       }));
  //     }
  //   };

  //   eventSource.onerror = (error) => {
  //     console.error(`SSE Error for ${connectId}:`, error);
  //     // Attempt to reconnect after a delay
  //     setTimeout(() => fetchLiveAccountData(connectId), 5000);
  //   };
  // };

  // Connect to backend via Socket.IO once
useEffect(() => {
  if (!socketRef.current) {
    const newSocket = io('http://82.25.109.28:8000', {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        token: localStorage.getItem("token")
      }
    });

    socketRef.current = newSocket;
    setSocket(newSocket);  // <-- set the socket state

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    newSocket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err.message);
    });
  }

  return () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }
  };
}, []);


// Listen for updates for each account
useEffect(() => {
  if (!socket) return;

  accountData.forEach(account => {
    const eventKey = `mt5-update-${account.connectId}`;

    socket.on(eventKey, (updatedProfile) => {
      setAccountData(prevAccounts =>
        prevAccounts.map(acc =>
          acc.connectId === updatedProfile.connectId
            ? { ...acc, ...updatedProfile }
            : acc
        )
      );
    });

    // Connect once per account
    if (!activeWebSockets.current[account.connectId]) {
      startWebSocketConnection(account.connectId);
      activeWebSockets.current[account.connectId] = true;
    }
  });

  return () => {
    accountData.forEach(account => {
      socket.off(`mt5-update-${account.connectId}`);
    });
  };
}, [accountData, socket]);

  // Add cleanup for WebSocket connections when component unmounts
  useEffect(() => {
    return () => {
      // Close all WebSocket connections when component unmounts
      Object.keys(activeWebSockets.current).forEach(connectId => {
        // Note: The actual WebSocket is closed on the server side
        delete activeWebSockets.current[connectId];
      });
    };
  }, []);

  // Fetch servers
  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await axios.get("http://82.25.109.28:8000/api/server/servers/exness");
        const allServers = response.data.data.flatMap((item) => item.servers || []);
        setServerList(allServers);
      } catch (err) {
        console.error("Error fetching servers:", err);
      }
    };
    fetchServers();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredOptions([]);
      return;
    }

    const filtered = serverList.filter((item) =>
      item.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredOptions(filtered);
    setShowDropdown(true);
  }, [search, serverList]);

  const handleSelect = (value) => {
    setSearch(value);
    setFormData(prev => ({ ...prev, server: value }));
    setShowDropdown(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectAccount = (accountId) => {
    setSelectedAccounts(prev => {
      if (prev.includes(accountId)) {
        return prev.filter(id => id !== accountId);
      } else {
        return [...prev, accountId];
      }
    });
    setSelectAll(false);
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    if (isChecked) {
      const allIds = accountData.map(account => account.id);
      setSelectedAccounts(allIds);
    } else {
      setSelectedAccounts([]);
    }
  };

  const handleValidateLogin = async () => {
    setValidating(true);

    const payload = {
      user: formData.accountNumber,  
      password: formData.password,
      server: formData.server
    };

    try {
      const response = await axios.post('http://82.25.109.28:8000/api/connect/connectmt5', payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Validation successful:", response.data);
      alert("Validation successful!");
      
      // Store the connectId from the response for later use
      if (response.data.connectId) {
        setConnectId(response.data.connectId);
      }

    } catch (error) {
      console.error("Validation failed:", error?.response?.data || error);
      alert(error?.response?.data?.message || "Validation failed. Please check credentials.");
    }

    setValidating(false);
  };

  const fetchAccountSummary = async (connectId) => {
    try {
      const response = await axios.get(
        `http://82.25.109.28:8000/api/connect/getMT5AccountSummary/${connectId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      return response.data.summary;
    } catch (error) {
      console.error("Failed to fetch account summary:", error);
      return null;
    }
  };

const handleSaveAccount = async () => {
  if (!connectId) {
    alert("Please validate login first");
    return;
  }

  setLoading(true);

  try {
    // Fetch account summary first
    const accountSummary = await fetchAccountSummary(connectId);
    
    if (!accountSummary) {
      throw new Error("Failed to fetch account details");
    }

    // Prepare the payload for the save API
    const savePayload = {
      connectId: connectId,
      name: formData.name || `Account ${formData.accountNumber}`,
      accountNumber: formData.accountNumber,
      server: formData.server,
      currency: accountSummary.currency || "USD",
      balance: accountSummary.balance || 0,
      equity: accountSummary.equity || 0,
      profit: accountSummary.profit || 0,
      comment: formData.comment === "Custom" ? formData.customComment : formData.comment,
      mode: formData.mode
    };

    // Call the save API
    const saveResponse = await axios.post(
      'http://82.25.109.28:8000/api/connect/saveMT5Account',
      savePayload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!saveResponse.data || !saveResponse.data.savedAccount) {
      throw new Error("Invalid response from server");
    }

    // Transform the saved account data to match your frontend structure
    const savedAccount = {
      id: saveResponse.data.savedAccount._id,
      connectId: saveResponse.data.savedAccount.connectId,
      accountNumber: saveResponse.data.savedAccount.accountNumber,
      name: saveResponse.data.savedAccount.name,
      server: saveResponse.data.savedAccount.server,
      currency: saveResponse.data.savedAccount.currency,
      balance: saveResponse.data.savedAccount.balance,
      equity: saveResponse.data.savedAccount.equity,
      profit: saveResponse.data.savedAccount.profit,
      comment: saveResponse.data.savedAccount.comment,
      mode: saveResponse.data.savedAccount.mode
    };

    // Update state using functional update to ensure we have latest state
    setAccountData(prevAccounts => [...prevAccounts, savedAccount]);
    
    // Start WebSocket connection for the new account
    await startWebSocketConnection(connectId);
    activeWebSockets.current[connectId] = true;
    
    // Reset form and close modal
    setFormData({
      accountNumber: "",
      password: "",
      server: "",
      name: "",
      comment: "Same As Master",
      customComment: "",
      mode: "Manual"
    });
    setConnectId(null);
    setSearch("");
    setIsOpen(false);
    
    // Show success message
    setRecentlyUpdated(connectId);
    setTimeout(() => setRecentlyUpdated(null), 3000);

  } catch (error) {
    console.error("Error saving account:", error);
    alert("Failed to save account: " + (error.response?.data?.message || error.message));
  } finally {
    setLoading(false);
  }
}; 

const fetchAllAccounts = async () => {
  setLoading(true);
  try {   
    const response = await axios.get(
      "http://82.25.109.28:8000/api/connect/getAllSavedMT5AccountSummaries",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      } 
    );

    if (response.data && Array.isArray(response.data.summaries)) {
      const transformedData = response.data.summaries.map(account => ({
        id: account._id,
        connectId: account.connectId,
        accountNumber: account.accountNumber,
        name: account.name || `Account ${account.accountNumber}`,
        server: account.server,
        currency: account.currency || "USD",
        balance: account.balance || 0,
        equity: account.equity || 0,
        profit: account.profit || 0,
        margin: account.margin || 0,
        freeMargin: account.freeMargin || 0,
        marginLevel: account.marginLevel || 0,
        openedOrders: account.openedOrders || [],
        comment: account.comment || "",
        mode: account.mode || "Manual"
      }));

      setAccountData(transformedData);
      
      // Refresh live data for each account
      transformedData.forEach(account => {
        if (account.connectId) {
          fetchLiveAccountData(account.connectId);
        }
      });
    }
  } catch (err) {
    console.error("Failed to fetch accounts:", err);
  } finally {
    setLoading(false);
  }
};

//  useEffect(() => {
//     const fetchAllAccounts = async () => {
//       setLoading(true);
//       try {
//       const response = await axios.get(
//         "http://82.25.109.28:8000/api/connect/getAllSavedMT5AccountSummaries",
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`
//           }
//         } 
//       );
//       console.log('Full response:', response);

//         if (response.data && Array.isArray(response.data.summaries)) {
//           const transformedData = response.data.summaries.map(account => ({
//             id: account._id,
//             connectId: account.connectId,
//             accountNumber: account.accountNumber,
//             name: account.name || `Account ${account.accountNumber}`,
//             server: account.server,
//             currency: account.currency || "USD",
//             balance: account.balance || 0,
//             equity: account.equity || 0,
//             profit: account.profit || 0,
//             margin: account.margin || 0,
//             freeMargin: account.freeMargin || 0,
//             marginLevel: account.marginLevel || 0,
//             openedOrders: account.openedOrders || [],
//             comment: account.comment || "",
//             mode: account.mode || "Manual"
//           }));

//           setAccountData(transformedData);

//           // Initialize live data connections for each account
//           transformedData.forEach(account => {
//             if (account.connectId) {
//               fetchLiveAccountData(account.connectId);
//             }
//           });
//         }
//       } catch (err) {
//         console.error("Failed to fetch accounts:", err);
//       } finally {
//         setLoading(false);
//       }
//     };


//     fetchAllAccounts();

//     return () => {
//       // Clean up all SSE connections
//       Object.keys(eventSources.current).forEach(connectId => {
//         eventSources.current[connectId].close();
//       });
//     };
//   }, []);

  // Merge live data with account data


  const getMergedAccountData = () => {
    return accountData.map(account => {
      const liveAccountData = liveData[account.connectId] || {};
      return {
        ...account,
        ...liveAccountData,
        // Use live data if available, otherwise fall back to account data
        balance: liveAccountData.balance ?? account.balance,
        equity: liveAccountData.equity ?? account.equity,
        profit: liveAccountData.profit ?? account.profit,
        margin: liveAccountData.margin ?? account.margin,
        freeMargin: liveAccountData.freeMargin ?? account.freeMargin,
        marginLevel: liveAccountData.marginLevel ?? account.marginLevel,
        openedOrders: liveAccountData.openedOrders ?? account.openedOrders
      };
    });
  };

// useEffect(() => {
//   const fetchAllAccounts = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await axios.get(
//         "http://82.25.109.28:8000/api/connect/getAllSavedMT5AccountSummaries",
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`
//           }
//         }
//       );

//       if (response.data && Array.isArray(response.data.summaries) && response.data.summaries.length > 0) {
//         // Transform the data to match your existing structure
//         const transformedData = response.data.summaries.map(account => ({
//           id: account._id, // Use MongoDB _id as id
//           connectId: account.connectId,
//           accountNumber: account.accountNumber,
//           name: account.name || `Account ${account.accountNumber}`,
//           server: account.server,
//           currency: account.currency || "USD",
//           balance: account.balance || 0,
//           equity: account.equity || 0,
//           profit: account.profit || 0,
//           comment: account.comment || "",
//           mode: account.mode || "Manual"
//         }));

//         setAccountData(transformedData);
//       } else {
//         // No accounts found - set empty array and no error
//         setAccountData([]);
//       }
//     } catch (err) {
//       console.error("Failed to fetch accounts:", err);
//       // setError("Failed to load accounts. Please try again later.");
//       setAccountData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchAllAccounts();
// }, []);

// useEffect(() => {
//   const fetchAllAccounts = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await axios.get(
//         "http://82.25.109.28:8000/api/connect/getAllSavedMT5AccountSummaries",
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`
//           },
//           params: {
//             isDeleted: false // Add this parameter to your backend API
//           }
//         }
//       );

//       if (response.data && Array.isArray(response.data.summaries)) {
//         const transformedData = response.data.summaries.map(account => ({
//           id: account._id,
//           connectId: account.connectId,
//           accountNumber: account.accountNumber,
//           name: account.name || `Account ${account.accountNumber}`,
//           server: account.server,
//           currency: account.currency || "USD",
//           balance: account.balance || 0,
//           equity: account.equity || 0,
//           profit: account.profit || 0,
//           comment: account.comment || "",
//           mode: account.mode || "Manual"
//         }));

//         setAccountData(transformedData);
//       } else {
//         setAccountData([]);
//       }
//     } catch (err) {
//       console.error("Failed to fetch accounts:", err);
//       setAccountData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchAllAccounts();
// }, []);

const handleDeleteAccounts = async () => {
  try {
    // Validation
    if (selectedAccounts.length === 0) {
      throw new Error("Please select at least one account to delete");
    }

    // Confirmation
    const isConfirmed = window.confirm(
      `Are you sure you want to delete ${selectedAccounts.length} selected account.. This action cannot be undone.`
    );
    if (!isConfirmed) return;

    setLoading(true);
    
    // Get connectIds for selected accounts with validation
    const accountsToDelete = accountData
      .filter(account => selectedAccounts.includes(account.id))
      .map(account => {
        if (!account.connectId) {
          throw new Error(`Account ${account.accountNumber} is missing connectId`);
        }
        return account.connectId;
      });

    if (accountsToDelete.length !== selectedAccounts.length) {
      throw new Error("Some selected accounts could not be found");
    }

    // Delete accounts in parallel with error handling for each
    const deleteResults = await Promise.allSettled(
      accountsToDelete.map(connectId => 
        axios.delete(
          `http://82.25.109.28:8000/api/connect/deleteMT5Connection/${connectId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            timeout: 5000 // 5 second timeout
          }
        ).catch(error => {
          console.error(`Failed to delete account ${connectId}:`, error);
          return { connectId, error: error.message };
        })
      )
    );

    // Check results
    const failedDeletions = deleteResults.filter(
      result => result.status === 'rejected' || result.value?.error
    );

    if (failedDeletions.length > 0) {
      const errorMessages = failedDeletions.map(failure => 
        failure.reason?.message || failure.value?.error || 'Unknown error'
      );
      throw new Error(
        `Failed to delete ${failedDeletions.length} account(s):\n${errorMessages.join('\n')}`
      );
    }

    // Clean up WebSocket connections
    accountsToDelete.forEach(connectId => {
      if (activeWebSockets.current[connectId]) {
        delete activeWebSockets.current[connectId];
      }
    });

    // Optimistic UI update - remove deleted accounts immediately
    setAccountData(prev => 
      prev.filter(account => !selectedAccounts.includes(account.id))
    );

    // Clear selection
    setSelectedAccounts([]);
    setSelectAll(false);

    // Show success message
    alert(`Successfully deleted ${accountsToDelete.length} account(s)`);

  } catch (error) {
    console.error("Account deletion error:", error);
    
    // Show detailed error message
    alert(`Deletion failed: ${error.message}`);
    
    // Re-fetch accounts to ensure UI is in sync
    try {
      const response = await axios.get(
        "http://82.25.109.28:8000/api/connect/getAllSavedMT5AccountSummaries",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      if (response.data?.summaries) {
        setAccountData(response.data.summaries.map(account => ({
          id: account._id,
          connectId: account.connectId,
          accountNumber: account.accountNumber,
          name: account.name || `Account ${account.accountNumber}`,
          server: account.server,
          currency: account.currency || "USD",
          balance: account.balance || 0,
          equity: account.equity || 0,
          profit: account.profit || 0,
          comment: account.comment || "",
          mode: account.mode || "Manual"
        })));
      }
    } catch (fetchError) {
      console.error("Failed to refresh accounts:", fetchError);
    }
  } finally {
    setLoading(false);
  }
};

const fetchOpenTrades = async (connectId) => {
  try {
    const response = await axios.get(
      `http://82.25.109.28:8000/api/connect/getOpenTrades/${connectId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );
    return response.data.trades || [];
  } catch (error) {
    console.error("Error fetching open trades:", error);
    return [];
  }
};

  const handleOpenCloseTradeModal = async () => {
    if (selectedAccounts.length === 0) return;

    setLoading(true);
    setIsCloseTradeModalOpen(true);

    try {
      // Get all selected accounts with their connectIds
      const accountsToClose = accountData
        .filter(account => selectedAccounts.includes(account.id))
        .map(account => ({
          id: account.id,
          connectId: account.connectId,
          accountNumber: account.accountNumber
        }));

      // Fetch open trades for each account
      const tradesPromises = accountsToClose.map(async account => {
        const trades = await fetchOpenTrades(account.connectId);
        return trades.map(trade => ({
          ...trade,
          accountId: account.id,
          accountNumber: account.accountNumber,
          connectId: account.connectId
        }));
      });

      const allTrades = (await Promise.all(tradesPromises)).flat();
      setOpenTrades(allTrades);
      
      // Set initial symbol in close trade form if there are trades
      if (allTrades.length > 0) {
        setCloseTradeForm(prev => ({
          ...prev,
          symbol: allTrades[0].symbol
        }));
      }
    } catch (error) {
      console.error("Error preparing close trades:", error);
      alert("Failed to prepare trade closing: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTradeFormChange = (e) => {
    const { name, value } = e.target;
    setCloseTradeForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCloseSelectedTrades = async () => {
    if (openTrades.length === 0) {
      alert("No trades available to close");
      return;
    }

    if (!closeTradeForm.symbol || !closeTradeForm.operation) {
      alert("Please select both symbol and operation type");
      return;
    }

    setLoading(true);

    try {
      // Group trades by connectId that match the selected symbol and operation
      const tradesByAccount = {};
      openTrades.forEach(trade => {
        if (trade.symbol === closeTradeForm.symbol && 
            String(trade.orderType).toLowerCase() === closeTradeForm.operation.toLowerCase()) {
          if (!tradesByAccount[trade.connectId]) {
            tradesByAccount[trade.connectId] = [];
          }
          tradesByAccount[trade.connectId].push(trade);
        }
      });

      // Close trades for each account
      const results = await Promise.all(
        Object.entries(tradesByAccount).map(async ([connectId, trades]) => {
          const tradeResults = await Promise.all(
            trades.map(async trade => {
              try {
                const response = await axios.post(
                  `http://82.25.109.28:8000/api/connect/closeMT5Trade/${connectId}`,
                  { 
                    symbol: closeTradeForm.symbol,
                    operation: closeTradeForm.operation
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                      'Content-Type': 'application/json'
                    }
                  }
                );
                
                return {
                  ticket: trade.ticket,
                  symbol: trade.symbol,
                  operation: trade.orderType,
                  success: true,
                  data: response.data
                };
              } catch (error) {
                return {
                  ticket: trade.ticket,
                  symbol: trade.symbol,
                  operation: trade.orderType,
                  success: false,
                  error: error.response?.data?.message || error.message
                };
              }
            })
          );
          return {
            connectId,
            results: tradeResults
          };
        })
      );

      // Analyze results
      const successfulClosures = results.flatMap(r =>
        r.results.filter(tr => tr.success)
      );
      const failedClosures = results.flatMap(r =>
        r.results.filter(tr => !tr.success)
      );

      if (failedClosures.length > 0) {
        const errorMessages = failedClosures.map(f =>
          `Trade ${f.ticket} (${f.symbol} ${f.operation}): ${f.error}`
        ).join('\n');

        alert(`Some trades failed to close:\n${errorMessages}`);
      } else {
        alert(`Successfully closed ${successfulClosures.length} trades`);
      }

      // Refresh data
      await fetchAllAccounts();
      setIsCloseTradeModalOpen(false);
      setSelectedTrades([]);
      setCloseAllTrades(false);

    } catch (err) {
      console.error("Error closing trades:", err);
      alert(`Error occurred while closing trades: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };


// const handleCloseTrades = async () => {
//   if (selectedAccounts.length === 0) return;

//   setLoading(true);

//   try {
//     // First, get the connectIds for the selected accounts
//     const accountsToClose = accountData
//       .filter(account => selectedAccounts.includes(account.id))
//       .map(account => account.connectId);

//     if (accountsToClose.length === 0) {
//       throw new Error("No valid accounts selected");
//     }

//     // Close trades for each account
//     const results = await Promise.all(
//       accountsToClose.map(async (connectId) => {
//         try {
//           const response = await axios.post(
//             `http://82.25.109.28:8000/api/connect/closeMT5Trade/${connectId}`,
//             {}, // Empty body since we're not sending symbol
//             {
//               headers: {
//                 Authorization: `Bearer ${localStorage.getItem("token")}`,
//                 'Content-Type': 'application/json'
//               }
//             }
//           );
          
//           return {
//             connectId,
//             success: true,
//             data: response.data
//           };
//         } catch (error) {
//           return {
//             connectId,
//             success: false,
//             error: error.response?.data?.message || error.message
//           };
//         }
//       })
//     );

//     // Analyze results
//     const successfulClosures = results.filter(r => r.success);
//     const failedClosures = results.filter(r => !r.success);

//     if (failedClosures.length > 0) {
//       const errorMessages = failedClosures.map(f => 
//         `Account ${f.connectId}: ${f.error}`
//       ).join('\n');
      
//       alert(`Some trades failed to close:\n${errorMessages}`);
//     } else {
//       alert(`Successfully closed trades for ${successfulClosures.length} account`);
//     }

//     // Refresh account data to show updated trade status
//     await fetchAllAccounts();

//   } catch (err) {
//     console.error("Error closing trades:", err);
//     alert(`Error occurred while closing trades: ${err.message}`);
//   } finally {
//     setLoading(false);
//   }
// };



const fetchSymbols = async (connectId) => {
  
  setLoadingSymbols(true);
  try {
    const response = await axios.post(
      `http://82.25.109.28:8000/api/connect/getSymbols/${connectId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );
    setSymbols(response.data || []);
  } catch (error) {
    console.error("Error fetching symbols:", error);
    setSymbols([]);
  } finally {
    setLoadingSymbols(false); 
  }
};

const handleOpenOrderModal = (account) => {
  setCurrentAccount(account);
  setIsOrderModalOpen(true);
  fetchSymbols(account.connectId);
  
  // Reset order form with default values for this account
  setOrderForm({
    symbol: 'EURUSD', // Default symbol
    operation: 'buy',
    volume: 0.1,
    stopLoss: 0,
    takeProfit: 0,
    comment: ''
  });
};

const handleOrderFormChange = (e) => {
  const { name, value } = e.target;
  setOrderForm(prev => ({
    ...prev,
    [name]: value
  }));
};

const handleSendOrder = async () => {
  if (!currentAccount) return;

  try {
    const response = await axios.post(
      `http://82.25.109.28:8000/api/connect/sendMT5Order/${currentAccount.connectId}`, // Use currentAccount.connectId
      {
        symbol: orderForm.symbol,
        operation: orderForm.operation,
        volume: parseFloat(orderForm.volume),
        stopLoss: parseFloat(orderForm.stopLoss),
        takeProfit: parseFloat(orderForm.takeProfit),
        comment: orderForm.comment
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.message === "Trade order sent successfully.") {
      alert(`Order sent successfully! Ticket: ${response.data.order.ticket}`);
      setIsOrderModalOpen(false);
    } else {
      throw new Error(response.data.message || "Failed to send order");
    }
  } catch (error) {
    console.error("Error sending order:", error);
    alert(`Failed to send order: ${error.response?.data?.message || error.message}`);
  }
};

const handleEditAccount = (account) => {
  // Set the form data with the account details
  setFormData({
    accountNumber: account.accountNumber,
    password: "", // Password won't be available for security reasons
    server: account.server,
    name: account.name,
    comment: account.comment === "Same As Master" ? "Same As Master" : 
             account.comment === "None" ? "None" : "Custom",
    customComment: account.comment !== "Same As Master" && account.comment !== "None" ? 
                   account.comment : "",
    mode: account.mode || "Manual"
  });
  
  // Set the search field for the server dropdown
  setSearch(account.server);
  
  // Set the connectId if available (for re-validation if needed)
  if (account.connectId) {
    setConnectId(account.connectId);
  }
  
  // Open the modal
  setIsOpen(true);
};

  const renderTableBody = () => {
    const mergedData = getMergedAccountData();
    
    if (loading) {
      return (
        <tr>
          <td colSpan="11" className="text-center py-4">Loading account data...</td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan="11" className="text-center py-4 text-red-500">{error}</td>
        </tr>
      );
    }

    if (mergedData.length === 0) {
      return (
        <tr>
          <td colSpan="11" className="text-center py-4">No accounts found. Please add an account.</td>
        </tr>
      );
    }

    return mergedData.map((account) => (
      <tr key={account.id} className="text-sm text-center hover:bg-gray-50">
        <td className="border px-4 py-2 text-center">
          <input
            type="checkbox"
            checked={selectedAccounts.includes(account.id)}
            onChange={() => handleSelectAccount(account.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </td>
        <td className="border px-4 py-2">{account.name || 'N/A'}</td>
        <td className="border px-4 py-2">{account.accountNumber || 'N/A'}</td>
        <td className="border px-4 py-2">{account.server || "Exness"}</td>
        <td className="border px-4 py-2">{account.currency || 'USD'}</td>
        <td className="border px-4 py-2">
          {account.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
        </td>
        <td className="border px-4 py-2">
          {account.equity?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
        </td>
        <td
          className={`border px-4 py-2 font-medium transition-colors duration-300 ${
            account.profit >= 0 ? 'text-green-600' : 'text-red-600'
          } ${recentlyUpdated === account.connectId ? 'bg-yellow-100' : ''}`}
        >
          {account.profit?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
        </td>
        <td className="border px-4 py-2">
          <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
            Success
          </span>
        </td>
        <td className="border px-4 py-2">
          <div className="flex justify-center items-center space-x-2">
            <button 
              className="text-blue-500 hover:text-blue-700"
              onClick={() => handleEditAccount(account)}
            >
              <FaEdit className="w-4 h-4" />
            </button>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </td>
        <td className="border px-4 py-2">
          <button 
            className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-xs"
            onClick={() => handleOpenOrderModal(account)}
          >
            Order Send
          </button>
        </td>
        {/* <td className="border px-4 py-2">
          <button className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs">
            Close
          </button>
        </td> */}
      </tr>
    ));
  };

  return (
    <div className="p-6 bg-gray-100">
      {/* Header */}
      <div className="bg-white p-4 rounded-md shadow-md mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-grey-800">Manage Accounts</h2>
        <button
          className="bg-sky-900 text-white px-4 py-2 rounded-md flex items-center"
          onClick={toggleModal}
        >
          <FaPlus className="mr-2" /> Add Account
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 mb-4">
         <button 
          className={`bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center transition-colors 
            ${(selectedAccounts.length === 0 || loading) ? 'cursor-not-allowed' : 'hover:bg-red-600'}`}
          onClick={handleDeleteAccounts}
          disabled={selectedAccounts.length === 0 || loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Deleting...
            </>
          ) : (
            `Delete ${selectedAccounts.length > 0 ? `(${selectedAccounts.length})` : ''}`
          )}
        </button>
       <button
  className={`bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm flex items-center transition-colors 
    ${(selectedAccounts.length === 0 || loading) ? 'cursor-not-allowed' : 'hover:bg-orange-600'}`}
  onClick={handleOpenCloseTradeModal}
  disabled={selectedAccounts.length === 0 || loading}
>
  {loading ? (
    <>
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Loading...
    </>
  ) : (
    `Close Trade ${selectedAccounts.length > 0 ? `(${selectedAccounts.length})` : ''}`
  )}
</button>
        <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center transition-colors">Pay Now</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="border px-4 py-2 text-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  disabled={accountData.length === 0}
                />
              </th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Account No.</th>
              <th className="border px-4 py-2">Broker</th>
              <th className="border px-4 py-2">Currency</th>
              <th className="border px-4 py-2">Balance</th>
              <th className="border px-4 py-2">Equity</th>
              <th className="border px-4 py-2">Live P/L</th>
              {/* <th className="border px-4 py-2">Margin</th> */}
              {/* <th className="border px-4 py-2">Free Margin</th> */}
              {/* <th className="border px-4 py-2">Margin Level</th> */}
              {/* <th className="border px-4 py-2">Open Orders</th> */}
              <th className="border px-4 py-2">Login</th>
              <th className="border px-4 py-2">Action</th>
              <th className="border px-4 py-2">Trade Open</th>
              {/* <th className="border px-4 py-2">Trade</th> */}
            </tr>
          </thead>
          <tbody>
            {renderTableBody()}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[70%] relative">
            <button 
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-xl" 
              onClick={toggleModal}
              disabled={loading}
            >
              <IoClose />
            </button>

            <h3 className="text-xl font-bold text-gray-800 mb-4">Manage Accounts</h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-blue-600 font-medium mb-1">Enter Account Number</label>
                <input 
                  type="text" 
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Enter Account Number" 
                  className="w-full p-2 border rounded" 
                />
              </div>

              <div>
                <label className="block text-blue-600 font-medium mb-1">Enter Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter Password" 
                    className="w-full p-2 border rounded pr-10" 
                  />
                  <FaEye 
                    className="absolute right-3 top-3 text-gray-500 cursor-pointer" 
                    onClick={() => setShowPassword(prev => !prev)} 
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-blue-600 font-medium mb-1">Select Broker & Server</label>
                <input
                  type="text"
                  name="server"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    handleInputChange(e);
                  }}
                  onFocus={() => search && setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  placeholder="Select Server"
                  className="w-full p-2 border rounded"
                />
                {showDropdown && filteredOptions.length > 0 && (
                  <ul className="absolute z-10 bg-white border mt-1 w-full rounded shadow max-h-48 overflow-y-auto">
                    {filteredOptions.map((item, index) => (
                      <li
                        key={index}
                        className="px-3 py-1 hover:bg-blue-100 cursor-pointer"
                        onClick={() => handleSelect(item)}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-blue-600 font-medium mb-1">Enter Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter Name" 
                  className="w-full p-2 border rounded" 
                />
              </div>

              <div>
                <label className="block text-blue-600 font-medium mb-1">Comment</label>
                <select
                  className="w-full p-2 border rounded"
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                >
                  <option value="Same As Master">Same As Master</option>
                  <option value="Custom">Custom</option>
                  <option value="None">None</option>
                </select>
              </div>

              {formData.comment === "Custom" && (
                <div className="col-span-1">
                  <label className="block text-blue-600 font-medium mb-1">Enter Custom Comment</label>
                  <input
                    type="text"
                    name="customComment"
                    value={formData.customComment}
                    onChange={handleInputChange}
                    placeholder="Enter your custom comment"
                    className="w-full p-2 border rounded"
                  />
                </div>
              )}

              <div className="flex items-end">
                <button
                  className="bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
                  onClick={handleValidateLogin}
                  disabled={validating}
                >
                  {validating ? "Validating..." : (
                    <>
                      <FaCheck className="mr-2" /> Validate Login
                    </>
                  )}
                </button>
              </div>

              <div className="col-span-3">
                <label className="block text-blue-600 font-medium mb-1">Order Placement Mode</label>
                <div className="flex space-x-2">
                  {["Manual", "Web"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={`px-4 py-2 rounded-md border ${
                        formData.mode === mode ? "bg-green-300 text-white" : "bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, mode }))}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-start mt-6">
              <button 
                className="bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
                onClick={handleSaveAccount}
                disabled={!connectId || loading}
              >
                {loading ? "Saving..." : (
                  <>
                    <FaCheck className="mr-2" /> Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

{/* Order Send Modal */}
{isOrderModalOpen && currentAccount && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 relative">
      <button 
        className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-xl" 
        onClick={() => setIsOrderModalOpen(false)}
      >
        <IoClose />
      </button>

      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Send Order - {currentAccount.accountNumber} ({currentAccount.server})
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
           <label className="block text-blue-600 font-medium mb-1">Symbol</label>
  {loadingSymbols ? (
    <div className="w-full p-2 border rounded bg-gray-100 text-gray-500">
      Loading symbols...
    </div>
  ) : symbols.length > 0 ? (
    <select
      name="symbol"
      value={orderForm.symbol}
      onChange={handleOrderFormChange}
      className="w-full p-2 border rounded"
    >
      {symbols.map((symbol) => (
        <option key={symbol} value={symbol}>
          {symbol}
        </option>
      ))}
    </select>
  ) : (
    <select
      name="symbol"
      value={orderForm.symbol}
      onChange={handleOrderFormChange}
      className="w-full p-2 border rounded"
      disabled
    >
      <option value="">No symbols available</option>
    </select>
  )}
        </div>

        <div>
          <label className="block text-blue-600 font-medium mb-1">Operation</label>
          <select
            name="operation"
            value={orderForm.operation}
            onChange={handleOrderFormChange}
            className="w-full p-2 border rounded"
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>

        <div>
          <label className="block text-blue-600 font-medium mb-1">Volume (Lots)</label>
          <input
            type="number"
            name="volume"
            min="0.01"
            step="0.01"
            value={orderForm.volume}
            onChange={handleOrderFormChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-blue-600 font-medium mb-1">Stop Loss (Pips)</label>
          <input
            type="number"
            name="stopLoss"
            min="0"
            step="1"
            value={orderForm.stopLoss}
            onChange={handleOrderFormChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-blue-600 font-medium mb-1">Take Profit (Pips)</label>
          <input
            type="number"
            name="takeProfit"
            min="0"
            step="1"
            value={orderForm.takeProfit}
            onChange={handleOrderFormChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-blue-600 font-medium mb-1">Comment</label>
          <input
            type="text"
            name="comment"
            value={orderForm.comment}
            onChange={handleOrderFormChange}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded-md"
          onClick={() => setIsOrderModalOpen(false)}
        >
          Cancel
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-md"
          onClick={handleSendOrder}
        >
          Send Order
        </button>
      </div>
    </div>
  </div>
)}

{/* Close Trades Modal */}
{isCloseTradeModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-h-[80vh] overflow-y-auto relative">
            <button 
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-xl" 
              onClick={() => {
                setIsCloseTradeModalOpen(false);
                setSelectedTrades([]);
                setCloseAllTrades(false);
              }}
            >
              <IoClose />
            </button>

            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Close Trades ({openTrades.length} trades found)
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
  <label className="block text-blue-600 font-medium mb-1">Symbol</label>
  {loadingSymbols ? (
    <div className="w-full p-2 border rounded bg-gray-100 text-gray-500">
      Loading symbols...
    </div>
  ) : symbols.length > 0 ? (
    <select
      name="symbol"
      value={orderForm.symbol}
      onChange={handleOrderFormChange}
      className="w-full p-2 border rounded"
    >
      {symbols.map((symbol) => (
        <option key={symbol} value={symbol}>
          {symbol}
        </option>
      ))}
    </select>
  ) : (
    <select
      name="symbol"
      value={orderForm.symbol}
      onChange={handleOrderFormChange}
      className="w-full p-2 border rounded"
      disabled
    >
      <option value="">No symbols available</option>
    </select>
  )}
</div>

              <div>
                <label className="block text-blue-600 font-medium mb-1">Operation</label>
                <select
                  name="operation"
                  value={closeTradeForm.operation}
                  onChange={handleCloseTradeFormChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>
            </div>

            {openTrades.length === 0 ? (
              <div className="text-center py-4">No open trades found</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white text-center">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2">Account</th>
                        <th className="px-4 py-2">Symbol</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2">Volume</th>
                        <th className="px-4 py-2">Open Price</th>
                        <th className="px-4 py-2">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openTrades
                        .filter(trade => 
                          trade.symbol === closeTradeForm.symbol && 
                          String(trade.orderType).toLowerCase() === closeTradeForm.operation.toLowerCase()
                        )
                        .map((trade) => (
                          <tr key={trade.ticket} className="hover:bg-gray-50">
                            <td className="border px-4 py-2">{trade.accountNumber}</td>
                            <td className="border px-4 py-2">{trade.symbol}</td>
                            <td className="border px-4 py-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                trade.orderType.includes('buy') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {trade.orderType}
                              </span>
                            </td>
                            <td className="border px-4 py-2">{trade.volume}</td>
                            <td className="border px-4 py-2">{trade.openPrice}</td>
                            <td className={`border px-4 py-2 ${
                              trade.profit >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {trade.profit?.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded-md"
                    onClick={() => {
                      setIsCloseTradeModalOpen(false);
                      setSelectedTrades([]);
                      setCloseAllTrades(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded-md"
                    onClick={handleCloseSelectedTrades}
                    disabled={loading}
                  >
                    {loading ? 'Closing...' : 'Close Trades'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
)}
    </div>
  );
};

export default ManageAccounts;





































































































// import { useState, useEffect } from "react";
// import axios from "axios";
// import { FaPlus, FaCheck, FaEye, FaEdit } from "react-icons/fa";
// import { IoClose } from "react-icons/io5";

// const ManageAccounts = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [selectedMode, setSelectedMode] = useState("Manual");
//   const [serverList, setServerList] = useState([]);
//   const [search, setSearch] = useState("");
//   const [filteredOptions, setFilteredOptions] = useState([]);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [selectedComment, setSelectedComment] = useState("Same As Master");
//   const [accountData] = useState([]);

//   const toggleModal = () => setIsOpen(!isOpen);

//   useEffect(() => {
//     const fetchServers = async () => {
//       try {
//         const response = await axios.get("http://82.25.109.28:8000/api/server/servers/exness");
//         // Flatten nested arrays if `servers` is array in each object
//         const allServers = response.data.data.flatMap((item) => item.servers || []);
//         setServerList(allServers);
//       } catch (err) {
//         console.error("Error fetching servers:", err);
//       }
//     };
//     fetchServers();
//   }, []);
//   useEffect(() => {
//     if (search.trim() === "") {
//       setFilteredOptions([]);
//       return;
//     }

//     const filtered = serverList.filter((item) =>
//       item.toLowerCase().includes(search.toLowerCase())
//     );
//     setFilteredOptions(filtered);
//     setShowDropdown(true);
//   }, [search, serverList]);

//   const handleSelect = (value) => {
//     setSearch(value);
//     setShowDropdown(false);
//   };

//   return (
//     <div className="p-6 bg-gray-100">
//       {/* Header */}
//       <div className="bg-white p-4 rounded-md shadow-md mb-4 flex justify-between items-center">
//         <h2 className="text-xl font-bold text-grey-800">Manage Accounts</h2>
//         <button
//           className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
//           onClick={toggleModal}
//         >
//           <FaPlus className="mr-2" /> Add Account
//         </button>
//       </div>

//       {/* Action Buttons */}
//       <div className="flex space-x-3 mb-4">
//         <button className="bg-red-600 text-white px-4 py-2 rounded-md">Delete</button>
//         <button className="bg-orange-500 text-white px-4 py-2 rounded-md">Close Trade</button>
//         <button className="bg-green-600 text-white px-4 py-2 rounded-md">Pay Now</button>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto bg-white shadow-md rounded-lg">
//         <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
//           <thead className="bg-gray-100 text-gray-700">
//             <tr>
//               <th className="border px-4 py-2"><input type="checkbox" /></th>
//               <th className="border px-4 py-2">Name</th>
//               <th className="border px-4 py-2">Account No.</th>
//               <th className="border px-4 py-2">Broker</th>
//               <th className="border px-4 py-2">Currency</th>
//               <th className="border px-4 py-2">Balance</th>
//               <th className="border px-4 py-2">Equity</th>
//               <th className="border px-4 py-2">Live P/L</th>
//               <th className="border px-4 py-2">Login</th>
//               <th className="border px-4 py-2">Action</th>
//               <th className="border px-4 py-2">Trade</th>
//             </tr>
//           </thead>
//           <tbody>
//             {accountData.map((account, index) => (
//               <tr key={index} className="text-sm text-center">
//                 <td className="border px-4 py-2"><input type="checkbox" /></td>
//                 <td className="border px-4 py-2">{account.name}</td>
//                 <td className="border px-4 py-2">{account.accountNo}</td>
//                 <td className="border px-4 py-2">{account.broker}</td>
//                 <td className="border px-4 py-2">{account.currency}</td>
//                 <td className="border px-4 py-2">{account.balance}</td>
//                 <td className="border px-4 py-2">{account.equity}</td>
//                 <td className="border px-4 py-2 text-green-600">{account.livePL}</td>
//                 <td className="border px-4 py-2">
//                   <span className="bg-green-500 text-white px-2 py-1 rounded">Success</span>
//                 </td>
//                 <td className="border px-4 py-2 text-center">
//                   <div className="flex flex-col-2 justify-center items-center space-y-2 gap-2">
//                     <FaEdit className="text-blue-500 cursor-pointer w-5 h-5" />
//                     <label className="relative inline-flex items-center cursor-pointer">
//                       <input type="checkbox" className="sr-only peer" />
//                       <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition-all duration-300 relative">
//                         <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-md transition-all duration-300 transform peer-checked:translate-x-5"></div>
//                       </div>
//                     </label>
//                   </div>
//                 </td>
//                 <td className="border px-4 py-2">
//                   <button className="bg-red-500 text-white px-2 py-1 rounded">close</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Modal */}
//       {isOpen && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-[70%] relative">
//             <button className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-xl" onClick={toggleModal}>
//               <IoClose />
//             </button>

//             <h3 className="text-xl font-bold text-gray-800 mb-4">Manage Accounts</h3>

//             <div className="grid grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-blue-600 font-medium mb-1">Enter Account Number</label>
//                 <input type="text" placeholder="Enter Account Number" className="w-full p-2 border rounded" />
//               </div>

//               <div>
//                 <label className="block text-blue-600 font-medium mb-1">Enter Password</label>
//                 <div className="relative">
//                   <input type="password" placeholder="Enter Password" className="w-full p-2 border rounded pr-10" />
//                   <FaEye className="absolute right-3 top-3 text-gray-500 cursor-pointer" />
//                 </div>
//               </div>

//               <div className="relative">
//       <label className="block text-blue-600 font-medium mb-1">Select Broker & Server</label>
//       <input
//         type="text"
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         onFocus={() => search && setShowDropdown(true)}
//         onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Delay to allow click
//         placeholder="Select Server"
//         className="w-full p-2 border rounded"
//       />
//       {showDropdown && filteredOptions.length > 0 && (
//         <ul className="absolute z-10 bg-white border mt-1 w-full rounded shadow max-h-48 overflow-y-auto">
//           {filteredOptions.map((item, index) => (
//             <li
//               key={index}
//               className="px-3 py-1 hover:bg-blue-100 cursor-pointer"
//               onClick={() => handleSelect(item)}
//             >
//               {item}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>

//               <div>
//                 <label className="block text-blue-600 font-medium mb-1">Enter Name</label>
//                 <input type="text" placeholder="Enter Name" className="w-full p-2 border rounded" />
//               </div>

//               <div>
//                   <label className="block text-blue-600 font-medium mb-1">Comment</label>
//                   <select
//                     className="w-full p-2 border rounded"
//                     value={selectedComment}
//                     onChange={(e) => setSelectedComment(e.target.value)}
//                   >
//                     <option>Same As Master</option>
//                     <option>Custom</option>
//                     <option>None</option>
//                   </select>
//                 </div>

//                 {selectedComment === "Custom" && (
//                   <div className="col-span-1">
//                     <label className="block text-blue-600 font-medium mb-1">Enter Custom Comment</label>
//                     <input
//                       type="text"
//                       placeholder="Enter your custom comment"
//                       className="w-full p-2 border rounded"
//                     />
//                   </div>
//                 )}


//               <div className="flex items-end">
//                 <button className="bg-green-700 text-white px-4 py-2 rounded-md flex items-center">
//                   <FaCheck className="mr-2" /> Validate Login
//                 </button>
//               </div>

//               <div className="col-span-3">
//                 <label className="block text-blue-600 font-medium mb-1">Order Placement Mode</label>
//                 <div className="flex space-x-2">
//                   {["Manual", "Web"].map((mode) => (
//                     <button
//                       key={mode}
//                       className={`px-4 py-2 rounded-md border ${
//                         selectedMode === mode ? "bg-green-300 text-white" : "bg-gray-100 text-gray-700"
//                       }`}
//                       onClick={() => setSelectedMode(mode)}
//                     >
//                       {mode}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-start mt-6">
//               <button className="bg-green-700 text-white px-4 py-2 rounded-md flex items-center">
//                 <FaCheck className="mr-2" /> Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ManageAccounts;
