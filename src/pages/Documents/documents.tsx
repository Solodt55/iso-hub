import React from 'react';
import { Edit, Trash } from 'lucide-react';

const document = [

  {
    Title: 'Project Plan',
    Category: 'Planning',
    Description: 'Lorem Ipsum is simply dummy text of the printing... ',
    Date: '03/05/2025',
  },
  // Add more users as needed...
];

export default function Documents() {
  return (
    <>
      {/* <div className="user_cont my-10">
        <a
          href="/addusers"
          className="w-fit bg-tracer-blue hover:bg-tracer-blue/90 text-white py-3 px-5 rounded font-medium uppercase transition duration-200 block"
        >
          Add Document
        </a>
      </div> */}

      <div className="user_data_wrap">
        <div className="user_dataHead w-full px-5 py-4 rounded bg-gray-700 text-white flex gap-4">
          <div className="userData w-[20%] font-bold">Document Title</div>
          <div className="userData w-[20%] font-bold">Category</div>
          <div className="userData w-[40%] font-bold">Description</div>
          <div className="userData w-[20%] font-bold">Date Uploaded</div>
        </div>
      </div>

      <div className="user_body w-full text-white mt-5">
        {document.map((document, index) => (
          <div
            key={index}
            className="UserDataRow group px-5 py-3 rounded flex gap-4 border border-gray-700 mt-4 hover:bg-gray-700 cursor-pointer relative"
          >
            <div className="userdata w-[20%]">{document.Title}</div>
            <div className="userdata w-[20%]">{document.Category}</div>
            <div className="userdata w-[40%]">{document.Description}</div>
            <div className="userdata w-[20%]">{document.Date}</div>

            <div className="edit-delete-btn absolute right-5 hidden group-hover:block">
              <div className="edit_data flex gap-2 items-center">
                {/* <a href="/edituser" className="hover:text-tracer-green">
                  <Edit />
                </a> */}
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
