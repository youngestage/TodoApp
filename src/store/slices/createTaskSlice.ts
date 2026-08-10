import { StateCreator } from 'zustand';
import { Task } from '../../types';
import { sendPushNotification } from '../../utils/notifications';
import { StoreState } from '../useStore';

export interface TaskSlice {
  tasks: Task[];
  taskFilter: 'All' | 'Mine' | 'Partner' | 'Joint';
  setTaskFilter: (filter: 'All' | 'Mine' | 'Partner' | 'Joint') => void;
  toggleJointTaskTap: (taskId: string, user: 'Leslie' | 'Asa' | string) => void;
  addTask: (task: Omit<Task, 'id' | 'completed' | 'userACompleted' | 'userBCompleted'>) => void;
}

export const createTaskSlice: StateCreator<StoreState, [], [], TaskSlice> = (set, get) => ({
  tasks: [],
  taskFilter: 'All',
  setTaskFilter: (filter) => set({ taskFilter: filter }),

  toggleJointTaskTap: (taskId: string, user: string) => {
    set((state: StoreState) => {
      const updatedTasks = state.tasks.map((task: Task) => {
        if (task.id !== taskId) return task;

        const isUserA = user === 'Leslie' || user === 'Partner A';
        const userACompleted = isUserA ? !task.userACompleted : task.userACompleted;
        const userBCompleted = !isUserA ? !task.userBCompleted : task.userBCompleted;

        const completed = task.isJoint ? userACompleted && userBCompleted : (userACompleted || userBCompleted);

        if (completed && !task.completed) {
          sendPushNotification('Task Completed! 🎉', `"${task.title}" has been confirmed done by both partners!`);
        }

        return {
          ...task,
          userACompleted,
          userBCompleted,
          completed
        };
      });

      return { tasks: updatedTasks };
    });
  },

  addTask: (task) => set((state: StoreState) => {
    sendPushNotification('New Joint Household Task', `Added: "${task.title}"`);
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      completed: false,
      userACompleted: false,
      userBCompleted: false,
      commentsCount: 0
    };
    return { tasks: [newTask, ...state.tasks] };
  })
});
