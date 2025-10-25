export const messages = {
  vi: {
    common: {
      login: 'Đăng nhập',
      logout: 'Đăng xuất',
      workspaces: 'Không gian làm việc',
      dashboard: 'Bảng điều khiển',
      search: 'Tìm kiếm',
      searchPlaceholder: 'Tìm kiếm trong không gian làm việc...',
      workspaceSettings: 'Cài đặt không gian làm việc',
      integrations: 'Tích hợp',
      security: 'Bảo mật',
      helpSupport: 'Trợ giúp & Hỗ trợ',
      profile: 'Hồ sơ',
      settings: 'Cài đặt',
      billing: 'Thanh toán',
      recentSearches: 'Tìm kiếm gần đây',
      activeTables: 'Bảng hoạt động',
      teamMembers: 'Thành viên nhóm',
      workflowSettings: 'Cài đặt quy trình',
    },
    auth: {
      email: 'Email',
      password: 'Mật khẩu',
      signIn: 'Đăng nhập',
      signOut: 'Đăng xuất',
      welcomeBack: 'Chào mừng trở lại',
      username: 'Tên đăng nhập',
      enterUsername: 'Nhập tên đăng nhập',
      useDemo: 'Dùng mẫu',
      processing: 'Đang xử lý...',
      needNewAccount: 'Cần tài khoản mới? Liên hệ admin workspace',
      demoEnvironment: 'Môi trường Demo',
      useDemoAccount: 'Sử dụng tài khoản demo:',
      orCreateNewWorkspace: 'Hoặc tạo workspace mới sau khi đăng nhập',
      accessYourAccount: 'Truy cập tài khoản BEQEEK của bạn',
      digitalProcessPlatform: 'Nền tảng số hóa quy trình',
      manageWorkspaces: 'Quản trị workspace, tự động hóa workflow và vận hành dữ liệu Active Table với bảo mật E2EE.',
      manageStructuredData: 'Quản lý dữ liệu cấu trúc với schema linh hoạt',
      automateWorkProcesses: 'Tự động hóa quy trình làm việc hiệu quả',
      secureDataE2E: 'Bảo mật dữ liệu với mã hóa đầu cuối',
    },
    workspace: {
      create: 'Tạo không gian làm việc',
      name: 'Tên không gian làm việc',
      description: 'Mô tả',
      emptyState: 'Chưa có không gian làm việc nào',
    },
  },
  en: {
    common: {
      login: 'Login',
      logout: 'Logout',
      workspaces: 'Workspaces',
      dashboard: 'Dashboard',
      search: 'Search',
      searchPlaceholder: 'Search across workspace...',
      workspaceSettings: 'Workspace Settings',
      integrations: 'Integrations',
      security: 'Security',
      helpSupport: 'Help & Support',
      profile: 'Profile',
      settings: 'Settings',
      billing: 'Billing',
      recentSearches: 'Recent searches',
      activeTables: 'Active tables',
      teamMembers: 'Team members',
      workflowSettings: 'Workflow settings',
    },
    auth: {
      email: 'Email',
      password: 'Password',
      signIn: 'Sign In',
      signOut: 'Sign Out',
      welcomeBack: 'Welcome Back',
      username: 'Username',
      enterUsername: 'Enter username',
      useDemo: 'Use Demo',
      processing: 'Processing...',
      needNewAccount: 'Need new account? Contact workspace admin',
      demoEnvironment: 'Demo Environment',
      useDemoAccount: 'Use demo account:',
      orCreateNewWorkspace: 'Or create new workspace after login',
      accessYourAccount: 'Access your BEQEEK account',
      digitalProcessPlatform: 'Digital Process Platform',
      manageWorkspaces: 'Manage workspaces, automate workflows and operate Active Table data with E2EE security.',
      manageStructuredData: 'Manage structured data with flexible schema',
      automateWorkProcesses: 'Automate work processes efficiently',
      secureDataE2E: 'Secure data with end-to-end encryption',
    },
    workspace: {
      create: 'Create Workspace',
      name: 'Workspace Name',
      description: 'Description',
      emptyState: 'No workspaces yet',
    },
  },
};

export function getMessage(key, locale = 'vi') {
  const keys = key.split('.');
  let value = messages[locale];

  for (const k of keys) {
    value = value?.[k];
  }

  return value || messages.en[key.split('.')[0]]?.[key.split('.')[1]] || key;
}
