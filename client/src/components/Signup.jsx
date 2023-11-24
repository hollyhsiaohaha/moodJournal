import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';

function Signup() {
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => {
      setLoading(true);

      setTimeout(() => {
          setLoading(false);
      }, 2000);
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
          <InputText id="userEmail" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
          <label htmlFor="userEmail">Email</label>
        </span>
      </div>
      <div className="card flex justify-content-center">
        <span className="p-float-label">
            <Password inputId="password" value={password} feedback={false} toggleMask onChange={(e) => setPassword(e.target.value)} />
            <label htmlFor="password">Password</label>
        </span>
      </div>
      <Button label="Sign Up" loading={loading} onClick={load}/>
    </>
  )
}

export default Signup;
