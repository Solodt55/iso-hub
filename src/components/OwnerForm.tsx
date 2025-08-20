import React, { useState } from "react";
import { Calendar } from "lucide-react"; // Replace or remove if not using this icon

const OwnerForm = ({ formData, setFormData }) => {
  const [ownerCount, setOwnerCount] = useState("");
  const [fileErrors, setFileErrors] = useState({});

  const getFileIcon = (fileName: string): string | undefined => {
    const extension = fileName.split('.').pop()?.toLowerCase();
  
    switch (extension) {
      case 'pdf':
        return "/pdf_file.png";
      case 'doc':
      case 'docx':
        return "/docs_file.png";
      case 'xls':
      case 'xlsx':
        return "/xls_file.png";
      case 'ppt':
      case 'pptx':
        return "/ppt_file.png";
      case 'txt':
        return "/txt_file.png";
      case 'csv':
        return "/csv_file.png";
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return "/gz_file.png"; // Archive icon
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'svg':
      case 'webp':
        return undefined; // Show actual image preview
      default:
        return "/default_file.png"; // Generic/default file icon
    }
  };
  

  const isImageFile = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension) : false;
  };

  const handleOwnerChange = (e) => {
    const count = parseInt(e.target.value, 10);
    setOwnerCount(count);

    setFormData((prev) => {
      const newData = [...prev];
      while (newData.length < count) {
        newData.push({
          ownership_first_name: "",
          ownership_last_name: "",
          ownership_percent: "",
          ownership_phone_number: "",
          ownership_city: "",
          ownership_state: "",
          ownership_zip: "",
          ownership_email: "",
          ownership_dob: "",
          ownership_social_security_number: "",
          ownership_residential_street_address: "",
          ownership_driver_licence_number: "",
          ownership_address: "",
          owner_street_address: "",
          owner_street_address2: "",
          ownership_title: "",
          driver_license_image: [],
        });
      }
      return newData.slice(0, count);
    });
  };

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = [...prev];
      updated[index][name] = value;
      return updated;
    });
  };

  const handleImageRemove = (index, imageIndex) => {
    setFormData((prev) => {
      const updated = [...prev];
      updated[index].driver_license_image.splice(imageIndex, 1);
      return updated;
    });
  };

  // const handleImageChange = (index, event) => {
  //   const files = Array.from(event.target.files);
  //   if (files.length) {
  //     const updatedImages = files.map((file) => ({
  //       file, // store the actual File object
  //       url: URL.createObjectURL(file),
  //       name: file.name,
  //       size: (file.size / 1024).toFixed(1) + "KB",
  //     }));
  //     setFormData((prev) => {
  //       const updated = [...prev];
  //       updated[index].driver_license_image = [
  //         ...updated[index].driver_license_image,
  //         ...updatedImages,
  //       ];
  //       return updated;
  //     });
  //   }
  // };

  const handleImageChange = (index, event) => {
    const files = Array.from(event.target.files);
    if (files.length) {
      const updatedImages = files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: (file.size / 1024).toFixed(1) + "KB",
      }));

      setFormData((prev) => {
        const updated = [...prev];

        // Prevent duplicate file names
        const existingNames = updated[index].driver_license_image.map(
          (img) => img.name
        );
        const nonDuplicateImages = updatedImages.filter(
          (img) => !existingNames.includes(img.name)
        );

        updated[index].driver_license_image = [
          ...updated[index].driver_license_image,
          ...nonDuplicateImages,
        ];
        return updated;
      });

      // Reset file input value
      event.target.value = null;
    }
  };

  return (
    <div>
      {/* Owner Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-1">
          Number of Owners with 25% ownership or more
        </label>
        <select
          className="mt-1 block w-1/2 rounded-md border-gray-300 shadow-sm"
          value={ownerCount}
          onChange={handleOwnerChange}
          required
        >
          <option value="">
            Select Owner
          </option>
          <option value="1">1 Owner</option>
          <option value="2">2 Owners</option>
          <option value="3">3 Owners</option>
        </select>
      </div>

      {/* Scrollable container if more than one owner */}
      <div
        className={`space-y-6 ${
          ownerCount > 1 ? "max-h-[600px] overflow-y-auto pr-3" : ""
        }`}
      >
        {formData.slice(0, ownerCount).map((owner, index) => (
          <fieldset
            key={index}
            className="border border-gray-300 rounded-lg p-6"
          >
            <legend className="text-lg font-semibold text-white px-2">
              {`Owner / Officer Information ${index + 1}`}
            </legend>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    name="ownership_first_name"
                    value={owner.ownership_first_name}
                    onChange={(e) => handleInputChange(index, e)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    name="ownership_last_name"
                    value={owner.ownership_last_name}
                    onChange={(e) => handleInputChange(index, e)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               
                <div>
                  <label className="block text-sm font-medium text-white">
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    name="owner_street_address"
                    value={owner.owner_street_address}
                    onChange={(e) => handleInputChange(index, e)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white">
                    Street Address Line 2
                  </label>
                  <input
                    type="text"
                    name="owner_street_address2"
                    required
                    value={owner.owner_street_address2}
                    onChange={(e) => handleInputChange(index, e)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    name="ownership_phone_number"
                    value={owner.ownership_phone_number}
                    onChange={(e) => handleInputChange(index, e)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    name="ownership_city"
                    value={owner.ownership_city}
                    onChange={(e) => handleInputChange(index, e)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    name="ownership_state"
                    value={owner.ownership_state}
                    onChange={(e) => handleInputChange(index, e)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white">
                    ZIP
                  </label>
                  <input
                    type="text"
                    name="ownership_zip"
                    required
                    value={owner.ownership_zip}
                    onChange={(e) => handleInputChange(index, e)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white">
                    Ownership %
                  </label>
                  <input
                    type="text"
                    name="ownership_percent"
                    required
                    onChange={(e) => handleInputChange(index, e)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white">
                    Title
                  </label>
                  <input
                    type="text"
                    name="ownership_title"
                    required
                    value={owner.ownership_title}
                    onChange={(e) => handleInputChange(index, e)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    name="ownership_email"
                    value={owner.ownership_email}
                    onChange={(e) => handleInputChange(index, e)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="ownership_dob"
                      required
                      value={owner.ownership_dob}
                      onChange={(e) => handleInputChange(index, e)}
                      className="mt-1 block w-full rounded bg-gray-700 text-white border border-gray-600 px-3 py-2"
                    />
                    <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white">
                    Social Security Number
                  </label>
                  <input
                    type="text"
                    name="ownership_social_security_number"
                    required
                    value={owner.ownership_social_security_number}
                    onChange={(e) => handleInputChange(index, e)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white">
                    Driver Licence Number
                  </label>
                  <input
                    type="text"
                    name="ownership_driver_licence_number"
                    value={owner.ownership_driver_licence_number}
                    onChange={(e) => handleInputChange(index, e)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  OR Upload a picture of your Driver's License
                </label>

                <div className="flex space-x-4">
                  {/* Drag and drop box */}
                  <div
                    className="border border-dashed border-gray-300 p-3 text-center rounded cursor-pointer hover:bg-gray-50 w-100 h-100 flex items-center justify-center"
                    onClick={() =>
                      document.getElementById(`driverLicense-${index}`).click()
                    }
                  >
                    <input
                      type="file"
                      id={`driverLicense-${index}`}
                      accept="image/*"
                      className="hidden"
                      multiple
                      name="owner_docs_images[]"
                      onChange={(e) => handleImageChange(index, e)}
                    />

                    <div>
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/1828/1828911.png"
                        width="20"
                        alt="Upload icon"
                        className="mx-auto mb-1"
                      />
                      <p className="text-xs font-semibold">Browse</p>
                      <small className="text-[10px] text-gray-400">
                        Drag & drop
                      </small>
                    </div>
                  </div>
                </div>

                {/* Display selected images with filenames and size */}
                {owner.driver_license_image.length > 0 && (
                  <div className="mt-4">
                    {owner.driver_license_image.map((image, imageIndex) => (
                      <div
                        key={imageIndex}
                        className="flex items-center space-x-4 py-2 pl-2 pr-2 mt-3 bg-gray-800 rounded-md"
                      >

                      {isImageFile(image.name) ? (
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-5 h-5 object-cover rounded"
                          />
                        ) : (
                          <img
                            src={getFileIcon(image.name)}
                            alt="File icon"
                            className="w-5 h-5 object-contain"
                          />
                        )}

                        {/* <img
                          src={image.url}
                          alt={image.name}
                          className="w-5 h-5 object-cover rounded"
                        /> */}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">
                            {image.name}
                          </p>
                          <p className="text-xs text-gray-400">{image.size}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleImageRemove(index, imageIndex)}
                          className="text-red-600 font-semibold"
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  );
};

export default OwnerForm;
