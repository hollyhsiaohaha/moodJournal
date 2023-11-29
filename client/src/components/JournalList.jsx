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

function JournalList() {
  const navigate = useNavigate();
  const [getJournalsByUser] = useLazyQuery(Get_JOURNALS_BY_USER, { fetchPolicy: 'network-only' });
  const [deleteJournals] = useMutation(DELETE_JOURNALS);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [journals, setJournals] = useState([]);
  const [deleteButtonVisiual, setDeleteButtonVisiual] = useState(false);
  const [selectedJournals, setSelectedJournals] = useState([]);
  const [types] = useState(['note', 'diary']);
  const [filters, setFilters] = useState({
    title: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    type: { value: null, matchMode: FilterMatchMode.EQUALS },
    parsedCreatedAt: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
    },
    parsedUpdatedAt: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
    },
  });

  const formatDate = (value) => {
    const dd_mm_yyyy = value.toLocaleDateString();
    const yyyy_mm_dd = dd_mm_yyyy.replace(/(\d+)\/(\d+)\/(\d+)/g, '$3-$1-$2');
    return yyyy_mm_dd;
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
  const typeRowFilterTemplate = (option) => {
    return (
      <Dropdown
        showClear
        value={option.value}
        options={types}
        onChange={(e) => option.filterApplyCallback(e.value)}
        itemTemplate={typeItemTemplate}
        placeholder="Select One"
        className="p-column-filter"
        style={{ minWidth: '12rem' }}
      />
    );
  };

  const createdDateBodyTemplate = (rowData) => {
    return formatDate(rowData.parsedCreatedAt);
  };
  const updatedDateBodyTemplate = (rowData) => {
    return formatDate(rowData.parsedUpdatedAt);
  };

  // TODO: 日期篩選只能用 Date is 的
  const createdDateFilterTemplate = (options) => {
    return (
      <Calendar
        value={options.value}
        onChange={(e) => {
          // console.log(options)
          let createdFilters = { ...filters };
          createdFilters.parsedCreatedAt.constraints[options.index].value = e.value;
          // updatedFilters.parsedCreatedAt.constraints[options.index].matchMode = options.filterModel.matchMode;
          // updatedFilters.parsedCreatedAt = options.filterModel;
          setFilters(createdFilters);
          options.filterCallback(e.value, options.index);
        }}
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
        onChange={(e) => {
          let updatedFilters = { ...filters };
          updatedFilters.parsedUpdatedAt.constraints[options.index].value = e.value;
          setFilters(updatedFilters);
          options.filterCallback(e.value, options.index);
        }}
        dateFormat="yy-mm-dd"
        placeholder="yy-mm-dd"
        mask="9999-99-99"
      />
    );
  };

  const deleteSelected = async () => {
    const selectedIds = selectedJournals.map((journal) => journal._id);
    const { data } = await deleteJournals({ variables: { ids: selectedIds } });
    console.log(data)
    const deleteRes = data.deleteJournals;
    const failList = [];
    for (let i = 0; i < deleteRes.length; i++) {
      if (!deleteRes[i]) {
        failList.push(selectedJournals[i].title);
      }
    }
    failList.length ? alert (`以下筆記刪除失敗： ${failList.join(',')}`) : alert('刪除成功');
    setSelectedJournals([]);
    setRefreshFlag(refreshFlag + 1);
  };

  useEffect(() => {
    const getJournals = async () => {
      const { data } = await getJournalsByUser();
      if (!data) return alert('資料讀取失敗');
      const journalData = data.getJournalsbyUserId;
      const parsedJournalData = journalData.map((journal) => {
        return {
          ...journal,
          contentPreview: `${journal.content.slice(0, 30)}${
            journal.content.length > 30 ? '...' : ''
          }`,
          parsedCreatedAt: new Date(Number(journal.createdAt)),
          parsedUpdatedAt: new Date(Number(journal.updatedAt)),
        };
      });
      setJournals(parsedJournalData);
    };
    getJournals();
  }, [refreshFlag]);

  useEffect(() => {
    setDeleteButtonVisiual(selectedJournals.length ? true : false);
  }, [selectedJournals]);

  return (
    <>
      <Button
        label="Delete"
        severity="danger"
        icon="pi pi-times"
        onClick={deleteSelected}
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
          tableStyle={{ minWidth: '50rem' }}
          selectionMode="checkbox"
          selection={selectedJournals}
          onSelectionChange={(e) => {
            setSelectedJournals(e.value);
          }}
          dataKey="_id"
          filters={filters}
          filterDisplay="row"
          emptyMessage="沒有任何筆記"
        >
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
          <Column
            field="title"
            filterField="title"
            filter
            sortable
            body={titleBodyTemplate}
            header="名稱"
          ></Column>
          <Column
            field="type"
            style={{ width: '5%' }}
            showFilterMenu={false}
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
