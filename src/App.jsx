import { useEffect, useState } from 'react';
import { initTelegramApp, getUserData, sendDataToBot, closeApp } from './telegram';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    initTelegramApp();
    setUser(getUserData());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendDataToBot({ message });
    closeApp();
  };

  return (
    <div className="app">
      <header>
        <h1>Mini App Demo</h1>
        {user && <p>Welcome, {user.first_name}!</p>}
      </header>

      <main>
        <form onSubmit={handleSubmit}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message..."
          />
          <button type="submit">Send to Bot</button>
        </form>
      </main>
    </div>
  );
}

export default App;