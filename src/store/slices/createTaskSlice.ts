import { StateCreator } from 'zustand';
import { Task, TaskFolder } from '../../types';
import { sendPushNotification } from '../../utils/notifications';
import { StoreState } from '../useStore';
import {
  saveTaskToDB,
  updateTaskInDB,
  deleteTaskFromDB,
  saveFolderToDB,
  deleteFolderFromDB
} from '../../services';

export interface TaskSlice {
  tasks: Task[];
  folders: TaskFolder[];
  taskFilter: 'All' | 'Mine' | 'Partner' | 'Joint';
  setTaskFilter: (filter: 'All' | 'Mine' | 'Partner' | 'Joint') => void;
  toggleJointTaskTap: (taskId: string, user: 'Leslie' | 'Asa' | string) => void;
  addTask: (task: Omit<Task, 'id' | 'completed' | 'userACompleted' | 'userBCompleted'>) => void;
  deleteTask: (taskId: string) => void;
  addFolder: (folder: Omit<TaskFolder, 'id'>) => void;
  deleteFolder: (folderId: string) => void;
  addSubTask: (taskId: string, title: string) => void;
  toggleSubTask: (taskId: string, subTaskId: string, user: string) => void;
  deleteSubTask: (taskId: string, subTaskId: string) => void;
}

export const createTaskSlice: StateCreator<StoreState, [], [], TaskSlice> = (set, get) => ({
  tasks: [],
  folders: [],
  taskFilter: 'All',
  setTaskFilter: (filter) => set({ taskFilter: filter }),

  toggleJointTaskTap: (taskId: string, user: string) => {
    set((state: StoreState) => {
      const updatedTasks = state.tasks.map((task: Task) => {
        if (task.id !== taskId) return task;

        const isUserA = user === 'Leslie' || user === 'Partner A' || user === state.currentUser?.name;
        const userACompleted = isUserA ? !task.userACompleted : task.userACompleted;
        const userBCompleted = !isUserA ? !task.userBCompleted : task.userBCompleted;

        const completed = task.isJoint ? userACompleted && userBCompleted : (userACompleted || userBCompleted);
        const completedBy = completed ? user : undefined;

        if (completed && !task.completed) {
          sendPushNotification('Task Completed! 🎉', `"${task.title}" has been confirmed done by both partners!`);
        }

        return {
          ...task,
          userACompleted,
          userBCompleted,
          completed,
          completedBy
        };
      });

      return { tasks: updatedTasks };
    });

    const updatedTask = get().tasks.find(t => t.id === taskId);
    if (updatedTask) {
      updateTaskInDB(taskId, {
        completed: updatedTask.completed,
        userACompleted: updatedTask.userACompleted,
        userBCompleted: updatedTask.userBCompleted,
        completedBy: updatedTask.completedBy
      });
    }
  },

  addTask: (task) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      completed: false,
      userACompleted: false,
      userBCompleted: false,
      commentsCount: 0,
      subTasks: task.subTasks || []
    };

    set((state: StoreState) => {
      sendPushNotification('New Joint Household Task', `Added: "${task.title}"`);
      return { tasks: [newTask, ...state.tasks] };
    });

    const householdId = get().household?.id;
    if (householdId) saveTaskToDB(newTask, householdId);
  },

  deleteTask: (taskId) => {
    set((state: StoreState) => ({
      tasks: state.tasks.filter(t => t.id !== taskId)
    }));
    deleteTaskFromDB(taskId);
  },

  addFolder: (folder) => {
    const newFolder = { ...folder, id: crypto.randomUUID() };
    set((state: StoreState) => ({
      folders: [...state.folders, newFolder]
    }));
    
    const householdId = get().household?.id;
    if (householdId) saveFolderToDB(newFolder, householdId);
  },

  deleteFolder: (folderId) => {
    set((state: StoreState) => ({
      folders: state.folders.filter(f => f.id !== folderId)
    }));
    deleteFolderFromDB(folderId);
  },

  addSubTask: (taskId, title) => {
    set((state: StoreState) => ({
      tasks: state.tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            subTasks: [...(t.subTasks || []), { id: `st-${Date.now()}`, title, completed: false }]
          };
        }
        return t;
      })
    }));

    const updatedTask = get().tasks.find(t => t.id === taskId);
    if (updatedTask) {
      updateTaskInDB(taskId, { subTasks: updatedTask.subTasks });
    }
  },

  toggleSubTask: (taskId, subTaskId, user) => {
    set((state: StoreState) => ({
      tasks: state.tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            subTasks: (t.subTasks || []).map(st => {
              if (st.id === subTaskId) {
                const isCompleted = !st.completed;
                return { ...st, completed: isCompleted, completedBy: isCompleted ? user : undefined };
              }
              return st;
            })
          };
        }
        return t;
      })
    }));

    const updatedTask = get().tasks.find(t => t.id === taskId);
    if (updatedTask) {
      updateTaskInDB(taskId, { subTasks: updatedTask.subTasks });
    }
  },

  deleteSubTask: (taskId, subTaskId) => {
    set((state: StoreState) => ({
      tasks: state.tasks.map(t => {
        if (t.id === taskId) {
          return { ...t, subTasks: (t.subTasks || []).filter(st => st.id !== subTaskId) };
        }
        return t;
      })
    }));

    const updatedTask = get().tasks.find(t => t.id === taskId);
    if (updatedTask) {
      updateTaskInDB(taskId, { subTasks: updatedTask.subTasks });
    }
  }
});
