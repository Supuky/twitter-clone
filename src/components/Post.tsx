import React, { useState, useEffect } from 'react';
import styles from './Post.module.css';
import { db } from "../firebase";
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import { Avatar } from '@mui/material';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import SendIcon from '@mui/icons-material/Send';
import MessageIcon from '@mui/icons-material/Message';
// import {  } from '@mui/material/styles' ;

interface PEOPS {
    postId: string;
    avatar: string;
    image: string;
    text: string;
    timestamp: any;
    username: string
}

interface COMMENT {
    id: string;
    avatar: string;
    text: string;
    timestamp: any;
    username: string;
}

const Post: React.FC<PEOPS> = (props) => {
    const user = useSelector(selectUser);
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState<COMMENT[]>([
        {
            id: "",
            avatar: "",
            text: "",
            timestamp: null,
            username: "",
        }
    ]);
    const [openComments, setOpenComments] = useState(false);

    useEffect(() => {
        const q = query(
          collection(db, "posts", props.postId, "comments"),
          orderBy("timestamp", "desc")
        );
        const unSub = onSnapshot(q, (snapshot) => {
          setComments(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              avatar: doc.data().avatar,
              text: doc.data().text,
              username: doc.data().username,
              timestamp: doc.data().timestamp,
            }))
          );
        });
        return () => {
          unSub();
        };
      }, [props.postId]);

    const newComment = /*async*/ (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        /*await*/ addDoc(collection(db, "posts", props.postId, "comments"), {
            avatar: user.photoUrl,
            text: comment,
            timestamp: serverTimestamp(),
            username: user.displayName
        });

        setComment("");
    }


  return (
    <div className={styles.post}>
        <div className={styles.post_avatar}>
            <Avatar src={props.avatar} />
        </div>
        <div className={styles.post_body}>
            <div>
                <div className={styles.post_header}>
                    <h3>
                        <span className={styles.post_headerUser}>{props.username}</span>
                        <span className={styles.post_headerTime}>
                            {new Date(props.timestamp?.toDate()).toLocaleString()}
                        </span>
                    </h3>
                </div>
                <div className={styles.post_tweet}>
                    <p>{props.text}</p>
                </div>
            </div>
            {props.image && (
                <div className={styles.post_tweetImage}>
                    <img src={props.image} alt="tweet image" />
                </div>
            )
            }
            <MessageIcon 
                className={styles.post_commentIcon}
                onClick={() => setOpenComments(!openComments)}
            />
            {openComments && (
                <>

                {comments.map((com) => (
                    <div key={com.id} className={styles.post_comment}>
                        <Avatar src={com.avatar} sx={{ width: 24, height: 24 }}/>

                        <span className={styles.post_commentUser}>{com.username}</span>
                        <span className={styles.post_commentText}>{com.text}</span>
                        <span className={styles.post_headerTime}>
                            { new Date(com.timestamp?.toDate()).toLocaleString() }
                        </span>
                    </div>
                ))}

                <form onSubmit={newComment}>
                    <div className={styles.post_form}>
                        <input 
                            className={styles.post_input}
                            type="text"
                            placeholder='コメント'
                            value={comment}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComment(e.target.value)}
                        />
                        <button
                            disabled={!comment}
                            className={
                                comment ? styles.post_button : styles.post_buttonDisable
                            }
                            type="submit"
                        >
                            <SendIcon className={styles.post_sendIcon}/>
                        </button>
                    </div>
                </form>
            </>
            )}
            
        </div>
    </div>
  )
}

export default Post