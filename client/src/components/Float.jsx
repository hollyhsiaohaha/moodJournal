import React, { useState } from 'react';
import Graph from './Graph';
import './Float.css'; // 引入CSS样式文件

function Float() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="floating-icon">
      <button onClick={toggleOpen} className="floating-icon-btn">Icon</button>
      {/* {isOpen && <div className="content">这里是展开的内容</div>} */}
      {isOpen && <div className="content"><Graph /></div>}
    </div>
  );
}

export default Float;
