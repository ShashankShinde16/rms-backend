import React, { useState } from "react";
import { FaTimes, FaEdit, FaCheck, FaArrowLeft } from "react-icons/fa";

const ProfilePopup = ({ user, onClose, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleAddressChange = (index, field, value) => {
    const updated = [...formData.addresses];
    updated[index][field] = value;
    setFormData({ ...formData, addresses: updated });
  };

  const addNewAddress = () => {
    setFormData({
      ...formData,
      addresses: [...formData.addresses, { street: "", city: "", phone: "" }]
    });
  };

  const removeAddress = (index) => {
    const updated = formData.addresses.filter((_, i) => i !== index);
    setFormData({ ...formData, addresses: updated });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onUpdate(formData);
      setEditMode(false);
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all">
      <div className="relative w-full max-w-md p-6 sm:p-8 bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg ring-1 ring-gray-200 transition-transform animate-fade-in-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
        >
          <FaTimes size={18} />
        </button>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {editMode ? "Edit Profile" : "My Profile"}
          </h2>

          {editMode ? (
            <button
              onClick={() => setEditMode(false)}
              className="flex items-center text-sm text-gray-500 hover:text-blue-500"
            >
              <FaArrowLeft className="mr-1" /> Back
            </button>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center text-sm text-gray-500 hover:text-blue-500"
            >
              <FaEdit className="mr-1" /> Edit
            </button>
          )}
        </div>

        {/* Content */}
        {!editMode ? (
          <div className="space-y-3 text-sm text-gray-700">
            <p><span className="font-medium">Name:</span> {user.name}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
            {/* <p><span className="font-medium">Role:</span> {user.role}</p>
            <p><span className="font-medium">Verified:</span> {user.verified ? "Yes" : "No"}</p>
            <p><span className="font-medium">Active:</span> {user.isActive ? "Yes" : "No"}</p>
            <p><span className="font-medium">Blocked:</span> {user.blocked ? "Yes" : "No"}</p> */}

            <div className="pt-2">
              <p className="font-medium">Addresses:</p>
              <ul className="list-disc list-inside text-gray-600 pl-3 text-xs">
                  <li>
                    {user.address.street}, {user.address.city} - {user.address.phone}
                  </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-sm text-gray-700">
            <InputField label="Name" name="name" value={formData.name} onChange={handleChange} />
            <InputField label="Email" name="email" value={formData.email} onChange={handleChange} />
            {/* <SelectField
              label="Role"
              name="role"
              value={formData.role}
              options={["Admin", "user"]}
              onChange={handleChange}
            />
            <CheckboxField label="Verified" name="verified" checked={formData.verified} onChange={handleChange} />
            <CheckboxField label="Active" name="isActive" checked={formData.isActive} onChange={handleChange} />
            <CheckboxField label="Blocked" name="blocked" checked={formData.blocked} onChange={handleChange} /> */}
            <input
              type="text"
              name="street"
              placeholder="Street"
              value={user.address.street}
              onChange={(e) => handleAddressChange(idx, "street", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={user.address.city}
              onChange={(e) => handleAddressChange(idx, "city", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <div className="flex space-x-2">
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={user.address.phone}
                onChange={(e) => handleAddressChange(idx, "phone", e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

          </div>
        )}

        {/* Footer Buttons */}
        {editMode && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {loading ? "Saving..." : (
                <span className="flex items-center">
                  <FaCheck className="mr-2" /> Save
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange }) => (
  <div>
    <label className="block font-medium mb-1">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const SelectField = ({ label, name, value, options, onChange }) => (
  <div>
    <label className="block font-medium mb-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const CheckboxField = ({ label, name, checked, onChange }) => (
  <div className="flex items-center space-x-2">
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 border-gray-300 rounded focus:ring-blue-500"
    />
    <label>{label}</label>
  </div>
);

export default ProfilePopup;
