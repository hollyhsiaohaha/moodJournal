import { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { DataView } from 'primereact/dataview';
import { Tag } from 'primereact/tag';
import { GET_BACKLINK } from '../queries/journals';
import { useLazyQuery } from '@apollo/client';
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";

function Backlink({ journalId }) {
  const [getBackLink] = useLazyQuery(GET_BACKLINK);
  const [backlinks, setBacklinks] = useState([]);

  const getSeverity = (journal) => {
    switch (journal.type) {
        case 'diary':
            return 'info';
        case 'note':
            return 'success';
    }
  };

  useEffect(() => {
    const getBackLinkInfo = async () => {
      const { data } = await getBackLink({ variables: { id: journalId } });
      if (data) setBacklinks(data.getBackLinkedJournals);
    };
    getBackLinkInfo();
  }, []);

  //  TODO: 連結是壞的 QQQQ
  const itemTemplate = (journal) => {
    return (
      <div className="col-12">
          <div className="flex flex-column p-2 gap-2">
              <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
                  <div className="flex flex-column align-items-center sm:align-items-start gap-3">
                      <Link to={`/journal/${journal._id}`}>{journal.title}</Link>
                      <div className="flex align-items-center gap-3">
                          <Tag value={journal.type} severity={getSeverity(journal)}></Tag>
                      </div>
                  </div>
                  <span className="text-xs">{journal.content}</span>
              </div>
          </div>
      </div>
    );
  };

  return (
    <>
      <h3>反向連結</h3>
      <div className="card">
        <DataView value={backlinks} paginator rows={5} itemTemplate={itemTemplate} emptyMessage='此筆記尚無反向連結' />
      </div>
    </>
  );
}

Backlink.propTypes = {
  journalId: PropTypes.string,
};

export default Backlink;
