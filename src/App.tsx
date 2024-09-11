import { useEffect, useState } from 'react';
declare global {
  interface Window {
    Telegram: any;
  }
}
const App = () => {
  const [coins, setCoins] = useState(0);
  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => {
    // Check if window.Telegram exists (i.e., app is running inside Telegram WebView)
    if (window.Telegram) {
      const tg = window.Telegram.WebApp;
      tg.ready();

      // Fetch the user's Telegram information
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setUsername(user.username || user.first_name);
      }

      return () => {
        tg.close();
      };
    } else {
      console.log('Running outside Telegram WebApp');
    }
  }, []);
  const handleTap = () => {
    setCoins(coins + 1);
    // TODO: Send the coin balance to the backend (Supabase)
  };
  return (
    <div className='h-screen flex flex-col items-center justify-center gap-4'>
      <h1 className='text-4xl font-bold'>Tap Me</h1>
      {username && <p>Welcome, {username}!</p>}
      <button className='btn btn-primary' onClick={handleTap}>
        Tap to Earn Coins
      </button>
      <p>Your Coins: {coins}</p>
    </div>
  );
};
export default App;
