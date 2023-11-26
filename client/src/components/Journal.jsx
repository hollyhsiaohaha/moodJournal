import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

function Journal() {
  const navigate = useNavigate();

  return (
    <>
      <p>Journal tables</p>
      <Button
          label='New Journal'
          icon= 'pi pi-fw pi-plus'
          iconPos='right'
          onClick={() => { navigate('/newJournal')}}
        />
    </>
  );
}

export default Journal;
