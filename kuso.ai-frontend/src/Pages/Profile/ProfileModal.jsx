import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import './ProfileModal.css'
import axios from "axios";

const INDUSTRIES = [
    { value: 16, label: "General" },
    { value: 1, label: "Information Technology" },
    { value: 2, label: "Healthcare and Medical" },
    { value: 3, label: "Finance and Insurance" },
    { value: 4, label: "Education" },
    { value: 5, label: "Manufacturing" },
    { value: 6, label: "Retail and Consumer Goods" },
    { value: 7, label: "Marketing and Advertising" },
    { value: 9, label: "Engineering and Construction" },
    { value: 10, label: "Government and Public Administration" },
    { value: 11, label: "Business Services" },
    { value: 12, label: "Hospitality and Travel" },
    { value: 13, label: "Pharmaceuticals and Biotechnology" },
    { value: 14, label: "Legal Services" },
    { value: 15, label: "Environmental Services" },
    { value: 8, label: "Arts, Media, and Entertainment" }
  ];

  function ProfileModal({ isOpen, onClose, userData, onSave }) {
    const [age, setAge] = useState(userData?.age || '');
    const [employed, setEmployed] = useState(userData?.employed || false);
    const [selectedIndustries, setSelectedIndustries] = useState([]);
  
    useEffect(() => {
      if (userData) {
        setAge(userData.age || '');
        setEmployed(userData.employed || false);
        setSelectedIndustries(
          userData.industries.map(ind => INDUSTRIES.find(i => i.value === ind.industryId)) || []
        );
      }
    }, [userData]);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      const ageInt = age ? parseInt(age, 10) : null;
      await onSave({ 
        age: ageInt, 
        employed, 
        industries: selectedIndustries.map(ind => ind.value)
      });
      onClose();
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>{userData?.age || userData?.industries.length > 0 ? 'Edit Profile' : 'Complete Profile'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="age">Age:</label>
              <input 
                id="age"
                type="number" 
                value={age} 
                onChange={(e) => setAge(e.target.value)} 
                min="0"
                max="120"
              />
            </div>
            <div className="form-group">
              <label className="toggle-container">
                <span className="toggle-label">Employed:</span>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={employed}
                    onChange={() => setEmployed(!employed)}
                  />
                  <span className="slider round"></span>
                </div>
              </label>
            </div>
            <div className="form-group">
              <label htmlFor="industries">Industries:</label>
              <Select
                id="industries"
                isMulti
                options={INDUSTRIES}
                value={selectedIndustries}
                onChange={setSelectedIndustries}
              />
            </div>
            <div className="button-group">
              <button type="submit">Save</button>
              <button type="button" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  export default ProfileModal;