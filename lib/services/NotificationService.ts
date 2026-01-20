const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type Notification = {
  id: number;
  titre: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  canal: string;
  lu: boolean;
  luAt: string | null;
  createdAt: string;
  equipement?: any;
  mouvement?: any;
};

export default class NotificationService {

  // 📥 Récupérer mes notifications
 async getMyNotifications(userId: number): Promise<Notification[]> {
    const res = await fetch(`${API_URL}/notifications/user/${userId}`);
    if (!res.ok) throw new Error("Erreur récupération notifications");
    return res.json();
  }

  // 🔔 Compteur non lues (badge)
  async getUnreadCount(userId: number): Promise<{ count: number }> {
    const res = await fetch(`${API_URL}/notifications/user/${userId}/unread/count`);
    if (!res.ok) throw new Error("Erreur compteur notifications");
    return res.json();
  }


  // 👁 Marquer comme lue
  async markAsRead(id: number): Promise<Notification> {
    const res = await fetch(`${API_URL}/notifications/${id}/mark-as-read`, { method: "PUT" });
    if (!res.ok) throw new Error("Erreur marquage comme lu");
    return res.json();
  }
}

