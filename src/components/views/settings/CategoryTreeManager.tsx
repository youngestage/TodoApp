import React, { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { BudgetCategoryType } from '../../../types';
import { Add, Trash } from 'iconsax-react';

export const CategoryTreeManager: React.FC = () => {
  const { subcategories, addSubcategory, deleteSubcategory } = useStore();
  const [selectedParentCategory, setSelectedParentCategory] = useState<BudgetCategoryType>('Expenses');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [subcategoryError, setSubcategoryError] = useState<string | null>(null);

  const handleAddSubcategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcategoryName.trim()) return;
    const success = addSubcategory(selectedParentCategory, newSubcategoryName);
    if (!success) {
      setSubcategoryError(`"${newSubcategoryName}" already exists in ${selectedParentCategory}.`);
    } else {
      setNewSubcategoryName('');
      setSubcategoryError(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 space-y-6 border-0 shadow-none">
      <div className="space-y-1 border-b border-[#F5F3EF] pb-4">
        <h3 className="font-bold text-lg text-[#231F1E]">Budget Category Manager</h3>
        <p className="text-xs text-[#6B6560]">Manage up to 20 subcategories per master group</p>
      </div>

      {/* Master Group Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {(['Income', 'Expenses', 'Bills', 'Savings', 'Investments', 'Debt'] as BudgetCategoryType[]).map((group) => (
          <button
            key={group}
            onClick={() => {
              setSelectedParentCategory(group);
              setSubcategoryError(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border-0 cursor-pointer ${
              selectedParentCategory === group
                ? 'bg-[#EF713F] text-white'
                : 'bg-[#FBF9F5] text-[#6B6560] hover:text-[#231F1E]'
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      {/* Add New Subcategory Form */}
      <form onSubmit={handleAddSubcategorySubmit} className="space-y-3 pt-2">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newSubcategoryName}
            onChange={(e) => setNewSubcategoryName(e.target.value)}
            placeholder={`New subcategory under ${selectedParentCategory}...`}
            className="flex-1 px-4 py-3 bg-[#FBF9F5] rounded-2xl text-xs sm:text-sm text-[#231F1E] border-0 focus:outline-none focus:ring-2 focus:ring-[#EF713F]/30"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-2xl bg-[#231F1E] text-white hover:bg-black font-bold text-xs border-0 cursor-pointer transition-colors flex items-center space-x-1"
          >
            <Add size={16} />
            <span>Add</span>
          </button>
        </div>

        {subcategoryError && (
          <p className="text-xs text-[#EF713F] font-mono font-semibold">
            ⚠️ {subcategoryError}
          </p>
        )}
      </form>

      {/* Current Subcategories Chips */}
      <div className="space-y-2 pt-2">
        <label className="block text-xs font-semibold text-[#6B6560] uppercase font-mono tracking-wider">
          Active Subcategories ({subcategories[selectedParentCategory]?.length || 0}/20)
        </label>

        <div className="flex flex-wrap gap-2">
          {(subcategories[selectedParentCategory] || []).map((item) => (
            <div
              key={item}
              className="px-3.5 py-2 rounded-2xl bg-[#FBF9F5] text-xs font-semibold text-[#231F1E] flex items-center space-x-2 border-0"
            >
              <span>{item}</span>
              <button
                onClick={() => deleteSubcategory(selectedParentCategory, item)}
                className="text-[#6B6560] hover:text-[#EF713F] border-0 bg-transparent cursor-pointer p-0.5"
                title="Remove"
              >
                <Trash size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
