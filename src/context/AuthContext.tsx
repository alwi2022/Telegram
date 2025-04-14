// src/context/AuthContext.tsx
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { StreamChat } from "stream-chat";
import * as SecureStore from "expo-secure-store";

const apiKey = process.env.EXPO_PUBLIC_STREAM_API_KEY;

if (!apiKey) {
  throw new Error('Missing Stream API key. Set EXPO_PUBLIC_STREAM_API_KEY in .env file.');
}
const client = StreamChat.getInstance(apiKey);

interface AuthContextType {
  isLogin: boolean;
  setLogin: Dispatch<SetStateAction<boolean>>;
  user: any;
  streamClient: StreamChat;
  login: (token: string, user: any,videoToken: string) => Promise<void>;
  logout: () => Promise<void>; // 👈 Tambahan ini
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLogin, setLogin] = useState(false);
  const [user, setUser] = useState<any>(null);

  const connectStreamUser = async (user: any, token: string) => {
    if (client.user) {
      if (client.user.id === user.id) {
        return; // sudah terhubung dengan user yang sama
      } else {
        await client.disconnectUser(); // beda user, disconnect dulu
      }
    }

    await client.connectUser(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token
    );
  };

  const login = async (token: string, user: any,videoToken:string) => {
    await connectStreamUser(user, token);
    setUser(user);
    setLogin(true);
   
  };


  
  


  useEffect(() => {
    const restoreSession = async () => {
      const token = await SecureStore.getItemAsync("token");
      const storedUser = await SecureStore.getItemAsync("user");

      if (token && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        await connectStreamUser(parsedUser, token);
        setUser(parsedUser);
        setLogin(true);
      }
    };

    restoreSession();
  }, []);

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
    await SecureStore.deleteItemAsync("userId");
  
    if (client.user) {
      await client.disconnectUser();
    }
  
    setUser(null);
    setLogin(false);
  };
  

  return (
    <AuthContext.Provider value={{ isLogin, setLogin, user, streamClient: client, login,logout,  }}>
      {children}
    </AuthContext.Provider>
  );
}
