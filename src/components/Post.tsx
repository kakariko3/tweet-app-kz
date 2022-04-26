import { Avatar } from '@mui/material';
import { Timestamp } from 'firebase/firestore';

import styles from './Post.module.css';

interface Props {
  postId: string;
  avatar: string;
  image: string;
  text: string;
  timestamp: Timestamp | null;
  username: string;
}

export const Post = (props: Props) => {
  const { postId, avatar, image, text, timestamp, username } = props;

  return (
    <div className={styles.post}>
      <div className={styles.post_avatar}>
        <Avatar src={avatar} />
      </div>
      <div className={styles.post_body}>
        <div>
          <div className={styles.post_header}>
            <h3>
              <span className={styles.post_headerUser}>@{username}</span>
              <span className={styles.post_headerTime}>
                {timestamp && new Date(timestamp.toDate()).toLocaleString()}
              </span>
            </h3>
          </div>
          <div className={styles.post_tweet}>
            <p>{text}</p>
          </div>
        </div>
        {image && (
          <div className={styles.post_tweetImage}>
            <img src={image} alt="tweet" />
          </div>
        )}
      </div>
    </div>
  );
};
