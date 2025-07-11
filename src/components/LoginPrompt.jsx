import React, { useState } from 'react';

const LoginPrompt = ({ onLogin }) => {
  const [isDevelopment, setIsDevelopment] = useState(false);

  const handleLogin = (provider) => {
    // Azure Static Web Apps authentication URL
    window.location.href = `/.auth/login/${provider}`;
  };

  const handleDevLogin = () => {
    // In development, just trigger the login check
    onLogin();
  };

  // Check if we're in development mode by trying to detect local environment
  const isLocalDevelopment = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1';

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🏠 Lake Stash</h1>
          <p>Cabin Inventory Tracker</p>
        </div>
        
        <div className="login-content">
          <h2>Welcome!</h2>
          <p>Sign in to manage your cabin inventory</p>
          
          <div className="login-buttons">
            {isLocalDevelopment ? (
              <>
                <button 
                  className="login-btn development"
                  onClick={handleDevLogin}
                  style={{
                    borderColor: '#10b981',
                    color: '#10b981'
                  }}
                >
                  <span>🔧</span>
                  Continue as Development User
                </button>
                
                <div className="dev-notice">
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '1rem' }}>
                    Development Mode: Authentication is simulated for local testing
                  </p>
                </div>
              </>
            ) : (
              <>
                <button 
                  className="login-btn github"
                  onClick={() => handleLogin('github')}
                >
                  <span>🔗</span>
                  Continue with GitHub
                </button>
                
                <button 
                  className="login-btn microsoft"
                  onClick={() => handleLogin('aad')}
                >
                  <span>🔗</span>
                  Continue with Microsoft
                </button>
                
                <button 
                  className="login-btn google"
                  onClick={() => handleLogin('google')}
                >
                  <span>🔗</span>
                  Continue with Google
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="login-footer">
          <p>
            {isLocalDevelopment 
              ? 'Local development environment'
              : 'Secure authentication powered by Azure'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;
