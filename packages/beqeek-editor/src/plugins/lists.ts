import { NumberedList, BulletedList, TodoList } from '@yoopta/lists';

/**
 * List plugins (Numbered, Bulleted, Todo)
 * Using default Yoopta renders
 */
export function getListPlugins() {
  return [NumberedList, BulletedList, TodoList];
}
