import React, { useState } from 'react';
import styles from './TweetInput.module.css';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import { auth, db, storage } from '../firebase';
import { signOut } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Avatar, Button, IconButton } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import { getDownloadURL, ref,  uploadBytesResumable } from 'firebase/storage';

const TweetInput: React.FC = () => {
    // redux -> user state を取得
    const user = useSelector(selectUser);
    const [tweetMsg, setTweetMsg] = useState("");
    const [tweetImage, setTweetImage] = useState<File | null>(null);

    const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files![0]) {
          setTweetImage(e.target.files![0]);
          e.target.value = "";
        }
    };

    const sendTweet = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (tweetImage) {
            const S =
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            const N = 16;
            const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
                .map((n) => S[n % S.length])
                .join("");
            const fileName = randomChar + "_" + tweetImage.name;
            //Firebase ver9 compliant
            const uploadTweetImg = uploadBytesResumable(
                ref(storage, `images/${fileName}`),
                tweetImage
            );
            //Firebase ver9 compliant
            uploadTweetImg.on(
                "state_changed",

                () => {},
                (err) => {
                alert(err.message);
                },
                async () => {
                await getDownloadURL(ref(storage, `images/${fileName}`)).then(
                    async (url) => {
                    addDoc(collection(db, "posts"), {
                        avatar: user.photoUrl,
                        image: url,
                        text: tweetMsg,
                        timestamp: serverTimestamp(),
                        username: user.displayName,
                    });
                    }
                );
                }
            );
        } else {
            const docRef = await addDoc(collection(db, "posts"), {
                avatar: user.photoUrl,
                image: "",
                text: tweetMsg,
                timestamp: serverTimestamp(),
                username: user.displayName
            });
            console.log("Document written with ID: ", docRef.id);
        }
        setTweetImage(null);
        setTweetMsg("");
    };

  return (
    <>
        <form onSubmit={sendTweet}>
            <div className={styles.tweet_form}>
                <Avatar 
                    className={styles.tweet_avater}
                    src={user.photoUrl}
                    onClick={async () =>  await signOut(auth)}
                />
                <input 
                    type="text" 
                    className={styles.tweet_input}
                    placeholder="Tweet"
                    autoFocus
                    value={tweetMsg}
                    onChange={(e) => setTweetMsg(e.target.value)}                
                />
                <IconButton>
                    <label >
                        <ImageIcon 
                            className={
                                tweetImage ? styles.tweet_addIconLoaded : styles.tweet_addIcon
                            }
                        />
                        <input 
                            type="file"
                            className={styles.tweet_hiddenIcon}
                            onChange={onChangeImageHandler} 
                        />
                    </label>
                </IconButton>
            </div>
            <Button type='submit' disabled={!tweetMsg} className={tweetMsg ? styles.tweet_sendBtn : styles.tweet_sendDisableBtn} >
                Tweet
            </Button>
        </form>
    </>
  );
};

export default TweetInput;