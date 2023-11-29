import { useState, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import { GET_USER_PROFILE } from '../queries/user';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useUserState } from '../state/state.js';

function Profile() {
  const [getUserProfile] = useLazyQuery(GET_USER_PROFILE);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();
  const { loginState, setLoginState, setLogoutState } = useUserState();

  useEffect(() => {
    const refreshProfile = async () => {
      const { data, error } = await getUserProfile();
      const status = error?.networkError?.result?.errors[0].extensions?.http?.status;
      if (status === 403) {
        setUserEmail('');
        setUserName('');
        setUserId('');
        Cookies.remove('JWT_TOKEN');
        navigate('/signin');
        return alert('請重新登入');
      }
      const user = data?.getUserProfile;
      if (user) {
        setUserEmail(user.email);
        setUserName(user.name);
        setUserId(user._id);
      }
    };
    refreshProfile();
  }, [getUserProfile, navigate]);

  const signOut = () => {
    setUserEmail('');
    setUserName('');
    setUserId('');
    Cookies.remove('JWT_TOKEN');
    setLogoutState();
    navigate('/');
    alert('成功登出');
  };
  return (
    <>
      <h1>Profile</h1>
      <p>{`Id: ${userId}`}</p>
      <p>{`Name: ${userName}`}</p>
      <p>{`Email: ${userEmail}`}</p>
      <Button label="Sign Out" onClick={signOut} />
    </>
  );
}

export default Profile;
