import React, { useState } from 'react';

export default function LoginForm({ onSubmit, loading }) {
  const [email, setEmail] = useState('admin@servicecenter.dev');
  const [password, setPassword] = useState('Admin123!');
  const [activeCenterTab, setActiveCenterTab] = useState('downtown');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ email, password });
  };

  const downtownAccounts = [
    { email: 'admin@servicecenter.dev', password: 'Admin123!', role: 'Admin' },
    { email: 'manager@servicecenter.dev', password: 'Manager123!', role: 'Manager' },
    { email: 'supervisor@servicecenter.dev', password: 'Supervisor123!', role: 'Supervisor' },
    { email: 'cashier@servicecenter.dev', password: 'Cashier123!', role: 'Cashier' },
    { email: 'receptionist@servicecenter.dev', password: 'Receptionist123!', role: 'Receptionist' }
  ];

  const westsideAccounts = [
    { email: 'admin.westside@servicecenter.dev', password: 'Admin123!', role: 'Admin' },
    { email: 'manager.westside@servicecenter.dev', password: 'Manager123!', role: 'Manager' },
    { email: 'supervisor.westside@servicecenter.dev', password: 'Supervisor123!', role: 'Supervisor' },
    { email: 'cashier.westside@servicecenter.dev', password: 'Cashier123!', role: 'Cashier' },
    { email: 'receptionist.westside@servicecenter.dev', password: 'Receptionist123!', role: 'Receptionist' }
  ];

  const handleDemoSelect = (account) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  const currentAccounts = activeCenterTab === 'downtown' ? downtownAccounts : westsideAccounts;

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Service Center Admin Portal</h2>
      <p className="subtitle">Multi-Tenant Service Center Management</p>
      
      <label>
        Email
        <input
          type="email"
          value={email}
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      <div className="demo-accounts" style={{ marginTop: '1.5rem' }}>
        <p className="demo-title" style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
          Select Service Center to Test:
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <button
            type="button"
            className={`tab-btn ${activeCenterTab === 'downtown' ? 'active' : ''}`}
            onClick={() => {
              setActiveCenterTab('downtown');
              setEmail(downtownAccounts[0].email);
              setPassword(downtownAccounts[0].password);
            }}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '6px',
              border: activeCenterTab === 'downtown' ? '2px solid #2563eb' : '1px solid #cbd5e1',
              background: activeCenterTab === 'downtown' ? '#eff6ff' : '#fff',
              color: activeCenterTab === 'downtown' ? '#1d4ed8' : '#64748b',
              fontWeight: activeCenterTab === 'downtown' ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
          >
            🏢 Downtown Service Center
          </button>
          <button
            type="button"
            className={`tab-btn ${activeCenterTab === 'westside' ? 'active' : ''}`}
            onClick={() => {
              setActiveCenterTab('westside');
              setEmail(westsideAccounts[0].email);
              setPassword(westsideAccounts[0].password);
            }}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '6px',
              border: activeCenterTab === 'westside' ? '2px solid #2563eb' : '1px solid #cbd5e1',
              background: activeCenterTab === 'westside' ? '#eff6ff' : '#fff',
              color: activeCenterTab === 'westside' ? '#1d4ed8' : '#64748b',
              fontWeight: activeCenterTab === 'westside' ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
          >
            🏢 Westside Auto Care
          </button>
        </div>

        <p className="demo-title" style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
          Quick Sign-In by Role ({activeCenterTab === 'downtown' ? 'Downtown' : 'Westside'}):
        </p>
        <div className="role-buttons">
          {currentAccounts.map((account) => (
            <button
              key={account.role}
              type="button"
              className={`role-btn ${email === account.email ? 'active-role' : ''}`}
              onClick={() => handleDemoSelect(account)}
            >
              <span className="role-label">{account.role}</span>
              <span className="role-email">{account.email}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="role-info" style={{ marginTop: '1.25rem', fontSize: '0.85rem' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>Multi-Tenant Roles &amp; Permissions:</h3>
        <ul>
          <li><strong>Admin:</strong> Manages center profile, services, inventory, and staff</li>
          <li><strong>Manager:</strong> Manages inventory &amp; AI demand forecasting for this center</li>
          <li><strong>Supervisor:</strong> Assigns technicians &amp; manages appointment queue</li>
          <li><strong>Cashier:</strong> View and process payments</li>
          <li><strong>Receptionist:</strong> Manages appointments &amp; customer arrivals</li>
        </ul>
      </div>
    </form>
  );
}
