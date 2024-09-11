import { gql, useMutation, useQuery } from '@apollo/client';
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
const GET_USER = gql`
  query GetUser($chat_id: Int!) {
    getUser(chat_id: $chat_id) {
      id
      name
      coin_balance
      chat_id
    }
  }
`;
// Define the mutation
const UPDATE_COINS_MUTATION = gql`
  mutation UpdateCoins($chat_id: Int!, $coins: Int!) {
    updateCoins(chat_id: $chat_id, coins: $coins) {
      id
      coin_balance
      chat_id
    }
  }
`;
const App = () => {
  const [coins, setCoins] = useState(0);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const { data: userData } = useQuery(GET_USER, {
    variables: { chat_id: userId },
    skip: !userId,
  });
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
  useEffect(() => {
    if (userData?.getUser) {
      setCoins(userData.getUser.coin_balance);
    }
  }, [userData]);
  const handleTap = async () => {
    const newCoinBalance = coins + 1;
    setCoins(newCoinBalance);
    try {
      if (userId) {
        const { data } = await updateCoins({
          variables: {
            chat_id: userId,
            coins: newCoinBalance,
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
