import { Component, OnInit, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from './services/user.service';
import { UserModal } from './components/user-modal/user-modal';
import { ConfirmDialog } from './components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, UserModal, ConfirmDialog],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly userService = inject(UserService);

  // Computed stats from signals
  readonly totalCount = computed(() => this.userService.users().length);
  readonly activeCount = computed(
    () => this.userService.users().filter((u) => u.status === 'Active').length,
  );
  readonly inactiveCount = computed(
    () => this.userService.users().filter((u) => u.status === 'Inactive').length,
  );
  readonly adminCount = computed(
    () => this.userService.users().filter((u) => u.role === 'Admin').length,
  );

  @ViewChild('userModal') userModal!: UserModal;
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialog;

  // Navigation State
  readonly tabs = [
    { id: 'all-users', name: 'All Users', icon: 'group' },
    { id: 'roles', name: 'Roles & Permissions', icon: 'shield_person' },
    { id: 'security', name: 'Security', icon: 'security' },
    { id: 'activity', name: 'Activity Logs', icon: 'history' },
    { id: 'invitations', name: 'Invitations', icon: 'mail' },
    { id: 'teams', name: 'Teams', icon: 'groups' },
    { id: 'policies', name: 'Workplace Policies', icon: 'policy' },
    { id: 'whos-in', name: "Who's In", icon: 'co_present' },
  ];
  readonly activeTab = signal<string>('all-users');

  // Dark / Light Theme state
  readonly isDarkMode = signal<boolean>(false);

  // Modal State Signals
  readonly selectedUser = signal<User | null>(null);
  readonly userToDelete = signal<User | null>(null);

  // Mock roles and logs for premium tabs
  readonly permissionsList = [
    { role: 'Admin', desc: 'Full access to all settings, configurations, and billing.', count: 2 },
    {
      role: 'Editor',
      desc: 'Can create and edit users, view reports, and manage teams.',
      count: 3,
    },
    { role: 'Viewer', desc: 'Read-only access to dashboard data and logs.', count: 18 },
  ];

  readonly securityLogs = [
    { action: 'MFA Enabled', user: 'Olivia Vance', date: '2026-06-17 09:34', status: 'Success' },
    {
      action: 'Password reset request',
      user: 'Liam Patterson',
      date: '2026-06-16 14:22',
      status: 'Pending',
    },
    {
      action: 'Failed login attempt',
      user: 'unknown (IP 192.168.1.4)',
      date: '2026-06-16 10:05',
      status: 'Blocked',
    },
  ];

  readonly activityLogs = [
    { event: 'User added: Sophia Rodriguez', actor: 'Olivia Vance', date: '2026-06-17 10:15' },
    { event: 'User status changed to Inactive', actor: 'Ethan Hunt', date: '2026-06-17 08:30' },
    {
      event: 'Role updated: Marcus Chen to Editor',
      actor: 'Olivia Vance',
      date: '2026-06-16 17:02',
    },
    { event: 'User deleted: Peter Parker', actor: 'Ethan Hunt', date: '2026-06-15 11:45' },
  ];

  readonly teamsList = [
    {
      name: 'Engineering',
      lead: 'Olivia Vance',
      size: 12,
      bg: 'linear-gradient(135deg, #4f46e5, #818cf8)',
    },
    {
      name: 'Marketing & Sales',
      lead: 'Sophia Rodriguez',
      size: 6,
      bg: 'linear-gradient(135deg, #06b6d4, #67e8f9)',
    },
    {
      name: 'Operations & Security',
      lead: 'Ethan Hunt',
      size: 4,
      bg: 'linear-gradient(135deg, #10b981, #34d399)',
    },
  ];

  readonly invitationsList = [
    {
      email: 'danielle.jones@company.com',
      role: 'Editor',
      sentDate: '2026-06-15',
      expires: '2 days',
    },
    {
      email: 'robert.smith@company.com',
      role: 'Viewer',
      sentDate: '2026-06-17',
      expires: '6 days',
    },
  ];

  ngOnInit() {
    this.userService.loadUsers();
  }

  setTab(tabId: string) {
    this.activeTab.set(tabId);
  }

  toggleTheme() {
    this.isDarkMode.update((dark) => {
      const next = !dark;
      if (next) {
        document.body.classList.remove('theme-light');
        document.body.classList.add('theme-dark');
      } else {
        document.body.classList.remove('theme-dark');
        document.body.classList.add('theme-light');
      }
      return next;
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.userService.searchTerm.set(value);
  }

  onDepartmentChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.userService.searchTerm.set(value);
  }

  setUserFilters(status: 'Active' | 'Inactive' | 'Admin' | '') {
    this.userService.searchTerm.set(status);
  }

  // Modal Open Handlers
  openAddUser() {
    this.selectedUser.set(null);
    this.userModal.show();
  }

  openEditUser(user: User) {
    this.selectedUser.set(user);
    this.userModal.show();
  }

  openDeleteUser(user: User, event: Event) {
    event.stopPropagation(); // prevent row click triggers
    this.userToDelete.set(user);
    this.confirmDialog.show();
  }

  // Modal Save Handler
  onSaveUser(userData: User) {
    if (userData.id) {
      this.userService.updateUser(userData);
    } else {
      this.userService.addUser(userData);
    }
  }

  // Deletion Confirmation Handler
  onConfirmDelete() {
    const user = this.userToDelete();
    if (user && user.id) {
      this.userService.deleteUser(user.id);
    }
  }
}
