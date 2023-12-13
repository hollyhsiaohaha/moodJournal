import { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { useMutation } from '@apollo/client';
import { SIGN_IN } from '../mutations/users.js';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useUserState } from '../state/state.js';
import { toast } from 'react-toastify';

function Signin() {
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [signIn] = useMutation(SIGN_IN);
  const navigate = useNavigate();
  const { setLoginState, setUserInfoState } = useUserState();

  useEffect(() => {
    const token = Cookies.get('JWT_TOKEN');
    token ? navigate('/home') : null;
  }, []);

  const submit = async () => {
    setLoading(true);
    try {
      const { data } = await signIn({
        variables: {
          signInInput: {
            email: userEmail,
            password: password,
          },
        },
      });
      const token = data.signIn?.jwtToken;
      const userId = data.signIn?._id;
      const userName = data.signIn?.name;
      Cookies.set('JWT_TOKEN', token, { expires: 1 }); // day
      setLoginState(true);
      setUserInfoState({ id: userId, name: userName, email: userEmail });
      navigate('/home');
      toast.success('成功登入');
    } catch (error) {
      error.message === 'incorrect email or password'
        ? toast.error('錯誤的 Email 或密碼')
        : console.error(error);
    }
    setLoading(false);
  };
  return (
    <>
      <div className="flex flex-column align-items-center ml-5" style={{ width: '100%' }}>
        <div className="card flex justify-content-start" style={{ width: '100%', maxWidth: '360px' }}>
          <span className="p-float-label">
            <InputText
              id="userEmail"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
            <label htmlFor="userEmail">Email</label>
          </span>
        </div>
        <div className="card flex justify-content-start" style={{ width: '100%', maxWidth: '360px' }}>
          <span className="p-float-label">
            <Password
              inputId="password"
              value={password}
              feedback={false}
              toggleMask
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="password">Password</label>
          </span>
        </div>
      </div>
      <Button label="登入" loading={loading} onClick={submit} />
      <br />
      <Button
        label="註冊 >>>"
        link
        onClick={() => {
          navigate('/signup');
        }}
      />
    </>
  );
}

export default Signin;
