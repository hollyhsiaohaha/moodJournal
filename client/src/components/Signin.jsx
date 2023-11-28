import { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { useMutation } from '@apollo/client';
import { SIGN_IN } from '../mutations/users.js';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';


function Signin() {
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [signIn] = useMutation(SIGN_IN);
  const navigate = useNavigate();

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
      Cookies.set('JWT_TOKEN', token, { expires: 1 }); // day
      navigate('/home');
      alert('成功登入');
    } catch (error) {
      error.message === 'incorrect email or password' ? alert('錯誤的 Email 或密碼') : console.error(error);
    }
    setLoading(false);
  };
  return (
    <>
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
      <Button label="Sign In" loading={loading} onClick={submit} />
      <br/>
      <Button
          label="Sign Up >>>"
          link
          onClick={() => {
            navigate('/signup');
          }}
        />
    </>
  );
}

export default Signin;
