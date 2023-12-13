import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Get_JOURNALS_BY_USER } from '../queries/journals';
import { DELETE_JOURNALS } from '../mutations/journals';
import { useMutation, useLazyQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { toast } from 'react-toastify';

function JournalList() {
  const initFilters = {
    title: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    type: {
      operator: FilterOperator.OR,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
    parsedCreatedAt: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
    },
    parsedUpdatedAt: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
    },
  };
  const navigate = useNavigate();
  const [getJournalsByUser] = useLazyQuery(Get_JOURNALS_BY_USER, { fetchPolicy: 'network-only' });
  const [deleteJournals] = useMutation(DELETE_JOURNALS);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [journals, setJournals] = useState([]);
  const [deleteButtonVisiual, setDeleteButtonVisiual] = useState(false);
  const [selectedJournals, setSelectedJournals] = useState([]);
  const [types] = useState(['note', 'diary']);
  const [filters, setFilters] = useState(initFilters);

  const getJournals = async () => {
    const { data } = await getJournalsByUser();
    if (!data) return toast.error('資料讀取失敗');
    const journalData = data.getJournalsbyUserId;
    const parsedJournalData = journalData.map((journal) => {
      return {
        ...journal,
        contentPreview: `${journal.content.slice(0, 20)}${
          journal.content.length > 20 ? '...' : ''
        }`,
        parsedCreatedAt: new Date(Number(journal.createdAt)),
        parsedUpdatedAt: new Date(Number(journal.updatedAt)),
      };
    });
    setJournals(parsedJournalData);
  };

  useEffect(() => {
    getJournals();
    setFilters(initFilters);
  }, [refreshFlag]);

  const dateParser = (myDate) => {
    const offset = myDate.getTimezoneOffset();
    myDate = new Date(myDate.getTime() - offset * 60 * 1000);
    return myDate.toISOString().split('T')[0];
  };

  const getSeverity = (type) => {
    switch (type) {
      case 'diary':
        return 'info';
      case 'note':
        return 'success';
    }
  };

  const titleBodyTemplate = (journal) => {
    return <Link to={`/journal/${journal._id}`}>{journal.title}</Link>;
  };
  const typeBodyTemplate = (journal) => {
    return <Tag value={journal.type} severity={getSeverity(journal.type)}></Tag>;
  };
  const typeItemTemplate = (option) => {
    return <Tag value={option} severity={getSeverity(option)}></Tag>;
  };
  const typeRowFilterTemplate = (options) => {
    return (
      <Dropdown
        showClear
        value={options.value}
        options={types}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        itemTemplate={typeItemTemplate}
        placeholder="type"
        className="p-column-filter"
      />
    );
  };

  const createdDateBodyTemplate = (rowData) => {
    return dateParser(rowData.parsedCreatedAt);
  };
  const updatedDateBodyTemplate = (rowData) => {
    return dateParser(rowData.parsedUpdatedAt);
  };

  const createdDateFilterTemplate = (options) => {
    return (
      <Calendar
        value={options.value}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        dateFormat="yy-mm-dd"
        placeholder="yy-mm-dd"
        mask="9999-99-99"
      />
    );
  };

  const updatedDateFilterTemplate = (options) => {
    return (
      <Calendar
        value={options.value}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        dateFormat="yy-mm-dd"
        placeholder="yy-mm-dd"
        mask="9999-99-99"
      />
    );
  };

  const deleteSelected = async () => {
    const selectedIds = selectedJournals.map((journal) => journal._id);
    const { data } = await deleteJournals({ variables: { ids: selectedIds } });
    console.log(data);
    const deleteRes = data.deleteJournals;
    const failList = [];
    for (let i = 0; i < deleteRes.length; i++) {
      if (!deleteRes[i]) {
        failList.push(selectedJournals[i].title);
      }
    }
    failList.length
      ? toast.error(`以下筆記刪除失敗： ${failList.join(',')}`)
      : toast.success('刪除成功');
    setSelectedJournals([]);
    setRefreshFlag(refreshFlag + 1);
  };

  const confirm = (event) => {
    confirmPopup({
      target: event.currentTarget,
      message: '確定要刪除所選筆記？',
      icon: 'pi pi-info-circle',
      acceptClassName: 'p-button-danger',
      accept: deleteSelected,
      reject: () => toast.warn('取消'),
    });
  };

  useEffect(() => {
    setDeleteButtonVisiual(selectedJournals.length ? true : false);
  }, [selectedJournals]);

  return (
    <>
      <ConfirmPopup />
      <Button
        label="刪除選取"
        severity="danger"
        icon="pi pi-times"
        onClick={confirm}
        visible={deleteButtonVisiual}
      />
      <div className="card">
        <DataTable
          value={journals}
          sortField="updatedAt"
          sortOrder={-1}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10]}
          selectionMode="checkbox"
          selection={selectedJournals}
          onSelectionChange={(e) => setSelectedJournals(e.value)}
          dataKey="_id"
          filters={filters}
          emptyMessage="沒有任何筆記"
        >
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
          <Column
            field="title"
            filterField="title"
            filter
            filterPlaceholder="title"
            sortable
            body={titleBodyTemplate}
            header="名稱"
          ></Column>
          <Column
            field="type"
            filter
            filterElement={typeRowFilterTemplate}
            sortable
            body={typeBodyTemplate}
            header="類型"
          ></Column>
          <Column
            field="parsedCreatedAt"
            filterField="parsedCreatedAt"
            dataType="date"
            body={createdDateBodyTemplate}
            filter
            filterElement={createdDateFilterTemplate}
            sortable
            header="建立時間"
          ></Column>
          <Column
            field="parsedUpdatedAt"
            filterField="parsedUpdatedAt"
            dataType="date"
            body={updatedDateBodyTemplate}
            filter
            filterElement={updatedDateFilterTemplate}
            sortable
            header="更新時間"
          ></Column>
          <Column field="contentPreview" sortable header="內容"></Column>
        </DataTable>
      </div>
      <Button
        label="新增筆記"
        icon="pi pi-fw pi-plus"
        iconPos="right"
        onClick={() => {
          navigate(`/newJournal/${dateParser(new Date())}`);
        }}
      />
    </>
  );
}

export default JournalList;
