import { NotificationPriority, NotificationCategory } from "@prisma/client";

export interface NotificationPayload {
  userId: string;
  recipient?: string; // Phone number, email address, or device token
  title: string;
  message: string;
  type?: string;
  priority?: NotificationPriority;
  category?: NotificationCategory;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationProvider {
  readonly name: string;
  send(payload: NotificationPayload): Promise<boolean>;
}
