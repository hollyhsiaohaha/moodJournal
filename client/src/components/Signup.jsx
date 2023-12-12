import { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { useMutation } from '@apollo/client';
import { SIGN_UP } from '../mutations/users.js';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useUserState } from '../state/state.js';
import { toast } from 'react-toastify';

function Signup() {
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [signUp] = useMutation(SIGN_UP);
  const navigate = useNavigate();
  const { setLoginState, setUserInfoState } = useUserState();

  const validateEmail = (email) => {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
  };

  useEffect(() => {
    const token = Cookies.get('JWT_TOKEN');
    token ? navigate('/home') : null;
  }, []);

  const submit = async () => {
    setLoading(true);
    try {
      if (!validateEmail(userEmail)) {
        setLoading(false);
        return toast.error('Email 不符合格式');
      }
      const { data } = await signUp({
        variables: {
          signUpInput: {
            name: userName,
            email: userEmail,
            password: password,
          },
        },
      });
      const token = data.signUp?.jwtToken;
      const userId = data.signUp?._id;
      Cookies.set('JWT_TOKEN', token, { expires: 1 }); // day
      setLoginState(true);
      setUserInfoState( {id: userId, name: userName, email: userEmail} );
      navigate('/home');
      toast.success('成功登入');
    } catch (error) {
      error.message === 'email exist' ? toast.warn('Email 已被註冊') : console.error(error);
    }
    setLoading(false);
  };
  return (
    <>
      <div className="card flex justify-content-center">
        <span className="p-float-label">
          <InputText id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} />
          <label htmlFor="userName">User name</label>
        </span>
      </div>
      <div className="card flex justify-content-center">
        <span className="p-float-label">
          <InputText
            id="userEmail"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
          />
          <label htmlFor="userEmail">Email</label>
        </span>
      </div>
      <div className="card flex justify-content-center">
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
      <Button label="註冊" loading={loading} onClick={submit} />
      <br/>
      <Button
          label="登入 >>>"
          link
          onClick={() => {
            navigate('/signin');
          }}
        />
    </>
  );
}

export default Signup;
