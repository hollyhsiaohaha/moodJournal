import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLazyQuery } from '@apollo/client';
import { GET_USER_PROFILE } from '../queries/user';
import Cookies from 'js-cookie';
import { useUserState } from '../state/state.js';
import { toast } from 'react-toastify';

function Authentication({path}) {
  const [getUserProfile] = useLazyQuery(GET_USER_PROFILE, { fetchPolicy: 'network-only' });
  const navigate = useNavigate();
  const { setLoginState, setUserInfoState } = useUserState();

  useEffect(() => {
    const validateLogin = async () => {
      const { error } = await getUserProfile();
      const status = error?.networkError?.result?.errors[0].extensions?.http?.status;
      if (status === 403) {
        setLoginState(false);
        setUserInfoState({ id: '', name: '', email: '' });
        Cookies.remove('JWT_TOKEN');
        navigate('/signin');
        return toast.warn('登入已過期 請重新登入');
      }
    };
    const noAuthPath = ['/', '/signin', '/signup'];
    if (!noAuthPath.includes(path)) {
      validateLogin();
    }
  }, [path]);
  return;
}

export default Authentication;

