import { getServerSession } from "next-auth";
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { connectDB } from './db';
import { User } from './db/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: '아이디', type: 'text' },
        password: { label: '비밀번호', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('아이디와 비밀번호를 입력해주세요.');
        }

        await connectDB();
        const user = await User.findOne({ username: credentials.username });

        if (!user) {
          throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
        }

        if (!user.isActive) {
          throw new Error('비활성화된 계정입니다.');
        }

        // 마지막 로그인 시간 업데이트
        await User.findByIdAndUpdate(user._id, {
          lastLogin: new Date()
        });

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24시간
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login'
  }
};

export async function auth() {
  const session = await getServerSession();
  return session;
} 