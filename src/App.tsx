import React, { useEffect } from 'react';
import styles from './App.module.css';
import { useSelector, useDispatch } from "react-redux";
import {selectUser, login, logout} from "./features/userSlice";
import { auth } from "./firebase";
import Feed from './components/Feed';
import Auth from './components/Auth';

const App: React.FC = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  useEffect(() => {
   // firebaseのauthに対して変化があったときに毎回呼び出させる関数 (login logout ユーザーの変化 etc..)
   const unSub =  auth.onAuthStateChanged((authUser) => {
    if(authUser) {
      dispatch(login({
        uid: authUser.uid,
        photoUrl: authUser.photoURL,
        displayName: authUser.displayName,
      }));
    } else {
      dispatch(logout());
    }
   });
   //cleanUp関数
   return () => {
    unSub();
   }
  }, [dispatch]);


  return (
    <>
      {user.uid ? (
        <div className={styles.app}>
          <Feed/> 
        </div>
      ) : (
        <Auth/>
      )
      }
    </>
  );
}

export default App;
