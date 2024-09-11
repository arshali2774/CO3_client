import { gql, useMutation } from '@apollo/client';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        initDataUnsafe?: {
          user?: {
            id?: number;
            username?: string;
            first_name?: string;
          };
        };
        close: () => void;
      };
    };
  }
}
// Define the mutation
const UPDATE_COINS_MUTATION = gql`
  mutation UpdateCoins($id: ID!, $coins: Int!) {
    updateCoins(id: $id, coins: $coins) {
      id
      coin_balance
    }
  }
`;
const App = () => {
  const [coins, setCoins] = useState(0);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [updateCoins] = useMutation(UPDATE_COINS_MUTATION);
  console.log(window.Telegram);
  useEffect(() => {
    // Check if window.Telegram exists (i.e., app is running inside Telegram WebView)
    if (window.Telegram) {
      const tg = window.Telegram.WebApp;
      tg.ready();

      // Fetch the user's Telegram information
      const user = tg.initDataUnsafe?.user;
      console.log(user);
      if (user) {
        const name = user.username || user.first_name || 'User';
        setUsername(name);
        setUserId(user.id || 0);
      }

      return () => {
        tg.close();
      };
    } else {
      console.log('Running outside Telegram WebApp');
    }
  }, []);
  const handleTap = async () => {
    setCoins((prev) => prev + 1);
    // TODO: Send the coin balance to the backend (Supabase)
    try {
      if (userId) {
        const { data } = await updateCoins({
          variables: {
            id: userId,
            coins: coins + 1,
          },
        });
        console.log('coin balance updated', data);
      } else {
        console.error('user id is not available');
      }
    } catch (error) {
      console.error('error updating coin balance', error);
      console.log(window.Telegram);
    }
  };
  return (
    <div className='h-screen flex flex-col items-center justify-center gap-4'>
      <h1 className='text-4xl font-bold'>Tap Me</h1>
      {userId && <p>User ID: {userId}</p>}
      {username && <p>Welcome, {username}!</p>}
      <button className='btn btn-primary' onClick={handleTap}>
        Tap to Earn Coins
      </button>
      <p>Your Coins: {coins}</p>
    </div>
  );
};
export default App;
