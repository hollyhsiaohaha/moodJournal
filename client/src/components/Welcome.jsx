import { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Image } from 'primereact/image';
import { useNavigate } from 'react-router-dom';
import angryFace from '../assets/angry.png';
import whatFace from '../assets/what.png';
import happyFace from '../assets/happy.png';
import reactSvg from '../assets/react.svg';
import journalBook from '../assets/journal.png';
import Cookies from 'js-cookie';

function Welcome() {
  const navigate = useNavigate();
  const [currentPersonImage, setCurrentPersonImage] = useState(angryFace);
  const [currentIconImage, setCurrentIconImage] = useState(null);

  useEffect(() => {
    const token = Cookies.get('JWT_TOKEN');
    token ? navigate('/home') : null;
  }, []);

  return (
    <>
      <div className="card flex justify-content-between">
        <Image
          src={currentPersonImage}
          alt="Image"
          height="500"
          onMouseEnter={() => {
            setCurrentPersonImage(happyFace);
            setCurrentIconImage(journalBook);
          }}
          onMouseLeave={() => {
            setCurrentPersonImage(angryFace);
            setCurrentIconImage(null);
          }}
        />
        <Image src={currentIconImage} alt="Image" width="300" />
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
