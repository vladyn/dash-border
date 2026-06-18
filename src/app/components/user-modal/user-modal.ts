import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../services/user.service';

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgOptimizedImage],
  templateUrl: './user-modal.html',
  styleUrl: './user-modal.css',
})
export class UserModal implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() user: User | null = null;
  @Output() save = new EventEmitter<User>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('dialog') dialogElement!: ElementRef<HTMLDialogElement>;

  readonly form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{6,16}$/)]],
    role: ['Viewer', [Validators.required]],
    department: ['Engineering', [Validators.required]],
    status: ['Active', [Validators.required]],
    avatar: ['/assets/images/Rambo-First-Blood.webp'],
  });

  roles = ['Admin', 'Editor', 'Viewer'];
  departments = [
    'Engineering',
    'Product Management',
    'Marketing',
    'Human Resources',
    'Customer Support',
    'Security Operations',
  ];

  ngOnChanges() {
    if (this.user) {
      this.form.patchValue({
        name: this.user.name,
        email: this.user.email,
        role: this.user.role,
        department: this.user.department,
        status: this.user.status,
        avatar: this.user.avatar,
      });
    } else {
      this.form.reset({
        role: 'Viewer',
        department: 'Engineering',
        status: 'Active',
        avatar: '/assets/images/Rambo-First-Blood.webp',
      });
    }
  }

  show() {
    this.dialogElement.nativeElement.showModal();
  }

  close() {
    this.dialogElement.nativeElement.close();
    this.cancel.emit();
  }

  onSubmit() {
    if (this.form.valid) {
      const userData: User = {
        ...this.form.value,
        id: this.user?.id, // preserve id if editing
      };
      this.save.emit(userData);
      this.close();
    } else {
      this.form.markAllAsTouched();
    }
  }

  // Helpers for template validations
  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
