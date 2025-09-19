"use client";

import { useParams } from "next/navigation";

export default function Blog() {
  const params = useParams();
  const { id } = params;

  return <h1>Blog Post ID: {id}</h1>;
}
