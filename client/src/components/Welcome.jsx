import { useEffect } from 'react';
import { Button } from 'primereact/button';
import { Image } from 'primereact/image';
import { useNavigate } from 'react-router-dom';
import happyFace from '../assets/happy.png';
import journalBook from '../assets/journal.png';
import Cookies from 'js-cookie';
import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import { PARTICLES_OPTION } from '../utils/particles.js';
function Welcome() {
  const navigate = useNavigate();

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
      <div className="card flex justify-content-center" style={{ zIndex: 1 }}>
        <Image src={happyFace} alt="Image" height="500" />
        <Image src={journalBook} alt="Image" width="300" />
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
