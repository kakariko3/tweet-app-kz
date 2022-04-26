import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styles from './App.module.css';
import { Auth } from './components/Auth';
import { Feed } from './components/Feed';
import { login, logout, selectUser } from './features/userSlice';
import { auth } from './firebase';

export const App = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  useEffect(() => {
    // ユーザーの変更を監視
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log(user);
        // ユーザーが存在する場合
        dispatch(
          login({
            uid: user.uid,
            photoUrl: user.photoURL,
            displayName: user.displayName,
          })
        );
      } else {
        // ユーザーが存在しない場合
        dispatch(logout());
      }
    });
    // クリーンアップ関数 (コンポーネントのアンマウント時に実行)
    return () => unsub();
  }, [dispatch]);

  return (
    <>
      {user.uid ? (
        <div className={styles.app}>
          <Feed />
        </div>
      ) : (
        <Auth />
      )}
    </>
  );
};
