import { useState } from 'react';
import Graph from './Graph';
import { Button } from 'primereact/button';
import './Float.css';

function Float() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="floating-icon">
      <Button className="floating-icon-btn" icon="pi pi-share-alt" onClick={toggleOpen} />
      {isOpen && <div className="content"><Graph showFilter={false}/></div>}
    </div>
  );
}

export default Float;
