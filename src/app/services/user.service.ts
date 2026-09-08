import { Injectable, inject, signal, computed, Injector } from '@angular/core';
import { httpResource } from '@angular/common/http';

export interface User {
  phone: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'Active' | 'Inactive';
  avatar?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // Injector for creating httpResource outside of injection context
  private readonly injector = inject(Injector);
  // Use HttpResource to back this service via signals/resources
  private readonly usersResource = httpResource<User[]>(() => this.apiUrl, { injector: this.injector });
  // private readonly apiUrl = 'http://localhost:3000/users';
  private readonly apiUrl = 'https://restful-api-vercel-2pbh.onrender.com/users';

  // Expose the users as a readonly signal derived from the resource
  readonly users = computed(() => this.usersResource.value() ?? []);

  // Loading and error signals backed by the resource
  readonly loading = computed(() => this.usersResource.isLoading());
  readonly error = computed(() => {
    const err = this.usersResource.error();
    return err ? String(err.message ?? err) : null;
  });

  readonly searchTerm = signal<string>('');

  // Computed signal to filter users by name locally in real-time
  readonly filteredUsers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const allUsers = this.users();
    if (!term) return allUsers;
    return allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.status.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term) ||
        user.department.toLowerCase().includes(term),
    );
  });

  // Trigger a reload of the users resource
  loadUsers() {
    this.usersResource.reload();
  }

  // Helper: perform mutating request via httpResource and wait for result
  private async runRequest<T>(request: () => any): Promise<T> {
    const ref = httpResource<T>(request, { injector: this.injector });
    // Trigger load (resource may auto-load, but reload ensures it starts)
    ref.reload();
    // Poll for completion
    return await new Promise<T>((resolve, reject) => {
      const check = () => {
        const status = ref.status();
        if (status === 'resolved') {
          resolve(ref.value() as T);
        } else if (status === 'error') {
          reject(ref.error());
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  }

  // Add a new user
  async addUser(user: User) {
    try {
      const newUser = await this.runRequest<User>(() => ({ url: this.apiUrl, method: 'POST', body: user }));
      // Refresh list after mutation
      this.usersResource.reload();
      return newUser;
    } catch (err) {
      console.error('Failed to add user:', err);
      throw err;
    }
  }

  // Update an existing user
  async updateUser(user: User) {
    if (!user.id) return;
    try {
      const updatedUser = await this.runRequest<User>(() => ({ url: `${this.apiUrl}/${user.id}`, method: 'PUT', body: user }));
      this.usersResource.reload();
      return updatedUser;
    } catch (err) {
      console.error('Failed to update user:', err);
      throw err;
    }
  }

  // Delete a user
  async deleteUser(id: string) {
    try {
      await this.runRequest<void>(() => ({ url: `${this.apiUrl}/${id}`, method: 'DELETE' }));
      this.usersResource.reload();
    } catch (err) {
      console.error('Failed to delete user:', err);
      throw err;
    }
  }
}
