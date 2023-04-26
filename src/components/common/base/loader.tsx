import React from 'react';
import './loader.less';

const Loader = ({ spinning = true }: any) => (
  <div className="loading-screen">
    <img
      alt="loading"
      src={typeof spinning === 'string' ? spinning : '/loading-ico1.gif'}
      width="100px"
    />
  </div>
);

export default Loader;
