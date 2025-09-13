import Image from "next/image";

export default function ShimmerImage({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 33vw"
      className="object-cover w-full h-full transform transition-all duration-300 hover:scale-105"
      placeholder="blur"
      blurDataURL={`data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><rect width='100%' height='100%' fill='%23e5e7eb'/></svg>`}
    />
  );
}
