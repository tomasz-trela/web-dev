import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { User } from '@/types';

interface UserListProps {
  users: User[];
}

export function UserList({ users }: UserListProps) {
  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
        Online — {users.length}
      </h3>
      {users.map((user) => (
        <div key={user.id} className="flex items-center gap-2 px-2 py-1 rounded-md">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs bg-primary/10">
              {user.nickname.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm truncate">{user.nickname}</span>
          <span className="ml-auto h-2 w-2 rounded-full bg-green-500 shrink-0" />
        </div>
      ))}
    </div>
  );
}
