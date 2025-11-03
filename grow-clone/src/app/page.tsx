// app/page.jsx
"use client";
import React from 'react';
// Corrected import path for Navbar component to use the absolute root path
import Navbar from '../../components/Navbar'; 
import { TrendingUp, BarChart3, Users } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// Note: In this environment, we should use a standard <img> tag or a simple div/placeholder
// as the next/image component requires complex Next.js setup, which is not fully available here.

const PageWrapper = ({ children }:any) => {
    return (
        // The outer div and styling are now moved here to be consistent
        <div className="min-h-screen bg-white font-sans">
            {/* 1. Navigation Bar - Constant on every component */}
            <Navbar />
            {children}
        </div>
    );
};



const LandingPage = () => {
  const router = useRouter()

  const navigate = () => {
    router.push('/mutual-funds');
  }
  return (
    // We remove the outer div and just return the PageWrapper, containing all content as children
    <PageWrapper>
      
      {/* 2. Hero Section (Matches the large centered text in the image) */}
      <main className="text-center pt-24 pb-12 px-4 container mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-700 mb-6 leading-tight">
          Groww your wealth
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-10 font-light">
          Built for a Growwing India
        </p>
        
        {/* Get Started Button */}
        <button onClick={navigate} className="bg-[#00D09C] text-white font-semibold text-lg py-3 px-8 rounded-lg shadow-xl hover:bg-[#00BFA5] transition duration-300 transform hover:scale-105">
          Get started
        </button>
      </main>

      {/* 3. Illustration/Background Section */}
      <section className="mt-16 flex justify-center">
        {/* Reverted to standard <img> or placeholder as 'next/image' is not supported */}
        {/* <div className="w-[1440px] max-w-full h-[500px] bg-gray-50 flex items-center justify-center text-gray-400 text-sm overflow-hidden rounded-xl shadow-inner">
            Isometric City Map Illustration Placeholder (image.png)
        </div> */}
        <Image src='/image.png' alt='isometric city map' width={1440} height={500} className="w-7xl h-auto object-cover max-w-full" />
        {/* If you prefer to use a standard image tag: */}
        {/* <img src='/image.png' alt='isometric city map' style={{ width: '1440px', height: '500px' }} className="w-7xl h-auto object-cover max-w-full" /> */}
      </section>

      {/* You would add more sections here (e.g., Features, Testimonials) */}

    </PageWrapper>
  );
};

export default LandingPage;
