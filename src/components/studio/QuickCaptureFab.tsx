import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Task } from '../../types';

export const QuickCaptureFab: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('none');
  const addTask = useStore(state => state.addTask);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      category: 'Home', // default
      isJoint: false,
      assignedToName: 'Both',
      dueDate: '',
      priority: (priority === 'none' ? 'Medium' : priority) as Task['priority'],
      subTasks: []
    });

    setTitle('');
    setPriority('none');
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-6 sm:bottom-8 sm:right-8 bg-[#EF713F] text-white p-4 rounded-full shadow-lg hover:bg-[#d65f30] hover:shadow-xl transition-all duration-300 z-50 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Quick Capture Modal/Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-semibold text-lg text-gray-800">Quick Capture</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4">
              <input
                type="text"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full text-xl text-gray-800 placeholder-gray-400 border-none focus:outline-none focus:ring-0 mb-6"
              />
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex space-x-2">
                  {(['none', 'Low', 'Medium', 'High'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        priority === p 
                          ? p === 'High' ? 'bg-[#EF713F] text-white border-[#EF713F]' 
                          : p === 'Medium' ? 'bg-yellow-500 text-white border-yellow-500' 
                          : p === 'Low' ? 'bg-[#4A7C59] text-white border-[#4A7C59]' 
                          : 'bg-gray-800 text-white border-gray-800'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {p === 'none' ? 'No Priority' : p}
                    </button>
                  ))}
                </div>
                
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="bg-[#EF713F] text-white px-5 py-2 rounded-xl font-medium shadow-sm hover:bg-[#d65f30] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
