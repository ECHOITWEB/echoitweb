'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12 bg-gray-50">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <Image
            src="https://ext.same-assets.com/1397033195/831049508.png"
            alt="ECHOIT"
            width={120}
            height={30}
            className="mx-auto"
          />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-echoit-text">페이지를 찾을 수 없습니다</h1>

        <p className="text-gray-600 mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          URL을 확인하시거나 아래 버튼을 클릭하여 메인 페이지로 이동하세요.
        </p>

        <Link
          href="/"
          className="inline-flex items-center px-5 py-2.5 bg-echoit-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          메인 페이지로 돌아가기
        </Link>
      </div>
    </div>
  )
}
