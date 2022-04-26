import { ChangeEvent, FormEvent, useState } from 'react';
import { useSelector } from 'react-redux';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';

import { Avatar } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

import styles from './Post.module.css';
import { db } from '../firebase';
import { selectUser } from '../features/userSlice';

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
  const user = useSelector(selectUser);
  const [comment, setComment] = useState('');

  // コメント投稿時の処理
  const newComment = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    // Firestoreにコメントを追加 (posts.postId.comments)
    addDoc(collection(db, 'posts', postId, 'comments'), {
      avatar: user.photoUrl,
      text: comment,
      timestamp: serverTimestamp(),
      username: user.displayName,
    });
    // 入力フォームの初期化
    setComment('');
  };

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
        <form onSubmit={newComment}>
          <div className={styles.post_form}>
            <input
              className={styles.post_input}
              type="text"
              placeholder="Type new comment..."
              value={comment}
              onChange={(evt: ChangeEvent<HTMLInputElement>) => setComment(evt.target.value)}
            />
            <button
              className={comment ? styles.post_button : styles.post_buttonDisable}
              type="submit"
              disabled={!comment}
            >
              <SendIcon className={styles.post_sendIcon} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
