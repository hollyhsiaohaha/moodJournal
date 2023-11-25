import { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { useMutation } from '@apollo/client';
import { SIGN_UP } from '../mutations/users.js';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';


function Signup() {
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [signUp] = useMutation(SIGN_UP);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
  };

  const submit = async () => {
    setLoading(true);
    try {
      if (!validateEmail(userEmail)) {
        setLoading(false);
        return alert('Email 不符合格式');
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
      Cookies.set('JWT_TOKEN', token, { expires: 1 }); // day
      navigate('/profile');
      alert('成功登入');
    } catch (error) {
      error.message === 'email exist' ? alert('Email 已被註冊') : console.error(error);
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
      <Button label="Sign Up" loading={loading} onClick={submit} />
      <br/>
      <Button
          label="Sign In >>>"
          link
          onClick={() => {
            navigate('/signin');
          }}
        />
    </>
  );
}

export default Signup;
