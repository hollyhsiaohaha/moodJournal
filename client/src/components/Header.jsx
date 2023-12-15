import { useState, useEffect } from 'react';
import { TabMenu } from 'primereact/tabmenu';
import { AutoComplete } from 'primereact/autocomplete';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserState } from '../state/state.js';
import { SEARCH_JOURNALS } from '../queries/journals';
import { useLazyQuery } from '@apollo/client';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginState } = useUserState();
  const [searchValue, setSearchValue] = useState('');
  const [searchItems, setSearchItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchJournals] = useLazyQuery(SEARCH_JOURNALS, { fetchPolicy: 'network-only' });

  const search = (event) => {
    const getSuggestions = async() => {
      const {data} = await searchJournals({ variables: { keyword: event.query.trim() } });
      return setSearchItems(data.searchJournals);
    }
    getSuggestions();
  };

  const getActiveIndex = () => {
    switch(location.pathname) {
      case '/home':
        return 0;
      case '/journalList':
        return 1;
      case '/dashboard':
        return 2;
      case '/graph':
        return 3;
      case '/profile':
        return 4;
      default:
        return -1;
    }
  }

  useEffect(() => {
    console.log('current path', location.pathname)
    console.log('getActiveIndex', getActiveIndex(location.pathname))
    setActiveIndex(getActiveIndex(location.pathname));
  }, [location.pathname]);

  const select = (event) => {
    setSearchValue('');
    if (event.value) return navigate(`/journal/${event.value._id}`);
  };

  const suggestionItemTemplate = (journal) => {
    return (
      <>
        <span className="text-s">{journal.title}</span>
        <div className="flex align-items-center">
          <span className="text-xs">{journal.content}</span>
        </div>
      </>
    );
  };

  const menuItems = [
    {
      label: '主頁',
      icon: 'pi pi-fw pi-home',
      command: () => {
        navigate('/home');
      },
    },
    {
      label: '筆記',
      icon: 'pi pi-fw pi-inbox',
      command: () => {
        navigate('/journalList');
      },
    },
    {
      label: '儀表板',
      icon: 'pi pi-fw pi-chart-bar',
      command: () => {
        navigate('/dashboard');
      },
    },
    {
      label: '力導向圖',
      icon: 'pi pi-fw pi-share-alt',
      command: () => {
        navigate('/graph');
      },
    },
    {
      label: '使用者',
      icon: 'pi pi-fw pi-user',
      command: () => {
        navigate('/profile');
      },
    },
  ];

  return (
    <>
      {loginState ? (
        <div className="card flex justify-content-between">
          <TabMenu model={menuItems} activeIndex={activeIndex} key={activeIndex}/>
          <AutoComplete
            className="p-inputtext-sm"
            placeholder="search"
            value={searchValue}
            suggestions={searchItems}
            completeMethod={search}
            onSelect={select}
            onChange={(e) => setSearchValue(e.value)}
            itemTemplate={suggestionItemTemplate}
            loadingIcon="pi pi-spin pi-spinner"
          />
        </div>
      ) : null}
    </>
  );
}

export default Header;
