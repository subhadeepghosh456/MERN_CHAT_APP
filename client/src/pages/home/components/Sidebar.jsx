import React, { useState } from 'react'
import Search from './Search'
import UserList from './UserList';

const Sidebar = ({socket,onlineUsers}) => {
  const [searchKey,setSearchKey] = useState('');
  return (
    <div className='app-sidebar'>
      {/* <div className="main-content"></div> */}
      <Search searchKey={searchKey} setSearchKey={setSearchKey}/>
      <UserList socket={socket} onlineUsers={onlineUsers} searchKey={searchKey}/>
    </div>
  )
}

export default Sidebar