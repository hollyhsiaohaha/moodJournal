import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useUserState } from '../state/state.js';
import { toast } from 'react-toastify';
import { Image } from 'primereact/image';

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
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div>
        <h1 className="text-left">基本資料</h1>
        <div className="flex">
          <Image
            src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${userInfoState.name}`}
            alt="avatar"
            height="150px"
          />
          <div className="flex flex-wrap flex-column text-left ml-5">
            <p>{`Id: ${userInfoState.id}`}</p>
            <p>{`帳號: ${userInfoState.name}`}</p>
            <p>{`電子信箱: ${userInfoState.email}`}</p>
          </div>
        </div>
        <Button label="登出" onClick={signOut} />
      </div>
    </div>
  );
}

export default Profile;
