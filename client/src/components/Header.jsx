import { TabMenu } from 'primereact/tabmenu';
import { useNavigate } from 'react-router-dom';

// TODO: 配上正確的路徑
function Header() {
  const navigate = useNavigate();
  const items = [
    {
      label: 'Home',
      icon: 'pi pi-fw pi-home',
      command: () => {
        navigate('/');
      },
    },
    {
      label: 'Journals',
      icon: 'pi pi-fw pi-inbox',
      command: () => {
        navigate('/');
      },
    },
    {
      label: 'Graph',
      icon: 'pi pi-fw pi-share-alt',
      command: () => {
        navigate('/');
      },
    },
    {
      label: 'Dashboard',
      icon: 'pi pi-fw pi-chart-bar',
      command: () => {
        navigate('/');
      },
    },
    {
      label: 'User',
      icon: 'pi pi-fw pi-user',
      command: () => {
        navigate('/');
      },
    },
  ];

  return (
    <div className="card">
      <TabMenu model={items} />
    </div>
  );
}

export default Header;
