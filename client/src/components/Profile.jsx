import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useUserState } from '../state/state.js';
import { toast } from 'react-toastify';

function Profile() {
  const navigate = useNavigate();
  const { userInfoState, setLoginState, setUserInfoState } = useUserState();

  const signOut = () => {
    Cookies.remove('JWT_TOKEN');
    setLoginState(false);
    setUserInfoState({ id: '', name: '', email: '' });
    navigate('/');
    toast.success('成功登出');
  };

  return (
    <>
      <h1 className="text-left ml-8">基本資料</h1>
      <div className="flex flex-wrap flex-column text-left ml-8">
        <p>{`Id: ${userInfoState.id}`}</p>
        <p>{`Name: ${userInfoState.name}`}</p>
        <p>{`Email: ${userInfoState.email}`}</p>
        <Button label="登出" onClick={signOut} />
      </div>
    </>
  );
}

export default Profile;
