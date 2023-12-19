import { useEffect, useState } from 'react';
import Graph from './Graph';
import JournalGraph from './JournalGraph';
import { useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';
import './Float.css';

function Float() {
  const [isOpen, setIsOpen] = useState(false);
  const [showFloat, setShowFloat] = useState(false);
  const [journalID, setjournalID] = useState(null);
  const location = useLocation();
  const { pathname } = location;

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const noShowFloatPath = ['/', '/signin', '/signup'];
    noShowFloatPath.includes(pathname) ? setShowFloat(false) : setShowFloat(true);
    if (pathname.includes('/journal/')) return setjournalID(pathname.split('/')[2]);
    setjournalID(null);
  }, [pathname]);

  return (
    <>
      {showFloat && (
        <div className="floating-icon">
          <Button className="floating-icon-btn" icon="pi pi-external-link" onClick={toggleOpen} />
          {isOpen && !journalID && (
            <div className="content">
              <Graph showFilter={false} />
            </div>
          )}
          {isOpen && journalID && (
            <div className="content">
              <JournalGraph showFilter={false} journalId={journalID} />
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Float;
