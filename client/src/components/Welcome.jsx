import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Image } from 'primereact/image';
import { useNavigate } from 'react-router-dom';
import happyFace from '../assets/happy.png';
import curiousFace from '../assets/curious.png';
import approveFace from '../assets/approve.png';
import journalBook from '../assets/journal.png';
import maskedJournalBook from '../assets/journalMask.png';
import Cookies from 'js-cookie';
import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import { PARTICLES_OPTION } from '../utils/particles.js';
function Welcome() {
  const navigate = useNavigate();
  const [currentPersonImage, setCurrentPersonImage] = useState(curiousFace);
  const [currentIconImage, setCurrentIconImage] = useState(maskedJournalBook);

  useEffect(() => {
    const token = Cookies.get('JWT_TOKEN');
    token ? navigate('/home') : null;
  }, []);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    await console.log(container);
  }, []);

  return (
    <>
      <Particles
        id="tsparticles"
        init={particlesInit}
        particlesLoaded={particlesLoaded}
        options={PARTICLES_OPTION}
      />
      <div className='mx-8'>
        <div className="card flex justify-content-between">
          <Image className='mx-8' src={currentPersonImage} alt="Image" height="500" />
          <Image className='mx-8' src={currentIconImage} alt="Image" width="300" />
        </div>
      </div>
      <div className="card flex justify-content-center">
        <Button
          label="開始使用"
          size="large"
          onClick={() => navigate('/signin')}
          onMouseEnter={() => {
            setCurrentPersonImage(approveFace);
            setCurrentIconImage(journalBook);
          }}
          onMouseLeave={() => {
            setCurrentPersonImage(curiousFace);
            setCurrentIconImage(maskedJournalBook);
          }}
        />
      </div>
    </>
  );
}

export default Welcome;
