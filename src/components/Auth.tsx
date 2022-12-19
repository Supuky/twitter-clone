import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { auth, storage, provider } from "../firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateUserProfile } from "../features/userSlice";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  IconButton,
  Paper,
  Box,
  Grid,
  Typography,
  // Modal
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
// import SendIcon from "@mui/icons-material/Send";
import GoogleIcon from '@mui/icons-material/Google';
// import EmailIcon from "@mui/icons-material/Email";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LoginIcon from "@mui/icons-material/Login";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import styles from "./Auth.module.css";



const theme = createTheme();

const Auth: React.FC = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatarImage, setAvatarImage] = useState<File | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const sendResetEmail = async (e: React.MouseEvent<HTMLElement>) => {
    await sendPasswordResetEmail(auth, resetEmail)
      .then(() => {
        setOpenModal(false);
        setResetEmail("");
      })
      .catch((err: any) => {
        alert(err.message);
        setResetEmail("");
      });
  }

  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files![0]) {
      setAvatarImage(e.target.files![0]);
      e.target.value = "";
    }
  };

  const signInEmail = async () => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpEmail = async () => {
    const authUser = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    let url = "";
    if (avatarImage) {
      // file名をランダムで生成する
      const S =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const N = 16;
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join("");
      const fileName = randomChar + "_" + avatarImage.name;

      await uploadBytes(ref(storage, `avatars/${fileName}`), avatarImage);
      url = await getDownloadURL(ref(storage, `avatars/${fileName}`));
    }
    if (authUser.user) {
      await updateProfile(authUser.user, {
        displayName: username,
        photoURL: url,
      });
    }
    dispatch(
      updateUserProfile({
        displayName: username,
        photoUrl: url
      })
    )
  };

  const signInGoogle = async () => {
    await signInWithPopup(auth, provider)
      .catch((err) => alert(err.message));
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: "url(https://source.unsplash.com/random)",
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              {isLogin ? "Login" : "Register"}
            </Typography>
            <Box component="form" noValidate /*onSubmit={""}**/ sx={{ mt: 1 }}>
              {!isLogin && (
              <>
                <TextField 
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="Username"
                  label="username"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setUsername(e.target.value)}
                  />
                  <Box textAlign="center">
                    <IconButton>
                      <label >
                        <AccountCircleIcon
                          fontSize="large"
                          className={
                            avatarImage ?
                            styles.login_addIconLoaded :
                            styles.login_addIcon
                          }
                        />
                        <input 
                          type="file" 
                          className={styles.login_hiddenIcon}
                          onChange={onChangeImageHandler}
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
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(
                  event: React.ChangeEvent<
                    HTMLInputElement | HTMLTextAreaElement
                  >
                ) => setEmail(event.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(
                  event: React.ChangeEvent<
                    HTMLInputElement | HTMLTextAreaElement
                  >
                ) => setPassword(event.target.value)}
              />
              <Button
                disabled={
                  isLogin ?
                  !email || password.length < 6 : 
                  !username || !email || password.length < 6 || !avatarImage
                }
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                startIcon={<LoginIcon />}
                onClick={
                  isLogin
                    ? async () => {
                        try {
                          await signInEmail();
                        } catch (err: any) {
                          alert(err.message);
                        }
                      }
                    : async () => {
                        try {
                          await signUpEmail();
                        } catch (err: any) {
                          alert(err.message);
                        }
                      }
                }
              >
                {isLogin ? "Login" : "Register"}
              </Button>
              <Grid container>
                <Grid item xs>
                  <span className={styles.login_reset} onClick={() => setOpenModal(true)}>Forgot password?</span>
                </Grid>
                <Grid className={styles.login_toggleMode} item>
                  <span onClick={() => setIsLogin(!isLogin)} className={styles.login_toggleMode}>
                    {isLogin ? "Create new account?" : "Back to login"}
                  </span>
                </Grid>
              </Grid>

              <Button
                fullWidth
                variant="contained"
                startIcon={<GoogleIcon />}
                sx={{ mt: 3, mb: 2 }}
                onClick={signInGoogle}
              >
                SignIn with Google
              </Button>
            </Box>
            {/* スタイルが決まるまでコメントアウト */}
            {/* <Modal open={openModal} onClose={() => setOpenModal(false)}>
            <div className={styles.login_modal_position} >
              <div className={styles.login_modal}>
                <TextField
                  InputLabelProps={{
                    shrink: true,
                  }}
                  type="email"
                  name="email"
                  label="Reset E-mail"
                  value={resetEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setResetEmail(e.target.value);
                  }}
                />
                <IconButton onClick={sendResetEmail}>
                  <SendIcon />
                </IconButton>
              </div>
            </div>
          </Modal> */}
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default Auth;
