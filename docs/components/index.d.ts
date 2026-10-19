// TaskFlow component types (documentation; read by the design-system page, not type-checked).
import type { ReactNode, ComponentType, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from 'react';

export type Lang = 'en' | 'ar';
export type Theme = 'light' | 'dark';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type LucideIcon = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;

export interface Task {
  id: string; title: string; description?: string | null;
  status: TaskStatus; priority: TaskPriority;
  /** ISO date (YYYY-MM-DD) or null */ due?: string | null;
  /** display name of a project member, or null */ assignee?: string | null;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  /** square button; REQUIRES aria-label */ iconOnly?: boolean;
  /** shows a spinner, sets aria-busy and disables the button; keep the label */ loading?: boolean;
  icon?: LucideIcon; iconEnd?: LucideIcon;
  /** mirror directional icons (arrows, chevrons) in RTL */ mirrorIcon?: boolean;
}
export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode; hint?: ReactNode; error?: ReactNode; required?: boolean;
  multiline?: boolean; rows?: number; count?: string; inputClassName?: string;
}
export interface SelectProps {
  label: ReactNode; hint?: ReactNode; error?: ReactNode; required?: boolean; disabled?: boolean; name?: string; className?: string;
  /** values must be non-empty strings ("none" for Unassigned) */
  options: { value: string; label: string; icon?: ReactNode; disabled?: boolean }[];
  value?: string; defaultValue?: string; onChange?: (value: string) => void; placeholder?: string;
}
export interface DateFieldProps {
  label: ReactNode; hint?: ReactNode; error?: ReactNode; required?: boolean; className?: string; lang?: Lang;
  /** ISO YYYY-MM-DD or null */ value?: string | null; defaultValue?: string | null;
  onChange?: (value: string | null) => void; placeholder?: string; /** ISO, for tests */ today?: string;
}
export interface CalendarProps { lang?: Lang; selected?: Date; today?: Date; onSelect?: (d?: Date) => void; className?: string }
export interface ThemeScopeProps { container?: HTMLElement | null; dir?: 'ltr' | 'rtl'; children: ReactNode }
export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> { label: ReactNode }
export interface SearchFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** accessible name; visually hidden unless hideLabel=false */ label: string;
  value: string; onClear?: () => void; clearLabel?: string; hideLabel?: boolean;
}
export interface StatusBadgeProps { status: TaskStatus; lang?: Lang; className?: string }
export interface PriorityBadgeProps { priority: TaskPriority; lang?: Lang; className?: string }
export interface DueDateProps { due?: string | null; status?: TaskStatus; lang?: Lang; /** YYYY-MM-DD, defaults to today */ today?: string; className?: string }
export interface AvatarProps { name: string; size?: 'sm' | 'md' | 'lg'; /** set when the avatar stands alone (no visible name) */ label?: string; className?: string }
export interface AvatarStackProps { names: string[]; max?: number; size?: 'sm' | 'md' | 'lg'; label?: string }
export interface MemberChipProps { name: string; owner?: boolean; ownerLabel?: string; onRemove?: () => void; removeLabel?: string; className?: string }
export interface ProjectCardProps {
  name: string; description?: string; href?: string; done?: number; total?: number; overdue?: number;
  members?: string[]; updated?: string; lang?: Lang;
}
export interface StatCardProps { label: string; value: number; icon?: LucideIcon; tone?: 'neutral' | 'todo' | 'progress' | 'done' | 'danger'; hint?: ReactNode; lang?: Lang }
export interface TaskRowProps { task: Task; lang?: Lang; today?: string; canEdit?: boolean; canDelete?: boolean; onEdit?: () => void; onDelete?: () => void }
export interface FilterBarProps {
  lang?: Lang; query?: string; onQuery?: (q: string) => void;
  status?: TaskStatus | 'all'; onStatus?: (s: string) => void;
  priority?: TaskPriority | 'all'; onPriority?: (p: string) => void;
  assignee?: string; onAssignee?: (a: string) => void; members?: string[];
  count: number; total: number; onClear?: () => void;
}
export interface ModalProps {
  open?: boolean; onClose?: () => void; title: ReactNode; children?: ReactNode; footer?: ReactNode; icon?: ReactNode;
  closeLabel?: string; /** static copy for docs; omit in the app */ inline?: boolean; className?: string;
}
export interface ConfirmDialogProps extends Omit<ModalProps, 'footer' | 'icon' | 'onClose'> {
  confirmLabel: string; cancelLabel: string; onConfirm?: () => void; onCancel?: () => void; loading?: boolean; tone?: 'danger' | 'primary';
}
export interface ToastProps { tone?: 'success' | 'error' | 'info'; title: ReactNode; message?: ReactNode; action?: ReactNode; onClose?: () => void; closeLabel?: string; className?: string }
export interface EmptyStateProps { icon?: LucideIcon; title: ReactNode; children?: ReactNode; action?: ReactNode; className?: string }
export interface SkeletonProps { className?: string }
export interface NavbarProps { lang?: Lang; theme?: Theme; onTheme?: () => void; onLang?: () => void; user?: string; current?: string; onNewProject?: () => void }
export interface StatePageProps { kind: 'denied' | 'notFound'; title: ReactNode; children?: ReactNode; actionLabel: string; onAction?: () => void }
export interface MembersManagerProps { lang?: Lang; owner: string; members: string[]; email?: string; error?: ReactNode; adding?: boolean; onEmail?: (v: string) => void; onAdd?: () => void; onRemove?: (name: string) => void }
export interface DangerZoneProps { lang?: Lang; projectName: string; onDelete?: () => void }
export interface TaskFormProps { lang?: Lang; values?: Partial<Task>; errors?: { title?: string; due?: string }; members?: string[]; saving?: boolean; onCancel?: () => void; onSubmit?: () => void; title?: string }
export interface TileBoardProps { className?: string }
export interface PasswordFieldProps { label: ReactNode; value?: string; defaultValue?: string; onChange?: (v: string) => void; showStrength?: boolean; autoComplete?: string; hint?: ReactNode; error?: ReactNode; required?: boolean; disabled?: boolean; lang?: Lang; className?: string }
export interface AuthLayoutProps { lang: Lang; theme: Theme; onTheme: () => void; onLang: () => void; tagline: [string, string]; children: ReactNode }
