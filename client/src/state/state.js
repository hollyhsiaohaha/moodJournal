import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useUserState = create(
  persist(
    (set) => ({
      loginState: false,
      userInfoState: { id: '', name: '', email: '' },
      setLoginState: (isLogin) => set({ loginState: isLogin }),
      setUserInfoState: (userInfo) =>
        set({ userInfoState: userInfo }),
    }),
    {
      name: 'userState',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
