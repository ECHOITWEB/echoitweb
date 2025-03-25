#!/usr/bin/env node

/**
 * 서버 시작 스크립트
 * 포트가 이미 사용 중이면 자동으로 다른 포트를 사용합니다.
 */

import { spawn } from 'child_process';
import net from 'net';

// 기본 포트
let port = 3000;
const host = '0.0.0.0';
const MAX_PORT = 3100; // 최대 포트 번호 (너무 높은 포트는 피함)

/**
 * 지정된 포트가 사용 가능한지 확인
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false); // 포트가 사용 중
      } else {
        resolve(false); // 다른 오류
      }
    });
    
    server.once('listening', () => {
      // 포트가 사용 가능하면 서버 닫기
      server.close();
      resolve(true);
    });
    
    server.listen(port, host);
  });
}

/**
 * 사용 가능한 포트 찾기
 */
async function findAvailablePort() {
  while (port <= MAX_PORT) {
    if (await isPortAvailable(port)) {
      return port;
    }
    port++;
  }
  throw new Error('사용 가능한 포트를 찾을 수 없습니다.');
}

/**
 * Next.js 서버 시작
 */
async function startServer() {
  try {
    const availablePort = await findAvailablePort();
    
    console.log(`🔍 사용 가능한 포트 찾음: ${availablePort}`);
    
    // Next.js 서버 시작
    const server = spawn('next', ['start', '-H', host, '-p', availablePort.toString()], {
      stdio: 'inherit',
      shell: true
    });
    
    server.on('error', (error) => {
      console.error('❌ 서버 시작 오류:', error);
      process.exit(1);
    });
    
    process.on('SIGINT', () => {
      console.log('\n👋 서버를 종료합니다...');
      server.kill('SIGINT');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
    process.exit(1);
  }
}

// 서버 시작
startServer(); 