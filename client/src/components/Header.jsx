import { useState } from 'react';
import { TabMenu } from 'primereact/tabmenu';
import { AutoComplete } from 'primereact/autocomplete';
import { useNavigate } from 'react-router-dom';
import { useUserState } from '../state/state.js';
import { SEARCH_JOURNALS } from '../queries/journals';
import { useLazyQuery } from '@apollo/client';

function Header() {
  const navigate = useNavigate();
  const { loginState } = useUserState();
  const [searchValue, setSearchValue] = useState('');
  const [searchItems, setSearchItems] = useState([]);
  const [searchJournals] = useLazyQuery(SEARCH_JOURNALS, { fetchPolicy: 'network-only' });

  const search = (event) => {
    const getSuggestions = async() => {
      const {data} = await searchJournals({ variables: { keyword: event.query.trim() } });
      // console.log(data)
      return setSearchItems(data.searchJournals);
    }
    getSuggestions();
  };

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
      label: 'Home',
      icon: 'pi pi-fw pi-home',
      command: () => {
        navigate('/home');
      },
    },
    {
      label: 'Journals',
      icon: 'pi pi-fw pi-inbox',
      command: () => {
        navigate('/journalList');
      },
    },
    {
      label: 'Dashboard',
      icon: 'pi pi-fw pi-chart-bar',
      command: () => {
        navigate('/dashboard');
      },
    },
    {
      label: 'Graph',
      icon: 'pi pi-fw pi-share-alt',
      command: () => {
        navigate('/graph');
      },
    },
    {
      label: 'User',
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
          <TabMenu model={menuItems} />
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
