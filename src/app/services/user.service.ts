import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';

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
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://restful-api-vercel-7itg3tlgc-vladyns-projects.vercel.app/users';
  // private readonly apiUrl = 'http://localhost:3000/users';

  // Signals for state management
  private readonly _users = signal<User[]>([]);
  readonly users = this._users.asReadonly();

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly searchTerm = signal<string>('');

  // Computed signal to filter users by name locally in real-time
  readonly filteredUsers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const allUsers = this._users();
    if (!term) return allUsers;
    return allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.status.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term) ||
        user.department.toLowerCase().includes(term),
    );
  });

  // Load users from API
  loadUsers() {
    this.loading.set(true);
    this.error.set(null);

    this.http
      .get<User[]>(this.apiUrl)
      .pipe(
        catchError((err) => {
          console.error('Failed to load users:', err);
          this.error.set(
            'Failed to connect to the backend. Please check that the server is running on http://localhost:3000.',
          );
          return throwError(() => err);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((data) => {
        this._users.set(data);
      });
  }

  // Add a new user
  addUser(user: User) {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .post<User>(this.apiUrl, user)
      .pipe(
        catchError((err) => {
          console.error('Failed to add user:', err);
          this.error.set('Failed to create user. Please try again.');
          return throwError(() => err);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((newUser) => {
        // Optimistically update or just prepend
        this._users.update((current) => [newUser, ...current]);
      });
  }

  // Update an existing user
  updateUser(user: User) {
    if (!user.id) return;
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .put<User>(`${this.apiUrl}/${user.id}`, user)
      .pipe(
        catchError((err) => {
          console.error('Failed to update user:', err);
          this.error.set('Failed to update user. Please try again.');
          return throwError(() => err);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((updatedUser) => {
        this._users.update((current) =>
          current.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
        );
      });
  }

  // Delete a user
  deleteUser(id: string) {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .delete<User>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError((err) => {
          console.error('Failed to delete user:', err);
          this.error.set('Failed to delete user. Please try again.');
          return throwError(() => err);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this._users.update((current) => current.filter((u) => u.id !== id));
      });
  }
}
