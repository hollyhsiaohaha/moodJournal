import { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { Get_JOURNALS_BY_USER } from '../queries/journals';
import { useMutation, useLazyQuery } from '@apollo/client';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
// TODO: Link
// TODO: Delete
// TODO: Filter

function JournalList() {
  const navigate = useNavigate();
  const [getJournalsByUser] = useLazyQuery(Get_JOURNALS_BY_USER);
  const [journals, setJournals] = useState([]);
  const [selectedJournals, setSelectedJournals] = useState(null);
  // const types = ['note, diary'];
  const types = useState(['note, diary']);
  const parseDate = (dateString) => {
    const date = new Date(Number(dateString));
    var dd_mm_yyyy = date.toLocaleDateString();
    var yyyy_mm_dd = dd_mm_yyyy.replace(/(\d+)\/(\d+)\/(\d+)/g, "$3-$1-$2");
    return(yyyy_mm_dd);
  }
  // const getSeverity = (type) => {
  //   switch (type) {
  //       case 'note':
  //           return 'success';
  //       case 'diary':
  //           return 'info';
  //   }
  // };
  // const typeRowFilterTemplate = (options) => {
  //   return (
  //       <Dropdown value={options.value} options={types} onChange={(e) => options.filterApplyCallback(e.value)} itemTemplate={typeItemTemplate} placeholder="Select One" className="p-column-filter" showClear style={{ minWidth: '12rem' }} />
  //   );
  // };
  // const typeItemTemplate = (option) => {
  //   return <Tag value={option} severity={getSeverity(option)} />;
  // };

// TODO: 啥時要更新？ 怎知道有沒有新 journal
  useEffect(() => {
    const getJournals = async () => {
      const { data } = await getJournalsByUser();
      if (!data) return alert('資料讀取失敗');
      const journalData = data.getJournalsbyUserId;
      const parsedJournalData = journalData.map((journal) => {
        return {
          ...journal,
          contentPreview: `${journal.content.slice(0, 30)}${journal.content.length > 30? '...' : ''}`,
          parsedCreatedAt: parseDate(journal.createdAt),
          parsedUpdatedAt: parseDate(journal.updatedAt),
        }
      })
      setJournals(parsedJournalData);
    };
    getJournals();
  }, []);
  return (
    <>
      <div className="card">
        <DataTable
          value={journals}
          sortField="updatedAt"
          sortOrder={-1}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10]}
          tableStyle={{ minWidth: '50rem' }}
          selectionMode='checkbox'
          selection={selectedJournals}
          onSelectionChange={(e) => setSelectedJournals(e.value)}
          dataKey="_id"
          emptyMessage="No journals found."
        >
          {/* <Column field="_id" header="Id"></Column> */}
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
          <Column field="title" filter sortable header="名稱"></Column>
          {/* <Column field="type" showFilterMenu={false} filter filterElement={typeRowFilterTemplate} body={typeItemTemplate} sortable header="類型"></Column> */}
          <Column field="type" showFilterMenu={false} sortable header="類型"></Column>
          <Column field="parsedCreatedAt" sortable header="建立時間"></Column>
          <Column field="parsedUpdatedAt" sortable header="更新時間"></Column>
          <Column field="contentPreview" sortable header="內容"></Column>
        </DataTable>
      </div>
      <Button
        label="New Journal"
        icon="pi pi-fw pi-plus"
        iconPos="right"
        onClick={() => {
          navigate('/newJournal');
        }}
      />
    </>
  );
}

export default JournalList;
