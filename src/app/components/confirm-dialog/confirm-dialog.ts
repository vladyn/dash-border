import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../services/user.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css'
})
export class ConfirmDialog {
  @Input() user: User | null = null;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('dialog') dialogElement!: ElementRef<HTMLDialogElement>;

  show() {
    this.dialogElement.nativeElement.showModal();
  }

  close() {
    this.dialogElement.nativeElement.close();
    this.cancel.emit();
  }

  onConfirm() {
    this.confirm.emit();
    this.close();
  }
}
