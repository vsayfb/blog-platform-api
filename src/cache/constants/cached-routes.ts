import { AccountRoutes } from 'src/resources/accounts/enums/account-routes';
import { NotificationRoutes } from 'src/resources/account_notifications/enums/notification-routes';
import { BookmarkRoutes } from 'src/resources/bookmarks/enums/bookmark-routes';
import { ChatRoutes } from 'src/resources/chats/enums/chat-routes';
import {
  ACCOUNTS_ROUTE,
  BOOKMARKS_ROUTE,
  CHATS_ROUTE,
  NOTIFICATIONS_ROUTE,
} from 'src/lib/constants';

export const CACHED_ROUTES = {
  CLIENT_ACCOUNT: '/api' + ACCOUNTS_ROUTE + AccountRoutes.CLIENT,
  CLIENT_CHATS: '/api' + CHATS_ROUTE + ChatRoutes.CLIENT,
  CLIENT_NOTIFS: '/api' + NOTIFICATIONS_ROUTE + NotificationRoutes.CLIENT,
  CLIENT_BOOKMARKS: '/api' + BOOKMARKS_ROUTE + BookmarkRoutes.CLIENT,
};
