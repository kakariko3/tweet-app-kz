import styles from './Feed.module.css';
import { auth } from '../firebase';
import { TweetInput } from './TweetInput';

export const Feed = () => {
  return (
    <div className={styles.feed}>
      <TweetInput />
      <button onClick={() => auth.signOut()}>Logout</button>
    </div>
  );
};
