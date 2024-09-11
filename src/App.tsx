import { gql, useMutation } from '@apollo/client';
import { useEffect, useState } from 'react';
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            username: string;
            first_name: string;
            last_name?: string;
          };
        };
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
  useEffect(() => {
    const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
    if (tgUser) {
      setUserId(tgUser.id);
      setUsername(
        tgUser.username || `${tgUser.first_name} ${tgUser.last_name || ''}`
      );
    }
  }, []);
  const handleTap = async () => {
    setCoins((prev) => prev + 1);
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
