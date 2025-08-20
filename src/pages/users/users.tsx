import React from 'react';
import { Edit, Trash } from 'lucide-react';

const users = [

  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '1234567890',
    role: 'User',
  },
  // Add more users as needed...
];

export default function Users() {
  return (
    <>
      <div className="user_cont my-10">
        <a
          href="/addusers"
          className="w-fit bg-tracer-blue hover:bg-tracer-blue/90 text-white py-3 px-5 rounded font-medium uppercase transition duration-200 block"
        >
          Add user
        </a>
      </div>

      <div className="user_data_wrap">
        <div className="user_dataHead w-full px-5 py-4 rounded bg-gray-700 text-white flex gap-4">
          <div className="userData w-[20%] font-bold">First Name</div>
          <div className="userData w-[20%] font-bold">Last Name</div>
          <div className="userData w-[20%] font-bold">Email</div>
          <div className="userData w-[20%] font-bold">Phone Number</div>
          <div className="userData w-[20%] font-bold">Role</div>
        </div>
      </div>

      <div className="user_body w-full text-white mt-5">
        {users.map((user, index) => (
          <div
            key={index}
            className="UserDataRow group px-5 py-3 rounded flex gap-4 border border-gray-700 mt-4 hover:bg-gray-700 cursor-pointer relative"
          >
            <div className="userdata w-[20%]">{user.firstName}</div>
            <div className="userdata w-[20%]">{user.lastName}</div>
            <div className="userdata w-[20%]">{user.email}</div>
            <div className="userdata w-[20%]">{user.phone}</div>
            <div className="userdata w-[20%]">{user.role}</div>
            <div className="edit-delete-btn absolute right-5 hidden group-hover:block">
              <div className="edit_data flex gap-2 items-center">
                <a href="/edituser" className="hover:text-yellow-500">
                  <Edit />
                </a>
                <a href="javascript:void(0)" className="hover:text-red-500">
                  <Trash />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
