import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null,
        allUsers: [],
        allChats: [],
        selectedChats:null
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload
        },
        setAllUser: (state, action) => {
            state.allUsers = action.payload
        },
        setAllChats: (state, action) => {
            state.allChats = action.payload
        },

        setSelectedChats:(state,action)=>{
            state.selectedChats = action.payload
        }

    }
});


export const { setUser, setAllUser,setAllChats,setSelectedChats } = userSlice.actions;
export default userSlice.reducer;