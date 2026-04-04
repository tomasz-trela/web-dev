# Plan implementacji czatu WebSocket (React + Socket.IO + shadcn/ui)

## Cel projektu
Zbudować pełnofunkcyjny czat internetowy z wieloma pokojami, pseudonimami, indykatorem pisania, wysyłaniem zdjęć i chmurkami wiadomości — przy użyciu React, Socket.IO, shadcn/ui i dobrych praktyk.

---

## Stack technologiczny

| Warstwa | Technologia |
|---------|------------|
| Frontend | React 18 + Vite + TypeScript |
| UI | shadcn/ui (Button, Input, Dialog, ScrollArea, Avatar, Badge, Tabs, Tooltip, Separator) |
| Styling | Tailwind CSS 3 |
| Real-time | Socket.IO Client 4.x |
| Backend | Node.js + Express + Socket.IO Server 4.x |
| Ikony | lucide-react |

---

## Struktura katalogów

```
chat-app/
├── server/
│   ├── index.ts              # Express + Socket.IO server
│   ├── types.ts              # Wspólne typy (Message, Room, User)
│   └── roomManager.ts        # Logika zarządzania pokojami i użytkownikami
├── src/
│   ├── main.tsx
│   ├── App.tsx               # Router: NickDialog → ChatLayout
│   ├── socket.ts             # Singleton instancji socket.io-client
│   ├── types.ts              # Typy współdzielone z backendem
│   ├── hooks/
│   │   ├── useSocket.ts      # Hook do nasłuchiwania eventów socket
│   │   ├── useChat.ts        # Hook: wiadomości, wysyłanie, typing
│   │   └── useRooms.ts       # Hook: lista pokoi, join/leave
│   ├── components/
│   │   ├── NickDialog.tsx    # Modal z wyborem pseudonimu (shadcn Dialog + Input)
│   │   ├── ChatLayout.tsx    # Główny layout: sidebar + chat area
│   │   ├── Sidebar.tsx       # Lista pokoi + lista użytkowników online
│   │   ├── RoomList.tsx      # Pokoje z Badgami (nieprzeczytane)
│   │   ├── UserList.tsx      # Użytkownicy w pokoju (Avatar + nick)
│   │   ├── ChatArea.tsx      # Obszar wiadomości + input
│   │   ├── MessageBubble.tsx # Chmurka wiadomości (own vs other)
│   │   ├── MessageInput.tsx  # Input + przycisk zdjęcia + wysyłanie
│   │   ├── TypingIndicator.tsx # "{user} is typing..." animacja
│   │   ├── ImagePreview.tsx  # Podgląd zdjęcia przed wysłaniem
│   │   └── SystemMessage.tsx # Komunikaty join/leave
│   └── lib/
│       └── utils.ts          # cn(), formatDate(), etc.
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Fazy implementacji (krok po kroku)

### FAZA 1: Inicjalizacja projektu

```bash
# 1. Scaffold
npm create vite@latest chat-app -- --template react-ts
cd chat-app
npm install

# 2. Tailwind + shadcn
npm install -D tailwindcss @tailwindcss/vite
npx shadcn@latest init
# Wybrać: New York style, Zinc color, CSS variables = yes

# 3. Komponenty shadcn
npx shadcn@latest add button input dialog scroll-area avatar badge tabs tooltip separator card

# 4. Socket.IO
npm install socket.io-client
npm install -D socket.io express cors @types/express

# 5. Dodatkowe
npm install lucide-react date-fns uuid
npm install -D @types/uuid tsx nodemon concurrently
```

**Skrypt dev w package.json:**
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:client": "vite",
    "dev:server": "tsx watch server/index.ts"
  }
}
```

---

### FAZA 2: Backend — Socket.IO Server

**Plik: `server/types.ts`**
```typescript
export interface User {
  id: string;          // socket.id
  nickname: string;
  currentRoom: string;
}

export interface Message {
  id: string;
  type: 'text' | 'image' | 'system';
  content: string;     // tekst lub base64 data URL
  sender: string;      // nickname
  senderId: string;    // socket.id
  room: string;
  timestamp: number;   // Date.now()
}

export interface Room {
  name: string;
  users: Map<string, User>;
  messages: Message[];  // ostatnie N wiadomości (historia)
}
```

**Plik: `server/roomManager.ts`**
- Klasa `RoomManager` ze stanem w pamięci
- Metody: `createRoom(name)`, `joinRoom(socketId, roomName, user)`, `leaveRoom(socketId, roomName)`, `getRoom(name)`, `getRoomList()`, `getUserRooms(socketId)`
- Domyślne pokoje: `["Ogólny", "Technologia", "Random"]`
- Limit historii: ostatnie 100 wiadomości na pokój

**Plik: `server/index.ts`**

Eventy Socket.IO do zaimplementowania:

| Event (client → server) | Opis | Odpowiedź (server → client) |
|--------------------------|------|------------------------------|
| `user:join` | Użytkownik podaje nick | `user:joined` + przypisanie do "Ogólny" |
| `room:join` | Dołączenie do pokoju | `room:joined` (z historią), `room:user-joined` (broadcast) |
| `room:leave` | Opuszczenie pokoju | `room:user-left` (broadcast) |
| `room:list` | Pobranie listy pokoi | `room:list` (nazwy + liczba userów) |
| `room:create` | Tworzenie nowego pokoju | `room:created` (broadcast do wszystkich) |
| `message:send` | Wysłanie wiadomości (text/image) | `message:new` (broadcast do pokoju) |
| `typing:start` | Rozpoczęcie pisania | `typing:update` (broadcast do pokoju, bez sendera) |
| `typing:stop` | Zakończenie pisania | `typing:update` (broadcast) |
| `disconnect` | Rozłączenie | `room:user-left` we wszystkich pokojach |

**Kluczowe decyzje backendu:**
- Użyj `socket.join(roomName)` do zarządzania pokojami Socket.IO
- Wysyłanie zdjęć: akceptuj base64 data URL (max ~5MB), przesyłaj jako `Message` z `type: 'image'`
- Typing debounce: po stronie serwera nie trzeba, klient sam zarządza timeoutem
- Wiadomości systemowe (join/leave) mają `type: 'system'` i `sender: 'System'`

---

### FAZA 3: Frontend — Konfiguracja socketu

**Plik: `src/socket.ts`**
```typescript
import { io, Socket } from 'socket.io-client';

const URL = import.meta.env.DEV ? 'http://localhost:3001' : '/';
export const socket: Socket = io(URL, {
  autoConnect: false,  // łączymy dopiero po podaniu nicku
});
```

---

### FAZA 4: Frontend — Flow użytkownika

**`App.tsx` — Logika główna:**
1. Stan: `nickname: string | null`, `connected: boolean`
2. Jeśli brak nicku → wyświetl `<NickDialog />`
3. Po podaniu nicku → `socket.connect()` + emit `user:join`
4. Po potwierdzeniu → wyświetl `<ChatLayout />`

**`NickDialog.tsx`:**
- shadcn `Dialog` (open, nie zamykalny bez podania nicku)
- shadcn `Input` z walidacją (3-20 znaków, alfanumeryczne + _)
- shadcn `Button` "Dołącz do czatu"
- Opcjonalnie: shadcn `Avatar` z automatycznym generowaniem initialek

---

### FAZA 5: Frontend — Layout czatu

**`ChatLayout.tsx`:**
```
┌──────────────┬──────────────────────────────┐
│              │   Nazwa pokoju + info        │
│  Sidebar     ├──────────────────────────────┤
│  - Pokoje    │                              │
│  - Online    │   Wiadomości (ScrollArea)    │
│  users       │                              │
│              ├──────────────────────────────┤
│              │   TypingIndicator            │
│              │   MessageInput               │
└──────────────┴──────────────────────────────┘
```

- Responsywny: na mobile sidebar jako sheet/drawer
- Użyj stałych proporcji (280px sidebar)

**`Sidebar.tsx`:**
- `RoomList` — każdy pokój to `Button variant="ghost"` z `Badge` (liczba online)
- Przycisk "+" do tworzenia pokoju (shadcn `Dialog` + `Input`)
- `Separator`
- `UserList` — `Avatar` + nick, status online (zielona kropka)

---

### FAZA 6: Frontend — Wiadomości (chmurki)

**`MessageBubble.tsx` — Kluczowy komponent:**

```tsx
// Logika:
const isOwn = message.senderId === mySocketId;
const isSystem = message.type === 'system';

// Klasy Tailwind dla chmurki:
// Own:    ml-auto bg-primary text-primary-foreground rounded-2xl rounded-br-sm
// Other:  mr-auto bg-muted rounded-2xl rounded-bl-sm
// System: mx-auto text-muted-foreground text-sm italic
```

Zawartość chmurki:
- Nagłówek: nick (tylko dla 'other') + czas (date-fns: `format(timestamp, 'HH:mm')`)
- Body: tekst LUB `<img>` dla type='image' (kliknięcie = pełny rozmiar w Dialog)
- Opcjonalny tail (trójkąt CSS)

**Styl chmurki (Tailwind):**
```
Own message:    max-w-[70%] ml-auto px-4 py-2 bg-primary text-primary-foreground rounded-2xl rounded-br-none shadow-sm
Other message:  max-w-[70%] mr-auto px-4 py-2 bg-muted rounded-2xl rounded-bl-none shadow-sm
```

**`SystemMessage.tsx`:**
- Wycentrowane, szare, mniejsze — np. "Adam dołączył do pokoju"

---

### FAZA 7: Frontend — Input i wysyłanie

**`MessageInput.tsx`:**
- shadcn `Input` lub `Textarea` (auto-resize)
- Przycisk wysyłania (lucide `Send` icon) — shadcn `Button`
- Przycisk zdjęcia (lucide `ImagePlus` icon) — ukryty `<input type="file" accept="image/*">`
- Enter = wyślij, Shift+Enter = nowa linia
- Na zmianę tekstu: emit `typing:start`, po 2s bez zmian: emit `typing:stop` (debounce)

**`ImagePreview.tsx`:**
- Po wybraniu pliku: wyświetl miniaturę nad inputem
- Przycisk X do anulowania
- Konwersja na base64: `FileReader.readAsDataURL()`
- Kompresja przed wysłaniem: użyj `<canvas>` do resize max 1024px i quality 0.7

---

### FAZA 8: Frontend — Typing indicator

**`TypingIndicator.tsx`:**
- Nasłuchuje `typing:update` z serwera (lista nicknames piszących użytkowników)
- Wyświetla: "Adam pisze..." / "Adam i Ewa piszą..." / "3 osoby piszą..."
- Animacja: trzy pulsujące kropki (CSS `@keyframes`)
- Umieszczony tuż nad `MessageInput`

**Logika po stronie klienta (hook `useChat`):**
```typescript
const typingTimeout = useRef<NodeJS.Timeout>();

const handleInputChange = (text: string) => {
  setText(text);
  socket.emit('typing:start', { room: currentRoom });
  clearTimeout(typingTimeout.current);
  typingTimeout.current = setTimeout(() => {
    socket.emit('typing:stop', { room: currentRoom });
  }, 2000);
};
```

---

### FAZA 9: Dodatkowe funkcjonalności (bonusy)

3. **Linkowanie URL** — auto-detect linków w tekście, renderuj jako `<a target="_blank">`
4. **Unread badge** — licznik nieprzeczytanych na pokojach w sidebarze
6. **Responsywność** — mobile-first, sidebar jako shadcn `Sheet` na małych ekranach
7. **Autoscroll** — automatyczne przewijanie do dołu przy nowej wiadomości (z przyciskiem "nowe wiadomości" gdy user scrolluje w górę)

---

## Vite proxy config

**`vite.config.ts`:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
      },
    },
  },
});
```

---

## Prompt do wklejenia w Claude Code

```
Zaimplementuj czat WebSocket zgodnie z planem w pliku PLAN_IMPLEMENTACJI_CHAT.md.

Stack: React 18 + Vite + TypeScript, shadcn/ui, Tailwind CSS, Socket.IO, Node.js + Express.

Wymagania:
1. Backend (server/index.ts): Express + Socket.IO z roomManager. Domyślne pokoje: Ogólny, Technologia, Random. Obsługa eventów: user:join, room:join, room:leave, room:create, message:send, typing:start/stop, disconnect. Port 3001.
2. NickDialog: modal shadcn wymuszający podanie pseudonimu (3-20 znaków).
3. ChatLayout: sidebar (280px) z listą pokoi (Badge z liczbą online) + lista userów + obszar czatu.
4. MessageBubble: chmurki — własne wyrównane do prawej (bg-primary, rounded-br-none), obce do lewej (bg-muted, rounded-bl-none). Nick + czas (HH:mm). Obsługa type text/image/system.
5. MessageInput: Enter = wyślij, Shift+Enter = nowa linia. Przycisk zdjęcia z podglądem i kompresją canvas do max 1024px.
6. TypingIndicator: debounce 2s, animowane kropki, "{nick} pisze..."
7. SystemMessage: komunikaty join/leave wycentrowane.
8. Bonusy: dark mode toggle, autoscroll z przyciskiem "nowe wiadomości", unread badge na pokojach, powiadomienie dźwiękowe, emoji, linkowanie URL.

Użyj hooków useSocket, useChat, useRooms. Singleton socket z autoConnect: false. Vite proxy /socket.io → localhost:3001.
Struktura: server/ (backend), src/components/, src/hooks/, src/lib/.
Skrypt dev: concurrently serwer (tsx watch) + vite.
```

---

## Uwagi końcowe

- **Nie używamy bazy danych** — historia wiadomości w pamięci serwera (wystarczające na potrzeby projektu)
- **Bezpieczeństwo**: sanitize wiadomości (XSS), limit rozmiaru zdjęć, rate limiting
- **Testowanie**: otwórz 2-3 karty przeglądarki z różnymi nickami
- **maxHttpBufferSize**: ustaw na ~10MB w konfiguracji Socket.IO dla obsługi zdjęć