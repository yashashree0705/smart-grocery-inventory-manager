import React, { useState, useEffect } from 'react';

export default function App() {
  // Application Page Context Handlers
  const [currentPage, setCurrentPage] = useState('login');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Core Data State Handlers
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState({
    totalUniqueItems: 0,
    lowStockCount: 0,
    expiredCount: 0,
    shoppingListSuggestions: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Interactive Form Inputs
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState('');
  const [itemUnit, setItemUnit] = useState('Pcs');
  const [itemCategory, setItemCategory] = useState('Dairy');
  const [itemMinLimit, setItemMinLimit] = useState('2');
  const [itemExpiry, setItemExpiry] = useState('');

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchDashboardData();
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const itemsRes = await fetch(`${API_BASE}/grocery`, { headers });
      const itemsData = await itemsRes.json();
      setInventory(Array.isArray(itemsData) ? itemsData : []);

      const summaryRes = await fetch(`${API_BASE}/grocery/summary`, { headers });
      const summaryData = await summaryRes.json();
      setSummary(summaryData);
    } catch (err) {
      console.error("Data syncing pipeline collapsed.");
    }
  };

  const handleAuth = async (e, endpoint) => {
    e.preventDefault();
    try {
      const body = endpoint === 'login' ? { email, password } : { name, email, password };
      const res = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        setCurrentPage('dashboard');
      } else {
        alert(data.msg || "Authentication schema validation rejected.");
      }
    } catch (err) {
      alert("Network authorization handshake dropped.");
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/grocery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: itemName,
          quantity: Number(itemQty),
          unit: itemUnit,
          category: itemCategory,
          minStockLimit: Number(itemMinLimit),
          expiryDate: itemExpiry
        })
      });
      if (res.ok) {
        setItemName(''); setItemQty(''); setItemExpiry('');
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Failed to append structural entity to database.");
    }
  };

  const handleModifyQty = async (id, currentQty, shift) => {
    try {
      await fetch(`${API_BASE}/grocery/${id}/quantity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ quantity: currentQty + shift })
      });
      fetchDashboardData();
    } catch (err) {
      console.error("Quantity state mutation failed.");
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await fetch(`${API_BASE}/grocery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchDashboardData();
    } catch (err) {
      console.error("Purging transactional model record dropped.");
    }
  };

  // CSV Spreadsheet Export Engine Method
  const handleCSVExport = () => {
    if (inventory.length === 0) {
      alert("Pantry inventory buffer is empty. Populate items before exporting.");
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,Item Name,Current Quantity,Unit Metric,Category Segment,Expiry Date Timeline\n";
    inventory.forEach(i => { 
      csvContent += `"${i.name.replace(/"/g, '""')}",${i.quantity},"${i.unit}","${i.category}",${i.expiryDate.split('T')[0]}\n`; 
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Smart_Pantry_Stock_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute metrics dynamically for the visual bar charts
  const categoryTotals = inventory.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.quantity;
    return acc;
  }, {});
  
  const totalVolumeAcrossPantry = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0) || 1;

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Dairy', 'Produce', 'Bakery', 'Meat', 'Grains', 'Other'];
  
  // Style Themes Map
  const categoryColors = {
    Dairy: '#38bdf8',
    Produce: '#34d399',
    Bakery: '#fbbf24',
    Meat: '#f87171',
    Grains: '#c084fc',
    Other: '#94a3b8'
  };

  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff', fontFamily: 'system-ui, sans-serif', padding: '20px' },
    card: { backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.4)', margin: '100px auto' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', width: '100%', boxSizing: 'border-box', outline: 'none' },
    button: { padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#38bdf8', color: '#0f172a', fontSize: '15px', fontWeight: '600', cursor: 'pointer', width: '100%' },
    metricBox: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #334155' }
  };

  if (!token) {
    if (currentPage === 'login') {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <h2 style={{ color: '#38bdf8', marginBottom: '20px', textAlign: 'center' }}>Pantry Login</h2>
            <form onSubmit={(e) => handleAuth(e, 'login')} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required />
              <button type="submit" style={styles.button}>Authenticate Profile</button>
            </form>
            <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '16px' }}>New here? <span onClick={() => setCurrentPage('register')} style={{ color: '#38bdf8', cursor: 'pointer' }}>Sign Up</span></p>
          </div>
        </div>
      );
    }
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={{ color: '#38bdf8', marginBottom: '20px', textAlign: 'center' }}>Create Account</h2>
          <form onSubmit={(e) => handleAuth(e, 'register')} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} required />
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required />
            <button type="submit" style={styles.button}>Register Profile</button>
          </form>
          <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '16px' }}>Got an account? <span onClick={() => setCurrentPage('login')} style={{ color: '#38bdf8', cursor: 'pointer' }}>Log In</span></p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Top Navbar */}
      <nav style={{ backgroundColor: '#1e293b', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
        <h2 style={{ margin: 0, color: '#38bdf8', fontWeight: '700', fontSize: '22px' }}>Smart Pantry & Inventory Hub</h2>
        <div style={{ display: 'flex', gap: '14px' }}>
          <button onClick={handleCSVExport} style={{ backgroundColor: '#334155', color: '#38bdf8', border: '1px solid #475569', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Export Spreadsheet Data</button>
          <button onClick={() => setToken('')} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Disconnect</button>
        </div>
      </nav>

      {/* --- LIVE STATUS METRICS PANEL --- */}
      <div style={{ maxWidth: '1300px', margin: '30px auto 0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        <div style={styles.metricBox}>
          <div style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Pantry Catalog Varieties</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#38bdf8', marginTop: '6px' }}>{summary.totalUniqueItems} Items</div>
        </div>
        <div style={{ ...styles.metricBox, borderColor: summary.lowStockCount > 0 ? '#ea580c' : '#334155' }}>
          <div style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Low Stock Deficits</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: summary.lowStockCount > 0 ? '#f97316' : '#10b981', marginTop: '6px' }}>{summary.lowStockCount} Flags</div>
        </div>
        <div style={{ ...styles.metricBox, borderColor: summary.expiredCount > 0 ? '#dc2626' : '#334155' }}>
          <div style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Impending Expiries</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: summary.expiredCount > 0 ? '#ef4444' : '#10b981', marginTop: '6px' }}>{summary.expiredCount} Critical</div>
        </div>
      </div>

      {/* --- TOP VISUAL ANALYTICS GRAPH MATRIX CHART --- */}
      <div style={{ maxWidth: '1300px', margin: '20px auto 0 auto', padding: '0 20px' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', tracking: '0.05em' }}>Pantry Category Volume Ratio Distributions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
            {categories.filter(c => c !== 'All').map(cat => {
              const totalQty = categoryTotals[cat] || 0;
              const percentageShare = Math.round((totalQty / totalVolumeAcrossPantry) * 100);
              const activeColor = categoryColors[cat] || '#cbd5e1';
              
              return (
                <div key={cat} style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '10px', border: '1px solid #27272a', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: '600', color: '#f4f4f5', fontSize: '14px' }}>{cat}</span>
                    <span style={{ color: activeColor, fontWeight: 'bold', fontSize: '12px', backgroundColor: `${activeColor}15`, padding: '2px 8px', borderRadius: '20px' }}>{percentageShare}%</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>{totalQty} <span style={{ fontSize: '12px', color: '#71717a', fontWeight: 'normal' }}>Units</span></div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#27272a', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentageShare}%`, height: '100%', backgroundColor: activeColor, borderRadius: '3px', transition: 'width 0.5s ease' }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Bottom Workspace Layout Grid */}
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '30px' }}>
        
        {/* LEFT COLUMN: CONTROL STYLES */}
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155', alignSelf: 'start' }}>
          <h3 style={{ marginTop: 0, color: '#38bdf8', marginBottom: '16px' }}>Stock New Entry</h3>
          <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" placeholder="Item Name (e.g. Eggs)" value={itemName} onChange={(e) => setItemName(e.target.value)} style={styles.input} required />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="number" placeholder="Qty" value={itemQty} onChange={(e) => setItemQty(e.target.value)} style={styles.input} required />
              <input type="text" placeholder="Unit (e.g. Pack)" value={itemUnit} onChange={(e) => setItemUnit(e.target.value)} style={styles.input} required />
            </div>
            <select value={itemCategory} onChange={(e) => setItemCategory(e.target.value)} style={styles.input}>
              {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="number" placeholder="Alert Limit Threshold" value={itemMinLimit} onChange={(e) => setItemMinLimit(e.target.value)} style={styles.input} required />
            <input type="date" value={itemExpiry} onChange={(e) => setItemExpiry(e.target.value)} style={styles.input} required />
            <button type="submit" style={{ ...styles.button, backgroundColor: '#10b981', color: '#fff' }}>Commit to Pantry</button>
          </form>
        </div>

        {/* MIDDLE COLUMN: PANTRY MANAGEMENT MATRIX */}
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>Pantry Store Matrix</h3>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input type="text" placeholder="Search item keys..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.input} />
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ ...styles.input, maxWidth: '120px' }}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredInventory.map(item => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: '#0f172a', borderRadius: '8px', borderLeft: item.quantity <= item.minStockLimit ? '4px solid #ea580c' : '4px solid transparent' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Category: {item.category} | Expiry: {item.expiryDate.split('T')[0]}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button onClick={() => handleModifyQty(item._id, item.quantity, -1)} style={{ width: '28px', height: '28px', backgroundColor: '#334155', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>-</button>
                  <span style={{ minWidth: '50px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity} {item.unit}</span>
                  <button onClick={() => handleModifyQty(item._id, item.quantity, 1)} style={{ width: '28px', height: '28px', backgroundColor: '#334155', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                  <button onClick={() => handleDeleteItem(item._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: '10px' }}>✕</button>
                </div>
              </div>
            ))}
            {filteredInventory.length === 0 && <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>No products match this query filter.</div>}
          </div>
        </div>

        {/* RIGHT COLUMN: AUTO-GENERATED SHOPPING LIST */}
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155', alignSelf: 'start' }}>
          <h3 style={{ marginTop: 0, color: '#eab308', marginBottom: '6px' }}> Auto Shopping List</h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 16px 0', lineHeight: '1.4' }}>Compiled instantly based on items falling below safe limit parameters:</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {summary.shoppingListSuggestions.map((suggestion, index) => (
              <div key={index} style={{ padding: '12px', backgroundColor: '#0f172a', borderRadius: '8px', borderLeft: '4px solid #eab308' }}>
                <div style={{ fontWeight: '600', fontSize: '14px', color: '#f4f4f5' }}>{suggestion.name}</div>
                <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '4px' }}>Required Restock: <span style={{ color: '#eab308', fontWeight: '600' }}>+{suggestion.suggestedQty} {suggestion.unit}</span></div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Trigger: {suggestion.reason}</div>
              </div>
            ))}
            {summary.shoppingListSuggestions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: '14px' }}>Pantry is fully stocked. Safe storage configurations verified.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}