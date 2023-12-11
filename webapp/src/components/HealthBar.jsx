import React from 'react';

const HealthBar = ({ count, max, lowThresh, highThresh, uom, label }) => {
  const getHealthColor = (count) => {
    if (count <= lowThresh) {
      return 'red';
    } else if (count < highThresh) {
      return 'orange';
    } else {
      return 'green';
    }
  };

  const healthStyle = {
    width: `${((count/max)) * 100}%`,
    height: '20px',
    backgroundColor: getHealthColor(count),
    borderRadius: '0px',
    transition: 'width 0.3s ease-in-out',
    position: 'relative',
    border: '1px solid black',
    margin: '10px 0',
  };

  const backgroundStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
    opacity: 0.3,
    borderRadius: '0px',
    zIndex: -1,
  };

  const textStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'white',
    zIndex: 1,
  };

  const labelStyle = {
    marginRight: '8px', // Adjust this value as needed
    marginLeft: '8px', // Adjust this value as needed
    fontWeight: 'bold',
  };

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={containerStyle}>
        <div style={labelStyle}>{label}</div>
        <div style={healthStyle}>
          <div style={backgroundStyle}></div>
          <div style={textStyle}>{count.toString()+" "+uom}</div>
        </div>
      </div>
    </div>
  );
};

export default HealthBar;