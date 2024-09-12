import { gql, useMutation, useQuery } from '@apollo/client';
import { Player } from '@lottiefiles/react-lottie-player';
import { useEffect, useRef, useState } from 'react';
import animationData from './lottie/coin.json';
import image from './lottie/tapcoin.json';
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
  const playerRef = useRef<Player>(null);
  const buttonPlayerRef = useRef<Player>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showPlusOne, setShowPlusOne] = useState(false);
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
    // Trigger animation for '+1'
    setShowPlusOne(true);

    // Hide the animation after 1 second (adjust time based on animation duration)
    setTimeout(() => setShowPlusOne(false), 1000);
    playerRef.current?.setSeeker(50);
    playerRef.current?.play();
    buttonPlayerRef.current?.setPlayerSpeed(5);
    buttonPlayerRef.current?.play();
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
      {/* {chatId && <p>User ID: {chatId}</p>}
      {username && <p>Welcome, {username}!</p>} */}
      <div className='flex items-center gap-4'>
        <div className='bg-base-300 text-base-content px-4 py-2 rounded-md h-full flex justify-center items-center'>
          <p className='lg:text-xl font-bold sm:text-xs'>
            {' '}
            Welcome, {username}!
          </p>
        </div>
        <div className='bg-base-300 rounded-md text-base-content flex justify-center items-center pr-4 gap-2'>
          <Player src={animationData} ref={playerRef} />
          <p className='lg:text-xl font-bold sm:text-xs'>{coins}</p>
        </div>
      </div>
      <button className='w-[60%]' onClick={handleTap} ref={buttonRef}>
        <Player
          src={image}
          style={{ width: '100%', height: '100%' }}
          ref={buttonPlayerRef}
        />
        {showPlusOne && (
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2  text-lg font-bold text-white animate-ping'>
            +1
          </div>
        )}
      </button>
      <p className='w-full text-center'>⬆️ Tap Me!</p>
    </div>
  );
};
export default App;
