import { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { useMutation } from '@apollo/client';
import { SIGN_IN } from '../mutations/users.js';
import Cookies from 'js-cookie';

function Signin() {
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [signIn] = useMutation(SIGN_IN);

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
      const anHour = 1/24;
      Cookies.set('JWT_TOKEN', token, {expires: anHour});
    } catch (error) {
      error.message === 'incorrect email or password'
      ? alert(error.message)
      : console.error(error);
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
    </>
  );
}

export default Signin;
