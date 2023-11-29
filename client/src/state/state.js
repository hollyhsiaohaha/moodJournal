import { create } from 'zustand';
import { persist } from 'zustand/middleware'

export const useUserState = create(persist((set) => ({
  loginState: false,
  setLoginState: () => set({ loginState: true }),
  setLogoutState: () => set({ loginState: false }),
  }),
  {
    name: 'userState',
    getStorage: () => localStorage,
  }
))
