import React, { useState, useEffect } from "react";
import { Edit, Download, Trash2, Megaphone, X, Loader2 } from "lucide-react";


export default function Marketing() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [items, setItems] = useState([{ title: "", description: "" }]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditCatModal, setShowCatEditModal] = useState(false);

  const [editItemData, setEditItemData] = useState({ id: null, title: "", description: "" });
  const [editCategoryData, setEditCategoryData] = useState({ id: null, name: "" });
  const [user, setUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRep, setSelectedRep] = useState(null);
  const [deleteType, setDeleteType] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);


  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("auth_token");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const value = localStorage.getItem("auth_user");
      const parsedUser = value ? JSON.parse(value) : null;
      setUser(parsedUser);

      let body = undefined;

      // Add user_id to body only if role is NOT 1 or 2
      if (parsedUser && parsedUser.role_id !== 1 && parsedUser.role_id !== 2) {
        body = JSON.stringify({ user_id: parsedUser.id });
      }

      const response = await fetch(`${API_BASE_URL}/marketing/lists`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: body,
      });

      const result = await response.json();

      if (response.ok && result.status === "success" && Array.isArray(result.data)) {
        setCategories(result.data);
      } else {
        throw new Error(result.message || "Unexpected response format");
      }
    } catch (error) {
      console.error("Error fetching categories:", error.message);
      alert("Failed to fetch categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const response = await fetch(`${API_BASE_URL}/marketing/create-category`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name: newCategoryName.trim(), user_id: user?.id }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setShowModal(false);
        setNewCategoryName("");
        fetchCategories();
      } else {
        throw new Error(data.message || "Failed to add category.");
      }
    } catch (error) {
      console.error("Error adding category:", error.message);
      alert("Failed to add category. Please try again.");
    }
  };

  const handleEditItemClick = async (itemId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/marketing/get-item-details/${itemId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setEditItemData({
          id: itemId,
          title: data.data.title, // assuming response format { data: { title: "..." } }
          description: data.data.description
        });
        setShowEditModal(false);
      } else {
        throw new Error(data.message || "Item not found.");
      }
    } catch (error) {
      console.error("Error fetching item details:", error.message);
      alert("Could not fetch item details.");
    }
  };

  const handleEditCatClick = async (itemId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/marketing/get-category-details/${itemId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setEditCategoryData({
          id: itemId,
          name: data.data.name, // assuming response format { data: { title: "..." } }
        });
        setShowCatEditModal(false);
      } else {
        throw new Error(data.message || "Item not found.");
      }
    } catch (error) {
      console.error("Error fetching item details:", error.message);
      alert("Could not fetch item details.");
    }
  };


  const handleAddItemsToCategory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/marketing/create-item`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          category_id: selectedCategoryId,
          // items: items.filter((item) => item.title.trim() !== ""),
          items: items.filter((item) => item.title !== "").map((item) => ({
            title: item.title,
            description: item.description,
          })),

        }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setShowItemModal(false);
        setItems([{ title: "", description: "" }]);

        fetchCategories();
      } else {
        throw new Error(data.message || "Failed to add items.");
      }
    } catch (error) {
      console.error("Error adding items:", error.message);
      alert("Failed to add items. Please try again.");
    }
  };

  const handleUpdateItem = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/marketing/update-item`, {
        method: "POST", // or POST depending on your API
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          title: editItemData.title,
          id: editItemData.id,
          description: editItemData.description
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setShowEditModal(false);
        fetchCategories(); // refresh list
      } else {
        throw new Error(data.message || "Update failed.");
      }
    } catch (error) {
      console.error("Error updating item:", error.message);
      alert("Failed to update item.");
    }
  };

  const handleUpdateCat = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/marketing/update-category`, {
        method: "POST", // or POST depending on your API
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          id: editCategoryData.id,
          name: editCategoryData.name
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setShowCatEditModal(false);
        fetchCategories(); // refresh list
      } else {
        throw new Error(data.message || "Update failed.");
      }
    } catch (error) {
      console.error("Error updating item:", error.message);
      alert("Failed to update category.");
    }
  };

  const confirmAndDeleteItem = (item, title) => {
    setSelectedRep({ id: item, name: title });
    setDeleteType("item");
    setShowDeleteModal(false);
  };

  const confirmAndDeleteCat = (catId, catName) => {
    setSelectedRep({ id: catId, name: catName });
    setDeleteType("category");
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="relative">
        {/* Blur overlay and Coming Soon watermark - fixed to main content area only */}
        <div className="fixed top-16 left-[16rem] w-[calc(100vw-16rem)] h-full bg-black/10 backdrop-blur-[2px] z-50 flex items-center justify-center pointer-events-none">
          <div className="text-4xl font-bold text-tracer-green transform -rotate-12">
            Coming Soon
          </div>
        </div>

        {/* Header */}
        <div className="mb-8 bg-tracer-green rounded-lg p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <Megaphone className="h-10 w-10 text-black" />
            <div>
              <h1 className="text-3xl font-bold text-black">Marketing</h1>
              <p className="text-black/80 mt-1">
                Access and customize your marketing materials below:
              </p>
            </div>
          </div>
        </div>

        {/* Add Category Button */}
        <div>
           {/* onClick={() => setShowModal(true)} make true if working */}
          <button
            onClick={() => setShowModal(false)}
            className="w-fit bg-tracer-green rounded py-2 px-5 font-semibold uppercase flex items-center justify-center hover:bg-tracer-green/90 gap-2 text-white"
          >
            Add New Category
          </button>
        </div>

        {loading ? (
          <p className="text-white mt-4 text-center text-sm">Loading...</p>
        ) : categories.length === 0 ? (
          <div className="flex justify-center items-center mt-8">
            <p className="text-white text-center text-sm">No marketing categories found.</p>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="markiting-wrap mt-8">
              <div className="marketing-heading flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-white text-base font-semibold">{category.name}</h3>
                  <button
                    onClick={() => confirmAndDeleteCat(category.id, category.name)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleEditCatClick(category.id)}
                    className="text-white hover:text-gray-300"
                  >
                    <Edit className="w-4 h-4" />
                  </button>


                </div>
                <button
                  onClick={() => {
                    setSelectedCategoryId(category.id);
                    setItems([{ title: "", description: "" }]);
                    setShowItemModal(false);
                  }}
                  className="w-fit bg-tracer-green rounded py-1 px-3 text-xs font-semibold uppercase flex items-center justify-center hover:bg-tracer-green/90 gap-1 text-white"
                >
                  Add item
                </button>
              </div>
              {category.items.map((item, index) => (
                <div key={index} className="markiting-list-wrap">
                  <div className="markiting-list group px-4 py-3 rounded border border-gray-700 mt-3 bg-gray-700 cursor-pointer relative text-white">
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {item.description}
                    </p>
                    <div className="edit-delete-btn absolute right-4 top-3 hidden group-hover:block">
                      <div className="edit_data flex gap-2 items-center">
                        <button onClick={() => handleEditItemClick(item.id)} className="hover:text-yellow-500">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => confirmAndDeleteItem(item.id, item.title)} className="hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {/* <a href="#" className="hover:text-yellow-500">
                          <Download className="w-4 h-4" />
                        </a> */}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Add Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Add Marketing Category</h2>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="bg-tracer-green px-4 py-2 rounded text-white hover:bg-tracer-green/90"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Items Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Add Items to Category</h2>

            {items.map((item, index) => (
              <div key={index} className="mb-4">
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => {
                    const updated = [...items];
                    updated[index].title = e.target.value;
                    setItems(updated);
                  }}
                  placeholder={`Title ${index + 1}`}
                  className="w-full p-2 border border-gray-300 rounded mb-2"
                />
                <textarea
                  value={item.description}
                  onChange={(e) => {
                    const updated = [...items];
                    updated[index].description = e.target.value;
                    setItems(updated);
                  }}
                  placeholder={`Description ${index + 1}`}
                  className="w-full p-2 border border-gray-300 rounded"
                ></textarea>
              </div>
            ))}


            <button
              onClick={() => setItems([...items, { title: "", description: "" }])}
              className="mb-4 text-sm text-blue-600 hover:underline"
            >
              + Add another item
            </button>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowItemModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItemsToCategory}
                className="bg-tracer-green px-4 py-2 rounded text-white hover:bg-tracer-green/90"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Edit Item</h2>
            <input
              type="text"
              value={editItemData.title}
              onChange={(e) =>
                setEditItemData({ ...editItemData, title: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Enter new title"
            />
            <textarea
              className="w-full p-2 border border-gray-300 rounded mt-2"
              placeholder="Enter description"
              value={editItemData.description}
              onChange={(e) =>
                setEditItemData({ ...editItemData, description: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateItem}
                className="bg-tracer-green px-4 py-2 rounded text-white hover:bg-tracer-green/90"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditCatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Edit Category</h2>
            <input
              type="text"
              value={editCategoryData.name}
              onChange={(e) =>
                setEditCategoryData({ ...editCategoryData, name: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Enter new title"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCatEditModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCat}
                className="bg-tracer-green px-4 py-2 rounded text-white hover:bg-tracer-green/90"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-lg w-full max-w-md relative">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedRep(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                Delete {deleteType === "category" ? "Category" : "Item"}
              </h3>

              <p className="text-gray-300 mb-6">
                Are you sure you want to delete <span className="font-semibold">{selectedRep.name}</span>?
                This action cannot be undone.
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedRep(null);
                  }}
                  className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setIsDeleting(true);
                    try {
                      const endpoint =
                        deleteType === "category"
                          ? `/marketing/remove-category/${selectedRep.id}`
                          : `/marketing/remove-item/${selectedRep.id}`;

                      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                        method: "GET",
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      });

                      const result = await response.json();

                      if (response.ok && result.status === "success") {
                        fetchCategories();
                      } else {
                        alert("Failed to delete.");
                      }
                    } catch (err) {
                      alert("Delete failed.");
                    } finally {
                      setShowDeleteModal(false);
                      setSelectedRep(null);
                      setIsDeleting(false);
                    }
                  }}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition duration-200"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </div>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



    </>
  );
}
