import {  createSlice, PayloadAction } from '@reduxjs/toolkit';
import {  RootState } from '../app/store';
// import { fetchCount } from './counter/counterAPI';

interface USER {
  displayName: string;
  photoUrl: string;
}

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: {
      uid: "",
      photoUrl:"",
      displayName: ""
    },
  },
  reducers: {
    login: (state, action) => {
      // userのstateの内容をactionのpayload経由で受け取ったuser情報で更新する
      // loginに成功したときにfirebaseから取得したuser情報をReduxに反映
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = {uid: "", photoUrl: "", displayName: ""};
    },
    updateUserProfile: (state, action: PayloadAction<USER>) => {
      state.user.displayName = action.payload.displayName;
      state.user.photoUrl = action.payload.photoUrl;
    }
  }
});

export const { login, logout, updateUserProfile } = userSlice.actions;

export const selectUser = (state: RootState) => state.user.user;

export default userSlice.reducer;
