export type UserRole = 'admin' | 'web_manager' | 'news_manager' | 'esg_manager';

export interface UserPermissions {
  read: boolean;
  write: boolean;
  update: boolean;
  delete: boolean;
  manageUsers: boolean;
  manageBrochures: boolean;
  manageNews: boolean;
  manageESG: boolean;
  changePassword: boolean;
}

export const DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    read: true,
    write: true,
    update: true,
    delete: true,
    manageUsers: true,
    manageBrochures: true,
    manageNews: true,
    manageESG: true,
    changePassword: true
  },
  web_manager: {
    read: true,
    write: true,
    update: true,
    delete: true,
    manageUsers: false,
    manageBrochures: true,
    manageNews: false,
    manageESG: false,
    changePassword: false
  },
  news_manager: {
    read: true,
    write: true,
    update: true,
    delete: true,
    manageUsers: false,
    manageBrochures: false,
    manageNews: true,
    manageESG: false,
    changePassword: false
  },
  esg_manager: {
    read: true,
    write: true,
    update: true,
    delete: true,
    manageUsers: false,
    manageBrochures: false,
    manageNews: false,
    manageESG: true,
    changePassword: false
  }
};

export const USER_ROLE_NAMES: Record<UserRole, string> = {
  admin: '관리자',
  web_manager: '웹 관리자',
  news_manager: '뉴스 관리자',
  esg_manager: 'ESG 관리자'
};

export const USER_ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  web_manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  news_manager: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  esg_manager: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
}; 