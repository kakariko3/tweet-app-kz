import { ChangeEvent, FormEvent, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Paper,
  Box,
  Grid,
  Typography,
  IconButton,
  Modal,
} from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import {
  AccountCircle as AccountCircleIcon,
  Camera as CameraIcon,
  Email as EmailIcon,
  LockOutlined as LockOutlinedIcon,
  Send as SendIcon,
} from '@mui/icons-material';

import styles from './Auth.module.css';
import { auth, provider, storage } from '../firebase';
import { updateUserProfile } from '../features/userSlice';

const theme = createTheme();

// モーダルのスタイルを作成 (Emotion)
const SModal = styled('div')({
  outline: 'none',
  position: 'absolute',
  width: 400,
  borderRadius: 10,
  backgroundColor: 'white',
  boxShadow: theme.shadows[5],
  padding: theme.spacing(10),
});
// モーダルの位置を上下中央に揃える
const getModalStyle = () => {
  const top = 50;
  const left = 50;
  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
};

export const Auth = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatarImage, setAvatarImage] = useState<File | null>(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // パスワードリセットの送信ボタンを押下したときの処理
  const handleSendResetEmail = () => {
    sendPasswordResetEmail(auth, resetEmail)
      .then(() => {
        setOpenModal(false);
        setResetEmail('');
      })
      .catch((err) => {
        alert(err.message);
        setResetEmail('');
      });
  };

  // アバター選択時の処理
  const handleSelectAvatar = (evt: ChangeEvent<HTMLInputElement>) => {
    if (evt.target.files![0]) {
      setAvatarImage(evt.target.files![0]);
      evt.target.value = '';
    }
  };

  // Emailでサインアップ
  const signUpEmail = () => {
    createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
      if (avatarImage) {
        // ランダムな16桁の文字列を作成 (ファイル名)
        const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const N = 16;
        const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
          .map((n) => S[n % S.length])
          .join('');
        const fileName = randomChar + '_' + avatarImage.name;

        // アバター画像のアップロード
        const storageRef = ref(storage, `avatars/${fileName}`);
        uploadBytes(storageRef, avatarImage).then((snapshot) => {
          console.log('ファイルをアップロードしました');
          // アバター画像のURLを取得
          getDownloadURL(snapshot.ref).then((url) => {
            // Firebaseのユーザープロフィールを更新
            updateProfile(userCredential.user, {
              displayName: username,
              photoURL: url,
            });
            // ReduxのUserStateを更新
            dispatch(
              updateUserProfile({
                displayName: username,
                photoUrl: url,
              })
            );
          });
        });
      }
    });
  };

  // Emailでサインイン
  const signInEmail = async () => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Googleアカウントでサインイン
  const signInGoogle = async () => {
    await signInWithPopup(auth, provider).catch((err) => alert(err.message));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get('email'),
      password: data.get('password'),
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: 'url(https://source.unsplash.com/random)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              {isLoginMode ? 'Login' : 'Register'}
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              {!isLoginMode && (
                <>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    name="username"
                    label="Username"
                    autoComplete="username"
                    autoFocus
                    value={username}
                    onChange={(evt: ChangeEvent<HTMLInputElement>) => setUsername(evt.target.value)}
                  />
                  <Box textAlign="center">
                    <IconButton>
                      <label>
                        <AccountCircleIcon
                          fontSize="large"
                          className={
                            avatarImage ? styles.login_addIconLoaded : styles.login_addIcon
                          }
                        />
                        <input
                          type="file"
                          className={styles.login_hiddenIcon}
                          onChange={handleSelectAvatar}
                        />
                      </label>
                    </IconButton>
                  </Box>
                </>
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                name="email"
                label="Email Address"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(evt: ChangeEvent<HTMLInputElement>) => setEmail(evt.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="password"
                name="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(evt: ChangeEvent<HTMLInputElement>) => setPassword(evt.target.value)}
              />

              <Button
                disabled={
                  isLoginMode
                    ? !email || password.length < 6
                    : !username || !email || password.length < 6 || !avatarImage
                }
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                startIcon={<EmailIcon />}
                onClick={
                  isLoginMode
                    ? async () => {
                        try {
                          await signInEmail();
                        } catch (err) {
                          if (err instanceof Error) {
                            alert(err.message);
                          }
                        }
                      }
                    : async () => {
                        try {
                          await signUpEmail();
                        } catch (err) {
                          if (err instanceof Error) {
                            alert(err.message);
                          }
                        }
                      }
                }
              >
                {isLoginMode ? 'Login' : 'Register'}
              </Button>

              <Grid container>
                <Grid item xs>
                  <span className={styles.login_toggleMode} onClick={() => setOpenModal(true)}>
                    Forgot Password?
                  </span>
                </Grid>
                <Grid item>
                  <span
                    className={styles.login_toggleMode}
                    onClick={() => setIsLoginMode(!isLoginMode)}
                  >
                    {isLoginMode ? 'Create new account?' : 'Back to login'}
                  </span>
                </Grid>
              </Grid>

              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                startIcon={<CameraIcon />}
                onClick={signInGoogle}
              >
                Sign In with Google
              </Button>
            </Box>

            <Modal open={openModal} onClose={() => setOpenModal(false)}>
              <SModal style={getModalStyle()}>
                <div className={styles.login_modal}>
                  <TextField
                    InputLabelProps={{
                      shrink: true,
                    }}
                    type="email"
                    name="email"
                    label="Reset E-mail"
                    value={resetEmail}
                    onChange={(evt: ChangeEvent<HTMLInputElement>) => {
                      setResetEmail(evt.target.value);
                    }}
                  />
                  <IconButton onClick={handleSendResetEmail}>
                    <SendIcon />
                  </IconButton>
                </div>
              </SModal>
            </Modal>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};
