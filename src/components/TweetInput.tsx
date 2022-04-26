import { ChangeEvent, FormEvent, useState } from 'react';
import { useSelector } from 'react-redux';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

import { Avatar, Button, IconButton } from '@mui/material';
import { AddAPhoto as AddAPhotoIcon } from '@mui/icons-material';

import styles from './TweetInput.module.css';
import { auth, db, storage } from '../firebase';
import { selectUser } from '../features/userSlice';

export const TweetInput = () => {
  const user = useSelector(selectUser);
  const [tweetImage, setTweetImage] = useState<File | null>(null);
  const [tweetMsg, setTweetMsg] = useState('');

  // 投稿画像が選択されたときの処理
  const handleSelectImage = (evt: ChangeEvent<HTMLInputElement>) => {
    if (evt.target.files![0]) {
      setTweetImage(evt.target.files![0]);
      evt.target.value = '';
    }
  };

  // Submitが実行されたときの処理
  const sendTweet = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (tweetImage) {
      // 投稿画像が選択されているときの処理

      // ランダムな16桁の文字列を作成 (ファイル名)
      const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const N = 16;
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join('');
      const fileName = randomChar + '_' + tweetImage.name;

      // CloudStorageに投稿画像をアップロード
      const storageRef = ref(storage, `images/${fileName}`);
      const uploadTweetImg = uploadBytesResumable(storageRef, tweetImage);
      // アップロードの進捗状況を監視
      uploadTweetImg.on(
        'state_changed',
        // 進捗状況の取得
        () => {},
        // エラー時の処理
        (err: Error) => {
          alert(err.message);
        },
        // アップロード完了時の処理
        () => {
          // 画像のURLを取得
          getDownloadURL(uploadTweetImg.snapshot.ref).then((url) => {
            // Firestoreにツイートを追加
            addDoc(collection(db, 'posts'), {
              avatar: user.photoUrl,
              image: url,
              text: tweetMsg,
              timestamp: serverTimestamp(),
              username: user.displayName,
            })
              .then(() => {
                // 入力フォームの初期化
                setTweetImage(null);
                setTweetMsg('');
              })
              .catch((err: Error) => alert(err.message));
          });
        }
      );
    } else {
      // 投稿画像が未選択のときの処理

      // Firestoreにツイートを追加
      addDoc(collection(db, 'posts'), {
        avatar: user.photoUrl,
        image: '',
        text: tweetMsg,
        timestamp: serverTimestamp(),
        username: user.displayName,
      })
        .then(() => {
          // 入力フォームの初期化
          setTweetImage(null);
          setTweetMsg('');
        })
        .catch((err: Error) => alert(err.message));
    }
  };

  return (
    <>
      <form onSubmit={sendTweet}>
        <div className={styles.tweet_form}>
          <Avatar
            className={styles.tweet_avatar}
            src={user.photoUrl}
            onClick={() => auth.signOut()}
          />
          <input
            className={styles.tweet_input}
            type="text"
            placeholder="What's happening?"
            autoFocus
            value={tweetMsg}
            onChange={(evt: ChangeEvent<HTMLInputElement>) => setTweetMsg(evt.target.value)}
          />
          <IconButton>
            <label>
              <AddAPhotoIcon
                className={tweetImage ? styles.tweet_addIconLoaded : styles.tweet_addIcon}
              />
              <input className={styles.tweet_hiddenIcon} type="file" onChange={handleSelectImage} />
            </label>
          </IconButton>
        </div>
        <Button
          className={tweetMsg ? styles.tweet_sendBtn : styles.tweet_sendDisableBtn}
          type="submit"
          disabled={!tweetMsg}
        >
          Tweet
        </Button>
      </form>
    </>
  );
};
