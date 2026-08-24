import React, { useState } from 'react';
import { getUserAvatarUrl } from '../../utils/avatarUtils';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Plus, Trash2, Calendar } from 'lucide-react';
import { Task } from '../../types';
import { useStore } from '../../store/useStore';

interface TaskRowProps {
  task: Task;
}

export const TaskRow: React.FC<TaskRowProps> = ({ task }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubTask, setNewSubTask] = useState('');
  
  const toggleJointTaskTap = useStore(state => state.toggleJointTaskTap);
  const toggleSubTask = useStore(state => state.toggleSubTask);
  const addSubTask = useStore(state => state.addSubTask);
  const deleteSubTask = useStore(state => state.deleteSubTask);
  const deleteTask = useStore(state => state.deleteTask);
  const currentUser = useStore(state => state.currentUser);
  const partnerUser = useStore(state => state.partnerUser);

  const currentUserName = currentUser?.name || 'Partner A';

  const handleToggleSubTask = (subTaskId: string) => {
    toggleSubTask(task.id, subTaskId, currentUserName);
  };

  const handleAddSubTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubTask.trim()) {
      addSubTask(task.id, newSubTask.trim());
      setNewSubTask('');
    }
  };

  const handleToggleMainTask = () => {
    toggleJointTaskTap(task.id, currentUserName);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-[#EF713F] text-white';
      case 'Medium': return 'bg-yellow-500 text-white';
      case 'Low': return 'bg-[#4A7C59] text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const getUserAvatar = (name: string) => getUserAvatarUrl(name, currentUser, partnerUser);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 mb-3 overflow-hidden transition-all duration-200 ${task.completed ? 'opacity-70' : ''}`}>
      <div className="flex items-center p-4">
        {/* Main Checkbox */}
        <button 
          onClick={handleToggleMainTask}
          className="flex-shrink-0 mr-4 text-gray-400 hover:text-[#EF713F] focus:outline-none"
        >
          {task.completed ? (
            <CheckCircle2 className="w-7 h-7 text-[#4A7C59]" />
          ) : (
            <Circle className="w-7 h-7" />
          )}
        </button>

        {/* Task Info */}
        <div className="flex-grow flex flex-col justify-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <span className={`text-lg font-medium text-[#231F1E] ${task.completed ? 'line-through text-gray-400' : ''}`}>
            {task.title}
          </span>
          <div className="flex items-center mt-1 space-x-2">
            {task.priority && (task.priority as string) !== 'none' && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            )}
            {task.dueDate && (
              <span className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                {task.dueDate}
              </span>
            )}
            {task.subTasks && task.subTasks.length > 0 && (
              <span className="text-xs text-gray-500">
                {task.subTasks.filter(st => st.completed).length}/{task.subTasks.length} subtasks
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 ml-4">
          {task.completedBy && task.completed && (
             <div className="flex items-center text-xs text-gray-500 mr-2 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
               <img src={getUserAvatar(task.completedBy)} alt="Avatar" className="w-5 h-5 rounded-full mr-1.5 border border-gray-200" />
               <span className="hidden sm:inline">Completed by {task.completedBy}</span>
             </div>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
            className="text-gray-300 hover:text-red-500 focus:outline-none p-1"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 focus:outline-none p-1"
          >
            {isExpanded ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sub-tasks Section */}
      {isExpanded && (
        <div className="bg-[#F5F3EF] border-t border-gray-100 p-4">
          {(task.subTasks || []).map(subTask => (
            <div key={subTask.id} className="flex items-center justify-between py-2 border-b border-gray-200/50 last:border-0 group">
              <div className="flex items-center flex-grow">
                <button 
                  onClick={() => handleToggleSubTask(subTask.id)}
                  className="mr-3 text-gray-400 hover:text-[#8964B3]"
                >
                  {subTask.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#8964B3]" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <span className={`text-sm ${subTask.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {subTask.title}
                </span>
              </div>
              
              <div className="flex items-center space-x-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                {subTask.completed && subTask.completedBy && (
                   <img 
                    src={getUserAvatar(subTask.completedBy)} 
                    alt={subTask.completedBy} 
                    title={`Completed by ${subTask.completedBy}`}
                    className="w-5 h-5 rounded-full border border-gray-300"
                  />
                )}
                <button 
                  onClick={() => deleteSubTask(task.id, subTask.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add Sub-task Input */}
          <form onSubmit={handleAddSubTask} className="mt-3 flex items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
            <Plus className="w-5 h-5 text-gray-400 mr-2" />
            <input 
              type="text" 
              value={newSubTask}
              onChange={(e) => setNewSubTask(e.target.value)}
              placeholder="Add a sub-task..."
              className="flex-grow bg-transparent border-none focus:outline-none text-sm text-gray-700 placeholder-gray-400"
            />
          </form>
        </div>
      )}
    </div>
  );
};
