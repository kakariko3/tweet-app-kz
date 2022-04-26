import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

import { Avatar, createTheme } from '@mui/material';
import { Message as MessageIcon, Send as SendIcon } from '@mui/icons-material';
import styled from '@emotion/styled';

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

interface Comment {
  id: string;
  avatar: string;
  text: string;
  timestamp: Timestamp | null;
  username: string;
}

// テーマの作成
const theme = createTheme();

// アバターのスタイルを作成 (Emotion Styled)
const SAvatar = styled(Avatar)({
  width: theme.spacing(3),
  height: theme.spacing(3),
  marginRight: theme.spacing(1),
});

export const Post = (props: Props) => {
  const { postId, avatar, image, text, timestamp, username } = props;
  const user = useSelector(selectUser);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '',
      avatar: '',
      text: '',
      timestamp: null,
      username: '',
    },
  ]);
  const [isOpenComments, setIsOpenComments] = useState(false);

  useEffect(() => {
    // Firestoreからリアルタイムで対象のコメントの一覧を取得 (onSnapshot)
    const commentsCollectionRef = collection(db, 'posts', postId, 'comments');
    const q = query(commentsCollectionRef, orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setComments(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          avatar: doc.data().avatar,
          text: doc.data().text,
          timestamp: doc.data().timestamp,
          username: doc.data().username,
        }))
      );
    });
    // クリーンアップ関数 (コンポーネントのアンマウント時に実行)
    return () => unsub();
  }, [postId]);

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

        <MessageIcon
          className={styles.post_commentIcon}
          onClick={() => setIsOpenComments(!isOpenComments)}
        />

        {isOpenComments && (
          <>
            {comments.map((comment) => (
              <div key={comment.id} className={styles.post_comment}>
                <SAvatar src={comment.avatar} />
                <span className={styles.post_commentUser}>@{comment.username}</span>
                <span className={styles.post_commentText}>{comment.text}</span>
                <span className={styles.post_headerTime}>
                  {comment.timestamp && new Date(comment.timestamp.toDate()).toLocaleString()}
                </span>
              </div>
            ))}
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
          </>
        )}
      </div>
    </div>
  );
};
