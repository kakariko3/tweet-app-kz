import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

import styles from './Feed.module.css';
import { db } from '../firebase';
import { TweetInput } from './TweetInput';
import { Post } from './Post';

export const Feed = () => {
  const [posts, setPosts] = useState([
    {
      id: '',
      avatar: '',
      image: '',
      text: '',
      timestamp: null,
      username: '',
    },
  ]);

  useEffect(() => {
    // Firestoreからリアルタイムでツイートを取得 (onSnapshot)
    const postsCollectionRef = collection(db, 'posts');
    const q = query(postsCollectionRef, orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setPosts(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          avatar: doc.data().avatar,
          image: doc.data().image,
          text: doc.data().text,
          timestamp: doc.data().timestamp,
          username: doc.data().username,
        }))
      );
    });
    // クリーンアップ関数 (コンポーネントのアンマウント時に実行)
    return () => unsub();
  }, []);

  return (
    <div className={styles.feed}>
      <TweetInput />
      {posts[0].id &&
        posts.map((post) => (
          <Post
            key={post.id}
            postId={post.id}
            avatar={post.avatar}
            image={post.image}
            text={post.text}
            timestamp={post.timestamp}
            username={post.username}
          />
        ))}
    </div>
  );
};
