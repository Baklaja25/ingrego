"use client"

import Image from "next/image"
import { PropsWithChildren } from "react"

const MDXComponents = {
  h1: (props: PropsWithChildren) => <h1 className="mt-10 text-4xl font-bold text-[#1E1E1E]" {...props} />,
  h2: (props: PropsWithChildren) => <h2 className="mt-8 text-3xl font-semibold text-[#FF8C42]" {...props} />,
  h3: (props: PropsWithChildren) => <h3 className="mt-6 text-2xl font-semibold text-[#1E1E1E]" {...props} />,
  p: (props: PropsWithChildren) => (
    <p className="mt-4 text-base leading-relaxed text-[#424242]" {...props} />
  ),
  ul: (props: PropsWithChildren) => <ul className="mt-4 list-disc pl-6 text-[#424242]" {...props} />,
  ol: (props: PropsWithChildren) => <ol className="mt-4 list-decimal pl-6 text-[#424242]" {...props} />,
  li: (props: PropsWithChildren) => <li className="mt-2" {...props} />,
  blockquote: (props: PropsWithChildren) => (
    <blockquote
      className="mt-6 rounded-2xl border-l-4 border-[#FF8C42] bg-[#FBEED7]/60 px-5 py-4 text-[#1E1E1E]"
      {...props}
    />
  ),
  img: (props: any) => {
    const { src = "", alt = "", width, height, className = "", ...rest } = props
    const w = Number(width) || 800
    const h = Number(height) || 450
    return (
      <Image
        src={src}
        alt={alt}
        width={w}
        height={h}
        className={`rounded-xl my-4 ${className}`}
        {...rest}
      />
    )
  },
  a: (props: any) => (
    <a className="text-[#FF8C42] underline decoration-[#FBEED7] underline-offset-4" {...props} />
  ),
}

export default MDXComponents

