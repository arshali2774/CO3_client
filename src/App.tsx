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
  const [chatId, setChatId] = useState<number | null>(null);
  const {
    data: userData,
    error: userError,
    refetch,
  } = useQuery(GET_USER, {
    variables: { chat_id: chatId },
    skip: !chatId,
  });
  const [updateCoins, { error: updateError }] = useMutation(
    UPDATE_COINS_MUTATION
  );
  useEffect(() => {
    const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
    if (tgUser) {
      setChatId(tgUser.id);
      setUsername(
        tgUser.username || `${tgUser.first_name} ${tgUser.last_name || ''}`
      );
    }
  }, []);
  useEffect(() => {
    if (userData?.getUser) {
      console.log('User data received:', userData.getUser);
      setCoins(userData.getUser.coin_balance);
    }
    if (userError) {
      console.error('Error fetching user data:', userError);
    }
  }, [userData, userError]);
  const handleTap = async () => {
    const newCoinBalance = coins + 1;
    setCoins(newCoinBalance);
    try {
      if (chatId) {
        console.log(
          'Updating coins for chat_id:',
          chatId,
          'New balance:',
          newCoinBalance
        );
        const { data } = await updateCoins({
          variables: {
            chat_id: chatId,
            coins: newCoinBalance,
          },
        });
        console.log('Coin balance updated', data);
        refetch(); // Refetch user data to ensure UI is up-to-date
      } else {
        console.error('Chat ID is not available');
      }
    } catch (error) {
      console.error('Error updating coin balance:', error);
      setCoins(coins); // Revert the coin balance if update failed
    }
  };
  if (userError) return <p>Error loading user data</p>;
  if (updateError) return <p>Error updating coins</p>;
  return (
    <div className='h-screen flex flex-col items-center justify-center gap-4'>
      <h1 className='text-4xl font-bold'>Tap Me</h1>
      {chatId && <p>User ID: {chatId}</p>}
      {username && <p>Welcome, {username}!</p>}
      <button className='btn btn-primary' onClick={handleTap}>
        Tap to Earn Coins
      </button>
      <p>Your Coins: {coins}</p>
    </div>
  );
};
export default App;
