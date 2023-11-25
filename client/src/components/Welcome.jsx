import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

function Welcome() {
  const navigate = useNavigate();

  return (
    <>
      <p>Welcome</p>
      <p>Sign in first</p>
      <div className="card flex justify-content-center">
        <Button
          label="Sign In or Sign Up >>>"
          link
          onClick={() => {
            navigate('/signin');
          }}
        />
      </div>
    </>
  );
}

export default Welcome;
