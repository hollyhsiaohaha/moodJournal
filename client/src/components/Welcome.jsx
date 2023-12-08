import { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Image } from 'primereact/image';
import { useNavigate } from 'react-router-dom';
import angryFace from '../assets/angry.png'
import whatFace from '../assets/what.png'
import reactSvg from '../assets/react.svg'
import Cookies from 'js-cookie';

function Welcome() {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(angryFace);

  useEffect(() => {
    const token = Cookies.get('JWT_TOKEN');
    token ? navigate('/home') : null;
  }, []);

  return (
    <>
      <h1>Mood Journal</h1>
      <div className="card flex justify-content-between">
        <Image 
          src={currentImage} 
          alt="Image" 
          height="500"
          onMouseEnter={() => setCurrentImage(whatFace)}
          onMouseLeave={() => setCurrentImage(angryFace)} 
        />
        <Image src={reactSvg} alt="Image" width="300" />
      </div>
      <div className="card flex justify-content-center">
        <Button
          label="登入或註冊 >>>"
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
