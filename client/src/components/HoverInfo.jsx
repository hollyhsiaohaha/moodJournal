import { useState } from 'react';

function Info({ message }) {
  return (
    <div>
      <p>{message}</p>
    </div>
  );
}

const HoverInfo = ({ message }) => {
  const [isHovering, setIsHovering] = useState(false);
  const handleMouseOver = () => setIsHovering(true);
  const handleMouseOut = () => setIsHovering(false);

  return (
    <div>
      <div>
        <i
          className="pi pi-info-circle"
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        ></i>
        {/* <p style={{color: isHovering ? 'blue' : 'black'}}>{message}</p> */}
        {isHovering && <Info message={message} />}
      </div>
    </div>
  );
};

export default HoverInfo;
