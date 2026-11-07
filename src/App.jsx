import React, { useState, useEffect, useMemo, useRef, Fragment } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Html5Qrcode } from "html5-qrcode";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
const Sa = ({ med, cart, handleAddToCart, onOpenMonograph, viewMode, specialDiscounts, onRequestMedicine, isRequested }) => {
  const cartQty = cart[med.id] || 0;
  const [inputQty, setInputQty] = useState(1);
  const basePrice = Number(med.unit_price || med.price || med.wholesalePrice || 0);
  const oldPrice = Number(med.pack_mrp || med.mrp || 0);
  const discountAmt = Math.max(0, oldPrice - basePrice);
  const discountPercent = oldPrice > 0 && discountAmt > 0
    ? Math.round((discountAmt / oldPrice) * 100)
    : 0;
  const medType = (med.dosageForm || med.dosage_form || (med.type && med.type !== 'Other' && med.type !== 'Medicine' ? med.type : '') || (med.category && med.category !== 'Other' && med.category !== 'Medicine' ? med.category : '') || (med.type && med.type !== 'Other' ? med.type : '') || '').trim();

  if (viewMode === 'list') {
    return (
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 hover:shadow-md transition-shadow relative">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-shrink-0">
            {med.imageUrl ? (
              <img src={med.imageUrl} alt={med.name} className="w-16 h-16 object-cover rounded-lg bg-slate-50 border border-slate-100" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-[#1D2A3B]">{med.name}</h3>
              {medType && (
                <span className="text-[10px] font-bold text-[#0697A8] bg-[#E0F5F7] px-2 py-0.5 rounded-md border border-[#0697A8]/20 leading-none">
                  {medType}
                </span>
              )}
              <button
                onClick={() => onOpenMonograph(med)}
                className="p-1 text-slate-400 hover:text-[#0697A8] hover:bg-[#E0F5F7] rounded-md transition-colors cursor-pointer"
                title="View Medicine Info"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </button>
            </div>
            {med.generic && <p className="text-xs text-slate-500 mt-0.5">{med.generic}</p>}
            {med.manufacturer && <p className="text-xs text-slate-400 mt-0.5">{med.manufacturer}</p>}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {oldPrice > basePrice && (
                <span className="text-xs text-slate-400 font-medium line-through decoration-slate-300">৳{oldPrice.toFixed(2)}</span>
              )}
              <span className="text-xs font-bold text-[#0697A8]">৳{basePrice.toFixed(2)}</span>
              {discountPercent > 0 && (
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-md">
                  {discountPercent}% OFF
                </span>
              )}
              {med.stock > 0 ? (
                <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">In Stock ({med.stock})</span>
              ) : (
                <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">Out of Stock</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0">
          {med.stock > 0 ? (
            cartQty > 0 ? (
              <div className="flex items-center gap-2 bg-[#E0F5F7] rounded-xl px-2.5 py-1 border border-[#0697A8]/20">
                <button onClick={() => handleAddToCart(med, -1)} className="w-6 h-6 rounded-md bg-white text-[#0697A8] shadow-sm flex items-center justify-center font-bold hover:bg-slate-50 cursor-pointer">-</button>
                <input
                  type="number"
                  min="1"
                  max={med.stock}
                  value={cartQty}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) {
                      handleAddToCart(med, Math.min(med.stock, Math.max(0, val)) - cartQty);
                    }
                  }}
                  className="w-10 text-center font-bold text-[#0697A8] text-xs bg-transparent focus:outline-none focus:bg-white rounded"
                />
                <button onClick={() => handleAddToCart(med, 1)} className="w-6 h-6 rounded-md bg-white text-[#0697A8] shadow-sm flex items-center justify-center font-bold hover:bg-slate-50 cursor-pointer" disabled={cartQty >= med.stock}>+</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="number"
                  min="1"
                  max={med.stock}
                  value={inputQty}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setInputQty(isNaN(val) ? 1 : Math.max(1, Math.min(med.stock, val)));
                  }}
                  className="w-16 h-9 px-2 text-center text-xs font-bold text-[#1D2A3B] bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#0697A8]"
                  title="Enter Quantity"
                />
                <button onClick={() => handleAddToCart(med, inputQty)} className="flex-1 sm:flex-none px-4 py-2 bg-[#0697A8] text-white rounded-xl text-xs font-bold hover:bg-[#057A88] transition-colors shadow-sm shadow-[#0697A8]/20 flex items-center gap-1.5 cursor-pointer">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  Add
                </button>
              </div>
            )
          ) : (
            <button
              type="button"
              onClick={() => onRequestMedicine && onRequestMedicine(med)}
              disabled={isRequested}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${isRequested
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 cursor-default'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm shadow-amber-500/20 active:scale-95'
                }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {isRequested ? 'Requested ✓' : 'Request'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-3.5 md:p-4 rounded-2xl border border-slate-200 hover:shadow-xl hover:shadow-[#0697A8]/5 transition-all duration-300 group flex flex-col h-full relative">
      {cartQty > 0 && (
        <div className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-[#0697A8] text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-md z-20">
          {cartQty}
        </div>
      )}
      <div className="relative mb-3 flex-shrink-0">
        <div className="aspect-square bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-100 overflow-hidden flex items-center justify-center group-hover:border-[#0697A8]/20 transition-colors">
          {med.imageUrl ? (
            <img src={med.imageUrl} alt={med.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <svg className="w-12 h-12 text-slate-300 group-hover:text-[#0697A8]/40 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
          )}
        </div>

        {/* Stock Badge on Top-Left */}
        {med.stock > 0 ? (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-100 shadow-sm">
            <span className="text-[10px] font-bold text-green-600 block leading-tight">Stock: {med.stock}</span>
          </div>
        ) : (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-500/90 backdrop-blur-sm rounded-lg shadow-sm">
            <span className="text-[10px] font-bold text-white block leading-tight">Out of Stock</span>
          </div>
        )}

        {/* Discount Badge on Bottom-Left of Image */}
        {discountPercent > 0 && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-emerald-600 text-white rounded-lg shadow-sm text-[10px] font-extrabold tracking-tight flex items-center gap-0.5 z-10">
            <span>{discountPercent}% OFF</span>
          </div>
        )}

        {/* Info Icon Button on Top-Right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenMonograph(med);
          }}
          className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-slate-500 hover:text-[#0697A8] rounded-lg shadow-sm border border-slate-100 backdrop-blur-sm transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
          title="View Medicine Details"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        <h3 className="font-bold text-[#1D2A3B] text-sm line-clamp-2 leading-snug group-hover:text-[#0697A8] transition-colors">{med.name}</h3>
        {med.generic && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{med.generic}</p>}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {medType && (
            <span className="text-[10px] font-bold text-[#0697A8] bg-[#E0F5F7] px-1.5 py-0.5 rounded-md border border-[#0697A8]/20 leading-none">
              {medType}
            </span>
          )}
          {med.manufacturer && (
            <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100 leading-none line-clamp-1" title={med.manufacturer}>
              {med.manufacturer}
            </span>
          )}
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="flex flex-col">
            {oldPrice > basePrice && (
              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                <span className="text-[11px] text-slate-400 font-medium line-through decoration-slate-300">৳{oldPrice.toFixed(2)}</span>
                {discountPercent > 0 && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded-md leading-none">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
            )}
            <span className="text-base md:text-lg font-black text-[#0697A8] leading-none tracking-tight">৳{basePrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Quantity Field + Add Button */}
        <div className="mt-3 flex gap-2 items-center">
          {med.stock > 0 ? (
            cartQty > 0 ? (
              <div className="w-full flex items-center justify-between bg-[#E0F5F7] rounded-xl px-1.5 py-0.5 border border-[#0697A8]/20">
                <button
                  onClick={() => handleAddToCart(med, -1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#0697A8] hover:bg-white/80 transition-colors font-bold text-base cursor-pointer"
                >
                  -
                </button>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max={med.stock}
                    value={cartQty}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) {
                        handleAddToCart(med, Math.min(med.stock, Math.max(0, val)) - cartQty);
                      }
                    }}
                    className="w-10 text-center font-bold text-[#0697A8] text-xs bg-transparent focus:outline-none focus:bg-white rounded py-0.5"
                  />
                  <span className="text-[9px] text-[#0697A8]/70 font-semibold hidden sm:inline">in cart</span>
                </div>
                <button
                  onClick={() => handleAddToCart(med, 1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#0697A8] hover:bg-white/80 transition-colors font-bold text-base cursor-pointer disabled:opacity-40"
                  disabled={cartQty >= med.stock}
                >
                  +
                </button>
              </div>
            ) : (
              <>
                <div className="w-14 sm:w-16 flex-shrink-0">
                  <input
                    type="number"
                    min="1"
                    max={med.stock}
                    value={inputQty}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setInputQty(isNaN(val) ? 1 : Math.max(1, Math.min(med.stock, val)));
                    }}
                    className="w-full h-8 sm:h-9 px-1 text-center text-xs font-bold text-[#1D2A3B] bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#0697A8] focus:ring-1 focus:ring-[#0697A8] transition-all"
                    title="Enter quantity to add"
                  />
                </div>
                <button
                  onClick={() => handleAddToCart(med, inputQty)}
                  className="flex-1 h-8 sm:h-9 bg-[#0697A8] hover:bg-[#057A88] text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-[#0697A8]/20 flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add
                </button>
              </>
            )
          ) : (
            <button
              type="button"
              onClick={() => onRequestMedicine && onRequestMedicine(med)}
              disabled={isRequested}
              className={`w-full h-8 sm:h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${isRequested
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 cursor-default'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm shadow-amber-500/20 active:scale-95'
                }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {isRequested ? 'Requested ✓' : 'Request'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductSkeleton = ({ viewMode = "grid" }) => {
  if (viewMode === "list") {
    return (
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-16 h-16 rounded-lg bg-slate-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-36 bg-slate-200 rounded" />
            <div className="h-3 w-28 bg-slate-100 rounded" />
            <div className="h-3 w-20 bg-slate-100 rounded" />
            <div className="flex gap-2 pt-1">
              <div className="h-4 w-14 bg-slate-200 rounded" />
              <div className="h-4 w-16 bg-slate-100 rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto mt-3 sm:mt-0">
          <div className="h-9 w-20 bg-slate-100 rounded-xl" />
          <div className="h-9 w-24 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col h-full animate-pulse">
      <div className="aspect-square bg-slate-200 rounded-xl mb-3 w-full" />
      <div className="flex-1 flex flex-col space-y-2">
        <div className="h-4 w-3/4 bg-slate-200 rounded" />
        <div className="h-3 w-1/2 bg-slate-100 rounded" />
        <div className="h-3 w-1/3 bg-slate-100 rounded" />
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-3 w-12 bg-slate-100 rounded" />
            <div className="h-5 w-16 bg-slate-200 rounded" />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="w-9 h-9 rounded-xl bg-slate-100" />
          <div className="flex-1 h-9 rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
};


import slider1 from "./assets/sliders/MedEasy-26.webp";
import slider2 from "./assets/sliders/Medeasy-website-slider-for-innsaei.webp";

const ProductSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slides = [slider1, slider2];

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const handleTouchStart = e => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = e => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 40;
    if (distance > minSwipeDistance) {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    } else if (distance < -minSwipeDistance) {
      setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div
      className="relative w-full mb-5 overflow-hidden rounded-2xl md:rounded-3xl shadow-sm border border-slate-200/80 bg-slate-100 group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative aspect-[2.7/1] sm:aspect-[2.9/1] md:aspect-[3.5/1] lg:aspect-[4/1] min-h-[125px] w-full overflow-hidden">
        <div
          className="flex h-full w-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, idx) => (
            <div key={idx} className="w-full min-w-full h-full flex-shrink-0 relative overflow-hidden bg-slate-50">
              <img
                src={slide}
                alt={`Banner slide ${idx + 1}`}
                className="w-full h-full object-cover object-center"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md z-10 hover:scale-105 active:scale-95"
        title="Previous Slide"
      >
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md z-10 hover:scale-105 active:scale-95"
        title="Next Slide"
      >
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-2.5 md:bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 md:gap-2 bg-black/40 px-3 py-1 md:px-3.5 md:py-1.5 rounded-full backdrop-blur-md z-10 shadow-sm">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${idx === currentSlide ? "w-5 md:w-6 h-1.5 md:h-2 bg-[#0697A8]" : "w-1.5 md:w-2 h-1.5 md:h-2 bg-white/60 hover:bg-white"
              }`}
          />
        ))}
      </div>
    </div>
  );
};

import { supabase } from "./supabaseClient";
import "./App.css";
import logoUrl from "./assets/Logo New.png";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Supabase Cloud Backup Helpers (with IndexedDB fallback for offline capability)
const IDB_DB_NAME = 'DGPharmaBackups';
const IDB_STORE_NAME = 'backups';
const IDB_VERSION = 1;
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_DB_NAME, IDB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

const getBackups = async () => {
  try {
    const { data, error } = await supabase
      .from('database_backups')
      .select('id, created_at, backup_type, total_records, tables_summary, backup_data')
      .order('created_at', { ascending: false })
      .limit(30);

    if (!error && data && data.length > 0) {
      return data.map(b => {
        const tables = b.backup_data?.tables || {};
        const summary = b.tables_summary || b.backup_data?.summary || {
          medicines: (tables.medicines || b.backup_data?.medicines || []).length,
          orders: (tables.orders || b.backup_data?.orders || []).length,
          order_items: (tables.order_items || []).length,
          buyers: (tables.buyers || b.backup_data?.buyers || []).length,
          admin_users: (tables.admin_users || []).length,
          admin_roles: (tables.admin_roles || []).length,
          delivery_men: (tables.delivery_men || []).length,
          coupons: (tables.coupons || []).length,
          special_discounts: (tables.special_discounts || []).length,
          medicine_requests: (tables.medicine_requests || []).length,
          auth_users: (tables.auth_users || []).length
        };
        const meds = tables.medicines || b.backup_data?.medicines || (Array.isArray(b.backup_data) ? b.backup_data : []);
        return {
          id: b.id,
          timestamp: new Date(b.created_at).getTime(),
          date: new Date(b.created_at).toLocaleString(),
          type: b.backup_type || 'automated',
          itemCount: b.total_records || meds.length,
          summary: summary,
          tables: tables,
          data: meds,
          fullData: b.backup_data
        };
      });
    }
  } catch (cloudErr) {
    console.warn("Supabase backup fetch failed, falling back to local DB:", cloudErr);
  }

  // Fallback to local IndexedDB
  try {
    const db = await openDB();
    const tx = db.transaction(IDB_STORE_NAME, 'readonly');
    const store = tx.objectStore(IDB_STORE_NAME);
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result || []).map(r => ({ ...r, type: r.type || 'local' })).sort((a, b) => b.timestamp - a.timestamp));
      req.onerror = () => resolve([]);
    });
  } catch (err) {
    return [];
  }
};

const saveBackup = async (data) => {
  // 1. Try calling the Supabase RPC if available
  try {
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('generate_database_backup', { b_type: 'manual' });
    if (!rpcErr && rpcRes) {
      return rpcRes;
    }
  } catch (e) {
    console.warn("RPC generate_database_backup unavailable, attempting direct insert...", e);
  }

  // 2. Direct insert into Supabase database_backups
  try {
    const backupPayload = {
      timestamp: new Date().toISOString(),
      backup_type: 'manual',
      total_medicines: (data || []).length,
      medicines: data || []
    };
    const { data: inserted, error: insertErr } = await supabase
      .from('database_backups')
      .insert([{
        backup_type: 'manual',
        total_records: (data || []).length,
        backup_data: backupPayload
      }])
      .select()
      .single();

    if (!insertErr && inserted) {
      return inserted;
    }
  } catch (insertError) {
    console.warn("Supabase direct insert failed, falling back to IndexedDB:", insertError);
  }

  // 3. Fallback: Local IndexedDB
  const db = await openDB();
  const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
  const store = tx.objectStore(IDB_STORE_NAME);
  const id = new Date().toISOString();
  const backup = {
    id,
    timestamp: Date.now(),
    date: new Date().toLocaleString(),
    type: 'local',
    data: data,
    itemCount: (data || []).length
  };
  await new Promise((resolve, reject) => {
    const req = store.put(backup);
    req.onsuccess = resolve;
    req.onerror = () => reject(req.error);
  });
  return backup;
};

const deleteBackup = async (id) => {
  try {
    await supabase.from('database_backups').delete().eq('id', id);
  } catch (e) {
    console.warn("Could not delete from Supabase, trying local IndexedDB:", e);
  }
  try {
    const db = await openDB();
    const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
    const store = tx.objectStore(IDB_STORE_NAME);
    await new Promise((resolve) => {
      const req = store.delete(id);
      req.onsuccess = resolve;
      req.onerror = resolve;
    });
  } catch (e) {
    // ignore
  }
};

const BACKUP_TABLE_CATEGORIES = [
  {
    key: 'medicines',
    label: 'Medicines & Inventory',
    tables: ['medicines'],
    desc: 'Catalog, stock levels, wholesale prices, MRP & images',
    icon: '💊',
    getCount: (s) => `${Number(s.medicines ?? 0).toLocaleString()} SKUs`
  },
  {
    key: 'orders',
    label: 'Orders & Order Items',
    tables: ['orders', 'order_items'],
    desc: 'Customer orders and order line item details',
    icon: '📦',
    getCount: (s) => `${Number(s.orders ?? 0).toLocaleString()} orders (${Number(s.order_items ?? 0).toLocaleString()} items)`
  },
  {
    key: 'buyers',
    label: 'Buyers & Pharmacies',
    tables: ['buyers'],
    desc: 'Registered pharmacy client profiles & licenses',
    icon: '🏥',
    getCount: (s) => `${Number(s.buyers ?? 0).toLocaleString()} pharmacies`
  },
  {
    key: 'staff_roles',
    label: 'Admin Staff & Roles',
    tables: ['admin_users', 'admin_roles'],
    desc: 'Admin users, staff members & RBAC permission matrices',
    icon: '👥',
    getCount: (s) => `${Number(s.admin_users ?? 0).toLocaleString()} staff (${Number(s.admin_roles ?? 0).toLocaleString()} roles)`
  },
  {
    key: 'delivery_men',
    label: 'Delivery Personnel',
    tables: ['delivery_men'],
    desc: 'Delivery couriers and their assigned zones',
    icon: '🚚',
    getCount: (s) => `${Number(s.delivery_men ?? 0).toLocaleString()} couriers`
  },
  {
    key: 'discounts_coupons',
    label: 'Coupons & Special Discounts',
    tables: ['coupons', 'special_discounts'],
    desc: 'Promotional discount coupons & custom medicine rates',
    icon: '🏷️',
    getCount: (s) => `${Number(s.coupons ?? 0).toLocaleString()} coupons, ${Number(s.special_discounts ?? 0).toLocaleString()} discounts`
  },
  {
    key: 'medicine_requests',
    label: 'Medicine Requests',
    tables: ['medicine_requests'],
    desc: 'Buyer inquiries for out-of-stock and custom medicines',
    icon: '📝',
    getCount: (s) => `${Number(s.medicine_requests ?? 0).toLocaleString()} requests`
  },
  {
    key: 'auth_users',
    label: 'Auth User Accounts',
    tables: ['auth_users'],
    desc: 'Supabase authentication credentials, emails & metadata',
    icon: '🔑',
    getCount: (s) => `${Number(s.auth_users ?? 0).toLocaleString()} accounts`
  }
];
const _a = [{
  id: `DG-2026-0000`,
  buyerName: `Care & Cure Pharmacy Ltd.`,
  buyerAddress: `House #12, Road #4, Block-D, Banani, Dhaka - 1213`,
  addressLine1: `House #12, Road #4`,
  addressLine2: `Block-D`,
  city: `Banani`,
  division: `Dhaka`,
  postalCode: `1213`,
  location: `House #12, Road #4, Block-D, Banani, Dhaka - 1213`,
  phone: `+8801711223344`,
  date: `2026-06-15`,
  totalAmount: 1845.5,
  itemCount: 4,
  status: `Delivered & Invoiced`,
  paymentStatus: `Paid`,
  paymentMethod: `Credit Limit`,
  items: [{
    id: `MED-001`,
    name: `Amoxicillin 500mg`,
    quantity: 50,
    price: 18.5
  }, {
    id: `MED-003`,
    name: `Seclo 20mg`,
    quantity: 40,
    price: 14
  }, {
    id: `MED-005`,
    name: `Atova 10mg`,
    quantity: 10,
    price: 22
  }, {
    id: `MED-007`,
    name: `Ace 500mg`,
    quantity: 23,
    price: 6.5
  }]
}, {
  id: `DG-2026-0001`,
  buyerName: `Care & Cure Pharmacy Ltd.`,
  buyerAddress: `House #12, Road #4, Block-D, Banani, Dhaka - 1213`,
  addressLine1: `House #12, Road #4`,
  addressLine2: `Block-D`,
  city: `Banani`,
  division: `Dhaka`,
  postalCode: `1213`,
  location: `House #12, Road #4, Block-D, Banani, Dhaka - 1213`,
  phone: `+8801711223344`,
  date: `2026-06-17`,
  totalAmount: 935,
  itemCount: 2,
  status: `Out for Delivery`,
  paymentStatus: `Paid`,
  paymentMethod: `Bank Transfer`,
  items: [{
    id: `MED-002`,
    name: `Napa Extend 665mg`,
    quantity: 100,
    price: 8.2
  }, {
    id: `MED-006`,
    name: `Pantocid 40mg`,
    quantity: 10,
    price: 11.2
  }]
}, {
  id: `DG-2026-0002`,
  buyerName: `Care & Cure Pharmacy Ltd.`,
  buyerAddress: `House #12, Road #4, Block-D, Banani, Dhaka - 1213`,
  addressLine1: `House #12, Road #4`,
  addressLine2: `Block-D`,
  city: `Banani`,
  division: `Dhaka`,
  postalCode: `1213`,
  location: `House #12, Road #4, Block-D, Banani, Dhaka - 1213`,
  phone: `+8801711223344`,
  date: `2026-06-18`,
  totalAmount: 640,
  itemCount: 1,
  status: `Pending Verification`,
  paymentStatus: `Pending`,
  paymentMethod: `Credit Limit`,
  items: [{
    id: `MED-008`,
    name: `Azithrocin 500mg`,
    quantity: 20,
    price: 32
  }]
}, {
  id: `DG-2026-0003`,
  buyerName: `Care & Cure Pharmacy Ltd.`,
  buyerAddress: `House #12, Road #4, Block-D, Banani, Dhaka - 1213`,
  addressLine1: `House #12, Road #4`,
  addressLine2: `Block-D`,
  city: `Banani`,
  division: `Dhaka`,
  postalCode: `1213`,
  location: `House #12, Road #4, Block-D, Banani, Dhaka - 1213`,
  phone: `+8801711223344`,
  date: `2026-06-19`,
  totalAmount: 450,
  itemCount: 1,
  status: `Return Requested`,
  paymentStatus: `Paid`,
  paymentMethod: `Credit Limit`,
  returnReason: `Damaged outer packaging / seal broken during transport`,
  returnRefund: 450,
  returnItemsCount: 10,
  returnDate: `2026-06-20`,
  items: [{
    id: `MED-003`,
    name: `Seclo 20mg`,
    quantity: 10,
    price: 45
  }]
}];
const va = [{
  date: `2026-06-01`,
  ref: `BAL-FORWARD`,
  desc: `Opening Balance Forward`,
  debit: 0,
  credit: 0,
  balance: 12450,
  type: `System`
}, {
  date: `2026-06-05`,
  ref: `INV-2026-0811`,
  desc: `Purchase Order DG-2026-0003`,
  debit: 4800,
  credit: 0,
  balance: 17250,
  type: `Invoice`
}, {
  date: `2026-06-08`,
  ref: `PAY-2026-1049`,
  desc: `Bank Wire Payment - Ref #7729`,
  debit: 0,
  credit: 6e3,
  balance: 11250,
  type: `Payment`
}, {
  date: `2026-06-15`,
  ref: `INV-2026-0899`,
  desc: `Purchase Order DG-2026-0000`,
  debit: 1845.5,
  credit: 0,
  balance: 13095.5,
  type: `Invoice`
}, {
  date: `2026-06-16`,
  ref: `CRN-2026-0044`,
  desc: `Credit Note - Expiry Refund (Seclo batch SEC-99)`,
  debit: 0,
  credit: 450,
  balance: 12645.5,
  type: `Refund`
}, {
  date: `2026-06-18`,
  ref: `INV-2026-0940`,
  desc: `Purchase Order DG-2026-0002`,
  debit: 640,
  credit: 0,
  balance: 13285.5,
  type: `Invoice`
}];
const ya = [];
const ba = [];
const Ca = [];

const getFullAddress = (obj) => {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  const line1 = obj.addressLine1 || '';
  const line2 = obj.addressLine2 || '';
  const city = obj.city || '';
  const division = obj.division || '';
  const postal = obj.postalCode ? `${obj.postalCode}` : '';

  const parts = [];
  if (line1) parts.push(line1);
  if (line2) parts.push(line2);
  if (city) parts.push(city);
  if (division && postal) {
    parts.push(`${division} - ${postal}`);
  } else if (division) {
    parts.push(division);
  } else if (postal) {
    parts.push(postal);
  }

  if (parts.length > 0) return parts.join(', ');
  return obj.buyerAddress || obj.address || obj.location || 'House #12, Road #4, Block-D, Banani, Dhaka - 1213';
};

// Determines which delivery zone a city/address belongs to
const getDeliveryZone = (cityOrAddress) => {
  const c = (cityOrAddress || '').toLowerCase().trim();
  if (c.includes('gazipur') || c.includes('tongi') || c.includes('joydebpur') || c.includes('kaliakair') || c.includes('kaliganj') || c.includes('kapasia') || c.includes('sreepur')) return 'Gazipur';
  if (c.includes('dhaka') || c.includes('dhanmondi') || c.includes('mirpur') || c.includes('uttara') || c.includes('gulshan') || c.includes('mohammadpur') || c.includes('tejgaon') || c.includes('banani') || c.includes('motijheel') || c.includes('jatrabari') || c.includes('badda') || c.includes('rampura') || c.includes('khilgaon') || c.includes('demra') || c.includes('keraniganj') || c.includes('savar') || c.includes('narayanganj')) return 'Dhaka';
  return null;
};

// ============================================================================
// RBAC & PERMISSION CATALOG
// ============================================================================
const ADMIN_PERMISSION_CATEGORIES = [
  {
    category: 'Buyer Approvals',
    description: 'Buyer pharmacy license verification and registration',
    permissions: [
      { key: 'approvals.view', label: 'View Pending Buyers', desc: 'View pending/approved/rejected buyer profiles & drug license PDFs' },
      { key: 'approvals.action', label: 'Approve / Reject Buyers', desc: 'Approve or reject buyer registration applications' },
      { key: 'approvals.delete', label: 'Delete Buyer Accounts', desc: 'Permanently remove buyer profiles and data' }
    ]
  },
  {
    category: 'Orders & Fulfillment',
    description: 'Order processing, packing, delivery, and returns',
    permissions: [
      { key: 'orders.view', label: 'View Orders & Invoices', desc: 'View all orders, customer details, and invoices' },
      { key: 'orders.status', label: 'Update Order Status', desc: 'Advance order stages (Processing, Out for Delivery, Delivered)' },
      { key: 'orders.edit', label: 'Edit Order Items', desc: 'Modify item quantities before dispatch verification' },
      { key: 'orders.returns', label: 'Manage Returns', desc: 'Review and approve customer returned items' }
    ]
  },
  {
    category: 'Medicine Requests',
    description: 'Out-of-stock and custom medicine requests from buyers',
    permissions: [
      { key: 'requests.view', label: 'View Requested Medicines', desc: 'View catalog medicine requests from buyers' },
      { key: 'requests.action', label: 'Procurement & Restock', desc: 'Mark requests as In Procurement or Restocked' }
    ]
  },
  {
    category: 'Inventory & Pricing',
    description: 'Catalog products, stock counts, trade pricing, and MOQs',
    permissions: [
      { key: 'inventory.view', label: 'View Inventory', desc: 'Browse full medicine inventory and stock levels' },
      { key: 'inventory.edit_name', label: 'Edit Product Name', desc: 'Edit medicine and product names directly in the inventory table' },
      { key: 'inventory.stock', label: 'Update Stock Levels', desc: 'Edit stock quantities directly in catalog' },
      { key: 'inventory.pricing', label: 'Update Prices', desc: 'Modify wholesale price, buying price, and pack MRP' },
      { key: 'inventory.moq', label: 'Update MOQ', desc: 'Set Minimum Order Quantities per medicine' },
      { key: 'inventory.manage', label: 'Add / Delete Medicines', desc: 'Add new products or delete catalog items' },
      { key: 'inventory.bulk_rules', label: 'Bulk Pricing Rules', desc: 'Configure global markup percentage rules' }
    ]
  },
  {
    category: 'Stock-out Products',
    description: 'Zero-stock inventory monitoring and replenishment',
    permissions: [
      { key: 'stockout.view', label: 'View Stock-out Products', desc: 'Inspect products with zero remaining stock' },
      { key: 'stockout.restock', label: 'Quick Restock', desc: 'Replenish stock for out-of-stock products' }
    ]
  },
  {
    category: 'Delivery Zones',
    description: 'Dhaka and Gazipur zones and delivery personnel',
    permissions: [
      { key: 'deliveryzones.view', label: 'View Delivery Zones', desc: 'Inspect zone order statistics and deliveries' },
      { key: 'deliveryzones.manage', label: 'Manage Delivery Personnel', desc: 'Add, edit, or remove delivery representatives' }
    ]
  },
  {
    category: 'Discounts & Coupons',
    description: 'Promotions, coupon codes, and company discounts',
    permissions: [
      { key: 'discounts.manage', label: 'Manage Special Discounts', desc: 'Create and remove product-level discounts' },
      { key: 'coupons.manage', label: 'Manage Coupons', desc: 'Create and delete promotional discount coupons' }
    ]
  },
  {
    category: 'Operations & Audit',
    description: 'Scanning, reports, backup, and activity logging',
    permissions: [
      { key: 'barcode.scan', label: 'Barcode Scanner', desc: 'Access camera scanner to verify invoice barcodes' },
      { key: 'analytics.view', label: 'View Analytics', desc: 'View revenue charts and turnaround metrics' },
      { key: 'backup.manage', label: 'Backup & Restore', desc: 'Export and restore JSON database backups' },
      { key: 'activity_log.view', label: 'View Activity Log', desc: 'Access audit trail of all staff and admin actions' }
    ]
  },
  {
    category: 'Administration & Staff',
    description: 'Staff accounts, role creation, and permission configuration',
    permissions: [
      { key: 'roles.manage', label: 'Manage Roles', desc: 'Create, edit, and configure custom roles' },
      { key: 'users.manage', label: 'Manage Staff Users', desc: 'Create, edit, and manage sub-admin user accounts' }
    ]
  }
];

const ALL_PERMISSION_KEYS = ADMIN_PERMISSION_CATEGORIES.flatMap(c => c.permissions.map(p => p.key));

const DEFAULT_ADMIN_ROLES = [
  {
    id: 'role-super-admin',
    name: 'Super Administrator',
    description: 'Unrestricted master access across the entire pharmacy management system.',
    permissions: ALL_PERMISSION_KEYS,
    is_system: true
  },
  {
    id: 'role-order-manager',
    name: 'Order & Delivery Dispatcher',
    description: 'Manages order verification, packing, returns, and delivery personnel assignments.',
    permissions: [
      'orders.view', 'orders.status', 'orders.edit', 'orders.returns',
      'deliveryzones.view', 'deliveryzones.manage',
      'barcode.scan', 'activity_log.view'
    ],
    is_system: false
  },
  {
    id: 'role-inventory-manager',
    name: 'Inventory & Pricing Manager',
    description: 'Manages medicine stock, trade prices, pack MRPs, MOQs, and promotional discounts.',
    permissions: [
      'inventory.view', 'inventory.edit_name', 'inventory.stock', 'inventory.pricing', 'inventory.moq', 'inventory.manage', 'inventory.bulk_rules',
      'stockout.view', 'stockout.restock',
      'discounts.manage', 'requests.view', 'requests.action',
      'activity_log.view'
    ],
    is_system: false
  },
  {
    id: 'role-compliance-agent',
    name: 'Compliance & Onboarding Agent',
    description: 'Verifies buyer drug licenses, approves registrations, and reviews medicine requests.',
    permissions: [
      'approvals.view', 'approvals.action',
      'requests.view', 'requests.action',
      'activity_log.view'
    ],
    is_system: false
  }
];

const LocationMarker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position} icon={defaultIcon}></Marker>
  );
};

const AdminAnalytics = ({ inventory, orders, returns }) => {
  const totalStock = useMemo(() => inventory.reduce((s, i) => s + (i.stock || 0), 0), [inventory]);
  const totalSell = useMemo(() => orders.filter(o => o.status !== `Cancelled`).reduce((s, o) => s + (o.totalAmount || 0), 0), [orders]);
  const totalReturns = useMemo(() => (returns || []).filter(r => r.type === `Refund`).reduce((s, r) => s + (r.credit || 0), 0), [returns]);
  const totalOrders = orders.length;

  const defaultFrom = () => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0]; };
  const defaultTo = () => new Date().toISOString().split('T')[0];

  const [c1From, setC1From] = useState(defaultFrom);
  const [c1To, setC1To] = useState(defaultTo);
  const [c1Gran, setC1Gran] = useState('Daily');
  const [c2From, setC2From] = useState(defaultFrom);
  const [c2To, setC2To] = useState(defaultTo);
  const [c2Gran, setC2Gran] = useState('Daily');
  const [c3From, setC3From] = useState(defaultFrom);
  const [c3To, setC3To] = useState(defaultTo);
  const [c3Gran, setC3Gran] = useState('Daily');
  // Tables state: Top Buyers, Most Popular, Less Popular, Most Returned
  const [tbFrom, setTbFrom] = useState(defaultFrom);
  const [tbTo, setTbTo] = useState(defaultTo);
  const [tbGran, setTbGran] = useState('Monthly');
  const [tbLimit, setTbLimit] = useState(10);
  const [tbPage, setTbPage] = useState(1);

  const [mpFrom, setMpFrom] = useState(defaultFrom);
  const [mpTo, setMpTo] = useState(defaultTo);
  const [mpGran, setMpGran] = useState('Monthly');
  const [mpLimit, setMpLimit] = useState(10);
  const [mpPage, setMpPage] = useState(1);

  const [lpFrom, setLpFrom] = useState(defaultFrom);
  const [lpTo, setLpTo] = useState(defaultTo);
  const [lpGran, setLpGran] = useState('Monthly');
  const [lpLimit, setLpLimit] = useState(10);
  const [lpPage, setLpPage] = useState(1);

  const [mrFrom, setMrFrom] = useState(defaultFrom);
  const [mrTo, setMrTo] = useState(defaultTo);
  const [mrGran, setMrGran] = useState('Monthly');
  const [mrLimit, setMrLimit] = useState(10);
  const [mrPage, setMrPage] = useState(1);

  const inventoryMap = useMemo(() => {
    const map = {};
    inventory.forEach(item => { map[item.name] = item; });
    return map;
  }, [inventory]);

  const getBucketInfo = (dateStr, from, to, gran) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const start = new Date(from);
    const end = new Date(to); end.setHours(23, 59, 59, 999);
    if (d < start || d > end) return null;
    let label = '', sortKey = 0;
    if (gran === 'Daily') {
      label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      sortKey = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    } else if (gran === 'Weekly') {
      const fy = new Date(d.getFullYear(), 0, 1);
      const wn = Math.ceil(((d - fy) / 86400000 + fy.getDay() + 1) / 7);
      label = `W${wn}, ${d.getFullYear()}`; sortKey = d.getFullYear() * 100 + wn;
    } else if (gran === 'Monthly') {
      label = d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
      sortKey = d.getFullYear() * 100 + d.getMonth();
    }
    return { label, sortKey };
  };

  const filterByRange = (from, to) => {
    const start = new Date(from); const end = new Date(to); end.setHours(23, 59, 59, 999);
    return orders.filter(o => { if (!o.date) return false; const d = new Date(o.date); return !isNaN(d.getTime()) && d >= start && d <= end; });
  };

  const stockSoldCapitalData = useMemo(() => {
    const buckets = {};
    orders.forEach(order => {
      if (!order.date || order.status === 'Cancelled') return;
      const info = getBucketInfo(order.date, c1From, c1To, c1Gran);
      if (!info) return;
      if (!buckets[info.sortKey]) buckets[info.sortKey] = { date: info.label, sortKey: info.sortKey, 'Sold Amount': 0 };
      (order.items || []).forEach(item => {
        const q = Number(item.quantity) || 0;
        const p = Number(item.price) || 0;
        buckets[info.sortKey]['Sold Amount'] += (item.total_price ? Number(item.total_price) : q * p);
      });
    });
    // Stock Amount calculated using Unit Price (wholesalePrice / unit_price) * stock
    const totalStockVal = inventory.reduce((s, i) => {
      const unitPrice = Number(i.wholesalePrice || i.unit_price || i.price || 0);
      return s + ((Number(i.stock) || 0) * unitPrice);
    }, 0);
    // Capital Invested calculated using Buying Price * stock
    const totalCapital = inventory.reduce((s, i) => {
      const buyingPrice = Number(i.buyingPrice || 0);
      return s + ((Number(i.stock) || 0) * buyingPrice);
    }, 0);
    return Object.values(buckets).sort((a, b) => a.sortKey - b.sortKey).map(v => ({
      ...v,
      'Stock Amount': Math.round(totalStockVal),
      'Sold Amount': Math.round(v['Sold Amount']),
      'Capital Invested': Math.round(totalCapital)
    }));
  }, [orders, inventory, c1From, c1To, c1Gran]);

  const profitLossData = useMemo(() => {
    const buckets = {};
    orders.forEach(order => {
      if (!order.date || order.status === 'Cancelled') return;
      const info = getBucketInfo(order.date, c2From, c2To, c2Gran);
      if (!info) return;
      if (!buckets[info.sortKey]) buckets[info.sortKey] = { date: info.label, sortKey: info.sortKey, Profit: 0, Loss: 0 };
      (order.items || []).forEach(item => {
        const invItem = inventoryMap[item.name];
        const sp = Number(item.price) || 0, bp = invItem ? (Number(invItem.buyingPrice) || 0) : 0;
        const diff = (sp - bp) * (item.quantity || 0);
        if (diff >= 0) buckets[info.sortKey].Profit += diff; else buckets[info.sortKey].Loss += Math.abs(diff);
      });
    });
    return Object.values(buckets).sort((a, b) => a.sortKey - b.sortKey).map(v => ({ ...v, Profit: Math.round(v.Profit), Loss: Math.round(v.Loss) }));
  }, [orders, inventoryMap, c2From, c2To, c2Gran]);

  const orderPerfData = useMemo(() => {
    const buckets = {};
    orders.forEach(order => {
      if (!order.date) return;
      const info = getBucketInfo(order.date, c3From, c3To, c3Gran);
      if (!info) return;
      if (!buckets[info.sortKey]) buckets[info.sortKey] = { date: info.label, sortKey: info.sortKey, 'Total Orders': 0, 'Returned': 0, 'Cancelled': 0 };
      buckets[info.sortKey]['Total Orders'] += 1;
      if ((order.status || '').toLowerCase().includes('return')) buckets[info.sortKey]['Returned'] += 1;
      if (order.status === 'Cancelled') buckets[info.sortKey]['Cancelled'] += 1;
    });
    return Object.values(buckets).sort((a, b) => a.sortKey - b.sortKey);
  }, [orders, c3From, c3To, c3Gran]);

  const topBuyersData = useMemo(() => {
    const filtered = filterByRange(tbFrom, tbTo);
    const buyerMap = {};
    filtered.forEach(order => {
      if (order.status === 'Cancelled') return;
      const name = order.buyerName || 'Unknown';
      if (!buyerMap[name]) buyerMap[name] = { name, totalOrders: 0, totalAmount: 0 };
      buyerMap[name].totalOrders += 1;
      buyerMap[name].totalAmount += (order.totalAmount || 0);
    });
    return Object.values(buyerMap)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, tbLimit);
  }, [orders, tbFrom, tbTo, tbLimit]);

  const mostPopularData = useMemo(() => {
    const filtered = filterByRange(mpFrom, mpTo);
    const productSales = {};
    filtered.forEach(order => {
      if (order.status === 'Cancelled') return;
      (order.items || []).forEach(item => {
        const name = item.name || 'Unknown';
        if (!productSales[name]) {
          const inv = inventoryMap[name];
          productSales[name] = {
            name,
            qty: 0,
            totalAmount: 0,
            category: inv?.category || inv?.type || item.dosageForm || 'Medicine',
          };
        }
        const q = Number(item.quantity) || 0;
        const p = Number(item.price) || 0;
        productSales[name].qty += q;
        productSales[name].totalAmount += q * p;
      });
    });
    return Object.values(productSales)
      .sort((a, b) => b.qty - a.qty || b.totalAmount - a.totalAmount)
      .slice(0, mpLimit);
  }, [orders, inventoryMap, mpFrom, mpTo, mpLimit]);

  const lessPopularData = useMemo(() => {
    const filtered = filterByRange(lpFrom, lpTo);
    const productSales = {};
    filtered.forEach(order => {
      if (order.status === 'Cancelled') return;
      (order.items || []).forEach(item => {
        const name = item.name || 'Unknown';
        if (!productSales[name]) {
          const inv = inventoryMap[name];
          productSales[name] = {
            name,
            qty: 0,
            totalAmount: 0,
            category: inv?.category || inv?.type || item.dosageForm || 'Medicine',
          };
        }
        const q = Number(item.quantity) || 0;
        const p = Number(item.price) || 0;
        productSales[name].qty += q;
        productSales[name].totalAmount += q * p;
      });
    });

    const allList = Object.values(productSales);
    const soldNames = new Set(Object.keys(productSales));

    if (allList.length < lpLimit) {
      for (const item of inventory) {
        if (!soldNames.has(item.name)) {
          allList.push({
            name: item.name,
            qty: 0,
            totalAmount: 0,
            category: item.category || item.type || 'Medicine',
          });
          if (allList.length >= lpLimit) break;
        }
      }
    }

    return allList
      .sort((a, b) => a.qty - b.qty || a.totalAmount - b.totalAmount)
      .slice(0, lpLimit);
  }, [orders, inventory, inventoryMap, lpFrom, lpTo, lpLimit]);

  const mostReturnedData = useMemo(() => {
    const filtered = filterByRange(mrFrom, mrTo);
    const returnCounts = {};

    filtered.forEach(order => {
      if (order.returnItems && typeof order.returnItems === 'object') {
        (order.items || []).forEach(item => {
          const rq = Number(order.returnItems[item.id] || order.returnItems[item.name]) || 0;
          if (rq > 0) {
            const name = item.name || 'Unknown';
            if (!returnCounts[name]) {
              const inv = inventoryMap[name];
              returnCounts[name] = {
                name,
                qty: 0,
                refundAmount: 0,
                category: inv?.category || inv?.type || item.dosageForm || 'Medicine',
              };
            }
            returnCounts[name].qty += rq;
            returnCounts[name].refundAmount += rq * (Number(item.price) || 0);
          }
        });
      } else if ((order.status || '').toLowerCase().includes('return') || (order.status || '').toLowerCase().includes('refund')) {
        (order.items || []).forEach(item => {
          const name = item.name || 'Unknown';
          if (!returnCounts[name]) {
            const inv = inventoryMap[name];
            returnCounts[name] = {
              name,
              qty: 0,
              refundAmount: 0,
              category: inv?.category || inv?.type || item.dosageForm || 'Medicine',
            };
          }
          const q = Number(item.quantity) || 0;
          returnCounts[name].qty += q;
          returnCounts[name].refundAmount += q * (Number(item.price) || 0);
        });
      }
    });

    return Object.values(returnCounts)
      .sort((a, b) => b.qty - a.qty || b.refundAmount - a.refundAmount)
      .slice(0, mrLimit);
  }, [orders, inventoryMap, mrFrom, mrTo, mrLimit]);

  const StatCard = ({ title, value, accent, icon }) => (
    <div style={{ background: `linear-gradient(135deg, ${accent}18 0%, #fff 100%)` }} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
      <div style={{ background: `${accent}20` }} className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{title}</p>
        <p style={{ color: accent }} className="text-2xl font-black mt-0.5 leading-none">{value}</p>
      </div>
    </div>
  );

  const DateFilter = ({ from, setFrom, to, setTo, gran, setGran }) => (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200 text-[11px]">
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="bg-transparent text-slate-700 font-medium outline-none px-1.5 cursor-pointer w-[105px]" />
        <span className="text-slate-400">to</span>
        <input type="date" value={to} onChange={e => setTo(e.target.value)} className="bg-transparent text-slate-700 font-medium outline-none px-1.5 cursor-pointer w-[105px]" />
      </div>
      {gran !== undefined && <select value={gran} onChange={e => setGran(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg px-2 py-1.5 outline-none cursor-pointer focus:border-[#0697A8]">
        <option value="Daily">Daily</option><option value="Weekly">Weekly</option><option value="Monthly">Monthly</option>
      </select>}
    </div>
  );

  const PAGE_SIZE = 20;

  const TableFilter = ({ from, setFrom, to, setTo, gran, setGran, limit, setLimit, onResetPage }) => {
    const handleGranChange = (newGran) => {
      setGran?.(newGran);
      const now = new Date();
      const toStr = now.toISOString().split('T')[0];
      let fromD = new Date();
      if (newGran === 'Daily') {
        fromD.setDate(now.getDate() - 1);
      } else if (newGran === 'Weekly') {
        fromD.setDate(now.getDate() - 7);
      } else if (newGran === 'Monthly') {
        fromD.setDate(now.getDate() - 30);
      }
      setFrom(fromD.toISOString().split('T')[0]);
      setTo(toStr);
      onResetPage?.();
    };

    return (
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200 text-[11px]">
          <input
            type="date"
            value={from}
            onChange={e => { setFrom(e.target.value); onResetPage?.(); }}
            className="bg-transparent text-slate-700 font-medium outline-none px-1.5 cursor-pointer w-[105px]"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={to}
            onChange={e => { setTo(e.target.value); onResetPage?.(); }}
            className="bg-transparent text-slate-700 font-medium outline-none px-1.5 cursor-pointer w-[105px]"
          />
        </div>
        <select
          value={gran || 'Monthly'}
          onChange={e => handleGranChange(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg px-2 py-1.5 outline-none cursor-pointer focus:border-[#0697A8]"
        >
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>
        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200 text-[11px]">
          <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Show</span>
          <select
            value={limit}
            onChange={e => { setLimit(Number(e.target.value)); onResetPage?.(); }}
            className="bg-transparent text-slate-700 font-black outline-none cursor-pointer focus:text-[#0697A8]"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
          </select>
        </div>
      </div>
    );
  };

  const PaginationBar = ({ totalItems, page, setPage }) => {
    if (totalItems <= PAGE_SIZE) return null;
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }
      if (page <= 3) {
        return [1, 2, 3, 4, '...', totalPages];
      }
      if (page >= totalPages - 2) {
        return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      }
      return [1, '...', page - 1, page, page + 1, '...', totalPages];
    };

    const pages = getPageNumbers();
    const startIdx = (page - 1) * PAGE_SIZE + 1;
    const endIdx = Math.min(page * PAGE_SIZE, totalItems);

    return (
      <div className="px-4 py-2.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-50/60">
        <span className="text-[11px] font-semibold text-slate-500">
          Showing <span className="font-bold text-slate-700">{startIdx}</span> to <span className="font-bold text-slate-700">{endIdx}</span> of <span className="font-bold text-slate-700">{totalItems}</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          {pages.map((p, idx) => typeof p === 'number' ? (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`w-7 h-7 flex items-center justify-center text-[11px] font-bold rounded-lg transition-colors ${p === page
                  ? 'bg-[#0697A8] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
              {p}
            </button>
          ) : (
            <span key={`ellipsis-${idx}`} className="w-5 text-center text-slate-400 text-xs font-bold">…</span>
          ))}
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const getRankBadgeClass = (rank) => {
    if (rank === 1) return 'bg-amber-100 text-amber-700 border border-amber-200';
    if (rank === 2) return 'bg-slate-200 text-slate-700 border border-slate-300';
    if (rank === 3) return 'bg-orange-100 text-orange-700 border border-orange-200';
    return 'bg-slate-50 text-slate-500 border border-slate-100';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-xl p-3 text-xs min-w-[140px]">
        <p className="font-bold text-slate-700 mb-2 border-b border-slate-100 pb-1.5 truncate">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 py-0.5">
            <span style={{ background: entry.color }} className="w-2.5 h-2.5 rounded-sm flex-shrink-0" />
            <span className="text-slate-500">{entry.name}:</span>
            <span className="font-black text-slate-800 ml-auto">{typeof entry.value === 'number' && !['Total Orders', 'Returned', 'Cancelled'].includes(entry.name) ? `\u09f3${entry.value.toLocaleString()}` : entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  };

  const CountTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-xl p-3 text-xs min-w-[140px]">
        <p className="font-bold text-slate-700 mb-2 border-b border-slate-100 pb-1.5 truncate">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 py-0.5">
            <span style={{ background: entry.color }} className="w-2.5 h-2.5 rounded-sm flex-shrink-0" />
            <span className="text-slate-500">{entry.name}:</span>
            <span className="font-black text-slate-800 ml-auto">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  };

  const EmptyState = ({ text }) => (
    <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3">
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      <p className="text-xs font-bold text-slate-400">{text}</p>
    </div>
  );

  const pagedMp = mostPopularData.length > PAGE_SIZE ? mostPopularData.slice((mpPage - 1) * PAGE_SIZE, mpPage * PAGE_SIZE) : mostPopularData;
  const pagedLp = lessPopularData.length > PAGE_SIZE ? lessPopularData.slice((lpPage - 1) * PAGE_SIZE, lpPage * PAGE_SIZE) : lessPopularData;
  const pagedMr = mostReturnedData.length > PAGE_SIZE ? mostReturnedData.slice((mrPage - 1) * PAGE_SIZE, mrPage * PAGE_SIZE) : mostReturnedData;
  const pagedTb = topBuyersData.length > PAGE_SIZE ? topBuyersData.slice((tbPage - 1) * PAGE_SIZE, tbPage * PAGE_SIZE) : topBuyersData;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-4 md:p-8 space-y-5">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Total Stock" value={totalStock.toLocaleString()} accent="#0697A8" icon="📦" />
          <StatCard title="Total Sales" value={`\u09f3${(totalSell / 1000).toFixed(1)}k`} accent="#10B981" icon="💰" />
          <StatCard title="Total Returns" value={`\u09f3${(totalReturns / 1000).toFixed(1)}k`} accent="#EF4444" icon="🔄" />
          <StatCard title="Total Orders" value={totalOrders.toLocaleString()} accent="#8B5CF6" icon="🧾" />
        </div>

        {/* Charts Grid: Chart1 tall left, Chart2+3 stacked right */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden xl:row-span-2 flex flex-col">
            <div className="p-4 border-b border-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-black text-[#1D2A3B]">{`Stock vs Sold vs Capital Invested`}</h2>
              </div>
              <DateFilter from={c1From} setFrom={setC1From} to={c1To} setTo={setC1To} gran={c1Gran} setGran={setC1Gran} />
            </div>
            <div className="p-3 flex-1" style={{ minHeight: 360 }}>
              {stockSoldCapitalData.length === 0 ? <EmptyState text="No data for selected range" /> : (
                <ResponsiveContainer width="100%" height="100%" style={{ outline: 'none' }}>
                  <BarChart data={stockSoldCapitalData} margin={{ top: 10, right: 10, left: 0, bottom: 15 }} barCategoryGap="20%" barGap={2} style={{ outline: 'none' }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94A3B8', fontWeight: 700 }} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                    <YAxis tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} width={50} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: 10, fontWeight: 700 }} iconType="circle" />
                    <Bar dataKey="Stock Amount" fill="#0697A8" radius={[4, 4, 0, 0]} maxBarSize={24} />
                    <Bar dataKey="Sold Amount" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={24} />
                    <Bar dataKey="Capital Invested" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-black text-[#1D2A3B]">{`Profit vs Loss`}</h2>
              </div>
              <DateFilter from={c2From} setFrom={setC2From} to={c2To} setTo={setC2To} gran={c2Gran} setGran={setC2Gran} />
            </div>
            <div className="p-3 flex-1" style={{ minHeight: 220 }}>
              {profitLossData.length === 0 ? <EmptyState text="No data for selected range" /> : (
                <ResponsiveContainer width="100%" height="100%" style={{ outline: 'none' }}>
                  <BarChart data={profitLossData} margin={{ top: 10, right: 10, left: 0, bottom: 15 }} barCategoryGap="20%" barGap={2} style={{ outline: 'none' }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94A3B8', fontWeight: 700 }} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                    <YAxis tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} width={50} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: 10, fontWeight: 700 }} iconType="circle" />
                    <Bar dataKey="Profit" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="Loss" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-black text-[#1D2A3B]">{`Order Performance`}</h2>
              </div>
              <DateFilter from={c3From} setFrom={setC3From} to={c3To} setTo={setC3To} gran={c3Gran} setGran={setC3Gran} />
            </div>
            <div className="p-3 flex-1" style={{ minHeight: 220 }}>
              {orderPerfData.length === 0 ? <EmptyState text="No data for selected range" /> : (
                <ResponsiveContainer width="100%" height="100%" style={{ outline: 'none' }}>
                  <BarChart data={orderPerfData} margin={{ top: 10, right: 10, left: 0, bottom: 15 }} barCategoryGap="20%" barGap={2} style={{ outline: 'none' }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94A3B8', fontWeight: 700 }} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                    <YAxis tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} width={30} allowDecimals={false} />
                    <Tooltip content={<CountTooltip />} />
                    <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: 10, fontWeight: 700 }} iconType="circle" />
                    <Bar dataKey="Total Orders" fill="#0697A8" radius={[4, 4, 0, 0]} maxBarSize={24} />
                    <Bar dataKey="Returned" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={24} />
                    <Bar dataKey="Cancelled" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Tables: 4 Separate Categories in a 2x2 grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Table 1: Most Popular Products */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-4 border-b border-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-black text-[#1D2A3B] flex items-center gap-1.5">
                    <span>🏆</span> {`Most Popular Products`}
                  </h2>
                </div>
                <TableFilter from={mpFrom} setFrom={setMpFrom} to={mpTo} setTo={setMpTo} gran={mpGran} setGran={setMpGran} limit={mpLimit} setLimit={setMpLimit} onResetPage={() => setMpPage(1)} />
              </div>
              <div className="overflow-x-auto">
                {mostPopularData.length === 0 ? (
                  <div className="p-8 text-center"><p className="text-xs font-bold text-slate-300">{`No sales recorded in selected date range`}</p></div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400 font-black border-b border-slate-100">
                        <th className="px-4 py-3 w-12">{`#`}</th>
                        <th className="px-4 py-3">{`Product Name`}</th>
                        <th className="px-4 py-3">{`Category`}</th>
                        <th className="px-4 py-3 text-right">{`Units Sold`}</th>
                        <th className="px-4 py-3 text-right">{`Revenue`}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {pagedMp.map((item, idx) => {
                        const rank = (mpPage - 1) * PAGE_SIZE + idx + 1;
                        return (
                          <tr key={`${item.name}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-2.5">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black ${getRankBadgeClass(rank)}`}>
                                {rank}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 font-bold text-[#1D2A3B] text-[11px] max-w-[200px] truncate" title={item.name}>{item.name}</td>
                            <td className="px-4 py-2.5">
                              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {item.category || 'Medicine'}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right font-black text-emerald-600">{item.qty.toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-slate-700">{`\u09f3${item.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            <PaginationBar totalItems={mostPopularData.length} page={mpPage} setPage={setMpPage} />
          </div>

          {/* Table 2: Less Popular Products */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-4 border-b border-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-black text-[#1D2A3B] flex items-center gap-1.5">
                    <span>📉</span> {`Less Popular Products`}
                  </h2>
                </div>
                <TableFilter from={lpFrom} setFrom={setLpFrom} to={lpTo} setTo={setLpTo} gran={lpGran} setGran={setLpGran} limit={lpLimit} setLimit={setLpLimit} onResetPage={() => setLpPage(1)} />
              </div>
              <div className="overflow-x-auto">
                {lessPopularData.length === 0 ? (
                  <div className="p-8 text-center"><p className="text-xs font-bold text-slate-300">{`No product data available for selected range`}</p></div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400 font-black border-b border-slate-100">
                        <th className="px-4 py-3 w-12">{`#`}</th>
                        <th className="px-4 py-3">{`Product Name`}</th>
                        <th className="px-4 py-3">{`Category`}</th>
                        <th className="px-4 py-3 text-right">{`Units Sold`}</th>
                        <th className="px-4 py-3 text-right">{`Revenue`}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {pagedLp.map((item, idx) => {
                        const rank = (lpPage - 1) * PAGE_SIZE + idx + 1;
                        return (
                          <tr key={`${item.name}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-2.5">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black ${getRankBadgeClass(rank)}`}>
                                {rank}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 font-bold text-[#1D2A3B] text-[11px] max-w-[200px] truncate" title={item.name}>{item.name}</td>
                            <td className="px-4 py-2.5">
                              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {item.category || 'Medicine'}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right font-black text-amber-600">{item.qty.toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-slate-700">{`\u09f3${item.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            <PaginationBar totalItems={lessPopularData.length} page={lpPage} setPage={setLpPage} />
          </div>

          {/* Table 3: Most Returned Products */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-4 border-b border-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-black text-[#1D2A3B] flex items-center gap-1.5">
                    <span>🔄</span> {`Most Returned Products`}
                  </h2>
                </div>
                <TableFilter from={mrFrom} setFrom={setMrFrom} to={mrTo} setTo={setMrTo} gran={mrGran} setGran={setMrGran} limit={mrLimit} setLimit={setMrLimit} onResetPage={() => setMrPage(1)} />
              </div>
              <div className="overflow-x-auto">
                {mostReturnedData.length === 0 ? (
                  <div className="p-8 text-center"><p className="text-xs font-bold text-slate-300">{`No product returns recorded for selected range`}</p></div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400 font-black border-b border-slate-100">
                        <th className="px-4 py-3 w-12">{`#`}</th>
                        <th className="px-4 py-3">{`Product Name`}</th>
                        <th className="px-4 py-3">{`Category`}</th>
                        <th className="px-4 py-3 text-right">{`Units Returned`}</th>
                        <th className="px-4 py-3 text-right">{`Refund Value`}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {pagedMr.map((item, idx) => {
                        const rank = (mrPage - 1) * PAGE_SIZE + idx + 1;
                        return (
                          <tr key={`${item.name}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-2.5">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black ${getRankBadgeClass(rank)}`}>
                                {rank}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 font-bold text-[#1D2A3B] text-[11px] max-w-[200px] truncate" title={item.name}>{item.name}</td>
                            <td className="px-4 py-2.5">
                              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {item.category || 'Medicine'}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right font-black text-red-600">{item.qty.toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-slate-700">{`\u09f3${item.refundAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            <PaginationBar totalItems={mostReturnedData.length} page={mrPage} setPage={setMrPage} />
          </div>

          {/* Table 4: Top Buyers */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-4 border-b border-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-black text-[#1D2A3B] flex items-center gap-1.5">
                    <span>👥</span> {`Top Buyers`}
                  </h2>
                </div>
                <TableFilter from={tbFrom} setFrom={setTbFrom} to={tbTo} setTo={setTbTo} gran={tbGran} setGran={setTbGran} limit={tbLimit} setLimit={setTbLimit} onResetPage={() => setTbPage(1)} />
              </div>
              <div className="overflow-x-auto">
                {topBuyersData.length === 0 ? (
                  <div className="p-8 text-center"><p className="text-xs font-bold text-slate-300">{`No buyer data for selected range`}</p></div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400 font-black border-b border-slate-100">
                        <th className="px-4 py-3 w-12">{`#`}</th>
                        <th className="px-4 py-3">{`Buyer Name`}</th>
                        <th className="px-4 py-3 text-right">{`Total Orders`}</th>
                        <th className="px-4 py-3 text-right">{`Total Spend`}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {pagedTb.map((buyer, idx) => {
                        const rank = (tbPage - 1) * PAGE_SIZE + idx + 1;
                        return (
                          <tr key={`${buyer.name}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-2.5">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black ${getRankBadgeClass(rank)}`}>
                                {rank}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 font-bold text-[#1D2A3B] text-[11px]">{buyer.name}</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-slate-600">{buyer.totalOrders}</td>
                            <td className="px-4 py-2.5 text-right font-black text-emerald-600">{`\u09f3${buyer.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            <PaginationBar totalItems={topBuyersData.length} page={tbPage} setPage={setTbPage} />
          </div>
        </div>
      </div>
    </div>
  );
};
const getSearchRelevance = (item, query) => {
  if (!query) return 100;
  const q = String(query).trim().toLowerCase();
  if (!q) return 100;

  const name = String(item.name || '').toLowerCase().trim();
  const generic = String(item.generic || '').toLowerCase().trim();
  const brandId = String(item.brandId || '').toLowerCase().trim();
  const manufacturer = String(item.manufacturer || '').toLowerCase().trim();

  // Tier 0: Exact match of medicine name
  if (name === q) return 0;

  // Tier 1: Medicine name starts with exact query followed by boundary
  if (name.startsWith(q + ' ') || name.startsWith(q + '-') || name.startsWith(q + '(') || name.startsWith(q + '/')) {
    return 1;
  }

  // Tier 2: Medicine name starts with the exact query
  if (name.startsWith(q)) return 2;

  // Tier 3: Query matches a distinct word in the name
  const words = name.split(/[\s\-_(),/]+/);
  if (words.includes(q)) return 3;

  // Tier 4: A word in the name starts with the query
  if (words.some(w => w.startsWith(q))) return 4;

  // If multi-word query (e.g. "napa 500")
  const qWords = q.split(/\s+/).filter(Boolean);
  if (qWords.length > 1) {
    if (name.startsWith(qWords[0]) && qWords.slice(1).every(w => name.includes(w))) {
      return 2.5;
    }
    if (qWords.every(w => name.includes(w))) {
      return 4.5;
    }
  }

  // Tier 5: Substring anywhere in the name (e.g. "Finapark", "Lonapam")
  if (name.includes(q)) return 5;

  // Tier 6-8: Generic matches
  if (generic === q || generic.startsWith(q + ' ')) return 6;
  if (generic.startsWith(q)) return 7;
  if (generic.includes(q)) return 8;

  // Tier 9-10: Brand ID matches
  if (brandId === q || brandId.startsWith(q)) return 9;
  if (brandId.includes(q)) return 10;

  // Tier 11-12: Manufacturer matches
  if (manufacturer.startsWith(q)) return 11;
  if (manufacturer.includes(q)) return 12;

  return 99;
};

const BuyerProfileView = ({ user, allUsers, onUpdateUser, onShowToast, orderCount, creditLimit, outstandingBalance }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    ownerName: user?.ownerName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    addressLine1: user?.addressLine1 || '',
    addressLine2: user?.addressLine2 || '',
    city: user?.city || '',
    division: user?.division || 'Dhaka',
    postalCode: user?.postalCode || '',
    licenseNumber: user?.licenseNumber || '',
    tradeLicense: user?.tradeLicense || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        ownerName: user.ownerName || '',
        email: user.email || '',
        phone: user.phone || '',
        addressLine1: user.addressLine1 || '',
        addressLine2: user.addressLine2 || '',
        city: user.city || '',
        division: user.division || 'Dhaka',
        postalCode: user.postalCode || '',
        licenseNumber: user.licenseNumber || '',
        tradeLicense: user.tradeLicense || '',
      });
    }
  }, [user]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
    setErrorMessage('');
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
    setErrorMessage('');
  };

  const handleReset = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        ownerName: user.ownerName || '',
        email: user.email || '',
        phone: user.phone || '',
        addressLine1: user.addressLine1 || '',
        addressLine2: user.addressLine2 || '',
        city: user.city || '',
        division: user.division || 'Dhaka',
        postalCode: user.postalCode || '',
        licenseNumber: user.licenseNumber || '',
        tradeLicense: user.tradeLicense || '',
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSaveSuccess(false);
      setErrorMessage('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSaveSuccess(false);

    if (!formData.name.trim()) {
      setErrorMessage('Pharmacy / Business Name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage('Email address is required.');
      return;
    }

    if (allUsers && allUsers.length > 0) {
      const emailTaken = allUsers.some(
        u => u.email.toLowerCase() === formData.email.trim().toLowerCase() &&
          u.email.toLowerCase() !== (user?.email || '').toLowerCase()
      );
      if (emailTaken) {
        setErrorMessage('This email address is already in use by another account.');
        return;
      }
    }

    if (passwordData.newPassword) {
      if (passwordData.newPassword.length < 6) {
        setErrorMessage('New password must be at least 6 characters long.');
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setErrorMessage('New password and confirmation password do not match.');
        return;
      }
      if (user?.password && passwordData.currentPassword && passwordData.currentPassword !== user.password) {
        setErrorMessage('Current password entered is incorrect.');
        return;
      }
    }

    setIsSaving(true);

    setTimeout(() => {
      const updated = {
        ...user,
        name: formData.name.trim(),
        ownerName: formData.ownerName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2.trim(),
        city: formData.city.trim(),
        division: formData.division,
        postalCode: formData.postalCode.trim(),
        licenseNumber: formData.licenseNumber.trim(),
        tradeLicense: formData.tradeLicense.trim(),
        location: [formData.addressLine1, formData.addressLine2, formData.city, formData.division, formData.postalCode].filter(Boolean).join(', ')
      };

      if (passwordData.newPassword) {
        updated.password = passwordData.newPassword;
      }

      onUpdateUser(updated);
      setIsSaving(false);
      setSaveSuccess(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      if (onShowToast) onShowToast('Profile settings saved successfully!');
    }, 300);
  };

  const getInitials = (str) => {
    if (!str) return 'DG';
    const words = str.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return str.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-br from-white via-slate-50 to-[#E0F5F7]/30 border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[#0697A8] to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-500/15 flex-shrink-0 tracking-wider">
              {getInitials(formData.name)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-xl md:text-2xl font-black text-[#1D2A3B] tracking-tight">{formData.name || 'My Pharmacy'}</h2>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified Buyer
                </span>
                {user?.tier && (
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200/60">
                    {user.tier}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748B] flex items-center gap-2 flex-wrap">
                {user?.pharmacyId && (
                  <span>Pharmacy ID: <strong className="font-mono text-[#1D2A3B]">{user.pharmacyId}</strong></span>
                )}
                {user?.pharmacyId && formData.ownerName && <span>•</span>}
                {formData.ownerName && (
                  <span>Owner: <strong className="text-[#1D2A3B]">{formData.ownerName}</strong></span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center w-full md:w-auto border-t md:border-t-0 md:border-l border-[#E2E8F0] pt-4 md:pt-0 md:pl-6">
            <div className="text-center md:text-left px-3">
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">Total Orders</span>
              <span className="text-2xl font-black text-[#1D2A3B]">{orderCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs font-bold text-emerald-800 animate-in fade-in duration-200">
          <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Your profile information and credentials have been updated successfully!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs font-bold text-red-700 animate-in fade-in duration-200">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Store & Contact Information */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-[#E0F5F7] text-[#0697A8] flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1D2A3B]">Store & Contact Details</h3>
                <p className="text-[11px] text-[#64748B]">Your pharmacy business name and primary contact details.</p>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                Pharmacy / Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="e.g. Care & Cure Pharmacy Ltd."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0697A8] focus:bg-white focus:ring-1 focus:ring-[#C2EAF0] transition-all text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                Owner / Representative Name
              </label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={e => handleChange('ownerName', e.target.value)}
                placeholder="e.g. Dr. Tasnim Alam"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0697A8] focus:bg-white focus:ring-1 focus:ring-[#C2EAF0] transition-all text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="buyer@dgpharma.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0697A8] focus:bg-white focus:ring-1 focus:ring-[#C2EAF0] transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  placeholder="+88017XXXXXXXX"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0697A8] focus:bg-white focus:ring-1 focus:ring-[#C2EAF0] transition-all text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Security & Password */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1D2A3B]">Security & Credentials</h3>
                  <p className="text-[11px] text-[#64748B]">Update your login password and protect account access.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] font-bold text-[#0697A8] hover:underline cursor-pointer"
              >
                {showPassword ? 'Hide Passwords' : 'Show Passwords'}
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                Current Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={e => handlePasswordChange('currentPassword', e.target.value)}
                placeholder="Enter current password (if changing password)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0697A8] focus:bg-white focus:ring-1 focus:ring-[#C2EAF0] transition-all text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={e => handlePasswordChange('newPassword', e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0697A8] focus:bg-white focus:ring-1 focus:ring-[#C2EAF0] transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={e => handlePasswordChange('confirmPassword', e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0697A8] focus:bg-white focus:ring-1 focus:ring-[#C2EAF0] transition-all text-slate-800"
                />
              </div>
            </div>
            <p className="text-[10px] text-[#94A3B8]">
              Tip: Passwords must be at least 6 characters long. Leave empty if you don't wish to change it.
            </p>
          </div>

          {/* Section 3: Physical Address */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1D2A3B]">Store Location & Delivery Address</h3>
                <p className="text-[11px] text-[#64748B]">Destination for pharmacy invoice deliveries and dispatches.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                  Address Line 1
                </label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={e => handleChange('addressLine1', e.target.value)}
                  placeholder="e.g. House #12, Road #4"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0697A8] focus:bg-white focus:ring-1 focus:ring-[#C2EAF0] transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={e => handleChange('addressLine2', e.target.value)}
                  placeholder="e.g. Block-D, Sector-3"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0697A8] focus:bg-white focus:ring-1 focus:ring-[#C2EAF0] transition-all text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                  City / Area
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => handleChange('city', e.target.value)}
                  placeholder="e.g. Banani"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0697A8] focus:bg-white focus:ring-1 focus:ring-[#C2EAF0] transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                  Division
                </label>
                <select
                  value={formData.division}
                  onChange={e => handleChange('division', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0697A8] focus:bg-white focus:ring-1 focus:ring-[#C2EAF0] transition-all text-slate-800"
                >
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Barisal">Barisal</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rangpur">Rangpur</option>
                  <option value="Mymensingh">Mymensingh</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.postalCode}
                  onChange={e => handleChange('postalCode', e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 1213"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0697A8] focus:bg-white focus:ring-1 focus:ring-[#C2EAF0] transition-all text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Licenses & Regulatory Info */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1D2A3B]">Regulatory & Licensing</h3>
                <p className="text-[11px] text-[#64748B]">Government compliance credentials and drug licenses.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                  DGDA Drug License Number
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={e => handleChange('licenseNumber', e.target.value)}
                  placeholder="e.g. DGDA-2024-8839"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0697A8] focus:bg-white focus:ring-1 focus:ring-[#C2EAF0] transition-all text-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                  Trade License Number
                </label>
                <input
                  type="text"
                  value={formData.tradeLicense}
                  onChange={e => handleChange('tradeLicense', e.target.value)}
                  placeholder="e.g. TR-BAN-99210"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0697A8] focus:bg-white focus:ring-1 focus:ring-[#C2EAF0] transition-all text-slate-800 font-mono"
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Compliance Verification Status</span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                Audited & Active
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#475569] rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Discard Changes
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#0697A8] hover:bg-[#057A88] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default function App() {
  // Restore session from localStorage if it exists
  const savedSession = (() => {
    try {
      const s = localStorage.getItem('dg_session');
      if (s) return JSON.parse(s);
    } catch { }
    return null;
  })();

  let [e, t] = useState(savedSession?.viewState || `login`),
    [n, r] = useState(savedSession?.currentUser || null),
    [i, a] = useState(() => {
      try {
        const saved = localStorage.getItem('dg_users');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(u => u.email !== 'buyer@dgpharma.com' && u.email !== 'admin@dgpharma.com');
            if (cleaned.length !== parsed.length) {
              localStorage.setItem('dg_users', JSON.stringify(cleaned));
            }
            return cleaned;
          }
        }
        return [];
      } catch {
        return [];
      }
    }),
    [o, s] = useState(() => localStorage.getItem(`theme`) === `dark`),
    [c, l] = useState(!1),
    [u, d] = useState(!1),
    [f, p] = useState(savedSession?.role || `buyer`);
  useEffect(() => {
    o ? (document.documentElement.classList.add(`dark`), localStorage.setItem(`theme`, `dark`)) : (document.documentElement.classList.remove(`dark`), localStorage.setItem(`theme`, `light`));
  }, [o]);

  // Persist login session to localStorage so it survives page reloads
  useEffect(() => {
    try {
      if (e === 'authenticated' && n) {
        localStorage.setItem('dg_session', JSON.stringify({
          viewState: e,
          currentUser: n,
          role: f
        }));
      } else if (e === 'login') {
        localStorage.removeItem('dg_session');
      }
    } catch { }
  }, [e, n, f]);

  let [m, h] = useState([]),
    [g, v] = useState(!0),
    [b, x] = useState([]),
    [ee, S] = useState([]),
    [C, w] = useState([]),
    [sdSearch, setSdSearch] = useState(``),
    [sdSelectedMedId, setSdSelectedMedId] = useState(``),
    [sdCompany, setSdCompany] = useState(``),
    [modalInput, setModalInput] = useState(``),
    [te, ne] = useState({
      isOpen: !1,
      title: ``,
      message: ``,
      onConfirm: null,
      isDestructive: !1,
      requireInput: !1,
      expectedInput: ``
    }),
    T = e => {
      let t = Date.now() + Math.random();
      w(n => [{
        id: t,
        text: e,
        date: `Just now`,
        read: !1
      }, ...n]), setTimeout(() => {
        w(e => e.map(e => e.id === t ? {
          ...e,
          read: !0
        } : e));
      }, 5e3);
    },
    [E, D] = useState([]),
    [showForgotModal, setShowForgotModal] = useState(false),
    [forgotEmail, setForgotEmail] = useState(''),
    [forgotLoading, setForgotLoading] = useState(false),
    [forgotMsg, setForgotMsg] = useState(null),
    [backupsList, setBackupsList] = useState([]),
    [restoreModal, setRestoreModal] = useState({ isOpen: false, backup: null, selectedCategories: [] }),
    [deliveryLocation, setDeliveryLocation] = useState(null),
    [locationError, setLocationError] = useState(false),
    [specialDiscounts, setSpecialDiscounts] = useState({}),
    [coupons, setCoupons] = useState([]),
    [couponInput, setCouponInput] = useState(``),
    [appliedCoupon, setAppliedCoupon] = useState(null),
    [isPlacingOrder, setIsPlacingOrder] = useState(false),
    [useCustomAddress, setUseCustomAddress] = useState(false),
    [customAddress, setCustomAddress] = useState({
      addressLine1: '',
      addressLine2: '',
      city: '',
      division: 'Dhaka',
      postalCode: '',
      phone: ''
    }),
    [addressError, setAddressError] = useState('');

  // Delivery Zones & Delivery Men state
  const [deliveryMen, setDeliveryMen] = useState(() => {
    try {
      const saved = localStorage.getItem('dg_delivery_men');
      if (saved) return JSON.parse(saved);
    } catch { }
    return [];
  });
  const [dzTab, setDzTab] = useState('zones');
  const [dzSelectedZone, setDzSelectedZone] = useState('Dhaka');
  const [dzNewMan, setDzNewMan] = useState({ name: '', phone: '', zones: [] });
  const [dzEditId, setDzEditId] = useState(null);

  // Persist delivery men to localStorage
  useEffect(() => {
    try { localStorage.setItem('dg_delivery_men', JSON.stringify(deliveryMen)); } catch { }
  }, [deliveryMen]);

  // Get delivery men assigned to a specific zone
  const getDeliveryMenForZone = (zone) => deliveryMen.filter(dm => dm.zones && dm.zones.includes(zone));

  // --- Dynamic RBAC Roles, Staff Users & Activity Logs State ---
  const [adminRoles, setAdminRoles] = useState(() => {
    try {
      const saved = localStorage.getItem('dg_admin_roles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map();
          DEFAULT_ADMIN_ROLES.forEach(r => map.set(r.id, r));
          parsed.forEach(r => map.set(r.id, r));
          return Array.from(map.values());
        }
      }
    } catch { }
    return DEFAULT_ADMIN_ROLES;
  });

  const [adminStaffUsers, setAdminStaffUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('dg_admin_users');
      if (saved) return JSON.parse(saved);
    } catch { }
    return [];
  });

  const [activityLogs, setActivityLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('dg_activity_logs');
      if (saved) return JSON.parse(saved);
    } catch { }
    return [];
  });

  // UI state for Staff & Roles management
  const [staffSubTab, setStaffSubTab] = useState('users'); // 'users' | 'roles'
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaffUser, setEditingStaffUser] = useState(null);
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    roleId: 'role_inventory',
    status: 'Active'
  });
  const [staffFormError, setStaffFormError] = useState('');
  const [staffFormLoading, setStaffFormLoading] = useState(false);

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });
  const [roleFormError, setRoleFormError] = useState('');
  const [roleFormLoading, setRoleFormLoading] = useState(false);

  // Admin Profile Modal state
  const [adminProfileModalOpen, setAdminProfileModalOpen] = useState(false);
  const [adminProfileForm, setAdminProfileForm] = useState({
    name: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [adminProfileError, setAdminProfileError] = useState('');
  const [adminProfileSuccess, setAdminProfileSuccess] = useState('');
  const [adminProfileLoading, setAdminProfileLoading] = useState(false);

  // Activity Log UI filter & pagination state
  const [activityCategoryFilter, setActivityCategoryFilter] = useState('ALL');
  const [activitySearch, setActivitySearch] = useState('');
  const [activityUserFilter, setActivityUserFilter] = useState('ALL');
  const [activityPage, setActivityPage] = useState(1);

  // Persist RBAC to localStorage
  useEffect(() => {
    try { localStorage.setItem('dg_admin_roles', JSON.stringify(adminRoles)); } catch { }
  }, [adminRoles]);

  useEffect(() => {
    try { localStorage.setItem('dg_admin_users', JSON.stringify(adminStaffUsers)); } catch { }
  }, [adminStaffUsers]);

  useEffect(() => {
    try { localStorage.setItem('dg_activity_logs', JSON.stringify(activityLogs)); } catch { }
  }, [activityLogs]);

  // Permission verification helper
  const hasPermission = (permKey) => {
    if (f !== 'admin' || !n) return false;
    const cleanEmail = (n.email || '').trim().toLowerCase();
    if (n.isSuperAdmin || cleanEmail === 'admin@dgpharma.shop' || cleanEmail === 'admin@dgpharma.com' || n.roleId === 'role_superadmin') {
      return true;
    }
    const userRole = adminRoles.find(r => r.id === n.roleId);
    if (!userRole || !Array.isArray(userRole.permissions)) return false;
    return userRole.permissions.includes(permKey) || userRole.permissions.includes('*');
  };

  // Activity logging helper
  const logAdminActivity = async ({ category, action, details, targetId = null, metadata = {} }) => {
    try {
      const actorEmail = n?.email || 'admin@dgpharma.shop';
      const actorName = n?.name || 'Administrator';
      const userRole = adminRoles.find(r => r.id === n?.roleId);
      const actorRole = (n?.isSuperAdmin || actorEmail === 'admin@dgpharma.shop' || actorEmail === 'admin@dgpharma.com')
        ? 'Super Administrator'
        : (userRole?.name || 'Staff Administrator');

      const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const createdAt = new Date().toISOString();

      const newLog = {
        id: logId,
        user_id: n?.id ? String(n.id) : null,
        user_name: actorName,
        user_email: actorEmail,
        role_name: actorRole,
        actor_name: actorName,
        actor_email: actorEmail,
        actor_role: actorRole,
        category,
        action,
        details,
        target_id: targetId ? String(targetId) : null,
        metadata: metadata || {},
        created_at: createdAt
      };

      setActivityLogs(prev => [newLog, ...prev.slice(0, 499)]);

      // Only send columns that exist in the PostgreSQL table schema:
      // id, user_id, user_name, user_email, role_name, category, action, details, target_id, metadata, created_at
      const dbPayload = {
        id: logId,
        user_id: n?.id ? String(n.id) : null,
        user_name: actorName,
        user_email: actorEmail,
        role_name: actorRole,
        category,
        action,
        details,
        target_id: targetId ? String(targetId) : null,
        metadata: metadata || {},
        created_at: createdAt
      };

      const { error } = await supabase.from('admin_activity_logs').insert([dbPayload]);
      if (error) {
        console.error('Supabase admin_activity_logs insert error:', error);
      }
    } catch (err) {
      console.warn('Could not record activity log to Supabase:', err);
    }
  };

  // Staff User Management Handlers
  const handleSaveStaffUser = async (e) => {
    if (e) e.preventDefault();
    setStaffFormError('');
    setStaffFormLoading(true);

    const cleanEmail = staffFormData.email.trim().toLowerCase();
    const cleanName = staffFormData.name.trim();
    const cleanPhone = staffFormData.phone.trim();
    const cleanPass = staffFormData.password.trim();

    if (!cleanName || !cleanEmail) {
      setStaffFormError('Name and Email are required.');
      setStaffFormLoading(false);
      return;
    }

    if (!editingStaffUser && (!cleanPass || cleanPass.length < 6)) {
      setStaffFormError('Password is required and must be at least 6 characters.');
      setStaffFormLoading(false);
      return;
    }

    // Check duplicate email
    const duplicate = adminStaffUsers.some(u => u.email && u.email.toLowerCase() === cleanEmail && (!editingStaffUser || u.id !== editingStaffUser.id));
    if (duplicate) {
      setStaffFormError('A staff member with this email already exists.');
      setStaffFormLoading(false);
      return;
    }

    const assignedRole = adminRoles.find(r => r.id === staffFormData.roleId);
    const roleTitle = assignedRole?.name || 'Staff';
    const isSuper = staffFormData.roleId === 'role_superadmin' || cleanEmail === 'admin@dgpharma.shop' || cleanEmail === 'admin@dgpharma.com';

    try {
      const payload = {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        role: 'admin',
        role_id: staffFormData.roleId,
        is_super_admin: isSuper,
        status: staffFormData.status,
        updated_at: new Date().toISOString()
      };
      if (cleanPass) {
        payload.password = cleanPass;
      }

      let savedUser = null;
      if (editingStaffUser?.id) {
        payload.id = editingStaffUser.id;
        const { error } = await supabase.from('admin_users').update(payload).eq('id', editingStaffUser.id);
        if (error) console.warn('Supabase admin_users update error:', error);
        savedUser = {
          ...editingStaffUser,
          ...payload,
          roleId: staffFormData.roleId,
          isSuperAdmin: isSuper
        };
        setAdminStaffUsers(prev => prev.map(u => u.id === editingStaffUser.id ? savedUser : u));
        logAdminActivity({
          category: 'STAFF_MANAGEMENT',
          action: 'STAFF_USER_UPDATED',
          details: `Updated staff profile for "${cleanName}" (${cleanEmail}) assigned role "${roleTitle}"`,
          targetId: String(editingStaffUser.id)
        });
        T(`Staff member "${cleanName}" updated successfully.`);
      } else {
        payload.created_at = new Date().toISOString();
        const { data: inserted, error } = await supabase.from('admin_users').insert([payload]).select().maybeSingle();
        if (error) console.warn('Supabase admin_users insert error:', error);
        savedUser = {
          id: inserted?.id || `staff_${Date.now()}`,
          ...payload,
          roleId: staffFormData.roleId,
          isSuperAdmin: isSuper
        };
        setAdminStaffUsers(prev => [savedUser, ...prev]);
        logAdminActivity({
          category: 'STAFF_MANAGEMENT',
          action: 'STAFF_USER_CREATED',
          details: `Created new staff account "${cleanName}" (${cleanEmail}) with role "${roleTitle}"`,
          targetId: String(savedUser.id)
        });
        T(`Staff member "${cleanName}" created successfully.`);
      }

      setStaffModalOpen(false);
      setEditingStaffUser(null);
      setStaffFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        roleId: 'role_inventory',
        status: 'Active'
      });
    } catch (err) {
      console.error('Error saving staff member:', err);
      setStaffFormError('Failed to save staff member. Please try again.');
    } finally {
      setStaffFormLoading(false);
    }
  };

  const handleToggleStaffStatus = async (staffUser) => {
    if (!staffUser) return;
    if (staffUser.isSuperAdmin || staffUser.email === 'admin@dgpharma.shop' || staffUser.email === 'admin@dgpharma.com') {
      T('Cannot deactivate the Super Administrator account.');
      return;
    }
    const newStatus = staffUser.status === 'Active' ? 'Inactive' : 'Active';
    setAdminStaffUsers(prev => prev.map(u => u.id === staffUser.id ? { ...u, status: newStatus } : u));
    try {
      await supabase.from('admin_users').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', staffUser.id);
      logAdminActivity({
        category: 'STAFF_MANAGEMENT',
        action: 'STAFF_STATUS_CHANGED',
        details: `Changed account status for "${staffUser.name}" to ${newStatus}`,
        targetId: String(staffUser.id)
      });
      T(`Staff member "${staffUser.name}" marked as ${newStatus}.`);
    } catch (err) {
      console.warn('Error updating staff status in Supabase:', err);
    }
  };

  const handleDeleteStaffUser = (staffUser) => {
    if (!staffUser) return;
    if (staffUser.isSuperAdmin || staffUser.email === 'admin@dgpharma.shop' || staffUser.email === 'admin@dgpharma.com') {
      T('Cannot delete the primary Super Administrator.');
      return;
    }

    ne({
      isOpen: true,
      title: `Delete Staff User: ${staffUser.name}`,
      message: `Are you sure you want to permanently delete the staff profile "${staffUser.name}" (${staffUser.email})? They will lose all access to the administrative portal immediately.`,
      isDestructive: true,
      requireInput: false,
      expectedInput: '',
      onConfirm: async () => {
        ne({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false, requireInput: false, expectedInput: '' });
        setAdminStaffUsers(prev => prev.filter(u => u.id !== staffUser.id));
        try {
          await supabase.from('admin_users').delete().eq('id', staffUser.id);
          logAdminActivity({
            category: 'STAFF_MANAGEMENT',
            action: 'STAFF_USER_DELETED',
            details: `Permanently removed staff account "${staffUser.name}" (${staffUser.email})`,
            targetId: String(staffUser.id)
          });
          T(`Staff member "${staffUser.name}" removed successfully.`);
        } catch (err) {
          console.error('Error deleting staff user from Supabase:', err);
        }
      }
    });
  };

  // Role Management Handlers
  const handleSaveRole = async (e) => {
    if (e) e.preventDefault();
    setRoleFormError('');
    setRoleFormLoading(true);

    const cleanName = roleFormData.name.trim();
    const cleanDesc = roleFormData.description.trim();

    if (!cleanName) {
      setRoleFormError('Role Name is required.');
      setRoleFormLoading(false);
      return;
    }

    if (!roleFormData.permissions || roleFormData.permissions.length === 0) {
      setRoleFormError('Please select at least one permission for this role.');
      setRoleFormLoading(false);
      return;
    }

    try {
      const roleId = editingRole?.id || `role_${Date.now()}`;
      const payload = {
        id: roleId,
        name: cleanName,
        description: cleanDesc,
        permissions: roleFormData.permissions,
        is_system: editingRole?.is_system ?? false,
        updated_at: new Date().toISOString()
      };

      if (editingRole) {
        setAdminRoles(prev => prev.map(r => r.id === editingRole.id ? payload : r));
        await supabase.from('admin_roles').upsert([payload]);
        logAdminActivity({
          category: 'STAFF_MANAGEMENT',
          action: 'ROLE_POLICY_UPDATED',
          details: `Configured permissions for role "${cleanName}" (${roleFormData.permissions.length} actions enabled)`,
          targetId: roleId
        });
        T(`Role "${cleanName}" updated successfully.`);
      } else {
        payload.created_at = new Date().toISOString();
        setAdminRoles(prev => [...prev, payload]);
        await supabase.from('admin_roles').insert([payload]);
        logAdminActivity({
          category: 'STAFF_MANAGEMENT',
          action: 'ROLE_POLICY_CREATED',
          details: `Created new custom role policy "${cleanName}" with ${roleFormData.permissions.length} permissions`,
          targetId: roleId
        });
        T(`Role "${cleanName}" created successfully.`);
      }

      setRoleModalOpen(false);
      setEditingRole(null);
      setRoleFormData({ name: '', description: '', permissions: [] });
    } catch (err) {
      console.error('Error saving role:', err);
      setRoleFormError('Failed to save role. Please try again.');
    } finally {
      setRoleFormLoading(false);
    }
  };

  const handleDeleteRole = (role) => {
    if (!role) return;
    if (role.is_system || role.id === 'role_superadmin') {
      T('System core roles cannot be deleted.');
      return;
    }

    const assignedCount = adminStaffUsers.filter(u => u.roleId === role.id).length;
    if (assignedCount > 0) {
      T(`Cannot delete role "${role.name}" because ${assignedCount} staff member(s) are currently assigned to it. Please reassign them first.`);
      return;
    }

    ne({
      isOpen: true,
      title: `Delete Role: ${role.name}`,
      message: `Are you sure you want to delete the role policy "${role.name}"? This action cannot be undone.`,
      isDestructive: true,
      requireInput: false,
      expectedInput: '',
      onConfirm: async () => {
        ne({ isOpen: false, title: '', message: '', onConfirm: null, isDestructive: false, requireInput: false, expectedInput: '' });
        setAdminRoles(prev => prev.filter(r => r.id !== role.id));
        try {
          await supabase.from('admin_roles').delete().eq('id', role.id);
          logAdminActivity({
            category: 'STAFF_MANAGEMENT',
            action: 'ROLE_POLICY_DELETED',
            details: `Deleted role policy "${role.name}"`,
            targetId: role.id
          });
          T(`Role "${role.name}" removed successfully.`);
        } catch (err) {
          console.error('Error deleting role from Supabase:', err);
        }
      }
    });
  };

  // Self Profile & Security Handler
  const handleAdminProfileSave = async (e) => {
    if (e) e.preventDefault();
    setAdminProfileError('');
    setAdminProfileSuccess('');
    setAdminProfileLoading(true);

    const cleanName = adminProfileForm.name.trim();
    const cleanPhone = adminProfileForm.phone.trim();
    const newPass = adminProfileForm.newPassword.trim();
    const confirmPass = adminProfileForm.confirmPassword.trim();

    if (!cleanName) {
      setAdminProfileError('Full Name is required.');
      setAdminProfileLoading(false);
      return;
    }

    if (newPass) {
      if (newPass.length < 6) {
        setAdminProfileError('New password must be at least 6 characters.');
        setAdminProfileLoading(false);
        return;
      }
      if (newPass !== confirmPass) {
        setAdminProfileError('New password and confirmation do not match.');
        setAdminProfileLoading(false);
        return;
      }
    }

    try {
      const updateData = {
        name: cleanName,
        phone: cleanPhone,
        updated_at: new Date().toISOString()
      };
      if (newPass) {
        updateData.password = newPass;
      }

      const adminEmail = (n?.email || '').trim().toLowerCase();
      if (adminEmail) {
        await supabase.from('admin_users').update(updateData).ilike('email', adminEmail);
      }

      // Update current user state
      r(prev => ({
        ...prev,
        name: cleanName,
        phone: cleanPhone
      }));

      // Update in staff list if present
      setAdminStaffUsers(prev => prev.map(u => (u.email && u.email.toLowerCase() === adminEmail) ? { ...u, name: cleanName, phone: cleanPhone } : u));

      logAdminActivity({
        category: 'SYSTEM_SETTINGS',
        action: 'ADMIN_PROFILE_UPDATED',
        details: `Profile and credentials updated for "${cleanName}" (${adminEmail})${newPass ? ' (password modified)' : ''}`
      });

      setAdminProfileSuccess('Profile updated successfully!');
      setTimeout(() => {
        setAdminProfileModalOpen(false);
        setAdminProfileSuccess('');
      }, 1200);
    } catch (err) {
      console.error('Error updating admin profile:', err);
      setAdminProfileError('Failed to update profile settings.');
    } finally {
      setAdminProfileLoading(false);
    }
  };

  useEffect(() => {
    const fetchDiscountsAndCoupons = async () => {
      try {
        let { data: regData } = await supabase.from('pharmacy_registrations').select('*').order('created_at', { ascending: false });
        let { data: buyerData } = await supabase.from('buyers').select('*').order('created_at', { ascending: false });

        const mergedMap = new Map();

        const normBuyerStatus = s => (s === 'Pending Verification' ? 'Pending' : (s || 'Pending'));

        (regData || []).forEach(r => {
          const key = (r.email || r.id || '').toLowerCase();
          mergedMap.set(key, {
            id: r.id,
            applyDate: r.apply_date || (r.created_at ? r.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
            name: r.name || 'Pharmacy Shop',
            addressLine1: r.address_line1,
            addressLine2: r.address_line2,
            city: r.city,
            division: r.division,
            postalCode: r.postal_code,
            licenseNumber: r.license_number || 'N/A',
            location: r.location || [r.address_line1, r.city].filter(Boolean).join(', ') || 'N/A',
            address: r.location || [r.address_line1, r.city].filter(Boolean).join(', ') || 'N/A',
            attachmentStatus: r.attachment_status || (r.drug_license_file ? 'Uploaded (Verified)' : 'Pending'),
            ownerName: r.owner_name || 'N/A',
            email: r.email,
            phone: r.phone || 'N/A',
            tradeLicense: r.trade_license || 'N/A',
            drugLicenseFile: r.drug_license_file,
            status: normBuyerStatus(r.status),
            creditLimit: 50000,
            outstandingBalance: 0
          });
        });

        (buyerData || []).forEach(b => {
          const key = (b.email || b.pharmacy_id || b.id || '').toLowerCase();
          if (mergedMap.has(key)) {
            const existing = mergedMap.get(key);
            mergedMap.set(key, {
              ...existing,
              status: normBuyerStatus(b.status || existing.status),
              creditLimit: b.credit_limit ?? existing.creditLimit,
              outstandingBalance: b.outstanding_balance ?? existing.outstandingBalance
            });
          } else {
            mergedMap.set(key, {
              id: b.pharmacy_id || `BUYER-${b.id}`,
              applyDate: b.created_at ? b.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
              name: b.name || b.buyer_name || 'Registered Pharmacy',
              addressLine1: b.address_line1,
              addressLine2: b.address_line2,
              city: b.city,
              division: b.division,
              postalCode: b.postal_code,
              licenseNumber: b.license_number || 'N/A',
              location: b.address || [b.address_line1, b.city].filter(Boolean).join(', ') || 'N/A',
              address: b.address || [b.address_line1, b.city].filter(Boolean).join(', ') || 'N/A',
              attachmentStatus: b.drug_license_file ? 'Uploaded (Verified)' : 'N/A',
              ownerName: b.owner_name || b.contact_person || 'N/A',
              email: b.email,
              phone: b.phone || 'N/A',
              tradeLicense: b.trade_license || 'N/A',
              drugLicenseFile: b.drug_license_file,
              status: normBuyerStatus(b.status || 'Approved'),
              creditLimit: b.credit_limit ?? 50000,
              outstandingBalance: b.outstanding_balance ?? 0
            });
          }
        });

        if (mergedMap.size > 0) {
          D(Array.from(mergedMap.values()));
        }
      } catch (err) {
        console.log('Error fetching registrations and buyers from Supabase:', err);
      }

      let { data: sdData } = await supabase.from('special_discounts').select('*');
      if (sdData) {
        const sdMap = {};
        sdData.forEach(item => {
          sdMap[item.product_name] = { type: item.discount_type, value: item.discount_value };
        });
        setSpecialDiscounts(sdMap);
      }
      let { data: cpData } = await supabase.from('coupons').select('*');
      if (cpData) {
        setCoupons(cpData.map(item => ({ code: item.code, type: item.discount_type, value: item.discount_value })));
      } else {
        setCoupons([]);
      }
      let { data: ruleData } = await supabase.from('bulk_pricing_rules').select('*').eq('id', 1).single();
      if (ruleData) {
        setBulkPriceRule({ type: ruleData.markup_type, amount: ruleData.markup_amount, company: ruleData.company });
      }
      try {
        let { data: dmData } = await supabase.from('delivery_men').select('*');
        if (dmData && dmData.length > 0) {
          const formatted = dmData.map(dm => ({
            id: dm.id,
            name: dm.name,
            phone: dm.phone,
            zones: Array.isArray(dm.zones) ? dm.zones : (typeof dm.zones === 'string' ? (() => { try { return JSON.parse(dm.zones); } catch { return []; } })() : []),
            createdAt: dm.created_at || dm.createdAt || new Date().toISOString()
          }));
          setDeliveryMen(formatted);
          try { localStorage.setItem('dg_delivery_men', JSON.stringify(formatted)); } catch { }
        }
      } catch (e) {
        console.warn('Could not fetch delivery_men from Supabase:', e);
      }
      try {
        let { data: reqData } = await supabase.from('medicine_requests').select('*').order('created_at', { ascending: false });
        if (reqData && reqData.length > 0) {
          const formattedReqs = reqData.map(r => ({
            id: r.id,
            medId: r.med_id,
            name: r.name,
            generic: r.generic || '',
            manufacturer: r.manufacturer || '',
            quantity: r.quantity || 100,
            notes: r.notes || '',
            photo: r.photo || null,
            buyerName: r.buyer_name || r.buyerName || '',
            buyerEmail: r.buyer_email || r.buyerEmail || '',
            buyerId: r.buyer_id || r.buyerId || '',
            pharmacyId: r.pharmacy_id || r.pharmacyId || '',
            buyerPhone: r.buyer_phone || r.buyerPhone || '',
            date: r.date || (r.created_at ? new Date(r.created_at).toLocaleDateString() : new Date().toLocaleDateString()),
            status: r.status || 'Pending Review',
            source: r.source || 'Catalog Out-of-Stock',
            createdAt: r.created_at
          }));
          ze(formattedReqs);
          try { localStorage.setItem('medicine_requests', JSON.stringify(formattedReqs)); } catch { }
        }
      } catch (e) {
        console.warn('Could not fetch medicine_requests from Supabase:', e);
      }

      // Supabase sync for RBAC roles
      try {
        let { data: rolesData } = await supabase.from('admin_roles').select('*').order('created_at', { ascending: true });
        if (rolesData && rolesData.length > 0) {
          const parsedRoles = rolesData.map(r => ({
            id: r.id,
            name: r.name,
            description: r.description,
            permissions: Array.isArray(r.permissions) ? r.permissions : (typeof r.permissions === 'string' ? JSON.parse(r.permissions) : []),
            is_system: r.is_system ?? false,
            createdAt: r.created_at
          }));
          setAdminRoles(prev => {
            const map = new Map();
            DEFAULT_ADMIN_ROLES.forEach(dr => map.set(dr.id, dr));
            prev.forEach(pr => map.set(pr.id, pr));
            parsedRoles.forEach(sr => map.set(sr.id, sr));
            return Array.from(map.values());
          });
        }
      } catch (e) {
        console.warn('Could not fetch admin_roles from Supabase:', e);
      }

      // Supabase sync for admin staff users
      try {
        let { data: staffData } = await supabase.from('admin_users').select('*').order('created_at', { ascending: false });
        if (staffData && staffData.length > 0) {
          const formattedStaff = staffData.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone || '',
            roleId: u.role_id || (u.is_super_admin ? 'role_superadmin' : 'role_superadmin'),
            isSuperAdmin: u.is_super_admin || u.email === 'admin@dgpharma.shop' || u.email === 'admin@dgpharma.com',
            status: u.status || 'Active',
            createdAt: u.created_at
          }));
          setAdminStaffUsers(formattedStaff);
          try { localStorage.setItem('dg_admin_users', JSON.stringify(formattedStaff)); } catch { }
        }
      } catch (e) {
        console.warn('Could not fetch admin_users from Supabase:', e);
      }

      // Supabase sync for admin activity logs (Supabase is the single source of truth)
      try {
        let { data: logsData, error: logFetchErr } = await supabase
          .from('admin_activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200);

        if (!logFetchErr && Array.isArray(logsData)) {
          const normalized = logsData.map(l => ({
            ...l,
            actor_name: l.user_name || l.actor_name || 'Admin',
            actor_email: l.user_email || l.actor_email || 'admin@dgpharma.shop',
            actor_role: l.role_name || l.actor_role || 'Staff'
          }));
          setActivityLogs(normalized);
          try { localStorage.setItem('dg_activity_logs', JSON.stringify(normalized)); } catch { }
        }
      } catch (e) {
        console.warn('Could not fetch admin_activity_logs from Supabase:', e);
      }
    };
    fetchDiscountsAndCoupons();
  }, []);

  // Supabase Realtime synchronization for admin_activity_logs
  useEffect(() => {
    const channel = supabase
      .channel('realtime_admin_activity_logs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_activity_logs' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const deletedId = payload.old?.id;
            if (deletedId) {
              setActivityLogs(prev => {
                const next = prev.filter(l => String(l.id) !== String(deletedId));
                try { localStorage.setItem('dg_activity_logs', JSON.stringify(next)); } catch { }
                return next;
              });
            } else {
              // Bulk delete or delete without returned old id: refetch fresh
              supabase.from('admin_activity_logs').select('*').order('created_at', { ascending: false }).limit(200).then(({ data, error }) => {
                if (!error && Array.isArray(data)) {
                  const normalized = data.map(l => ({
                    ...l,
                    actor_name: l.user_name || l.actor_name || 'Admin',
                    actor_email: l.user_email || l.actor_email || 'admin@dgpharma.shop',
                    actor_role: l.role_name || l.actor_role || 'Staff'
                  }));
                  setActivityLogs(normalized);
                  try { localStorage.setItem('dg_activity_logs', JSON.stringify(normalized)); } catch { }
                }
              });
            }
          } else if (payload.eventType === 'INSERT') {
            const newRow = payload.new;
            if (newRow) {
              const normalized = {
                ...newRow,
                actor_name: newRow.user_name || newRow.actor_name || 'Admin',
                actor_email: newRow.user_email || newRow.actor_email || 'admin@dgpharma.shop',
                actor_role: newRow.role_name || newRow.actor_role || 'Staff'
              };
              setActivityLogs(prev => {
                if (prev.some(l => String(l.id) === String(normalized.id))) return prev;
                const next = [normalized, ...prev];
                try { localStorage.setItem('dg_activity_logs', JSON.stringify(next)); } catch { }
                return next;
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  useEffect(() => {
    (async () => {
      v(!0);
      let pageSize = 1000,
        allData = [],
        page = 0,
        done = false;
      while (!done) {
        let { data, error } = await supabase.from(`medicines`).select(`*`).order('id').range(page * pageSize, (page + 1) * pageSize - 1);
        if (error) { console.error(`Fetch error:`, error); break; }
        if (data && data.length > 0) {
          allData = allData.concat(data);
          if (data.length < pageSize) done = true;
        } else {
          done = true;
        }
        page++;
      }
      allData.length > 0 ? h(allData.map(e => ({
        id: e.id,
        brandId: e.brand_id || (`MED-` + e.id),
        name: e.product_name || e.company || `Unnamed`,
        type: e.dosage_form || `Other`,
        slug: e.product_name ? e.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ``,
        dosageForm: e.dosage_form || ``,
        dosage_form: e.dosage_form || ``,
        generic: e.generic || ``,
        strength: e.strength || ``,
        manufacturer: e.company || ``,
        packSize: e.pack_size || ``,
        packageSize: e.pack_size || ``,
        stock: e.stock || 0,
        moq: e.moq || 1,
        buyingPrice: e.buying_price || 0,
        wholesalePrice: e.unit_price || 0,
        mrp: e.pack_mrp || (e.unit_price ? e.unit_price * 1.2 : 0),
        imageUrl: e.image_url,
        expiryDate: `2027-12-31`,
        expiryMonths: 24,
        category: e.dosage_form || `Other`
      }))) : h([]), v(!1);
    })();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      let { data: ordersData, error: ordersErr } = await supabase.from('orders').select('*').order('order_date', { ascending: false });
      if (ordersErr) { console.error('Error fetching orders:', ordersErr); return; }

      let { data: itemsData, error: itemsErr } = await supabase.from('order_items').select('*');
      if (itemsErr) { console.error('Error fetching order items:', itemsErr); return; }

      if (ordersData && itemsData) {
        let formattedOrders = ordersData.map(o => {
          let itemsForOrder = itemsData.filter(i => String(i.order_id) === String(o.id)).map(i => ({
            id: i.medicine_id,
            medicine_id: i.medicine_id,
            name: i.product_name,
            product_name: i.product_name,
            quantity: i.quantity,
            price: i.unit_price,
            unit_price: i.unit_price,
            specialDiscount: i.special_discount
          }));
          return {
            id: o.id,
            buyerId: o.buyer_id,
            buyerEmail: o.buyer_email || o.email || '',
            buyerName: o.buyer_name,
            buyerAddress: o.buyer_address || o.location || o.address,
            addressLine1: o.address_line1,
            addressLine2: o.address_line2,
            city: o.city,
            division: o.division,
            postalCode: o.postal_code,
            location: o.buyer_address || o.location || o.address,
            phone: o.phone,
            date: o.order_date,
            totalAmount: o.total_amount,
            status: o.status,
            paymentStatus: o.payment_status,
            paymentMethod: o.payment_method,
            items: itemsForOrder,
            itemCount: itemsForOrder.length
          };
        });
        x(formattedOrders);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    if (f === 'admin') {
      getBackups().then(setBackupsList).catch(console.error);

      // Subscribe to real-time backup events so newly created cloud backups appear automatically
      const backupChannel = supabase
        .channel('public:database_backups')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'database_backups' }, () => {
          getBackups().then(setBackupsList).catch(console.error);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(backupChannel);
      };
    }
  }, [f]);

  const executeSelectiveRestore = async (backupToRestore, selectedCategoryKeys) => {
    if (!backupToRestore || !selectedCategoryKeys || selectedCategoryKeys.length === 0) {
      T("Please select at least one table category to restore.");
      return;
    }

    const allTablesToRestore = [];
    selectedCategoryKeys.forEach(catKey => {
      const foundCat = BACKUP_TABLE_CATEGORIES.find(c => c.key === catKey);
      if (foundCat && foundCat.tables) {
        allTablesToRestore.push(...foundCat.tables);
      }
    });

    setRestoreModal({ isOpen: false, backup: null, selectedCategories: [] });

    try {
      We(true);
      Ke({
        percent: 15,
        rowsProcessed: 0,
        totalRows: allTablesToRestore.length,
        eta: `Restoring ${allTablesToRestore.length} tables from cloud snapshot...`
      });

      // 1. Call the Postgres RPC procedure 'restore_database_tables'
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('restore_database_tables', {
        target_backup_id: backupToRestore.id,
        tables_to_restore: allTablesToRestore
      });

      if (rpcErr) {
        console.warn("Postgres RPC restore failed, falling back to direct table restore:", rpcErr);
        // Fallback for medicines if selected
        if (allTablesToRestore.includes('medicines')) {
          Ke({ percent: 35, rowsProcessed: 1, totalRows: allTablesToRestore.length, eta: 'Restoring medicines...' });
          const medsData = backupToRestore.tables?.medicines || backupToRestore.data || [];
          const formatted = medsData.map(item => ({
            product_name: item.product_name || item.name || 'Unnamed',
            brandId: item.brandId || item.brand_id || null,
            dosage_form: item.dosage_form || item.dosageForm || item.type || null,
            company: item.company || item.manufacturer || null,
            pack_size: item.pack_size || item.packSize || null,
            stock: Number(item.stock ?? 0),
            moq: Number(item.moq ?? 1),
            unit_price: Number(item.unit_price ?? item.wholesalePrice ?? item.price ?? 0),
            pack_mrp: Number(item.pack_mrp ?? item.mrp ?? 0),
            image_url: item.image_url || item.imageUrl || null
          }));
          await supabase.from('medicines').delete().neq('id', 0);
          for (let i = 0; i < formatted.length; i += 500) {
            const chunk = formatted.slice(i, i + 500);
            await supabase.from('medicines').insert(chunk);
          }
        }
        // Fallback for buyers if selected
        if (allTablesToRestore.includes('buyers') && backupToRestore.tables?.buyers) {
          Ke({ percent: 55, rowsProcessed: 2, totalRows: allTablesToRestore.length, eta: 'Restoring buyers...' });
          for (const buyer of backupToRestore.tables.buyers) {
            await supabase.from('buyers').upsert(buyer, { onConflict: 'email' });
          }
        }
        // Fallback for delivery_men
        if (allTablesToRestore.includes('delivery_men') && backupToRestore.tables?.delivery_men) {
          await supabase.from('delivery_men').delete().neq('id', 'placeholder');
          await supabase.from('delivery_men').insert(backupToRestore.tables.delivery_men);
        }
        // Fallback for coupons
        if (allTablesToRestore.includes('coupons') && backupToRestore.tables?.coupons) {
          await supabase.from('coupons').delete().neq('id', 0);
          await supabase.from('coupons').insert(backupToRestore.tables.coupons);
        }
        // Fallback for special_discounts
        if (allTablesToRestore.includes('special_discounts') && backupToRestore.tables?.special_discounts) {
          await supabase.from('special_discounts').delete().neq('id', 0);
          await supabase.from('special_discounts').insert(backupToRestore.tables.special_discounts);
        }
      }

      Ke({
        percent: 85,
        rowsProcessed: allTablesToRestore.length,
        totalRows: allTablesToRestore.length,
        eta: 'Syncing restored data with application...'
      });

      // 2. Refetch affected tables to update local state
      if (allTablesToRestore.includes('medicines')) {
        let refreshPageSize = 1000, refreshAll = [], refreshPage = 0, refreshDone = false;
        while (!refreshDone) {
          const { data: chunk, error: refreshErr } = await supabase.from('medicines').select('*').order('id', { ascending: true }).range(refreshPage * refreshPageSize, (refreshPage + 1) * refreshPageSize - 1);
          if (refreshErr) { console.error('Refresh fetch error:', refreshErr); break; }
          if (chunk && chunk.length > 0) {
            refreshAll = refreshAll.concat(chunk);
            if (chunk.length < refreshPageSize) refreshDone = true;
          } else {
            refreshDone = true;
          }
          refreshPage++;
        }
        if (refreshAll.length > 0) {
          h(refreshAll.map(e => ({
            id: e.id,
            brandId: e.brand_id || 'MED-' + e.id,
            name: e.product_name || e.company || 'Unnamed',
            type: e.dosage_form || 'Other',
            slug: e.product_name ? e.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '',
            dosageForm: e.dosage_form || '',
            dosage_form: e.dosage_form || '',
            generic: e.generic || '',
            strength: e.strength || '',
            manufacturer: e.company || '',
            packSize: e.pack_size || '',
            packageSize: e.pack_size || '',
            stock: e.stock || 0,
            moq: e.moq || 1,
            buyingPrice: e.buying_price || 0,
            wholesalePrice: Number(e.unit_price) || 0,
            mrp: Number(e.pack_mrp) || (Number(e.unit_price) ? Number(e.unit_price) * 1.2 : 0),
            imageUrl: e.image_url,
            expiryDate: '2027-12-31',
            expiryMonths: 24,
            category: e.dosage_form || 'Other'
          })));
        }
      }

      if (allTablesToRestore.includes('orders')) {
        const { data: ords } = await supabase.from('orders').select('*').order('order_date', { ascending: false });
        const { data: items } = await supabase.from('order_items').select('*');
        if (ords && items) {
          x(ords.map(o => ({
            id: o.id,
            buyerId: o.buyer_id,
            buyerEmail: o.buyer_email || o.email || '',
            buyerName: o.buyer_name,
            buyerAddress: o.buyer_address || o.location || o.address,
            addressLine1: o.address_line1,
            addressLine2: o.address_line2,
            city: o.city,
            division: o.division,
            postalCode: o.postal_code,
            location: o.buyer_address || o.location || o.address,
            phone: o.phone,
            date: o.order_date,
            totalAmount: o.total_amount,
            status: o.status,
            paymentStatus: o.payment_status,
            paymentMethod: o.payment_method,
            items: items.filter(i => String(i.order_id) === String(o.id)),
            itemCount: items.filter(i => String(i.order_id) === String(o.id)).length
          })));
        }
      }

      if (allTablesToRestore.includes('admin_users')) {
        const { data: staff } = await supabase.from('admin_users').select('*');
        if (staff) setAdminStaffUsers(staff);
      }
      if (allTablesToRestore.includes('admin_roles')) {
        const { data: roles } = await supabase.from('admin_roles').select('*');
        if (roles) setAdminRoles(roles);
      }
      if (allTablesToRestore.includes('delivery_men')) {
        const { data: dm } = await supabase.from('delivery_men').select('*');
        if (dm) setDeliveryMen(dm);
      }

      Ke({
        percent: 100,
        rowsProcessed: allTablesToRestore.length,
        totalRows: allTablesToRestore.length,
        eta: 'Completed!'
      });

      T(`Restored ${selectedCategoryKeys.length} table categories successfully.`);
      setTimeout(() => We(false), 1000);
    } catch (err) {
      console.error("Selective restore error:", err);
      T("Restore failed: " + (err.message || "Unknown error"));
      setTimeout(() => We(false), 1200);
    }
  };

  let [O, k] = useState(`search`),
    [A, re] = useState(1),
    [ie, j] = useState(`grid`),
    [M, ae] = useState(1),
    [oe, se] = useState(``),
    [ce, le] = useState([]),
    [N, ue] = useState([]),
    [de, fe] = useState(`all`),
    [pe, me] = useState(`all`),
    [he, ge] = useState(`name`),
    [offersCompany, setOffersCompany] = useState(""),
    [_e, ve] = useState({
      isOpen: !1,
      medId: null,
      currentUrl: ``
    }),
    [ye, be] = useState({}),
    [xe, Se] = useState(!1),
    [Ce, P] = useState(`bank`),
    [we, Te] = useState(!1),
    [Ee, De] = useState(!1),
    [Oe, ke] = useState(null),
    [isEditingOrder, setIsEditingOrder] = useState(!1),
    [editedQuantities, setEditedQuantities] = useState({}),
    [returnOrderObj, setReturnOrderObj] = useState(null),
    [returnItems, setReturnItems] = useState({}),
    [returnReason, setReturnReason] = useState(``),
    [Ae, je] = useState(null),
    [Me, Ne] = useState({
      isOpen: !1,
      orderId: ``
    }),
    [Pe, Fe] = useState({
      subject: ``,
      body: ``,
      submitted: !1
    }),
    [Ie, Le] = useState({
      isOpen: !1,
      amount: ``
    }),
    [Re, ze] = useState(() => {
      try {
        const saved = localStorage.getItem('medicine_requests');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load medicine requests:", e);
      }
      return [
        {
          id: 'REQ-1725960000000',
          name: 'Napa Extra 500mg/65mg',
          generic: 'Paracetamol + Caffeine',
          manufacturer: 'Beximco Pharmaceuticals Ltd.',
          quantity: 200,
          buyerName: 'Care & Cure Pharmacy Ltd.',
          buyerEmail: 'buyer@dgpharma.com',
          buyerPhone: '01711-000000',
          notes: 'High local prescription demand - need urgent supply.',
          date: '09/09/2026',
          status: 'Pending Review',
          source: 'Catalog Out-of-Stock'
        },
        {
          id: 'REQ-1725945000000',
          name: 'Seclo 20mg Capsule',
          generic: 'Omeprazole',
          manufacturer: 'Square Pharmaceuticals Ltd.',
          quantity: 150,
          buyerName: 'Care & Cure Pharmacy Ltd.',
          buyerEmail: 'buyer@dgpharma.com',
          buyerPhone: '01711-000000',
          notes: 'Monthly chronic patient refilling batches.',
          date: '08/09/2026',
          status: 'Pending Review',
          source: 'Request Medicine Page'
        }
      ];
    }),
    [quickRequestModal, setQuickRequestModal] = useState({
      isOpen: false,
      med: null,
      quantity: '100',
      notes: ''
    }),
    [Be, F] = useState({
      name: ``,
      quantity: 100,
      photoPreview: null,
      photoFile: null,
      notes: ``,
      submitted: !1
    }),
    [Ve, He] = useState({
      loaded: !1,
      count: 0,
      fileName: ``
    }),
    [Ue, We] = useState(!1),
    [Ge, Ke] = useState({
      percent: 0,
      rowsProcessed: 0,
      totalRows: 0,
      eta: ``
    }),
    [qe, Je] = useState(``),
    [Ye, Xe] = useState(``),
    [showPassword, setShowPassword] = useState(!1),
    [barcodeModalOpen, setBarcodeModalOpen] = useState(!1),
    [invoicesToPrint, setInvoicesToPrint] = useState([]),
    [triggersPrint, setTriggersPrint] = useState(!1),
    [Ze, Qe] = useState(``),
    [$e, et] = useState(``),
    [tt, nt] = useState(``),
    [rt, it] = useState(``),
    [at, ot] = useState(``),
    [st, ct] = useState(``),
    [lt, ut] = useState(`Banani, Dhaka`),
    [regAddressLine1, setRegAddressLine1] = useState(``),
    [regAddressLine2, setRegAddressLine2] = useState(``),
    [regCity, setRegCity] = useState(``),
    [regDivision, setRegDivision] = useState(`Dhaka`),
    [regPostalCode, setRegPostalCode] = useState(``),
    [dt, ft] = useState(`uploaded_drug_license.pdf`),
    [regPassword, setRegPassword] = useState(''),
    [regConfirmPassword, setRegConfirmPassword] = useState(''),
    [showRegPassword, setShowRegPassword] = useState(false),
    [regError, setRegError] = useState(''),
    [regSubmitting, setRegSubmitting] = useState(false),
    [loginError, setLoginError] = useState(''),
    [loginLoading, setLoginLoading] = useState(false),
    [pdfUploading, setPdfUploading] = useState(false),
    [pdfFileName, setPdfFileName] = useState(''),
    [pdfUploadError, setPdfUploadError] = useState(''),
    editingNameRef = useRef({}),
    handleDrugLicenseUpload = async e => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      setPdfUploadError('');

      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        setPdfUploadError('Please select a valid PDF document.');
        return;
      }

      const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
      if (file.size > MAX_SIZE) {
        setPdfUploadError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 5 MB.`);
        return;
      }

      setPdfUploading(true);
      try {
        const formData = new FormData();
        formData.append('image', file); // upload.php on hosting expects 'image' key

        const res = await fetch('https://dgpharma.shop/upload.php', {
          method: 'POST',
          body: formData
        });

        let result;
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          result = await res.json();
        } else {
          const text = await res.text();
          try {
            result = JSON.parse(text);
          } catch {
            throw new Error('Upload server returned unexpected response.');
          }
        }

        if (res.ok && result.success && result.url) {
          ft(result.url);
          setPdfFileName(file.name);
          setPdfUploadError('');
        } else {
          throw new Error(result.error || 'Upload failed. Please try again.');
        }
      } catch (err) {
        console.error('PDF upload error:', err);
        setPdfUploadError(err.message || 'Failed to upload PDF. Please check your connection.');
      } finally {
        setPdfUploading(false);
      }
    },
    pt = async e => {
      let files = Array.from(e.target.files);
      if (!files.length) return;
      We(!0);
      He({
        loaded: !1,
        count: 0,
        fileName: files.length > 1 ? `${files.length} files` : files[0].name
      });
      Ke({
        percent: 0,
        rowsProcessed: 0,
        totalRows: 0,
        eta: `Reading file data...`,
        error: !1
      });

      const parseRows = async rawRows => {
        try {
          const total = rawRows.length;
          Ke(prev => ({
            ...prev,
            totalRows: total,
            eta: `Mapping columns and processing records...`
          }));

          let parsedItems = [];
          let existingMap = new Map();
          for (let med of m) {
            let key = `${med.name}-${med.manufacturer}`.toLowerCase();
            existingMap.set(key, med.id);
          }
          let batchSet = new Set();

          for (let i = 0; i < rawRows.length; i++) {
            let row = rawRows[i];
            if (!row || typeof row !== "object") continue;

            let norm = {};
            for (let k of Object.keys(row)) {
              let cleanKey = String(k).toLowerCase().replace(/[^a-z0-9]/g, "");
              norm[cleanKey] = row[k];
            }

            let rawProd = norm["productnamedosageform"] || norm["productname"] || norm["brandnameproductname"] || norm["name"] || norm["product"] || norm["item"] || "";
            let dosageForm = norm["dosageform"] || norm["form"] || norm["type"] || "Tablet";
            let prodName = rawProd;

            if (typeof rawProd === "string" && rawProd.includes(":")) {
              let parts = rawProd.split(":");
              dosageForm = parts[0].trim();
              prodName = parts.slice(1).join(":").trim();
            } else if (!prodName) {
              prodName = norm["brandname"] || "";
            }

            let manufacturer = norm["company"] || norm["manufacturer"] || norm["brandname"] || norm["mfg"] || "";
            if (norm["productnamedosageform"] && norm["company"]) {
              manufacturer = norm["company"];
            }

            let packSize = norm["packsize"] || norm["packagesize"] || norm["packagecontainer"] || norm["pack"] || "";
            let wholesalePrice = parseFloat(norm["averageunitprice"] || norm["unitpricebdt"] || norm["unitprice"] || norm["wholesaleprice"] || norm["tradeprice"] || norm["tp"] || norm["price"] || 0) || 0;
            let mrp = parseFloat(norm["packmrpbdt"] || norm["packmrp"] || norm["mrp"] || 0) || (wholesalePrice ? wholesalePrice * 1.22 : 0);
            let stock = parseInt(norm["stock"] || norm["quantity"] || norm["qty"] || 100) || 100;
            let moq = parseInt(norm["moq"] || norm["minimumorderquantity"] || 1) || 1;
            let generic = norm["generic"] || norm["genericname"] || "";
            let strength = norm["strength"] || "";

            if (prodName && String(prodName).trim()) {
              let key = `${String(prodName).trim()}-${String(manufacturer).trim()}`.toLowerCase();
              if (batchSet.has(key)) continue;
              batchSet.add(key);

              let existingId = existingMap.get(key);

              let newItem = {
                company: String(manufacturer).trim() || "",
                product_name: String(prodName).trim(),
                dosage_form: String(dosageForm).trim() || "Tablet",
                pack_size: String(packSize).trim(),
                unit_price: wholesalePrice,
                pack_mrp: mrp,
                image_url: norm["imageurl"] || norm["image"] || null,
                stock: stock,
                moq: moq,
                generic: generic,
                strength: strength
              };
              if (existingId) {
                newItem.id = existingId;
              }
              parsedItems.push(newItem);
            }
          }

          if (parsedItems.length === 0) {
            Ke({
              percent: 100,
              rowsProcessed: 0,
              totalRows: 0,
              eta: `No valid product rows found in file.`
            });
            He({
              loaded: !0,
              count: 0,
              fileName: files.length > 1 ? `${files.length} files` : files[0].name
            });
            T(`File processed: No valid records found.`);
            setTimeout(() => We(!1), 2000);
            return;
          }

          Ke({
            percent: 10,
            rowsProcessed: 0,
            totalRows: parsedItems.length,
            eta: `Uploading ${parsedItems.length} records to Database...`
          });
          console.log(`✅ STARTING SUPABASE UPLOAD FOR ${parsedItems.length} ROWS!`);

          const chunkSize = 500;
          let uploadedCount = 0;
          for (let c = 0; c < parsedItems.length; c += chunkSize) {
            let chunk = parsedItems.slice(c, c + chunkSize).map(item => ({
              company: item.company,
              product_name: item.product_name,
              dosage_form: item.dosage_form,
              pack_size: item.pack_size,
              unit_price: item.unit_price,
              pack_mrp: item.pack_mrp,
              image_url: item.image_url,
              stock: item.stock,
              moq: item.moq
            }));

            let {
              error: insertErr
            } = await supabase.from(`medicines`).upsert(chunk);
            if (insertErr) {
              console.error(`Supabase insert error on chunk:`, insertErr);
              throw insertErr;
            }

            uploadedCount += chunk.length;
            Ke({
              percent: Math.round(uploadedCount / parsedItems.length * 100),
              rowsProcessed: uploadedCount,
              totalRows: parsedItems.length,
              eta: `Uploaded ${uploadedCount} of ${parsedItems.length} rows to database...`
            });
          }

          let refreshPageSize = 1000, refreshAll = [], refreshPage = 0, refreshDone = false;
          while (!refreshDone) {
            const { data: chunk, error: refreshErr } = await supabase.from(`medicines`).select(`*`).order(`id`, { ascending: !0 }).range(refreshPage * refreshPageSize, (refreshPage + 1) * refreshPageSize - 1);
            if (refreshErr) { console.error(`Refresh fetch error:`, refreshErr); break; }
            if (chunk && chunk.length > 0) {
              refreshAll = refreshAll.concat(chunk);
              if (chunk.length < refreshPageSize) refreshDone = true;
            } else {
              refreshDone = true;
            }
            refreshPage++;
          }
          if (refreshAll.length > 0) {
            h(refreshAll.map(e => ({
              id: e.id,
              brandId: e.brand_id || `MED-` + e.id,
              name: e.product_name || e.company || `Unnamed`,
              type: e.dosage_form || `Other`,
              slug: e.product_name ? e.product_name.toLowerCase().replace(/[^a-z0-9]+/g, `-`) : ``,
              dosageForm: e.dosage_form || ``,
              dosage_form: e.dosage_form || ``,
              generic: e.generic || ``,
              strength: e.strength || ``,
              manufacturer: e.company || ``,
              packSize: e.pack_size || ``,
              packageSize: e.pack_size || ``,
              stock: e.stock || 0,
              moq: e.moq || 1,
              buyingPrice: Number(e.buying_price) || 0,
              wholesalePrice: Number(e.unit_price) || 0,
              mrp: Number(e.pack_mrp) || (Number(e.unit_price) ? Number(e.unit_price) * 1.2 : 0),
              imageUrl: e.image_url,
              expiryDate: `2027-12-31`,
              expiryMonths: 24,
              category: e.dosage_form || `Other`
            })));
          }

          He({
            loaded: !0,
            count: parsedItems.length,
            fileName: files.length > 1 ? `${files.length} files` : files[0].name
          });
          T(`Successfully imported ${parsedItems.length} medicines into the inventory!`);
          Ke({
            percent: 100,
            rowsProcessed: parsedItems.length,
            totalRows: parsedItems.length,
            eta: `Import Complete! Database synced.`
          });
          setTimeout(() => We(!1), 1200);
        } catch (err) {
          console.error(`Database Sync Error`, err);
          Ke({
            percent: 100,
            rowsProcessed: 0,
            totalRows: 0,
            eta: `❌ FAILED: ${err.message || `Import error`}`,
            error: !0
          });
          T(`Failed to import data: ${err.message || `Check console`}`);
        }
      };

      const readFile = file => new Promise((resolve, reject) => {
        const isExcel = file.name.endsWith(`.xlsx`) || file.name.endsWith(`.xls`);
        if (isExcel) {
          const reader = new FileReader();
          reader.onload = async evt => {
            try {
              const data = new Uint8Array(evt.target.result);
              const workbook = XLSX.read(data, { type: `array` });
              const firstSheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[firstSheetName];
              const rows = XLSX.utils.sheet_to_json(worksheet, { defval: `` });
              resolve(rows);
            } catch (err) {
              reject(err);
            }
          };
          reader.readAsArrayBuffer(file);
        } else {
          Papa.parse(file, {
            header: !0,
            skipEmptyLines: !0,
            complete: async results => resolve(results.data || []),
            error: err => reject(err)
          });
        }
      });

      try {
        let allRawRows = [];
        for (let file of files) {
          let rows = await readFile(file);
          allRawRows = allRawRows.concat(rows);
        }
        await parseRows(allRawRows);
      } catch (err) {
        console.error(`File parsing error:`, err);
        Ke({
          percent: 100,
          rowsProcessed: 0,
          totalRows: 0,
          eta: `❌ File Parse Error: ${err.message}`,
          error: !0
        });
        T(`Failed to process files: ${err.message}`);
      }
      e.target.value = ``;
    },
    [mt, ht] = useState(`approvals`),
    [gt, _t] = useState(null),
    [I, vt] = useState(null),
    [yt, bt] = useState({
      licenseGov: !1,
      addressMatch: !1,
      ownerIdVerify: !1,
      physicalStoreCheck: !1
    }),
    [xt, St] = useState(``),
    [Ct, wt] = useState(!1),
    [Tt, Et] = useState(``),
    [Dt, Ot] = useState(!1),
    [buyerFilterTab, setBuyerFilterTab] = useState('All'),
    [buyerSearchQuery, setBuyerSearchQuery] = useState(''),
    [kt, At] = useState([]),
    jt = e => {
      At(t => t.includes(e) ? t.filter(t => t !== e) : [...t, e]);
    },
    Mt = () => {
      kt.length === Jt.length && Jt.length > 0 ? At([]) : At(Jt.map(e => e.name));
    },
    Nt = async () => {
      if (kt.length !== 0 && window.confirm(`Are you sure you want to delete ${kt.length} selected medicines?`)) try {
        let {
          error: e
        } = await supabase.from(`medicines`).delete().in(`product_name`, kt);
        if (e) throw e;
        h(e => e.filter(e => !kt.includes(e.name))), At([]);
        let t = {
          id: Date.now(),
          text: `Admin deleted ${kt.length} medicines from the database.`,
          date: `Just now`,
          read: !1
        };
        w(e => [t, ...e]), T(`Deleted successfully!`);
      } catch (e) {
        console.error(e), T(`Error connecting to backend database`);
      }
    },
    Pt = () => {
      setModalInput("");
      ne({
        isOpen: !0,
        title: `Clear Entire Catalog`,
        message: `WARNING: Are you absolutely sure you want to delete ALL medicines from the database? This cannot be undone!`,
        isDestructive: !0,
        requireInput: !0,
        expectedInput: "confirm",
        onConfirm: async () => {
          ne({
            isOpen: !1,
            title: ``,
            message: ``,
            onConfirm: null,
            isDestructive: !1,
            requireInput: !1,
            expectedInput: ``
          });
          setModalInput("");
          try {
            We(!0);
            let {
              error: e
            } = await supabase.from(`medicines`).delete().neq(`id`, 0);
            if (e) throw e;
            h([]), At([]), T(`Admin successfully deleted all medicines from the database.`);
          } catch (e) {
            console.error(e), T(`Failed to delete all medicines: ` + e.message);
          } finally {
            We(!1);
          }
        }
      });
    },
    handleExportCsvClick = () => {
      if (!m || m.length === 0) {
        T(`No products available to export.`);
        return;
      }
      setModalInput("");
      ne({
        isOpen: true,
        title: `Export Catalog CSV`,
        message: `Admin authorization required. Please enter the security password to export the catalog dataset (${m.length.toLocaleString()} items).`,
        icon: "lock",
        isDestructive: false,
        requireInput: true,
        expectedInput: "password", // Current password; ready to be hooked to Supabase
        inputType: "password",
        inputLabel: "Admin Security Password",
        inputPlaceholder: "Enter password",
        confirmText: "Verify & Export",
        onConfirm: () => {
          ne({
            isOpen: false,
            title: "",
            message: "",
            onConfirm: null,
            isDestructive: false,
            requireInput: false,
            expectedInput: ""
          });
          setModalInput("");
          try {
            const dataToExport = m.map(e => ({
              brand_id: e.brandId || "",
              product_name: e.name || "",
              company: e.manufacturer || "",
              type: e.type || "",
              dosage_form: e.dosageForm || "",
              generic: e.generic || "",
              strength: e.strength || "",
              manufacturer: e.manufacturer || "",
              package_container: e.packSize || "",
              stock: e.stock || 0,
              moq: e.moq || 1,
              wholesalePrice: e.wholesalePrice || 0,
              mrp: e.mrp || 0,
              image_url: e.imageUrl || ""
            }));
            const csvStr = Papa.unparse(dataToExport);
            const blob = new Blob(["\uFEFF" + csvStr], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `dg_pharma_medicines_${new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            w(e => [{ id: Date.now(), text: `Admin authenticated and exported ${m.length} products to CSV.`, date: `Just now`, read: false }, ...e]);
            T(`Successfully exported ${m.length} products to CSV.`);
          } catch (err) {
            console.error("Export error:", err);
            T(`Failed to export CSV: ${err.message}`);
          }
        }
      });
    },
    [exportCsvHref, setExportCsvHref] = useState(""),
    [L, It] = useState(1),
    [Lt, Rt] = useState(20),
    [zt, Bt] = useState(``),
    [prevSearch, setPrevSearch] = useState(``),
    [Vt, Ht] = useState(`all`),
    [Ut, Wt] = useState(`all`),
    [prevCompany, setPrevCompany] = useState(`all`),
    searchInputRef = useRef(null),
    Gt = useMemo(() => [...new Set(m.map(e => e.manufacturer).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [m]),
    uniqueDosageForms = useMemo(() => {
      const defaults = [
        'Tablet', 'Capsule', 'Syrup', 'Suspension', 'Injection', 'Eye Drop', 'Ear Drop',
        'Cream', 'Ointment', 'Gel', 'Inhaler', 'Suppository', 'Lotion', 'Oral Suspension',
        'Nasal Spray', 'Nasal Drop', 'Powder for Suspension', 'Solution', 'Hand Rub',
        'Oral Solution', 'Chewable Tablet', 'IV Infusion'
      ];
      const fromData = [...new Set(m.map(e => e.dosageForm || e.dosage_form).filter(Boolean))];
      return [...new Set([...defaults, ...fromData])].sort((a, b) => a.localeCompare(b));
    }, [m]),
    Kt = useMemo(() => m.filter(e => {
      if (Vt === `inStock` && e.stock === 0 || Vt === `outOfStock` && e.stock > 0 || Ut !== `all` && e.manufacturer !== Ut) return !1;
      if (zt) {
        let t = zt.toLowerCase();
        return (e.name || ``).toLowerCase().includes(t) || (e.generic || ``).toLowerCase().includes(t) || (e.brandId || ``).toLowerCase().includes(t) || (e.manufacturer || ``).toLowerCase().includes(t);
      }
      return !0;
    }).sort((e, t) => {
      if (e._isNew && !t._isNew) return -1;
      if (!e._isNew && t._isNew) return 1;
      if (zt && zt.trim()) {
        let relE = getSearchRelevance(e, zt);
        let relT = getSearchRelevance(t, zt);
        if (relE !== relT) return relE - relT;
      }
      if (he === `name`) {
        let n = e.name || ``,
          r = t.name || ``,
          i = /^[a-zA-Z]/.test(n),
          a = /^[a-zA-Z]/.test(r);
        return i && !a ? -1 : !i && a ? 1 : n.localeCompare(r);
      }
      return he === `priceAsc` ? (e.wholesalePrice || 0) - (t.wholesalePrice || 0) : he === `priceDesc` ? (t.wholesalePrice || 0) - (e.wholesalePrice || 0) : he === `expiry` ? (e.expiryMonths || 0) - (t.expiryMonths || 0) : he === `stock` ? (t.stock || 0) - (e.stock || 0) : 0;
    }), [m, Vt, Ut, zt, he]),
    qt = Math.max(1, Math.ceil(Kt.length / Lt)),
    Jt = Kt.slice((L - 1) * Lt, L * Lt);
  useEffect(() => {
    It(1);
  }, [zt, Vt, Ut, Lt]);
  let [Yt, Xt] = useState(`All`),
    [Zt, Qt] = useState(`PharmaExpress`),
    [$t, en] = useState(``),
    [bulkPriceOpen, setBulkPriceOpen] = useState(false),
    [bulkPriceCompany, setBulkPriceCompany] = useState(`all`),
    [bulkPriceType, setBulkPriceType] = useState(`fixed`),
    [bulkPriceAmount, setBulkPriceAmount] = useState(``),
    [bulkPriceLoading, setBulkPriceLoading] = useState(false),
    [bulkPriceProgress, setBulkPriceProgress] = useState(0),
    [bulkPriceRule, setBulkPriceRule] = useState(null),
    tn = {
      name: n?.name || `Registered Pharmacy`,
      address: getFullAddress(n) || ``,
      addressLine1: n?.addressLine1 || ``,
      addressLine2: n?.addressLine2 || ``,
      city: n?.city || ``,
      division: n?.division || `Dhaka`,
      postalCode: n?.postalCode || ``,
      phone: n?.phone || ``,
      license: n?.licenseNumber || ``,
      tier: n?.tier || `Verified Buyer`,
      creditLimit: n?.creditLimit || 0,
      outstandingBalance: (() => {
        let lastEntry = ee && ee.length > 0 ? ee[ee.length - 1] : null;
        return lastEntry && typeof lastEntry.balance === 'number' ? lastEntry.balance : 0;
      })()
    };

  // Redirect staff users to their first authorized tab if currently on an unauthorized tab
  useEffect(() => {
    if (f === 'admin' && n) {
      const cleanEmail = (n.email || '').trim().toLowerCase();
      const isSuper = n.isSuperAdmin || cleanEmail === 'admin@dgpharma.shop' || cleanEmail === 'admin@dgpharma.com' || n.roleId === 'role_superadmin';
      if (!isSuper) {
        const tabPermissions = {
          approvals: 'approvals.view',
          fulfillment: 'orders.view',
          inventory: 'inventory.view',
          stockout: 'inventory.view',
          deliveryzones: 'deliveryzones.view',
          special_discount: 'pricing.view',
          coupons: 'pricing.view',
          staff_roles: 'users.manage',
          activity_log: 'activity_log.view',
          backup: 'backup.manage',
          analytics: 'analytics.view'
        };
        const requiredPerm = tabPermissions[mt];
        if (requiredPerm && !hasPermission(requiredPerm)) {
          const tabOrder = ['approvals', 'fulfillment', 'inventory', 'stockout', 'deliveryzones', 'special_discount', 'coupons', 'staff_roles', 'activity_log', 'backup', 'analytics'];
          const firstAllowed = tabOrder.find(t => hasPermission(tabPermissions[t]));
          if (firstAllowed) {
            ht(firstAllowed);
          }
        }
      }
    }
  }, [f, n, mt, adminRoles]);

  // Validate active buyer session against Supabase database. If buyer was deleted or revoked, terminate session immediately.
  useEffect(() => {
    if (e === 'authenticated' && f === 'buyer' && n?.email) {
      const checkBuyerSessionValidity = async () => {
        try {
          const cleanEmail = n.email.trim().toLowerCase();
          const { data: bRow, error: bErr } = await supabase
            .from('buyers')
            .select('status, id')
            .ilike('email', cleanEmail)
            .maybeSingle();

          if (bErr) return;

          if (!bRow) {
            // Check if pending registration exists
            const { data: regRow } = await supabase
              .from('pharmacy_registrations')
              .select('status')
              .ilike('email', cleanEmail)
              .maybeSingle();

            if (!regRow) {
              // Completely deleted from database!
              try { localStorage.removeItem('dg_session'); } catch { }
              try { await supabase.auth.signOut(); } catch { }
              a(prev => prev.filter(u => u.email.toLowerCase() !== cleanEmail));
              r(null);
              t('login');
              setLoginError('This buyer account has been deleted and no longer has access to the portal.');
              return;
            } else if (regRow.status === 'Rejected') {
              try { localStorage.removeItem('dg_session'); } catch { }
              try { await supabase.auth.signOut(); } catch { }
              r(null);
              t('login');
              setLoginError('Your registration application was rejected.');
              return;
            } else if (regRow.status === 'Pending' || regRow.status === 'Pending Verification') {
              t('awaiting_approval');
              return;
            }
          } else {
            // Buyer found in buyers table
            if (bRow.status === 'Rejected') {
              try { localStorage.removeItem('dg_session'); } catch { }
              try { await supabase.auth.signOut(); } catch { }
              r(null);
              t('login');
              setLoginError('Your buyer account access has been revoked.');
              return;
            } else if (bRow.status === 'Pending' || bRow.status === 'Pending Verification') {
              t('awaiting_approval');
              return;
            }
          }
        } catch (sessErr) {
          console.error('Session validation error:', sessErr);
        }
      };
      checkBuyerSessionValidity();
    }
  }, [e, f, n?.email]);

  // Compute delivery zone for the current buyer based on their city or address
  const buyerZone = getDeliveryZone(tn.city || n?.city || tn.buyerAddress || tn.address || tn.location || n?.address || '');
  const buyerDeliveryMen = buyerZone ? getDeliveryMenForZone(buyerZone) : [];

  const handleUpdateUserProfile = (updatedUser) => {
    r(updatedUser);
    a(prev => {
      const nextUsers = prev.map(u => (u.id === updatedUser.id || (u.email && u.email === updatedUser.email)) ? { ...u, ...updatedUser } : u);
      try {
        localStorage.setItem('dg_users', JSON.stringify(nextUsers));
      } catch (err) {
        console.error('Failed to save users to localStorage:', err);
      }
      return nextUsers;
    });
  };
  let nn = useMemo(() => (Array.isArray(m) ? m : []).filter(e => {
    if (!e || e.is_deactivated) return !1;
    if (oe.trim()) {
      let t = oe.toLowerCase();
      if (!(String(e.name || ``).toLowerCase().includes(t) || String(e.generic || ``).toLowerCase().includes(t) || String(e.brandId || ``).toLowerCase().includes(t) || String(e.manufacturer || ``).toLowerCase().includes(t))) return !1;
    }
    if (ce.length > 0 && !ce.includes(e.manufacturer) || N.length > 0 && !N.includes(e.category)) return !1;
    if (de === `inStock`) {
      if (e.stock <= 0) return !1;
    } else if (de === `lowStock`) {
      if (e.stock <= 0 || e.stock > 100) return !1;
    } else if (de === `outOfStock` && e.stock > 0) return !1;
    if (pe === `long`) {
      if (e.expiryMonths <= 12) return !1;
    } else if (pe === `medium`) {
      if (e.expiryMonths < 6 || e.expiryMonths > 12) return !1;
    } else if (pe === `short` && e.expiryMonths >= 6) return !1;
    return !0;
  }).sort((e, t) => {
    if (oe && oe.trim()) {
      let relE = getSearchRelevance(e, oe);
      let relT = getSearchRelevance(t, oe);
      if (relE !== relT) return relE - relT;
    }
    if (he === `name`) {
      let n = e.name || ``,
        r = t.name || ``,
        i = /^[a-zA-Z]/.test(n),
        a = /^[a-zA-Z]/.test(r);
      return i && !a ? -1 : !i && a ? 1 : n.localeCompare(r);
    }
    return he === `priceAsc` ? (e.wholesalePrice || 0) - (t.wholesalePrice || 0) : he === `priceDesc` ? (t.wholesalePrice || 0) - (e.wholesalePrice || 0) : he === `expiry` ? (e.expiryMonths || 0) - (t.expiryMonths || 0) : he === `stock` ? (t.stock || 0) - (e.stock || 0) : 0;
  }), [m, oe, ce, N, de, pe, he]);
  useEffect(() => {
    re(1);
  }, [oe, ce, N, de, pe, he]);

  useEffect(() => {
    if (!m || m.length === 0) {
      setExportCsvHref("");
      return;
    }
    const dataToExport = m.map(e => ({
      brand_id: e.brandId || "",
      product_name: e.name || "",
      company: e.manufacturer || "",
      type: e.type || "",
      dosage_form: e.dosageForm || "",
      generic: e.generic || "",
      strength: e.strength || "",
      manufacturer: e.manufacturer || "",
      package_container: e.packSize || "",
      stock: e.stock || 0,
      moq: e.moq || 1,
      wholesalePrice: e.wholesalePrice || 0,
      mrp: e.mrp || 0,
      image_url: e.imageUrl || ""
    }));
    const csvStr = Papa.unparse(dataToExport);
    const blob = new Blob(["\uFEFF" + csvStr], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    setExportCsvHref(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [m]);

  const handleBarcodeScanned = (barcodeText) => {
    const cleanId = barcodeText.trim().toUpperCase();
    const order = b.find(o => o.id === cleanId || o.id.replace('PB-2026-', '') === cleanId);

    if (order) {
      if (f === 'admin') {
        vt(order);
      } else {
        ke(order);
      }
      setBarcodeModalOpen(false);
      T(`Order ${order.id} found! Details opened.`);
    } else {
      T(`Order ${cleanId} not found in database.`);
    }
  };

  useEffect(() => {
    if (!barcodeModalOpen) return;

    let html5QrCode;
    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("barcode-reader-element");
        const config = {
          fps: 10,
          qrbox: (width, height) => {
            return { width: Math.min(width * 0.8, 250), height: 120 };
          },
          aspectRatio: 1.777778
        };
        try {
          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              handleBarcodeScanned(decodedText);
              html5QrCode.stop().catch(err => console.error("Error stopping scanner:", err));
            },
            () => { }
          );
        } catch (e) {
          console.warn("Rear-facing environment camera not found, trying any default camera device:", e);
          await html5QrCode.start(
            {},
            config,
            (decodedText) => {
              handleBarcodeScanned(decodedText);
              html5QrCode.stop().catch(err => console.error("Error stopping scanner:", err));
            },
            () => { }
          );
        }
      } catch (err) {
        console.error("Camera init failed:", err);
      }
    };

    const timer = setTimeout(startScanner, 250);

    return () => {
      clearTimeout(timer);
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop()
          .then(() => html5QrCode.clear())
          .catch(err => console.error("Scanner cleanup failed:", err));
      }
    };
  }, [barcodeModalOpen]);

  useEffect(() => {
    if (triggersPrint && invoicesToPrint.length > 0) {
      const timer = setTimeout(() => {
        window.print();
        setTriggersPrint(!1);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [triggersPrint, invoicesToPrint]);



  const getInvoiceItemPricing = (item) => {
    const rawName = item.name || item.product_name || '';
    const matchedMed = m.find(med =>
      String(med.id) === String(item.id || item.medicine_id) ||
      (rawName && med.name && med.name.toLowerCase() === rawName.toLowerCase()) ||
      (item.product_name && med.product_name && med.product_name.toLowerCase() === item.product_name.toLowerCase()) ||
      (item.brandId && med.brandId && med.brandId === item.brandId)
    );
    const name = rawName || matchedMed?.name || 'Item';
    const manufacturer = item.manufacturer || item.company || matchedMed?.manufacturer || matchedMed?.company || '';
    const unitPrice = Number(item.price ?? item.unit_price ?? item.wholesalePrice ?? 0);
    let mrp = Number(item.mrp || item.pack_mrp || matchedMed?.mrp || matchedMed?.pack_mrp || 0);
    if (!mrp || mrp <= 0) {
      mrp = unitPrice > 0 ? Number((unitPrice * 1.2).toFixed(2)) : 0;
    }
    const discountAmount = Math.max(0, mrp - unitPrice);
    const discountPercent = mrp > 0 && discountAmount > 0 ? Math.round((discountAmount / mrp) * 100) : 0;
    return {
      name,
      manufacturer,
      company: manufacturer,
      mrp,
      unitPrice,
      discountAmount,
      discountPercent
    };
  };

  const offersCompanies = useMemo(() => {
    const list = Object.keys(specialDiscounts).map(medName => {
      const med = m.find(e => e.product_name === medName || e.name === medName);
      return med ? med.manufacturer : null;
    }).filter(Boolean);
    return [...new Set(list)].sort();
  }, [m, specialDiscounts]);

  useEffect(() => {
    try {
      localStorage.setItem('medicine_requests', JSON.stringify(Re));
    } catch (e) {
      console.error("Failed to save medicine requests:", e);
    }
  }, [Re]);

  const myRequests = useMemo(() => {
    if (!Array.isArray(Re)) return [];
    if (f === 'admin') return Re;
    const currentEmail = n?.email ? n.email.trim().toLowerCase() : '';
    const currentPharmId = n?.pharmacyId || n?.id || '';
    const currentPhone = (n?.phone || tn?.phone || '').trim();
    const currentName = (tn?.name || n?.name || '').trim();

    return Re.filter(r => {
      if (!r) return false;
      const reqEmail = r.buyerEmail ? r.buyerEmail.trim().toLowerCase() : '';
      const reqPharmId = r.pharmacyId || r.buyerId || '';
      const reqPhone = (r.buyerPhone || '').trim();
      const reqName = (r.buyerName || '').trim();

      if (reqEmail && currentEmail && reqEmail === currentEmail) return true;
      if (reqPharmId && currentPharmId && (reqPharmId === currentPharmId || reqPharmId === n?.pharmacyId || reqPharmId === n?.id)) return true;
      if (reqPhone && currentPhone && reqPhone !== 'N/A' && currentPhone !== 'N/A' &&
        reqPhone.replace(/[^0-9]/g, '') === currentPhone.replace(/[^0-9]/g, '') && currentPhone.length >= 7) return true;
      if (reqName && currentName && reqName.toLowerCase() === currentName.toLowerCase()) {
        if (['registered pharmacy', 'pharmacy shop', 'demo pharmacy', 'care & cure pharmacy ltd.'].includes(currentName.toLowerCase())) {
          return currentEmail === 'buyer@dgpharma.com';
        }
        return true;
      }
      return false;
    });
  }, [Re, f, n, tn]);

  const myOrders = useMemo(() => {
    if (f === 'admin') return b;
    const currentEmail = n?.email ? n.email.trim().toLowerCase() : '';
    const currentPharmId = n?.pharmacyId || n?.id || '';
    const currentPhone = (n?.phone || tn?.phone || '').trim();
    const currentName = (tn?.name || n?.name || '').trim();

    return b.filter(o => {
      if (!o) return false;
      const orderEmail = o.buyerEmail ? o.buyerEmail.trim().toLowerCase() : '';
      const orderPharmId = o.buyerId || o.pharmacyId || '';
      const orderPhone = (o.phone || '').trim();
      const orderName = (o.buyerName || '').trim();

      if (orderPharmId && currentPharmId && (orderPharmId === currentPharmId || orderPharmId === n?.pharmacyId || orderPharmId === n?.id)) return true;
      if (orderEmail && currentEmail && orderEmail === currentEmail) return true;
      if (orderPhone && currentPhone && orderPhone !== 'N/A' && currentPhone !== 'N/A' &&
        orderPhone.replace(/[^0-9]/g, '') === currentPhone.replace(/[^0-9]/g, '') && currentPhone.length >= 7) return true;
      if (orderName && currentName && orderName.toLowerCase() === currentName.toLowerCase()) {
        if (['registered pharmacy', 'pharmacy shop', 'demo pharmacy', 'care & cure pharmacy ltd.'].includes(currentName.toLowerCase())) {
          return currentEmail === 'buyer@dgpharma.com';
        }
        return true;
      }
      return false;
    });
  }, [b, f, n, tn]);

  const isMedicineRequested = (med) => {
    if (!med || !Array.isArray(myRequests)) return false;
    return myRequests.some(r =>
      r && (
        (r.medId && r.medId === med.id) ||
        (r.name && typeof r.name === 'string' && (
          (med.name && typeof med.name === 'string' && r.name.toLowerCase() === med.name.toLowerCase()) ||
          (med.product_name && typeof med.product_name === 'string' && r.name.toLowerCase() === med.product_name.toLowerCase())
        ))
      )
    );
  };

  const handleOpenQuickRequest = (med) => {
    setQuickRequestModal({
      isOpen: true,
      med: med,
      quantity: '100',
      notes: ''
    });
  };

  const handleSubmitQuickRequest = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!quickRequestModal.med) return;
    const med = quickRequestModal.med;
    const medName = med.name || med.product_name || 'Unnamed Medicine';
    const newReq = {
      id: `REQ-${Date.now()}`,
      medId: med.id || null,
      name: medName,
      generic: med.generic || '',
      manufacturer: med.manufacturer || med.company || '',
      quantity: parseInt(quickRequestModal.quantity) || 100,
      notes: quickRequestModal.notes || 'Out-of-stock catalog request',
      buyerName: tn?.name || 'Registered Pharmacy',
      buyerEmail: n?.email || '',
      buyerId: n?.pharmacyId || n?.id || '',
      pharmacyId: n?.pharmacyId || n?.id || '',
      buyerPhone: tn?.phone || n?.phone || '',
      date: new Date().toLocaleDateString(),
      status: 'Pending Review',
      source: 'Catalog Out-of-Stock'
    };

    ze(prev => [newReq, ...prev]);
    try {
      supabase.from('medicine_requests').insert([{
        id: newReq.id,
        med_id: newReq.medId || null,
        name: newReq.name,
        generic: newReq.generic || '',
        manufacturer: newReq.manufacturer || '',
        quantity: newReq.quantity,
        notes: newReq.notes,
        buyer_name: newReq.buyerName,
        buyer_email: newReq.buyerEmail,
        buyer_id: newReq.buyerId,
        pharmacy_id: newReq.pharmacyId,
        buyer_phone: newReq.buyerPhone,
        date: newReq.date,
        status: newReq.status,
        source: newReq.source,
        created_at: new Date().toISOString()
      }]).then(({ error }) => {
        if (error) console.warn('Supabase medicine_requests insert error:', error);
      });
    } catch (err) {
      console.warn('Supabase insert error:', err);
    }
    setQuickRequestModal({ isOpen: false, med: null, quantity: '100', notes: '' });
    w(prev => [{
      id: Date.now(),
      text: `Medicine request for "${medName}" submitted to Admin.`,
      date: `Just now`,
      read: false
    }, ...prev]);
    T(`Request for "${medName}" sent to admin!`);
  };

  const handleUpdateRequestStatus = (reqId, newStatus) => {
    ze(prev => prev.map(r => r.id === reqId ? { ...r, status: newStatus } : r));
    try {
      supabase.from('medicine_requests').update({ status: newStatus }).eq('id', reqId).then(({ error }) => {
        if (error) console.warn('Supabase medicine_requests update error:', error);
      });
    } catch (err) {
      console.warn('Supabase update error:', err);
    }
    logAdminActivity({
      category: 'MEDICINE_REQUESTS',
      action: 'REQUEST_STATUS_UPDATED',
      details: `Updated medicine request #${reqId} status to "${newStatus}"`,
      targetId: reqId,
      metadata: { newStatus }
    });
    T(`Request status updated to "${newStatus}"`);
  };

  const handleAdminRestockMed = async (req, qtyToAdd = 100) => {
    const targetMed = m.find(item => (req.medId && item.id === req.medId) || (req.name && item.name && item.name.toLowerCase() === req.name.toLowerCase()));
    if (targetMed) {
      const newStock = (targetMed.stock || 0) + qtyToAdd;
      h(prev => prev.map(item => item.id === targetMed.id ? { ...item, stock: newStock } : item));
      ze(prev => prev.map(r => r.id === req.id ? { ...r, status: 'Restocked & Available' } : r));
      try {
        await supabase.from('medicines').update({ stock: newStock }).eq('id', targetMed.id);
        await supabase.from('medicine_requests').update({ status: 'Restocked & Available' }).eq('id', req.id);
      } catch (err) {
        console.warn('Could not sync stock to supabase:', err);
      }
      logAdminActivity({
        category: 'MEDICINE_REQUESTS',
        action: 'MEDICINE_RESTOCKED',
        details: `Restocked ${qtyToAdd} units for "${targetMed.name}" from customer request #${req.id}`,
        targetId: req.id,
        metadata: { medName: targetMed.name, medId: targetMed.id, qty: qtyToAdd }
      });
      T(`Restocked ${qtyToAdd} units for "${targetMed.name}". Status marked as Restocked!`);
    } else {
      ze(prev => prev.map(r => r.id === req.id ? { ...r, status: 'In Procurement' } : r));
      try {
        supabase.from('medicine_requests').update({ status: 'In Procurement' }).eq('id', req.id);
      } catch (err) { }
      logAdminActivity({
        category: 'MEDICINE_REQUESTS',
        action: 'MARK_IN_PROCUREMENT',
        details: `Marked medicine request #${req.id} ("${req.name}") as In Procurement`,
        targetId: req.id,
        metadata: { medName: req.name }
      });
      T(`Marked "${req.name}" as In Procurement.`);
    }
  };

  const handleDeleteRequest = (reqId) => {
    ze(prev => prev.filter(r => r.id !== reqId));
    try {
      supabase.from('medicine_requests').delete().eq('id', reqId).then(({ error }) => {
        if (error) console.warn('Supabase medicine_requests delete error:', error);
      });
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
    logAdminActivity({
      category: 'MEDICINE_REQUESTS',
      action: 'REQUEST_DELETED',
      details: `Deleted medicine request #${reqId}`,
      targetId: reqId
    });
    T(`Medicine request removed.`);
  };

  let rn = useMemo(() => {
    let e = new Map();
    (Array.isArray(nn) ? nn : []).forEach(t => {
      if (!t || !t.name) return;
      e.has(t.name) ? e.get(t.name).variations.push(t) : e.set(t.name, {
        ...t,
        variations: [t]
      });
    });
    return Array.from(e.values());
  }, [nn]),
    an = useMemo(() => rn.slice((A - 1) * 20, A * 20), [rn, A, 20]),
    on = useMemo(() => Object.entries(ye || {}).map(([e, t]) => {
      let n = Array.isArray(m) ? m.find(item => item && (String(item.id) === String(e) || String(item.name) === String(e) || String(item.brandId) === String(e))) : null;
      if (!n) return null;
      let unitPrice = Number(n.unit_price || n.price || n.wholesalePrice || 0);
      let sd = specialDiscounts && typeof specialDiscounts === 'object' ? (specialDiscounts[n.product_name] || specialDiscounts[n.name]) : null;
      let lineTotal = unitPrice * t;
      let itemSpecialDiscount = 0;
      if (sd) {
        if (sd.type === 'percentage') itemSpecialDiscount = lineTotal * (Number(sd.value || 0) / 100);
        else itemSpecialDiscount = Number(sd.value || 0);
      }
      return {
        ...n,
        wholesalePrice: unitPrice,
        quantity: t,
        itemSpecialDiscount: itemSpecialDiscount,
        itemTotal: Math.max(0, lineTotal - itemSpecialDiscount)
      };
    }).filter(Boolean), [ye, m, specialDiscounts]),
    sn = useMemo(() => {
      let e = on.reduce((e, t) => e + t.quantity, 0),
        discountedSubtotal = on.reduce((e, t) => e + t.itemTotal, 0),
        totalSpecialDiscounts = on.reduce((e, item) => e + item.itemSpecialDiscount, 0),
        n = on.reduce((e, t) => e + (Number(t.pack_mrp || t.mrp || t.wholesalePrice || 0) - t.wholesalePrice) * t.quantity, 0),
        r = 0;
      let couponDiscountAmount = 0;
      if (appliedCoupon) {
        if (appliedCoupon.type === 'percentage') couponDiscountAmount = discountedSubtotal * (appliedCoupon.value / 100);
        else couponDiscountAmount = appliedCoupon.value;
      }
      return {
        totalItems: e,
        subtotal: discountedSubtotal + totalSpecialDiscounts,
        totalSpecialDiscounts,
        couponDiscountAmount,
        savings: Math.max(0, n),
        tax: 0,
        finalTotal: Math.max(0, discountedSubtotal - couponDiscountAmount)
      };
    }, [on, appliedCoupon]),
    cn = (e, t) => {
      let medId = typeof e === "object" && e !== null ? (e.id || e.brandId || e.name) : e;
      let delta = typeof t === "number" ? t : 1;
      let n = m.find(item => String(item.id) === String(medId) || String(item.name) === String(medId) || String(item.brandId) === String(medId));
      if (!n && typeof e === "object" && e !== null) n = e;
      if (!n) return;
      let targetId = n.id || medId;

      be(prev => {
        let currentQty = prev[targetId] || 0;
        let newQty = currentQty + delta;
        if (newQty <= 0) {
          let updated = { ...prev };
          delete updated[targetId];
          return updated;
        }
        let maxStock = n.stock !== undefined ? n.stock : 99999;
        let capped = Math.min(newQty, maxStock);
        return {
          ...prev,
          [targetId]: capped
        };
      });
      if (delta > 0) {
        Se(!0);
      }
    },
    ln = (e, t) => {
      let medId = typeof e === "object" && e !== null ? (e.id || e.brandId || e.name) : e;
      let n = m.find(item => String(item.id) === String(medId) || String(item.name) === String(medId) || String(item.brandId) === String(medId));
      let targetId = n ? (n.id || medId) : medId;
      if (t <= 0) {
        be(prev => {
          let updated = { ...prev };
          delete updated[targetId];
          return updated;
        });
      } else {
        let maxStock = n && n.stock !== undefined ? n.stock : 99999;
        let capped = Math.min(t, maxStock);
        be(prev => ({
          ...prev,
          [targetId]: capped
        }));
      }
    },
    un = () => {
      be({});
      setAppliedCoupon(null);
    },
    dn = e => {
      e.preventDefault();
      let t = parseFloat(Ie.amount);
      if (isNaN(t) || t <= 0) return;
      let n = {
        date: new Date().toISOString().split(`T`)[0],
        ref: `PAY-2026-${Math.floor(1e3 + Math.random() * 9e3)}`,
        desc: `Credit Account Payment - Client Self Service`,
        debit: 0,
        credit: t,
        balance: Math.max(0, tn.outstandingBalance - t),
        type: `Payment`
      };
      S(e => [...e, n]);
      let r = {
        id: Date.now(),
        text: `Payment of ৳${t.toFixed(2)} received and credited to account. Available balance updated.`,
        date: `Just now`,
        read: !1
      };
      w(e => [r, ...e]), Le({
        isOpen: !1,
        amount: ``
      });
    },
    fn = async () => {
      if (on.length === 0 || isPlacingOrder) return;

      // 1. Resolve Delivery Address (Default Registered vs Custom Added)
      let resolvedAddressLine1 = '';
      let resolvedAddressLine2 = '';
      let resolvedCity = '';
      let resolvedDivision = 'Dhaka';
      let resolvedPostalCode = '';
      let resolvedPhone = tn.phone || n?.phone || '';
      let resolvedFullAddress = '';

      if (useCustomAddress) {
        if (!customAddress.addressLine1 || !customAddress.addressLine1.trim()) {
          setAddressError('Please enter Address Line 1 for delivery.');
          return;
        }
        if (!customAddress.city || !customAddress.city.trim()) {
          setAddressError('Please enter City / Area for delivery.');
          return;
        }
        setAddressError('');
        resolvedAddressLine1 = customAddress.addressLine1.trim();
        resolvedAddressLine2 = (customAddress.addressLine2 || '').trim();
        resolvedCity = customAddress.city.trim();
        resolvedDivision = (customAddress.division || 'Dhaka').trim();
        resolvedPostalCode = (customAddress.postalCode || '').trim();
        resolvedPhone = (customAddress.phone || '').trim() || tn.phone || n?.phone || '';
        resolvedFullAddress = [
          resolvedAddressLine1,
          resolvedAddressLine2,
          resolvedCity,
          (resolvedDivision && resolvedPostalCode ? `${resolvedDivision} - ${resolvedPostalCode}` : resolvedDivision || resolvedPostalCode)
        ].filter(Boolean).join(', ');
      } else {
        resolvedAddressLine1 = tn.addressLine1 || n?.addressLine1 || '';
        resolvedAddressLine2 = tn.addressLine2 || n?.addressLine2 || '';
        resolvedCity = tn.city || n?.city || '';
        resolvedDivision = tn.division || n?.division || 'Dhaka';
        resolvedPostalCode = tn.postalCode || n?.postalCode || '';
        resolvedPhone = tn.phone || n?.phone || '';
        resolvedFullAddress = tn.address || getFullAddress(n) || 'Default Registered Address';
      }

      setIsPlacingOrder(true);

      try {
        const currentYear = new Date().getFullYear();
        const prefix = `DG-${currentYear}-`;

        // 1. Determine next order serial (query Supabase and local state)
        let nextSerial = 1;
        try {
          const { data: dbOrders } = await supabase
            .from('orders')
            .select('id')
            .like('id', `${prefix}%`)
            .order('id', { ascending: false })
            .limit(1);
          if (dbOrders && dbOrders.length > 0) {
            const part = dbOrders[0].id.substring(prefix.length);
            const num = parseInt(part, 10);
            if (!isNaN(num)) nextSerial = Math.max(nextSerial, num + 1);
          }
        } catch (dbErr) {
          console.warn("Could not query highest order id from database:", dbErr);
        }

        const matches = (b || []).filter(o => o && typeof o.id === 'string' && o.id.startsWith(prefix));
        if (matches.length > 0) {
          const serials = matches.map(o => {
            const part = o.id.substring(prefix.length);
            const num = parseInt(part, 10);
            return isNaN(num) ? -1 : num;
          });
          nextSerial = Math.max(nextSerial, Math.max(...serials) + 1);
        }

        const orderId = `${prefix}${String(nextSerial).padStart(4, '0')}`;

        // 2. Resolve buyer's UUID (Supabase orders.buyer_id expects UUID, not PHARM-PEND-xxx)
        const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
        let buyerDbUuid = null;
        if (isUuid(n?.buyerUuid)) {
          buyerDbUuid = n.buyerUuid;
        } else if (isUuid(n?.id)) {
          buyerDbUuid = n.id;
        } else if (n?.email) {
          try {
            const { data: bRow } = await supabase.from('buyers').select('id').ilike('email', n.email.trim()).maybeSingle();
            if (bRow && isUuid(bRow.id)) {
              buyerDbUuid = bRow.id;
            }
          } catch (bLookupErr) {
            console.warn("Could not resolve buyer UUID:", bLookupErr);
          }
        }

        const orderDateStr = new Date().toISOString().split('T')[0];
        const newOrder = {
          id: orderId,
          buyerId: buyerDbUuid || n?.pharmacyId || n?.id || '',
          buyerEmail: n?.email || '',
          buyerName: tn?.name || n?.name || 'Registered Pharmacy',
          buyerAddress: resolvedFullAddress,
          addressLine1: resolvedAddressLine1,
          addressLine2: resolvedAddressLine2,
          city: resolvedCity,
          division: resolvedDivision,
          postalCode: resolvedPostalCode,
          location: resolvedFullAddress,
          phone: resolvedPhone,
          date: orderDateStr,
          totalAmount: sn.finalTotal,
          subtotal: sn.subtotal,
          tax: sn.tax,
          totalSpecialDiscounts: sn.totalSpecialDiscounts,
          couponDiscountAmount: sn.couponDiscountAmount,
          appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
          itemCount: on.length,
          status: `Pending Verification`,
          paymentStatus: `Pending (COD)`,
          paymentMethod: `Cash on Delivery (COD)`,
          locationCoordinates: null,
          items: on.map(e => ({
            id: e.id,
            name: e.name || e.product_name || '',
            manufacturer: e.manufacturer || '',
            mrp: Number(e.pack_mrp || e.mrp || 0),
            quantity: e.quantity,
            price: e.wholesalePrice,
            specialDiscount: e.itemSpecialDiscount || 0
          }))
        };

        // 3. Insert order into Supabase
        const { error: orderError } = await supabase.from('orders').insert({
          id: orderId,
          buyer_name: newOrder.buyerName,
          buyer_id: isUuid(buyerDbUuid) ? buyerDbUuid : null,
          phone: resolvedPhone || null,
          buyer_address: resolvedFullAddress || null,
          address_line1: resolvedAddressLine1 || null,
          address_line2: resolvedAddressLine2 || null,
          city: resolvedCity || null,
          division: resolvedDivision || null,
          postal_code: resolvedPostalCode || null,
          order_date: orderDateStr,
          total_amount: sn.finalTotal,
          status: `Pending Verification`,
          payment_status: `Pending (COD)`,
          payment_method: `Cash on Delivery (COD)`
        });

        if (orderError) {
          console.error("Failed to insert order into Supabase:", orderError);
          alert("Failed to place order: " + (orderError.message || JSON.stringify(orderError)));
          return;
        }

        // 4. Insert order items into Supabase
        const orderItems = on.map(item => ({
          order_id: orderId,
          medicine_id: String(item.id || ''),
          product_name: item.name || item.product_name || 'Medicine',
          quantity: item.quantity,
          unit_price: item.wholesalePrice,
          special_discount: item.itemSpecialDiscount || 0
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
        if (itemsError) {
          console.error("Failed to insert order items: ", itemsError);
        }

        // 5. Update local medicine stock and orders list
        h(prev => prev.map(med => {
          const cartItem = on.find(ci => String(ci.id) === String(med.id));
          return cartItem ? {
            ...med,
            stock: Math.max(0, (med.stock || 0) - cartItem.quantity)
          } : med;
        }));
        x(prev => [newOrder, ...prev]);

        // 6. Push local notification and trigger confirmation popup
        const orderNotification = {
          id: Date.now(),
          text: `Successfully placed B2B Order ${orderId} totaling ৳${sn.finalTotal.toFixed(2)}. Pending marketplace verification.`,
          date: `Just now`,
          read: false
        };
        w(prev => [orderNotification, ...prev]);
        be({});
        Se(false);
        Ne({
          isOpen: true,
          orderId: orderId,
          order: newOrder
        });
      } catch (err) {
        console.error("Order placement exception:", err);
        alert("Failed to place order: " + (err.message || String(err)));
      } finally {
        setIsPlacingOrder(false);
      }
    },
    pn = e => {
      se(e), O !== `search` && k(`search`);
    },
    mn = () => {
      se(``), le([]), ue([]), fe(`all`), me(`all`), ge(`name`), setOffersCompany("");
    },
    hn = m.filter(e => e.expiryMonths < 6).length,
    gn = m.filter(e => e.stock > 0 && e.stock <= 100).length,
    _n = async e => {
      D(t => t.map(t => (t.id === e || t.pharmacyId === e) ? {
        ...t,
        status: `Approved`
      } : t));
      a(t => {
        const next = t.map(t => (t.pharmacyId === e || t.id === e) ? {
          ...t,
          status: `Approved`
        } : t);
        try { localStorage.setItem('dg_users', JSON.stringify(next)); } catch { }
        return next;
      });
      let t = E.find(t => t.id === e || t.pharmacyId === e);
      let n = {
        id: Date.now(),
        text: `Admin Approved New Pharmacy Access: ${t?.name || e} (License ${t?.licenseNumber || ''}) has been activated.`,
        date: `Just now`,
        read: !1
      };
      w(e => [n, ...e]), _t(null), bt({
        licenseGov: !1,
        addressMatch: !1,
        ownerIdVerify: !1,
        physicalStoreCheck: !1
      }), Et(``);
      T(`Pharmacy "${t?.name || e}" has been approved and activated!`);

      try {
        await supabase.from('pharmacy_registrations').update({ status: 'Approved' }).eq('id', e);
        if (t?.email) {
          await supabase.from('buyers').update({ status: 'Approved' }).ilike('email', t.email);
        }
        await supabase.from('buyers').update({ status: 'Approved' }).eq('pharmacy_id', e);
        await supabase.from('buyers').update({ status: 'Approved' }).eq('id', e);
      } catch (err) {
        console.error('Error updating approval status in Supabase:', err);
      }
      logAdminActivity({
        category: 'BUYER_APPROVAL',
        action: 'PHARMACY_APPROVED',
        details: `Approved pharmacy license and activated buyer: ${t?.name || e} (${t?.email || 'N/A'})`,
        targetId: e,
        metadata: { licenseNumber: t?.licenseNumber, name: t?.name, email: t?.email }
      });
    },
    vn = async e => {
      const reason = xt.trim() || 'Access revoked by administrator';
      if (!xt.trim() && !Ct) {
        wt(!0);
        T("Please enter a reason or click again to confirm.");
        return;
      }
      D(t => t.map(t => (t.id === e || t.pharmacyId === e) ? {
        ...t,
        status: `Rejected`,
        rejectionReason: reason
      } : t));
      a(t => {
        const next = t.map(t => (t.pharmacyId === e || t.id === e) ? {
          ...t,
          status: `Rejected`,
          rejectionReason: reason
        } : t);
        try { localStorage.setItem('dg_users', JSON.stringify(next)); } catch { }
        return next;
      });
      let t = E.find(t => t.id === e || t.pharmacyId === e);
      let n = {
        id: Date.now(),
        text: `Admin Rejected/Revoked Pharmacy Registration: ${t?.name || e} due to: "${reason}".`,
        date: `Just now`,
        read: !1
      };
      w(e => [n, ...e]), _t(null), St(``), wt(!1), Et(``);
      T(`Access for "${t?.name || e}" has been rejected/revoked.`);

      try {
        await supabase.from('pharmacy_registrations').update({ status: 'Rejected' }).eq('id', e);
        if (t?.email) {
          await supabase.from('buyers').update({ status: 'Rejected' }).ilike('email', t.email);
        }
        await supabase.from('buyers').update({ status: 'Rejected' }).eq('pharmacy_id', e);
        await supabase.from('buyers').update({ status: 'Rejected' }).eq('id', e);
      } catch (err) {
        console.error('Error updating rejection status in Supabase:', err);
      }

      // If revoked buyer is in active session, clear session
      try {
        const s = localStorage.getItem('dg_session');
        if (s) {
          const parsed = JSON.parse(s);
          const sessEmail = parsed.currentUser?.email ? parsed.currentUser.email.trim().toLowerCase() : '';
          const targetEmail = t?.email ? t.email.trim().toLowerCase() : '';
          if ((targetEmail && sessEmail === targetEmail) || parsed.currentUser?.pharmacyId === e) {
            localStorage.removeItem('dg_session');
          }
        }
      } catch { }

      logAdminActivity({
        category: 'BUYER_APPROVAL',
        action: 'PHARMACY_REJECTED',
        details: `Rejected/Revoked pharmacy registration: ${t?.name || e} (${t?.email || 'N/A'}) - Reason: "${reason}"`,
        targetId: e,
        metadata: { rejectionReason: reason, name: t?.name, email: t?.email }
      });
    },
    handleDeleteBuyer = async buyer => {
      if (!buyer) return;

      ne({
        isOpen: !0,
        title: `Delete Buyer: ${buyer.name || 'User'}`,
        message: `Are you sure you want to permanently delete "${buyer.name}" (${buyer.email || buyer.id})? All records, registrations, and buyer credentials will be completely removed from the website and the database. This action cannot be undone.`,
        isDestructive: !0,
        requireInput: !1,
        expectedInput: ``,
        onConfirm: async () => {
          ne({
            isOpen: !1,
            title: ``,
            message: ``,
            onConfirm: null,
            isDestructive: !1,
            requireInput: !1,
            expectedInput: ``
          });

          try {
            const cleanEmail = buyer.email ? buyer.email.trim().toLowerCase() : null;

            // 1. Delete from Supabase pharmacy_registrations
            if (buyer.id) {
              await supabase.from('pharmacy_registrations').delete().eq('id', buyer.id);
            }
            if (cleanEmail) {
              await supabase.from('pharmacy_registrations').delete().ilike('email', cleanEmail);
            }

            // 2. Delete from Supabase buyers table
            if (cleanEmail) {
              await supabase.from('buyers').delete().ilike('email', cleanEmail);
            }
            if (buyer.id) {
              await supabase.from('buyers').delete().eq('pharmacy_id', buyer.id);
              await supabase.from('buyers').delete().eq('id', buyer.id);
            }

            // 3. Delete any orders associated with this buyer
            const buyerOrders = b.filter(order =>
              (buyer.name && order.buyerName === buyer.name) ||
              (buyer.phone && buyer.phone !== 'N/A' && order.phone === buyer.phone)
            );
            for (const bo of buyerOrders) {
              try {
                await supabase.from('order_items').delete().eq('order_id', bo.id);
                await supabase.from('orders').delete().eq('id', bo.id);
              } catch (oErr) {
                console.error('Error deleting buyer order:', oErr);
              }
            }
            if (buyerOrders.length > 0) {
              x(prev => prev.filter(order => !buyerOrders.some(bo => bo.id === order.id)));
            }

            // 4. Remove from admin buyers list (E / D)
            D(prev => prev.filter(item => {
              const itemEmail = item.email ? item.email.trim().toLowerCase() : '';
              if (cleanEmail && itemEmail === cleanEmail) return false;
              if (item.id === buyer.id) return false;
              return true;
            }));

            // 5. Remove from dg_users in localStorage / state (i / a)
            a(prev => {
              const next = prev.filter(u => {
                const uEmail = u.email ? u.email.trim().toLowerCase() : '';
                if (cleanEmail && uEmail === cleanEmail) return false;
                if (u.pharmacyId && u.pharmacyId === buyer.id) return false;
                if (u.id && u.id === buyer.id) return false;
                return true;
              });
              try {
                localStorage.setItem('dg_users', JSON.stringify(next));
              } catch { }
              return next;
            });

            // 6. Clear session if deleted user was in dg_session
            try {
              const s = localStorage.getItem('dg_session');
              if (s) {
                const parsed = JSON.parse(s);
                const sessEmail = parsed.currentUser?.email ? parsed.currentUser.email.trim().toLowerCase() : '';
                if ((cleanEmail && sessEmail === cleanEmail) || parsed.currentUser?.pharmacyId === buyer.id) {
                  localStorage.removeItem('dg_session');
                }
              }
            } catch { }

            // 7. Close inspect modal
            _t(null);

            // 8. Notification & Toast
            let notif = {
              id: Date.now(),
              text: `Buyer "${buyer.name}" (${buyer.email || buyer.id}) was permanently removed from the system and database.`,
              date: `Just now`,
              read: !1
            };
            w(prev => [notif, ...prev]);
            logAdminActivity({
              category: 'BUYER_APPROVAL',
              action: 'BUYER_DELETED',
              details: `Permanently deleted buyer: "${buyer.name}" (${buyer.email || buyer.id})`,
              targetId: buyer.id,
              metadata: { name: buyer.name, email: buyer.email }
            });
            T(`Buyer "${buyer.name}" deleted successfully.`);
          } catch (err) {
            console.error('Error deleting buyer:', err);
            T(`Error deleting buyer from database.`);
          }
        }
      });
    },
    yn = async (e, t) => {
      x(n => n.map(n => {
        if (n.id === e) {
          let updated = {
            ...n,
            status: t
          };
          if (t === `Delivered & Invoiced`) updated.paymentStatus = `Paid`;
          return updated;
        }
        return n;
      }));
      let n = {
        id: Date.now(),
        text: `Marketplace Order ${e} has been updated to [${t}].`,
        date: `Just now`,
        read: !1
      };
      w(e => [n, ...e]);
      if (I && I.id === e) {
        vt(prev => ({
          ...prev,
          status: t
        }));
      }
      try {
        let updatePayload = { status: t };
        if (t === `Delivered & Invoiced`) updatePayload.payment_status = `Paid`;
        await supabase.from('orders').update(updatePayload).eq('id', e);
      } catch (err) {
        console.error('Error updating order status in Supabase:', err);
      }
      logAdminActivity({
        category: 'ORDER_FULFILLMENT',
        action: 'ORDER_STATUS_UPDATED',
        details: `Updated order #${e} status to [${t}]`,
        targetId: e,
        metadata: { newStatus: t }
      });
    },
    handleApproveAll = () => {
      const pendingOrdersCount = b.filter(o => o.status === 'Pending Verification').length;
      if (pendingOrdersCount === 0) {
        T('No orders pending verification to approve.');
        return;
      }
      x(prev => prev.map(order => {
        if (order.status === 'Pending Verification') {
          return {
            ...order,
            status: 'Processing/Packing'
          };
        }
        return order;
      }));
      const notification = {
        id: Date.now(),
        text: `Approved all ${pendingOrdersCount} pending orders to Pack & Label status.`,
        date: `Just now`,
        read: !1
      };
      w(e => [notification, ...e]);
      if (I && I.status === 'Pending Verification') {
        vt(prev => ({
          ...prev,
          status: 'Processing/Packing'
        }));
      }
      logAdminActivity({
        category: 'ORDER_FULFILLMENT',
        action: 'BULK_ORDERS_APPROVED',
        details: `Bulk approved ${pendingOrdersCount} orders to Pack & Label status`,
        metadata: { count: pendingOrdersCount }
      });
      T(`Successfully approved ${pendingOrdersCount} orders to Pack & Label.`);
    },
    bn = async (e, t) => {
      if (t === '' || t === null || t === undefined) {
        h(prev => prev.map(item => String(item.id) === String(e) ? {
          ...item,
          moq: ''
        } : item));
        const { error } = await supabase.from(`medicines`).update({
          moq: 0
        }).eq(`id`, e);
        if (error) console.error("Error updating moq:", error);
        return;
      }
      let n = Math.max(0, parseInt(t) || 0);
      h(prev => prev.map(item => String(item.id) === String(e) ? {
        ...item,
        moq: t
      } : item));
      const { error } = await supabase.from(`medicines`).update({
        moq: n
      }).eq(`id`, e);
      if (error) console.error("Error updating moq:", error);
    },
    updateProductNameDirect = (e, t) => {
      if (!hasPermission('inventory.edit_name')) return;
      h(prev => prev.map(item => String(item.id) === String(e) ? {
        ...item,
        name: t,
        slug: t ? t.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''
      } : item));
    },
    saveProductNameDirect = async (e, t) => {
      if (!hasPermission('inventory.edit_name')) {
        T("Permission Denied: Your assigned role does not have permission to edit product names.");
        const orig = editingNameRef.current ? editingNameRef.current[e] : '';
        if (orig) {
          h(prev => prev.map(item => String(item.id) === String(e) ? { ...item, name: orig } : item));
        }
        return;
      }
      const trimmed = (t || '').trim();
      const orig = editingNameRef.current ? editingNameRef.current[e] : '';
      if (!trimmed) {
        T("Product name cannot be empty.");
        if (orig) {
          h(prev => prev.map(item => String(item.id) === String(e) ? { ...item, name: orig } : item));
        }
        return;
      }
      if (orig !== undefined && orig.trim() === trimmed) {
        return;
      }

      const { error } = await supabase.from('medicines').update({
        product_name: trimmed
      }).eq('id', e);

      if (error) {
        console.error("Error updating product name in Supabase:", error);
        T("Failed to update product name: " + error.message);
        if (orig) {
          h(prev => prev.map(item => String(item.id) === String(e) ? { ...item, name: orig } : item));
        }
        return;
      }

      if (orig && orig !== trimmed && specialDiscounts && specialDiscounts[orig]) {
        try {
          const sdVal = specialDiscounts[orig];
          await supabase.from('special_discounts').delete().eq('product_name', orig);
          await supabase.from('special_discounts').upsert({
            product_name: trimmed,
            discount_type: sdVal.type,
            discount_value: sdVal.value
          }, { onConflict: 'product_name' });
          setSpecialDiscounts(prev => {
            const copy = { ...prev };
            delete copy[orig];
            copy[trimmed] = sdVal;
            return copy;
          });
        } catch (sdErr) {
          console.error("Error updating special discounts for renamed product:", sdErr);
        }
      }

      logAdminActivity({
        category: 'INVENTORY_MANAGEMENT',
        action: 'PRODUCT_NAME_UPDATED',
        details: `Updated product #${e} name from "${orig}" to "${trimmed}"`,
        targetId: e,
        metadata: { oldName: orig, newName: trimmed }
      });
      T(`Product name updated to "${trimmed}"`);
    },
    updateCompanyDirect = (e, t) => {
      h(prev => prev.map(item => String(item.id) === String(e) ? {
        ...item,
        manufacturer: t,
        company: t
      } : item));
    },
    saveCompanyDirect = async (e, t) => {
      const trimmed = (t || '').trim();
      const { error } = await supabase.from('medicines').update({
        company: trimmed
      }).eq('id', e);
      if (error) {
        console.error("Error updating company:", error);
        T("Failed to update company: " + error.message);
      } else if (trimmed) {
        T(`Company updated: ${trimmed}`);
      }
    },
    updateDosageFormDirect = (e, t) => {
      h(prev => prev.map(item => String(item.id) === String(e) ? {
        ...item,
        dosageForm: t,
        dosage_form: t,
        type: t
      } : item));
    },
    saveDosageFormDirect = async (e, t) => {
      const trimmed = (t || '').trim();
      const { error } = await supabase.from('medicines').update({
        dosage_form: trimmed
      }).eq('id', e);
      if (error) {
        console.error("Error updating dosage form:", error);
        T("Failed to update dosage form: " + error.message);
      } else if (trimmed) {
        T(`Dosage form updated: ${trimmed}`);
      }
    },
    updateStockDirect = async (e, t) => {
      if (t === '' || t === null || t === undefined) {
        h(prev => prev.map(item => String(item.id) === String(e) ? {
          ...item,
          stock: ''
        } : item));
        const { error } = await supabase.from(`medicines`).update({
          stock: 0
        }).eq(`id`, e);
        if (error) console.error("Error updating stock:", error);
        return;
      }
      let n = Math.max(0, parseInt(t) || 0);
      h(prev => prev.map(item => String(item.id) === String(e) ? {
        ...item,
        stock: t
      } : item));
      const { error } = await supabase.from(`medicines`).update({
        stock: n
      }).eq(`id`, e);
      if (error) console.error("Error updating stock:", error);
    },
    xn = async (e, t, n) => {
      if (n === '' || n === null || n === undefined) {
        let r = 0;
        if (t === `buyingPrice` && bulkPriceRule) {
          let med = m.find(x => String(x.id) === String(e));
          let ruleApplies = bulkPriceRule.company === `all` || (med && med.manufacturer === bulkPriceRule.company);
          if (ruleApplies) {
            let newUnit = bulkPriceRule.type === `fixed` ? r + bulkPriceRule.amount : r + (r * bulkPriceRule.amount / 100);
            newUnit = Math.round(newUnit * 100) / 100;
            h(list => list.map(item => String(item.id) === String(e) ? { ...item, buyingPrice: '', wholesalePrice: newUnit } : item));
            await supabase.from(`medicines`).update({ buying_price: 0, unit_price: newUnit }).eq(`id`, e);
            return;
          }
        }
        h(list => list.map(item => String(item.id) === String(e) ? {
          ...item,
          [t]: ''
        } : item));
        let i = t === `wholesalePrice` ? `wholesale_price` : t;
        (i === `wholesale_price` || i === `price`) && (await supabase.from(`medicines`).update({ unit_price: 0 }).eq(`id`, e));
        (i === `buyingPrice`) && (await supabase.from(`medicines`).update({ buying_price: 0 }).eq(`id`, e));
        (i === `mrp`) && (await supabase.from(`medicines`).update({ pack_mrp: 0 }).eq(`id`, e));
        return;
      }
      let r = parseFloat(n);
      if (isNaN(r) || r < 0) return;
      if (t === `buyingPrice` && bulkPriceRule) {
        let med = m.find(x => String(x.id) === String(e));
        let ruleApplies = bulkPriceRule.company === `all` || (med && med.manufacturer === bulkPriceRule.company);
        if (ruleApplies) {
          let newUnit = bulkPriceRule.type === `fixed` ? r + bulkPriceRule.amount : r + (r * bulkPriceRule.amount / 100);
          newUnit = Math.round(newUnit * 100) / 100;
          h(list => list.map(item => String(item.id) === String(e) ? { ...item, buyingPrice: n, wholesalePrice: newUnit } : item));
          await supabase.from(`medicines`).update({ buying_price: r, unit_price: newUnit }).eq(`id`, e);
          return;
        }
      }
      h(list => list.map(item => String(item.id) === String(e) ? {
        ...item,
        [t]: n
      } : item));
      let i = t === `wholesalePrice` ? `wholesale_price` : t;
      (i === `wholesale_price` || i === `price`) && (await supabase.from(`medicines`).update({ unit_price: r }).eq(`id`, e));
      (i === `buyingPrice`) && (await supabase.from(`medicines`).update({ buying_price: r }).eq(`id`, e));
      (i === `mrp`) && (await supabase.from(`medicines`).update({ pack_mrp: r }).eq(`id`, e));
    },
    Sn = async (e, t) => {
      let n = parseInt(t);
      if (isNaN(n) || n <= 0) return;
      let r = m.find(t => String(t.id) === String(e));
      if (!r) return;
      let i = r.stock + n;
      h(t => t.map(t => String(t.id) === String(e) ? {
        ...t,
        stock: i
      } : t));
      const { error } = await supabase.from(`medicines`).update({
        stock: i
      }).eq(`id`, e);
      if (error) console.error("Error updating stock:", error);
      let a = {
        id: Date.now(),
        text: `Admin restocked SKU ${e}. Added ${n} boxes.`,
        date: `Just now`,
        read: !1
      };
      w(e => [a, ...e]);
    },
    applyBulkPricing = async () => {
      let amount = parseFloat(bulkPriceAmount);
      if (isNaN(amount) || amount < 0) return T(`Please enter a valid amount. Use 0 to reset markup.`);
      setBulkPriceLoading(true);
      setBulkPriceProgress(0);
      try {
        let targets = bulkPriceCompany === `all` ? m : m.filter(e => e.manufacturer === bulkPriceCompany);
        let updates = targets.map(med => {
          let buyPrice = Number(med.buyingPrice) || 0;
          let newUnitPrice = bulkPriceType === `fixed` ? buyPrice + amount : buyPrice + (buyPrice * amount / 100);
          newUnitPrice = Math.round(newUnitPrice * 100) / 100;
          return { id: med.id, wholesalePrice: newUnitPrice };
        });
        h(prev => prev.map(med => {
          let upd = updates.find(u => u.id === med.id);
          return upd ? { ...med, wholesalePrice: upd.wholesalePrice } : med;
        }));
        let totalChunks = Math.ceil(updates.length / 50);
        for (let i = 0; i < updates.length; i += 50) {
          let chunk = updates.slice(i, i + 50);
          let promises = chunk.map(u => supabase.from(`medicines`).update({ unit_price: u.wholesalePrice }).eq(`id`, u.id));
          await Promise.all(promises);
          let chunkIdx = Math.floor(i / 50) + 1;
          setBulkPriceProgress(Math.round((chunkIdx / totalChunks) * 100));
        }
        setBulkPriceProgress(100);
        setBulkPriceRule({ type: bulkPriceType, amount, company: bulkPriceCompany });
        await supabase.from('bulk_pricing_rules').upsert({ id: 1, markup_type: bulkPriceType, markup_amount: amount, company: bulkPriceCompany, updated_at: new Date().toISOString() }, { onConflict: 'id' });
        T(`Successfully updated unit prices for ${updates.length} products!`);
        setBulkPriceAmount(``);
        setTimeout(() => { setBulkPriceOpen(false); setBulkPriceProgress(0); }, 800);
        w(e => [{ id: Date.now(), text: `Admin applied bulk pricing (${bulkPriceType === 'fixed' ? '\u09f3' + amount + ' fixed' : amount + '%'}) to ${bulkPriceCompany === 'all' ? 'all companies' : bulkPriceCompany}. ${updates.length} products updated.`, date: `Just now`, read: false }, ...e]);
      } catch (err) {
        console.error(`Bulk pricing error:`, err);
        T(`Error applying bulk pricing. Please try again.`);
        setBulkPriceProgress(0);
      } finally {
        setBulkPriceLoading(false);
      }
    },
    addNewProductRow = async () => {
      try {
        const newProduct = {
          product_name: 'New Product',
          company: '',
          dosage_form: 'Tablet',
          stock: 0,
          buying_price: 0,
          unit_price: 0,
          pack_mrp: 0,
          moq: 1,
          is_deactivated: false
        };
        const { data, error } = await supabase.from('medicines').insert(newProduct).select().single();
        if (error) throw error;
        const mappedProduct = {
          id: data.id,
          brandId: 'MED-' + data.id,
          name: data.product_name || 'New Product',
          type: data.dosage_form || 'Tablet',
          slug: (data.product_name || 'New Product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          dosageForm: data.dosage_form || 'Tablet',
          dosage_form: data.dosage_form || 'Tablet',
          generic: '',
          strength: '',
          manufacturer: data.company || '',
          company: data.company || '',
          packSize: '',
          packageSize: '',
          stock: data.stock || 0,
          buyingPrice: data.buying_price || 0,
          wholesalePrice: data.unit_price || 0,
          mrp: data.pack_mrp || 0,
          moq: data.moq || 1,
          is_deactivated: false,
          imageUrl: '',
          expiryDate: '2027-12-31',
          expiryMonths: 24,
          category: data.dosage_form || 'Tablet',
          _isNew: true
        };
        h(prev => [mappedProduct, ...prev]);
        Bt('');
        Ht('all');
        Wt('all');
        It(1);
        T('New product row added! Fill in the details inline.');
        w(e => [{ id: Date.now(), text: `Admin added a new product (ID: ${data.id}) for inline editing.`, date: 'Just now', read: false }, ...e]);
      } catch (err) {
        console.error('Error adding new product:', err);
        T('Failed to add new product row: ' + (err.message || 'Please try again.'));
      }
    },
    toggleActive = async (e, t) => {
      let r = m.find(n => String(n.id) === String(e));
      if (!r) return;
      h(n => n.map(n => String(n.id) === String(e) ? {
        ...n,
        is_deactivated: t
      } : n));
      await supabase.from(`medicines`).update({
        is_deactivated: t
      }).eq(`id`, e);
      T(t ? `Product deactivated` : `Product activated`);
    },
    Cn = e => {
      setTimeout(() => {
        window.print();
      }, 100);
    },
    wn = async (e, t) => {
      t && (h(n => n.map(n => String(n.id) === String(e) ? {
        ...n,
        imageUrl: t
      } : n)), await supabase.from(`medicines`).update({
        image_url: t
      }).eq(`id`, e));
    },
    Tn = e => {
      ve({
        isOpen: !0,
        medId: e.id,
        currentUrl: e.imageUrl || ``
      });
    },
    En = e => {
      let t = parseFloat((e.wholesalePrice * e.stock * 0.8).toFixed(2));
      if (t <= 0) {
        T(`No stock available in batch to claim refund.`);
        return;
      }
      h(t => t.map(t => String(t.id) === String(e.id) ? {
        ...t,
        stock: 0
      } : t));
      let n = `CRN-2026-00${Math.floor(50 + Math.random() * 49)}`,
        r = {
          date: new Date().toISOString().split(`T`)[0],
          ref: n,
          desc: `Refund Credit Note - Batch Expiry [${e.name} / ${e.batch}]`,
          debit: 0,
          credit: t,
          balance: Math.max(0, tn.outstandingBalance - t),
          type: `Refund`
        };
      S(e => [...e, r]);
      let i = {
        id: Date.now(),
        text: `Expiry Refund Processed: Credit Note ${n} issued for ৳${t.toFixed(2)} to Care & Cure Pharmacy.`,
        date: `Just now`,
        read: !1
      };
      w(e => [i, ...e]), T(`Successfully processed return claim for ${e.name}. Issued refund of ৳${t} to buyer ledger.`);
    };
  return e === `authenticated` ? <>
    <div className={`print:hidden flex h-screen bg-[#F8FAFC] font-sans text-[#1D2A3B] overflow-hidden antialiased ${o ? `dark` : ``}`}>
      {c && <div onClick={() => l(!1)} className="fixed inset-0 bg-[#1D2A3B]/40 backdrop-blur-xs z-40 md:hidden" />}
      <aside className={`fixed md:static inset-y-0 left-0 w-68 bg-white border-r border-[#E2E8F0] flex flex-col z-50 select-none flex-shrink-0 transform transition-transform duration-300 ${c ? `translate-x-0` : `-translate-x-full md:translate-x-0`}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#E2E8F0]">
          <div>
            <img src={logoUrl} className="h-10 md:h-12 lg:h-13 w-auto object-contain transition-all" alt="Logo" />
          </div>
          <button onClick={() => l(!1)} className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer" title="Close Menu">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {f === `buyer` ? <>
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
            <button onClick={() => {
              k(`dashboard`), l(!1);
            }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${O === `dashboard` ? `bg-[#E0F5F7] text-[#0697A8] shadow-sm` : `text-[#64748B] hover:bg-slate-50 hover:text-[#1D2A3B]`}`}>
              <div className="flex items-center gap-3">
                <svg className={`w-4 h-4 ${O === `dashboard` ? `text-[#0697A8]` : `text-[#94A3B8]`}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>{`Dashboard Home`}</span>
              </div>
            </button>
            <button onClick={() => {
              k(`search`), l(!1);
            }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${O === `search` ? `bg-[#E0F5F7] text-[#0697A8] shadow-sm` : `text-[#64748B] hover:bg-slate-50 hover:text-[#1D2A3B]`}`}>
              <div className="flex items-center gap-3">
                <svg className={`w-4 h-4 ${O === `search` ? `text-[#0697A8]` : `text-[#94A3B8]`}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>{`Search Medicines`}</span>
              </div>
              <span className="text-[10px] bg-[#C2EAF0] text-[#057A88] px-1.5 py-0.5 rounded-full font-bold">
                {m.length}
              </span>
            </button>
            <button onClick={() => {
              k(`offers`), l(!1);
            }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${O === `offers` ? `bg-[#E0F5F7] text-[#0697A8] shadow-sm` : `text-[#64748B] hover:bg-slate-50 hover:text-[#1D2A3B]`}`}>
              <div className="flex items-center gap-3">
                <svg className={`w-4 h-4 ${O === `offers` ? `text-[#0697A8]` : `text-[#94A3B8]`}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                <span>{`Latest Offers`}</span>
              </div>
            </button>
            <button onClick={() => {
              k(`orders`), l(!1);
            }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${O === `orders` ? `bg-[#E0F5F7] text-[#0697A8] shadow-sm` : `text-[#64748B] hover:bg-slate-50 hover:text-[#1D2A3B]`}`}>
              <div className="flex items-center gap-3">
                <svg className={`w-4 h-4 ${O === `orders` ? `text-[#0697A8]` : `text-[#94A3B8]`}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span>{`Order History`}</span>
              </div>
              <span className="text-[10px] bg-[#E2E8F0] text-[#475569] px-1.5 py-0.5 rounded-full font-semibold">
                {myOrders.length}
              </span>
            </button>
            <button onClick={() => {
              k(`returns`), l(!1);
            }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${O === `returns` ? `bg-[#E0F5F7] text-[#0697A8] shadow-sm` : `text-[#64748B] hover:bg-slate-50 hover:text-[#1D2A3B]`}`}>
              <div className="flex items-center gap-3">
                <svg className={`w-4 h-4 ${O === `returns` ? `text-[#0697A8]` : `text-[#94A3B8]`}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                </svg>
                <span>{`Returns`}</span>
              </div>
            </button>
            <button onClick={() => {
              k(`support`), l(!1);
            }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${O === `support` ? `bg-[#E0F5F7] text-[#0697A8] shadow-sm` : `text-[#64748B] hover:bg-slate-50 hover:text-[#1D2A3B]`}`}>
              <div className="flex items-center gap-3">
                <svg className={`w-4 h-4 ${O === `support` ? `text-[#0697A8]` : `text-[#94A3B8]`}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>{`Support Helpdesk`}</span>
              </div>
            </button>
            <button onClick={() => {
              k(`request`), l(!1);
            }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${O === `request` ? `bg-[#E0F5F7] text-[#0697A8] shadow-sm` : `text-[#64748B] hover:bg-slate-50 hover:text-[#1D2A3B]`}`}>
              <div className="flex items-center gap-3">
                <svg className={`w-4 h-4 ${O === `request` ? `text-[#0697A8]` : `text-[#94A3B8]`}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{`Request Medicine`}</span>
              </div>
              {myRequests.length > 0 && <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                {myRequests.length}
              </span>}
            </button>
            <button onClick={() => {
              setBarcodeModalOpen(true);
              l(!1);
            }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${barcodeModalOpen ? `bg-[#E0F5F7] text-[#0697A8] shadow-sm` : `text-[#64748B] hover:bg-slate-50 hover:text-[#1D2A3B]`}`}>
              <div className="flex items-center gap-3">
                <svg className={`w-4 h-4 ${barcodeModalOpen ? `text-[#0697A8]` : `text-[#94A3B8]`}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 7V4a2 2 0 012-2h3m6 0h3a2 2 0 012 2v3m0 8v3a2 2 0 01-2 2h-3m-6 0H6a2 2 0 01-2-2v-3M7 7h2v10H7zm4 0h1v10h-1zm3 0h3v10h-3zm5 0h1v10h-1z" />
                </svg>
                <span>{`Scan Invoice Barcode`}</span>
              </div>
            </button>
            <button onClick={() => {
              k(`profile`), l(!1);
            }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${O === `profile` ? `bg-[#E0F5F7] text-[#0697A8] shadow-sm` : `text-[#64748B] hover:bg-slate-50 hover:text-[#1D2A3B]`}`}>
              <div className="flex items-center gap-3">
                <svg className={`w-4 h-4 ${O === `profile` ? `text-[#0697A8]` : `text-[#94A3B8]`}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{`My Profile`}</span>
              </div>
            </button>
          </nav>
        </> : <>
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
            {hasPermission('approvals.view') && (
              <button onClick={() => {
                ht(`approvals`), l(!1);
              }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${mt === `approvals` ? `bg-emerald-50 text-emerald-700 shadow-xs` : `text-[#64748B] hover:bg-slate-50 hover:text-[#1D2A3B]`}`}>
                <div className="flex items-center gap-3">
                  <svg className={`w-4 h-4 ${mt === `approvals` ? `text-emerald-600` : `text-[#94A3B8]`}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>{`Pending Approvals`}</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
                  {E.filter(e => e.status === `Pending` || e.status === `Pending Verification`).length}
                </span>
              </button>
            )}

            {hasPermission('orders.view') && (
              <button onClick={() => {
                ht(`fulfillment`), l(!1);
              }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${mt === `fulfillment` ? `bg-emerald-50 text-emerald-700 shadow-xs` : `text-[#64748B] hover:bg-slate-50 hover:text-[#1D2A3B]`}`}>
                <div className="flex items-center gap-3">
                  <svg className={`w-4 h-4 ${mt === `fulfillment` ? `text-emerald-600` : `text-[#94A3B8]`}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <span>{`Orders`}</span>
                </div>
                <span className="text-[10px] bg-[#C2EAF0] text-[#057A88] px-1.5 py-0.5 rounded-full font-bold">
                  {b.filter(e => e.status !== `Delivered & Invoiced`).length}
                </span>
              </button>
            )}

            {hasPermission('inventory.view') && (
              <button onClick={() => {
                ht(`inventory`), l(!1);
              }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${mt === `inventory` ? `bg-emerald-50 text-emerald-700 shadow-xs` : `text-[#64748B] hover:bg-slate-50 hover:text-[#1D2A3B]`}`}>
                <div className="flex items-center gap-3">
                  <svg className={`w-4 h-4 ${mt === `inventory` ? `text-emerald-600` : `text-[#94A3B8]`}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>{`Inventory & MOQ Manager`}</span>
                </div>
              </button>
            )}

            {hasPermission('inventory.view') && (
              <button onClick={() => {
                ht(`stockout`), l(!1);
              }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${mt === `stockout` ? `bg-red-50 text-red-700 shadow-xs` : `text-[#64748B] hover:bg-slate-50 hover:text-[#1D2A3B]`}`}>
                <div className="flex items-center gap-3">
                  <svg className={`w-4 h-4 ${mt === `stockout` ? `text-red-600` : `text-[#94A3B8]`}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{`Stock-out Products`}</span>
                </div>
                <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">
                  {m.filter(e => e.stock === 0).length}
                </span>
              </button>
            )}

            {hasPermission('deliveryzones.view') && (
              <button onClick={() => {
                ht(`deliveryzones`), l(!1);
              }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${mt === `deliveryzones` ? `bg-indigo-50 text-indigo-700 shadow-xs` : `text-[#64748B] hover:bg-slate-50 hover:text-[#1D2A3B]`}`}>
                <div className="flex items-center gap-3">
                  <svg className={`w-4 h-4 ${mt === `deliveryzones` ? `text-indigo-600` : `text-[#94A3B8]`}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{`Delivery Zones`}</span>
                </div>
              </button>
            )}

            {hasPermission('pricing.view') && (
              <button onClick={() => {
                ht(`special_discount`), l(!1);
              }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${mt === `special_discount` ? `bg-blue-50 text-blue-700 shadow-xs` : `text-[#64748B] hover:bg-slate-50 hover:text-[#1D2A3B]`}`}>
                <div className="flex items-center gap-3">
                  <svg className={`w-4 h-4 ${mt === `special_discount` ? `text-blue-600` : `text-[#94A3B8]`}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{`Special Discount`}</span>
                </div>
              </button>
            )}

            {hasPermission('pricing.view') && (
              <button onClick={() => {
                ht(`coupons`), l(!1);
              }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${mt === `coupons` ? `bg-purple-50 text-purple-700 shadow-xs` : `text-[#64748B] hover:bg-slate-50 hover:text-[#1D2A3B]`}`}>
                <div className="flex items-center gap-3">
                  <svg className={`w-4 h-4 ${mt === `coupons` ? `text-purple-600` : `text-[#94A3B8]`}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <span>{`Coupons`}</span>
                </div>
              </button>
            )}

            {hasPermission('orders.view') && (
              <button onClick={() => {
                setBarcodeModalOpen(true);
                l(!1);
              }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${barcodeModalOpen ? `bg-emerald-50 text-emerald-700 shadow-xs` : `text-[#64748B] hover:bg-slate-50 hover:text-[#1D2A3B]`}`}>
                <div className="flex items-center gap-3">
                  <svg className={`w-4 h-4 ${barcodeModalOpen ? `text-emerald-600` : `text-[#94A3B8]`}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 7V4a2 2 0 012-2h3m6 0h3a2 2 0 012 2v3m0 8v3a2 2 0 01-2 2h-3m-6 0H6a2 2 0 01-2-2v-3M7 7h2v10H7zm4 0h1v10h-1zm3 0h3v10h-3zm5 0h1v10h-1z" />
                  </svg>
                  <span>{`Scan Invoice Barcode`}</span>
                </div>
              </button>
            )}

            {(hasPermission('roles.manage') || hasPermission('users.manage')) && (
              <button onClick={() => {
                ht(`staff_roles`), l(!1);
              }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${mt === `staff_roles` ? `bg-teal-50 text-teal-700 shadow-xs` : `text-[#64748B] hover:bg-slate-50 hover:text-[#1D2A3B]`}`}>
                <div className="flex items-center gap-3">
                  <svg className={`w-4 h-4 ${mt === `staff_roles` ? `text-teal-600` : `text-[#94A3B8]`}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>{`Staff & Roles`}</span>
                </div>
                <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded-full font-bold">
                  {adminStaffUsers.length}
                </span>
              </button>
            )}

            {hasPermission('activity_log.view') && (
              <button onClick={() => {
                ht(`activity_log`), l(!1);
              }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${mt === `activity_log` ? `bg-amber-50 text-amber-700 shadow-xs` : `text-[#64748B] hover:bg-slate-50 hover:text-[#1D2A3B]`}`}>
                <div className="flex items-center gap-3">
                  <svg className={`w-4 h-4 ${mt === `activity_log` ? `text-amber-600` : `text-[#94A3B8]`}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{`Activity Log`}</span>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-bold">
                  {activityLogs.length}
                </span>
              </button>
            )}

            {hasPermission('backup.manage') && (
              <button onClick={() => {
                ht(`backup`), l(!1);
              }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${mt === `backup` ? `bg-emerald-50 text-emerald-700 shadow-xs` : `text-[#64748B] hover:bg-slate-50 hover:text-[#1D2A3B]`}`}>
                <div className="flex items-center gap-3">
                  <svg className={`w-4 h-4 ${mt === `backup` ? `text-emerald-600` : `text-[#94A3B8]`}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                  <span>{`Backup/Restore`}</span>
                </div>
              </button>
            )}

            {hasPermission('analytics.view') && (
              <button onClick={() => {
                ht(`analytics`), l(!1);
              }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${mt === `analytics` ? `bg-blue-50 text-blue-700 shadow-xs` : `text-[#64748B] hover:bg-slate-50 hover:text-[#1D2A3B]`}`}>
                <div className="flex items-center gap-3">
                  <svg className={`w-4 h-4 ${mt === `analytics` ? `text-blue-600` : `text-[#94A3B8]`}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>{`Analytics`}</span>
                </div>
              </button>
            )}
          </nav>
        </>}
        <div className={`md:hidden pt-[20px] px-4 border-t border-[#E2E8F0] bg-slate-50/40 flex items-center justify-center ${f === `buyer` ? `pb-[88px]` : `pb-[32px]`}`}>
          <button onClick={() => {
            try { localStorage.removeItem('dg_session'); } catch { }
            t(`login`), r(null), Te(!1), l(!1);
          }} className="flex items-center justify-center gap-2 text-sm font-extrabold text-red-600 hover:text-red-700 transition-colors cursor-pointer">
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>{`Logout`}</span>
          </button>
        </div>
        <div className="hidden md:block p-4 border-t border-[#E2E8F0] bg-slate-50/40 relative">
          <div onClick={() => Te(!we)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-[#E2E8F0] cursor-pointer">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs select-none ${f === `admin` ? `bg-emerald-100 text-emerald-800` : `bg-[#C2EAF0] text-blue-800`}`}>
              {f === `admin` ? (n?.name ? n.name.slice(0, 2).toUpperCase() : `AD`) : `CC`}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-[#1D2A3B] truncate">
                {f === `admin` ? (n?.name || `Administrator`) : tn.name}
              </h4>
              <p className="text-[10px] text-[#64748B] truncate">
                {f === `admin`
                  ? (n?.isSuperAdmin || (n?.email || '').toLowerCase() === 'admin@dgpharma.shop' || (n?.email || '').toLowerCase() === 'admin@dgpharma.com'
                    ? 'Super Administrator'
                    : (adminRoles.find(r => r.id === n?.roleId)?.name || 'Staff User'))
                  : `License: ${tn.license}`}
              </p>
            </div>
            <svg className="w-3.5 h-3.5 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {we && <div className="absolute bottom-16 left-4 right-4 bg-white border border-[#E2E8F0] rounded-xl shadow-lg p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="px-3 py-1.5 border-b border-slate-100 mb-1 text-[10px] font-bold text-slate-400 uppercase">{`Account Actions`}</div>
            {f === 'admin' && (
              <button onClick={() => {
                setAdminProfileForm({
                  name: n?.name || '',
                  phone: n?.phone || '',
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                });
                setAdminProfileError('');
                setAdminProfileSuccess('');
                setAdminProfileModalOpen(true);
                Te(false);
              }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-[#1D2A3B] hover:bg-slate-50 transition-colors cursor-pointer text-left mb-1">
                <svg className="w-4 h-4 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{`Profile & Security`}</span>
              </button>
            )}
            <button onClick={() => {
              try { localStorage.removeItem('dg_session'); } catch { }
              t(`login`), r(null), Te(!1), l(!1);
            }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer text-left">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>{`Log Out from Portal`}</span>
            </button>
          </div>}
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white dark:bg-[#1D2A3B] border-b border-[#E2E8F0] dark:border-[#1D2A3B] flex items-center justify-between px-4 md:px-8 z-50 flex-shrink-0 gap-4">
          <div className="flex md:hidden items-center gap-2 flex-shrink-0">
            <img src={logoUrl} className="h-[38px] w-auto object-contain" alt="Logo" />
          </div>
          <div className="hidden md:block flex-1 max-w-[480px]">
            {f === `buyer` ? <div className="relative w-full">
              <input type="text" list="medicine-suggestions-desktop" value={oe} onChange={e => pn(e.target.value)} placeholder="Search by medicine or manufacturer..." className="w-full pl-10 pr-4 py-2.5 bg-[#F1F5F9] border border-transparent rounded-xl text-xs transition-all duration-200 placeholder-[#94A3B8] focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-[#C2EAF0] shadow-inner" />
              <datalist id="medicine-suggestions-desktop">
                {oe.length >= 2 && nn.slice(0, 5).map(e => <option key={e.id || e.name} value={e.name}>
                  {e.generic}
                  {` (`}
                  {e.manufacturer}
                  {`)`}
                </option>)}
              </datalist>
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {oe && <button onClick={mn} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] hover:text-[#1D2A3B] font-semibold">{`Clear`}</button>}
            </div> : <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] min-w-0">
              <span className="text-[#94A3B8] truncate">{`Enterprise Marketplace Control`}</span>
              <svg className="w-3 h-3 text-[#CBD5E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-emerald-700 font-bold capitalize truncate">
                {`Admin Portal > `}
                {mt}
              </span>
            </div>}
          </div>
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            {/* Notifications removed */}
            {f === `buyer` ? <button onClick={() => Se(!0)} className="flex items-center gap-2 px-3 py-2 bg-[#0697A8] text-white rounded-xl font-bold text-xs hover:bg-[#057A88] shadow-md shadow-blue-500/10 transition-all flex-shrink-0 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="hidden sm:inline">{`Cart`}</span>
              <span className="bg-blue-800 text-white px-2 py-0.5 rounded-lg text-[10px] font-black">
                {sn.totalItems}
              </span>
            </button> : <button onClick={() => ht(`approvals`)} className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-500/10 transition-all flex-shrink-0 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{`Review Applications`}</span>
            </button>}
            <button onClick={() => l(!c)} className="md:hidden relative w-10 h-10 border border-[#E2E8F0] dark:border-[#1D2A3B] rounded-xl bg-white dark:bg-[#1D2A3B] focus:outline-none flex-shrink-0 cursor-pointer" title="Toggle Navigation Menu">
              <span className={`absolute block w-5 h-0.5 bg-[#475569] dark:bg-slate-300 rounded-full left-2.5 transition-all duration-300 ${c ? `top-[19px] rotate-45` : `top-[14px]`}`} />
              <span className={`absolute block w-5 h-0.5 bg-[#475569] dark:bg-slate-300 rounded-full left-2.5 transition-all duration-300 ${c ? `opacity-0` : `top-[19px]`}`} />
              <span className={`absolute block w-5 h-0.5 bg-[#475569] dark:bg-slate-300 rounded-full left-2.5 transition-all duration-300 ${c ? `top-[19px] -rotate-45` : `top-[24px]`}`} />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-hidden flex relative">
          {f === `buyer` && <div className="flex-1 flex overflow-hidden">
            {O === `dashboard` && <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
                <div>
                  <h2 className="text-2xl font-bold text-[#1D2A3B] tracking-tight">{`Approved B2B Buyer Dashboard`}</h2>
                  <p className="text-xs text-[#64748B] mt-0.5">{`Live wholesale rates, inventory tracking, and swift credit ordering.`}</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] bg-white border border-[#E2E8F0] px-4 py-2 rounded-xl shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{`Portal Status: Online`}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">{`Active Shipments`}</span>
                  </div>
                  <div className="mt-4">
                    <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">{`Active Shipments`}</span>
                    <span className="text-2xl font-black text-[#1D2A3B]">
                      {myOrders.filter(e => [`Processing/Packing`, `Out for Delivery`, `Pending Verification`].includes(e.status)).length}
                      {` Orders`}
                    </span>
                    <span className="text-[10px] text-[#64748B] block mt-1">
                      {`Shipping: `}
                      <span className="font-bold text-emerald-600">{`PharmaExpress Direct`}</span>
                    </span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    {hn > 0 && <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">{`Action Needed`}</span>}
                  </div>
                  <div className="mt-4">
                    <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">{`Short Expiry Batches`}</span>
                    <span className="text-2xl font-black text-[#1D2A3B]">
                      {hn}
                      {` Items`}
                    </span>
                    <span className="text-[10px] text-[#64748B] block mt-1">
                      {`Expires within `}
                      <span className="font-bold text-red-600">{`6 Months`}</span>
                    </span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <span className="text-[10px] bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded-full">{`Reorder`}</span>
                  </div>
                  <div className="mt-4">
                    <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">{`Low Wholesale Stock`}</span>
                    <span className="text-2xl font-black text-[#1D2A3B]">
                      {gn}
                      {` Items`}
                    </span>
                    <span className="text-[10px] text-[#64748B] block mt-1">
                      {`Stock Count `}
                      <span className="font-bold text-yellow-600">{`< 100 boxes`}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="md:hidden relative w-full mb-6">
                    <input type="text" value={oe} onChange={e => pn(e.target.value)} placeholder="Search by medicine or manufacturer..." className="w-full pl-10 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-xs transition-all duration-200 placeholder-[#94A3B8] focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-[#C2EAF0] shadow-inner" />
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {oe && <button onClick={mn} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] hover:text-[#1D2A3B] font-semibold">{`Clear`}</button>}
                  </div>
                  <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center bg-slate-50/50">
                      <div>
                        <h3 className="text-sm font-bold text-[#1D2A3B]">{`Critical Expiry & Low Stock Watchlist`}</h3>
                        <p className="text-[11px] text-[#64748B] mt-0.5">{`High priority items requiring buying decisions.`}</p>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-[10px] text-[#64748B] uppercase tracking-wider font-bold border-b border-[#E2E8F0]">
                            <th className="px-5 py-3.5">{`Medicine`}</th>
                            <th className="px-5 py-3.5">{`Category`}</th>
                            <th className="px-5 py-3.5">{`Stock`}</th>
                            <th className="px-5 py-3.5">{`Expiry / Batch`}</th>
                            <th className="px-5 py-3.5 text-right">{`Action`}</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs divide-y divide-slate-100">
                          {m.filter(e => e.stock <= 100 || e.expiryMonths < 6).slice((M - 1) * 10, M * 10).map((e, _idx) => <tr key={e.id || _idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-4">
                              <div className="font-bold text-[#1D2A3B]">
                                {e.name}
                              </div>
                              <div className="text-[10px] text-[#64748B] font-mono mt-0.5">
                                {e.generic}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-[#64748B]">
                              {e.category}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`font-bold ${e.stock === 0 ? `text-red-600` : e.stock <= 50 ? `text-orange-600` : `text-[#1D2A3B]`}`}>
                                {e.stock}
                                {` boxes`}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex flex-col">
                                <span className={`font-bold ${e.expiryMonths < 3 ? `text-red-600` : e.expiryMonths <= 6 ? `text-orange-600` : `text-[#64748B]`}`}>
                                  {e.expiryDate}
                                  {` (`}
                                  {e.expiryMonths}
                                  {`m)`}
                                </span>
                                <span className="text-[9px] text-[#94A3B8] font-mono mt-0.5">
                                  {`Batch: `}
                                  {e.batch}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-right">
                              {e.stock > 0 ? <button onClick={() => cn(e.id, e.moq)} className="bg-[#E0F5F7] text-[#0697A8] border border-[#C2EAF0] hover:bg-[#C2EAF0] px-3 py-1.5 rounded-lg font-bold text-[10px] transition-colors">
                                {`+ MOQ (`}
                                {e.moq}
                                {` Bxs)`}
                              </button> : <span className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-1 rounded-md">{`Out of Stock`}</span>}
                            </td>
                          </tr>)}
                        </tbody>
                      </table>
                    </div>
                    {(() => {
                      let e = m.filter(e => e.stock <= 100 || e.expiryMonths < 6),
                        t = Math.max(1, Math.ceil(e.length / 10));
                      return e.length === 0 ? null : <div className="p-4 border-t border-[#E2E8F0] flex justify-between items-center bg-white">
                        <span className="text-xs text-[#64748B]">
                          {`Showing `}
                          <span className="font-bold text-[#1D2A3B]">
                            {Math.min(e.length, (M - 1) * 10 + 1)}
                          </span>
                          {` to `}
                          <span className="font-bold text-[#1D2A3B]">
                            {Math.min(e.length, M * 10)}
                          </span>
                          {` of `}
                          {e.length}
                          {` items`}
                        </span>
                        <div className="flex gap-2">
                          <button onClick={() => ae(e => Math.max(1, e - 1))} disabled={M === 1} className="px-2 py-1 bg-slate-50 text-[#475569] text-[10px] font-bold rounded border border-[#CBD5E1] hover:bg-slate-100 disabled:opacity-50">{`Prev`}</button>
                          <button onClick={() => ae(e => Math.min(t, e + 1))} disabled={M === t} className="px-2 py-1 bg-slate-50 text-[#475569] text-[10px] font-bold rounded border border-[#CBD5E1] hover:bg-slate-100 disabled:opacity-50">{`Next`}</button>
                        </div>
                      </div>;
                    })()}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
                    <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-4">{`Dedicated B2B Support`}</h3>
                    {buyerDeliveryMen.length > 0 ? buyerDeliveryMen.map(dm => <div key={dm.id} className="mb-3 last:mb-0">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">{dm.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</div>
                        <div>
                          <h4 className="text-xs font-bold text-[#1D2A3B]">{dm.name}</h4>
                          <p className="text-[10px] text-[#64748B]">{`Delivery Representative`}{buyerZone ? ` • ${buyerZone} Zone` : ''}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] text-emerald-600 font-semibold">{`Available`}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex gap-2">
                        <a href={`tel:${dm.phone}`} className="flex-1 text-center py-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl text-[10px] font-bold text-indigo-700 transition-colors flex items-center justify-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          {`Call `}{dm.phone}
                        </a>
                      </div>
                    </div>) : <div className="text-center py-4">
                      <svg className="w-8 h-8 mx-auto mb-2 text-[#CBD5E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-[10px] text-[#94A3B8] font-semibold">{buyerZone ? `No delivery representative assigned to ${buyerZone} zone yet.` : `Your zone has not been determined yet.`}</p>
                    </div>}
                    <div className="mt-3 pt-2 border-t border-slate-100">
                      <button onClick={() => k(`support`)} className="w-full text-center py-2 bg-[#E0F5F7] hover:bg-[#C2EAF0] rounded-xl text-[10px] font-bold text-[#0697A8] transition-colors">{`Submit Support Ticket`}</button>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-3">
                    <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{`Order & Delivery Info`}</h3>
                    <div className="space-y-2.5 text-xs text-[#475569]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-[#1D2A3B]">{`Payment: Cash on Delivery`}</span>
                      </div>
                      <p className="text-[11px] text-[#64748B]">{`Pay the invoice total upon delivery directly to the courier representative.`}</p>
                      <div className="pt-2 border-t border-slate-100 flex gap-2">
                        <button onClick={() => k(`search`)} className="w-full py-2 bg-[#E0F5F7] hover:bg-[#C2EAF0] rounded-xl text-[10px] font-bold text-[#0697A8] transition-colors">{`Place New Order`}</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>}
            {O === `offers` && <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 bg-slate-50/50">
              {Object.keys(specialDiscounts).length > 0 ? (
                <div className="w-full max-w-7xl mx-auto">
                  <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-[#1D2A3B] tracking-tight mb-2">{`Latest Offers`}</h2>
                      <p className="text-sm text-[#64748B]">{`Exclusive deals and discounts on premium medicines.`}</p>
                    </div>
                    {offersCompanies.length > 0 && (
                      <select
                        value={offersCompany}
                        onChange={e => setOffersCompany(e.target.value)}
                        className="bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#475569] font-bold shadow-sm focus:outline-none focus:border-[#0697A8] w-full sm:w-auto"
                      >
                        <option value="">{`All Companies`}</option>
                        {offersCompanies.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  {(() => {
                    const displayedOffers = Object.keys(specialDiscounts).map(medName => {
                      return m.find(e => e.product_name === medName || e.name === medName);
                    }).filter(med => {
                      if (!med) return false;
                      if (offersCompany && med.manufacturer !== offersCompany) return false;
                      return true;
                    });

                    return displayedOffers.length > 0 ? (
                      <div className={ie === `grid` ? `grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5` : `flex flex-col gap-4`}>
                        {displayedOffers.map(med => (
                          <Sa key={med.id} med={med} cart={ye} handleAddToCart={cn} onOpenMonograph={je} viewMode={ie} specialDiscounts={specialDiscounts} onRequestMedicine={handleOpenQuickRequest} isRequested={isMedicineRequested(med)} />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm text-center">
                        <h3 className="text-sm font-bold text-[#1D2A3B]">{`No Offers Found`}</h3>
                        <p className="text-xs text-[#64748B] mt-1">{`There are no special discounts available for ${offersCompany} right now.`}</p>
                        <button onClick={() => setOffersCompany("")} className="mt-4 bg-[#E0F5F7] text-[#0697A8] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#C2EAF0]">{`Reset Filter`}</button>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto mt-20">
                  <div className="w-16 h-16 bg-[#C2EAF0] text-[#0697A8] rounded-full flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-black text-[#1D2A3B] mb-2">{`Latest Offers`}</h2>
                  <p className="text-sm text-[#64748B] mb-6">{`Check back soon for exclusive deals, discounts, and bulk purchase offers on premium medicines.`}</p>
                  <button onClick={() => k(`search`)} className="bg-[#0697A8] hover:bg-[#057A88] text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all">{`Browse Catalog`}</button>
                </div>
              )}
            </div>}
            {O === `search` && <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
                <div className="px-4 md:px-8 py-4 bg-white border-b border-[#E2E8F0] flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center flex-shrink-0">
                  <div className="md:hidden flex flex-col gap-2.5 w-full mb-1">
                    <div className="relative w-full">
                      <input type="text" list="medicine-suggestions-mobile" value={oe} onChange={e => se(e.target.value)} placeholder="Search medicines by name..." className="w-full pl-10 pr-4 py-2.5 bg-[#F1F5F9] border border-transparent rounded-xl text-xs focus:outline-none focus:bg-white focus:border-blue-500" />
                      <datalist id="medicine-suggestions-mobile">
                        {oe.length >= 2 && nn.slice(0, 5).map(e => <option key={e.id || e.name} value={e.name}>
                          {e.generic}
                          {` (`}
                          {e.manufacturer}
                          {`)`}
                        </option>)}
                      </datalist>
                      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <select value={ce[0] || ""} onChange={e => le(e.target.value ? [e.target.value] : [])} className="w-full bg-[#F1F5F9] border border-transparent rounded-xl px-3 py-2.5 text-xs text-[#475569] font-bold focus:outline-none focus:bg-white focus:border-blue-500">
                      <option value="">{`All Companies`}</option>
                      {Gt.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center justify-between gap-2.5 text-xs text-[#64748B]">
                    <div>
                      <span className="font-bold text-[#1D2A3B]">
                        {nn.length}
                      </span>
                      <span>{` medicines matched`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="hidden sm:flex bg-slate-100 rounded-xl p-1">
                        <button onClick={() => j(`grid`)} className={`p-1.5 rounded-lg transition-colors ${ie === `grid` ? `bg-white shadow text-[#0697A8]` : `text-[#64748B] hover:text-[#1D2A3B]`}`} title="Grid View">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                        </button>
                        <button onClick={() => j(`list`)} className={`p-1.5 rounded-lg transition-colors ${ie === `list` ? `bg-white shadow text-[#0697A8]` : `text-[#64748B] hover:text-[#1D2A3B]`}`} title="List View">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                        </button>
                      </div>
                      <select value={ce[0] || ""} onChange={e => le(e.target.value ? [e.target.value] : [])} className="hidden md:block bg-slate-50 border border-[#E2E8F0] rounded-xl px-2.5 py-1.5 text-xs text-[#475569] font-semibold focus:outline-none focus:border-blue-500">
                        <option value="">{`All Companies`}</option>
                        {Gt.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select value={he} onChange={e => ge(e.target.value)} className="bg-slate-50 border border-[#E2E8F0] rounded-xl px-2.5 py-1.5 text-xs text-[#475569] font-semibold focus:outline-none focus:border-blue-500">
                        <option value="name">{`Alphabetical (A-Z)`}</option>
                        <option value="priceAsc">{`Price: Low to High`}</option>
                        <option value="priceDesc">{`Price: High to Low`}</option>
                        <option value="expiry">{`Expiry: Nearest First`}</option>
                        <option value="stock">{`Stock: High to Low`}</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
                  <ProductSlider />
                  {g ? (
                    <div className={ie === `grid` ? `grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5` : `flex flex-col gap-4`}>
                      {Array.from({ length: 10 }).map((_, idx) => (
                        <ProductSkeleton key={`skeleton-${idx}`} viewMode={ie} />
                      ))}
                    </div>
                  ) : nn.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-[#E2E8F0]">
                      <h3 className="text-sm font-bold text-[#1D2A3B]">{`No Medicines Found`}</h3>
                      <p className="text-xs text-[#64748B] mt-1 max-w-sm">{`No items matched the criteria. Try resetting the filters.`}</p>
                      <button onClick={mn} className="mt-4 bg-[#E0F5F7] text-[#0697A8] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#C2EAF0]">{`Reset All Filters`}</button>
                    </div>
                  ) : (
                    <div className={ie === `grid` ? `grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5` : `flex flex-col gap-4`}>
                      {an.map((e, idx) => e ? <Sa key={e.id || idx} med={e} cart={ye || {}} handleAddToCart={cn} onOpenMonograph={je} viewMode={ie} specialDiscounts={specialDiscounts || {}} onRequestMedicine={handleOpenQuickRequest} isRequested={isMedicineRequested(e)} /> : null)}
                    </div>
                  )}
                  {rn.length > 0 && <div className="mt-6 flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm gap-4">
                    <div className="text-xs text-[#64748B]">
                      {`Showing `}
                      <span className="font-bold text-[#1D2A3B]">
                        {(A - 1) * 20 + 1}
                      </span>
                      {` to `}
                      <span className="font-bold text-[#1D2A3B]">
                        {Math.min(A * 20, rn.length)}
                      </span>
                      {` of `}
                      <span className="font-bold text-[#1D2A3B]">
                        {rn.length}
                      </span>
                      {` products`}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => re(e => Math.max(1, e - 1))} disabled={A === 1} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${A === 1 ? `bg-slate-100 text-slate-400 cursor-not-allowed` : `bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300`}`}>{`Previous`}</button>
                      <div className="flex items-center px-2">
                        <span className="text-xs font-bold text-slate-700">
                          {`Page `}
                          {A}
                          {` of `}
                          {Math.max(1, Math.ceil(rn.length / 20))}
                        </span>
                      </div>
                      <button onClick={() => re(e => Math.min(Math.ceil(rn.length / 20), e + 1))} disabled={A === Math.ceil(rn.length / 20) || rn.length === 0} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${A === Math.ceil(rn.length / 20) || rn.length === 0 ? `bg-slate-100 text-slate-400 cursor-not-allowed` : `bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300`}`}>{`Next`}</button>
                    </div>
                  </div>}
                </div>
              </div>
            </div>}
            {O === `returns` && <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-[#1D2A3B] mb-4">{`Return Delivered Products`}</h2>
                {!returnOrderObj ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">{`Select an eligible delivered order to initiate a return:`}</p>
                    <div className="grid gap-3">
                      {myOrders.filter(e => e.status === `Delivered & Invoiced`).length === 0 ? (
                        <p className="text-xs text-slate-400">{`No delivered orders available for return.`}</p>
                      ) : (
                        myOrders.filter(e => e.status === `Delivered & Invoiced`).map(o => (
                          <div key={o.id} onClick={() => {
                            setReturnOrderObj(o);
                            let initialRItems = {};
                            o.items.forEach((item, idx) => initialRItems[item.id || idx] = 0);
                            setReturnItems(initialRItems);
                            setReturnReason(``);
                          }} className="p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-[#0697A8] hover:bg-[#E0F5F7]/30 transition-colors flex justify-between items-center">
                            <div>
                              <div className="font-bold text-[#1D2A3B]">{o.id}</div>
                              <div className="text-xs text-slate-500">{o.date}{` • `}{o.items.length}{` items`}</div>
                            </div>
                            <span className="text-[#0697A8] font-bold text-sm">{`Select →`}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <button onClick={() => setReturnOrderObj(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold">
                        {`← Back`}
                      </button>
                      <h3 className="font-bold text-[#1D2A3B]">{`Returning Order: `}{returnOrderObj.id}</h3>
                    </div>
                    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-white">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 text-[9px] text-[#64748B] uppercase font-bold border-b border-[#E2E8F0]">
                            <th className="p-3">{`Medicine`}</th>
                            <th className="p-3 text-center">{`Purchased`}</th>
                            <th className="p-3 text-center">{`Return Qty`}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {returnOrderObj.items.map((item, t) => (
                            <tr key={item.id || t}>
                              <td className="p-3 font-bold text-[#1D2A3B] text-xs">{item.name}</td>
                              <td className="p-3 text-center font-semibold text-[#475569] text-xs">{item.quantity}</td>
                              <td className="p-3 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max={item.quantity}
                                  className="w-16 p-1 border rounded text-center text-xs"
                                  value={returnItems[item.id || t] !== undefined ? returnItems[item.id || t] : 0}
                                  onChange={(ev) => {
                                    let val = parseInt(ev.target.value) || 0;
                                    setReturnItems({ ...returnItems, [item.id || t]: Math.min(item.quantity, Math.max(0, val)) });
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">{`Reason for Return (Optional)`}</label>
                      <textarea
                        className="w-full p-2 border rounded-xl text-xs outline-none focus:border-[#0697A8] focus:ring-1 focus:ring-[#0697A8]"
                        rows="3"
                        placeholder="Please describe why you are returning these products (optional)..."
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={async () => {
                        let totalRefund = 0;
                        let returnedCount = 0;
                        returnOrderObj.items.forEach((item, idx) => {
                          let rq = returnItems[item.id || idx] || 0;
                          if (rq > 0) {
                            totalRefund += rq * item.price;
                            returnedCount += rq;
                          }
                        });

                        if (returnedCount === 0) {
                          T(`Please select at least one item to return.`);
                          return;
                        }

                        let refNum = `RET-2026-00${Math.floor(50 + Math.random() * 49)}`;
                        let retDate = new Date().toISOString().split(`T`)[0];
                        let retEntry = {
                          date: retDate,
                          ref: refNum,
                          desc: `Return Refund - Order ${returnOrderObj.id} (${returnedCount} items)${returnReason.trim() ? ` - Reason: ${returnReason.trim()}` : ''}`,
                          debit: 0,
                          credit: totalRefund,
                          balance: Math.max(0, tn.outstandingBalance - totalRefund),
                          type: `Refund`
                        };
                        S(e => [...e, retEntry]);

                        // Update order status to Return Requested
                        let updatedOrderWithReturn = {
                          ...returnOrderObj,
                          status: 'Return Requested',
                          returnReason: returnReason.trim(),
                          returnRefund: totalRefund,
                          returnItemsCount: returnedCount,
                          returnItems: { ...returnItems },
                          returnDate: retDate
                        };
                        x(prev => prev.map(o => o.id === returnOrderObj.id ? updatedOrderWithReturn : o));

                        try {
                          await supabase.from('orders').update({
                            status: 'Return Requested'
                          }).eq('id', returnOrderObj.id);
                        } catch (err) {
                          console.error('Error updating order return status in Supabase:', err);
                        }

                        let iMsg = {
                          id: Date.now(),
                          text: `Return Processed: Credit Note ${refNum} issued for ৳${totalRefund.toFixed(2)} to your account.`,
                          date: `Just now`,
                          read: !1
                        };
                        let adminMsg = {
                          id: Date.now() + 1,
                          text: `Return Request Submitted: ${tn.name} requested return on Order #${returnOrderObj.id} (${returnedCount} items, ৳${totalRefund.toFixed(2)}).`,
                          date: `Just now`,
                          read: !1
                        };
                        w(e => [adminMsg, iMsg, ...e]);
                        T(`Successfully submitted return. Order #${returnOrderObj.id} is now in Return Requested status.`);

                        setReturnOrderObj(null);
                        setReturnReason(``);
                      }}
                      className="w-full bg-[#0697A8] hover:bg-[#057A88] text-white font-bold py-3 rounded-xl shadow-md text-xs transition-all cursor-pointer"
                    >
                      {`Submit Return Request`}
                    </button>
                  </div>
                )}
              </div>
            </div>}
            {O === `orders` && <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#1D2A3B] tracking-tight">{`Wholesale Order History`}</h2>
                <p className="text-xs text-[#64748B] mt-0.5">{`Track shipping statuses, review past purchases, and download invoice copies.`}</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] text-[#64748B] uppercase tracking-wider font-bold border-b border-[#E2E8F0]">
                        <th className="px-5 py-3.5">{`Order ID`}</th>
                        <th className="px-5 py-3.5">{`Purchase Date`}</th>
                        <th className="px-5 py-3.5">{`Payment Method`}</th>
                        <th className="px-5 py-3.5">{`Total Value`}</th>
                        <th className="px-5 py-3.5">{`Fulfillment Status`}</th>
                        <th className="px-5 py-3.5">{`Payment Status`}</th>
                        <th className="px-5 py-3.5 text-right">{`Invoice`}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {myOrders.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-5 py-12 text-center text-[#94A3B8]">
                            <svg className="w-10 h-10 mx-auto mb-3 text-[#CBD5E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            <p className="text-sm font-bold text-[#64748B]">{`No orders placed yet`}</p>
                            <p className="text-[11px] mt-1">{`When you place wholesale medicine orders, they will appear here.`}</p>
                          </td>
                        </tr>
                      ) : (
                        myOrders.map((e, _idx) => <tr key={e.id || _idx} className="hover:bg-slate-50/50">
                          <td className="px-5 py-4 font-mono font-bold text-[#0697A8]">
                            {e.id}
                          </td>
                          <td className="px-5 py-4 text-[#475569]">
                            {e.date}
                          </td>
                          <td className="px-5 py-4 text-[#475569]">
                            {e.paymentMethod}
                          </td>
                          <td className="px-5 py-4 font-bold">
                            {`৳`}
                            {e.totalAmount.toFixed(2)}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${e.status === `Delivered & Invoiced` ? `bg-emerald-50 text-emerald-800 border-emerald-100` : e.status === `Out for Delivery` ? `bg-purple-50 text-purple-800 border-purple-100` : e.status === `Processing/Packing` ? `bg-[#E0F5F7] text-blue-800 border-[#C2EAF0]` : e.status === `Return Requested` ? `bg-rose-50 text-rose-800 border-rose-200 animate-pulse` : e.status === `Returned` ? `bg-slate-100 text-slate-700 border-slate-300` : `bg-yellow-50 text-yellow-800 border-yellow-200 animate-pulse`}`}>
                              {e.status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${e.paymentStatus === `Paid` ? `bg-emerald-100 text-emerald-800` : `bg-yellow-100 text-yellow-800`}`}>
                              {e.paymentStatus}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {['Pending', 'Pending Verification', 'Processing/Packing', 'Approved'].includes(e.status) && (
                                <button onClick={() => {
                                  ke(e);
                                  setIsEditingOrder(true);
                                  let initialQs = {};
                                  e.items.forEach((item, idx) => initialQs[item.id || idx] = item.quantity);
                                  setEditedQuantities(initialQs);
                                }} className="bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 px-2.5 py-1.5 rounded-lg font-bold text-[10px] transition-colors inline-flex items-center gap-1" title="Edit order quantities">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  {`Edit Order`}
                                </button>
                              )}
                              <button onClick={() => ke(e)} className="bg-[#E0F5F7] border border-[#C2EAF0] hover:bg-[#C2EAF0] text-[#0697A8] px-3 py-1.5 rounded-lg font-bold text-[10px] transition-colors inline-flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {`View Invoice`}
                              </button>
                            </div>
                          </td>
                        </tr>))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>}
            {O === `support` && <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#1D2A3B] tracking-tight">{`Approved Buyer Support Center`}</h2>
                <p className="text-xs text-[#64748B] mt-0.5">{`Submit expiry return claims, dispute statements, or contact support.`}</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-[#1D2A3B] mb-4">{`Open Support Ticket / Claim Case`}</h3>
                  {Pe.submitted ? <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center text-xs space-y-3">
                    <h4 className="font-bold text-[#1D2A3B]">{`Ticket Logged Successfully`}</h4>
                    <p className="text-[#64748B]">
                      {`Case Ref: #TKT-2026-`}
                      {Math.floor(1e3 + Math.random() * 9e3)}
                      {`. Your dedicated representative (${buyerDeliveryMen.length > 0 ? buyerDeliveryMen[0].name : 'B2B Support Lead'}) will respond within 2 hours.`}
                    </p>
                    <button onClick={() => Fe({
                      subject: ``,
                      body: ``,
                      submitted: !1
                    })} className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl">{`Submit Another Ticket`}</button>
                  </div> : <form onSubmit={e => {
                    e.preventDefault(), Fe(e => ({
                      ...e,
                      submitted: !0
                    }));
                  }} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-[#475569] mb-1.5">{`Claim Subject / Topic`}</label>
                      <input type="text" required={!0} value={Pe.subject} onChange={e => Fe({
                        ...Pe,
                        subject: e.target.value
                      })} placeholder="e.g. Batch expiry refund request" className="w-full px-3 py-2 bg-slate-50 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white" />
                    </div>
                    <div>
                      <label className="block font-bold text-[#475569] mb-1.5">{`Detailed Description`}</label>
                      <textarea required={!0} rows={5} value={Pe.body} onChange={e => Fe({
                        ...Pe,
                        body: e.target.value
                      })} placeholder="Provide details..." className="w-full px-3 py-2 bg-slate-50 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white" />
                    </div>
                    <button type="submit" className="bg-[#0697A8] hover:bg-[#057A88] text-white font-bold px-5 py-2.5 rounded-xl shadow-md">{`Log Ticket Case`}</button>
                  </form>}
                </div>
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{`B2B Buying FAQs`}</h3>
                  <div className="space-y-3.5 text-xs text-[#475569]">
                    <div>
                      <h4 className="font-bold text-[#1D2A3B]">{`Short-expiry return policy?`}</h4>
                      <p className="text-[11px] text-[#64748B]">{`Approved pharmacies can return batch items with less than 3 months expiry for full credit note refunds.`}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1D2A3B]">{`Accepted payment methods?`}</h4>
                      <p className="text-[11px] text-[#64748B]">{`Currently, all B2B orders are processed via Cash on Delivery (COD). You can verify items upon courier arrival before paying.`}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>}
            {O === `request` && <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#1D2A3B] tracking-tight">{`Request a Medicine`}</h2>
                <p className="text-xs text-[#64748B] mt-0.5">{`Can't find a medicine or it's out of stock? Submit a request with the medicine name and a photo. Our admin team will review and add it to the catalog.`}</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-[#1D2A3B] mb-5 flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#0697A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {`Submit New Medicine Request`}
                  </h3>
                  {Be.submitted ? <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-[#1D2A3B] text-sm">{`Request Submitted Successfully!`}</h4>
                    <p className="text-xs text-[#64748B]">
                      {`Request ID: #REQ-`}
                      {Math.floor(1e3 + Math.random() * 9e3)}
                      {`. Our admin team will review your request and update the inventory within 24-48 hours.`}
                    </p>
                    <button onClick={() => F({
                      name: ``,
                      quantity: 100,
                      photoPreview: null,
                      photoFile: null,
                      notes: ``,
                      submitted: !1
                    })} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition-colors">{`Submit Another Request`}</button>
                  </div> : <form onSubmit={e => {
                    e.preventDefault();
                    let t = {
                      id: `REQ-${Date.now()}`,
                      name: Be.name,
                      photo: Be.photoPreview,
                      notes: Be.notes,
                      quantity: parseInt(Be.quantity) || 100,
                      buyerName: tn?.name || `Registered Pharmacy`,
                      buyerEmail: n?.email || '',
                      buyerId: n?.pharmacyId || n?.id || '',
                      pharmacyId: n?.pharmacyId || n?.id || '',
                      buyerPhone: tn?.phone || n?.phone || '',
                      date: new Date().toLocaleDateString(),
                      status: `Pending Review`,
                      source: `Request Medicine Page`
                    };
                    ze(e => [t, ...e]);
                    try {
                      supabase.from('medicine_requests').insert([{
                        id: t.id,
                        name: t.name,
                        photo: t.photo || null,
                        notes: t.notes || '',
                        quantity: t.quantity,
                        buyer_name: t.buyerName,
                        buyer_email: t.buyerEmail,
                        buyer_id: t.buyerId,
                        pharmacy_id: t.pharmacyId,
                        buyer_phone: t.buyerPhone,
                        date: t.date,
                        status: t.status,
                        source: t.source,
                        created_at: new Date().toISOString()
                      }]).then(({ error }) => {
                        if (error) console.warn('Supabase medicine_requests insert error:', error);
                      });
                    } catch (err) {
                      console.warn('Supabase insert error:', err);
                    }
                    F({
                      name: ``,
                      quantity: 100,
                      photoPreview: null,
                      photoFile: null,
                      notes: ``,
                      submitted: !0
                    });
                    w(e => [{
                      id: Date.now(),
                      text: `Medicine request for "${Be.name}" submitted to Admin.`,
                      date: `Just now`,
                      read: false
                    }, ...e]);
                    T(`Medicine request for "${Be.name}" submitted successfully!`);
                  }} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-[#475569] mb-1.5">
                        {`Medicine Name `}
                        <span className="text-red-500">{`*`}</span>
                      </label>
                      <input type="text" required={!0} value={Be.name} onChange={e => F(t => ({
                        ...t,
                        name: e.target.value
                      }))} placeholder="e.g. Napa Extra 500mg, Seclo 20mg Capsule..." className="w-full px-4 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#475569] mb-1.5">
                        {`Estimated Quantity Needed (Units / Packs)`}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={Be.quantity || 100}
                        onChange={e => F(t => ({
                          ...t,
                          quantity: e.target.value
                        }))}
                        placeholder="e.g. 100"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#1D2A3B] focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#475569] mb-1.5">{`Upload Medicine Photo`}</label>
                      <div className="border-2 border-dashed border-[#E2E8F0] rounded-xl p-5 text-center hover:border-blue-400 transition-colors cursor-pointer relative">
                        {Be.photoPreview ? <div className="space-y-3">
                          <img src={Be.photoPreview} alt="Preview" className="max-h-40 mx-auto rounded-lg object-contain" />
                          <button type="button" onClick={() => F(e => ({
                            ...e,
                            photoPreview: null,
                            photoFile: null
                          }))} className="text-[10px] text-red-500 hover:text-red-700 font-bold">{`Remove Photo`}</button>
                        </div> : <label className="cursor-pointer block">
                          <div className="w-12 h-12 bg-[#E0F5F7] rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-xs font-bold text-[#475569]">{`Click to upload a photo of the medicine`}</p>
                          <p className="text-[10px] text-[#94A3B8] mt-1">{`Supports JPG, PNG (Max 5MB)`}</p>
                          <input type="file" accept="image/*" className="hidden" onChange={e => {
                            let t = e.target.files[0];
                            if (t) {
                              let e = new FileReader();
                              e.onloadend = () => F(n => ({
                                ...n,
                                photoPreview: e.result,
                                photoFile: t
                              })), e.readAsDataURL(t);
                            }
                          }} />
                        </label>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#475569] mb-1.5">{`Additional Notes (Optional)`}</label>
                      <textarea rows={3} value={Be.notes} onChange={e => F(t => ({
                        ...t,
                        notes: e.target.value
                      }))} placeholder="Any details: strength, dosage form, manufacturer, urgency..." className="w-full px-4 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                    </div>
                    <button type="submit" className="bg-[#0697A8] hover:bg-[#057A88] text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md shadow-blue-500/10 transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      {`Submit Request`}
                    </button>
                  </form>}
                </div>
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
                  <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-4">{`Your Requests`}</h3>
                  {myRequests.length === 0 ? <div className="text-center py-8">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-5 h-5 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-xs text-[#94A3B8] font-medium">{`No requests yet`}</p>
                    <p className="text-[10px] text-[#CBD5E1] mt-1">{`Your submitted requests will appear here`}</p>
                  </div> : <div className="space-y-3 max-h-96 overflow-y-auto">
                    {myRequests.map((e, _idx) => <div key={e.id || _idx} className="border border-[#E2E8F0] rounded-xl p-3 space-y-2">
                      {e.photo && <img src={e.photo} alt={e.name} className="w-full h-24 object-contain rounded-lg bg-slate-50" />}
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-[#1D2A3B]">
                            {e.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-[#94A3B8] font-mono">
                              {e.date}
                            </span>
                            {e.quantity && (
                              <span className="text-[9px] bg-slate-100 text-[#475569] font-bold px-1.5 py-0.2 rounded">
                                {e.quantity} Units
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${e.status === 'Restocked & Available' || e.status === 'Added' ? 'bg-emerald-50 text-emerald-700' :
                            e.status === 'In Procurement' ? 'bg-blue-50 text-blue-700' :
                              e.status === 'Unavailable / Rejected' ? 'bg-red-50 text-red-700' :
                                'bg-amber-50 text-amber-700'
                          }`}>
                          {e.status}
                        </span>
                      </div>
                      {e.notes && <p className="text-[10px] text-[#64748B] italic">
                        {e.notes}
                      </p>}
                    </div>)}
                  </div>}
                </div>
              </div>
            </div>}
            {O === `profile` && (
              <BuyerProfileView
                user={n}
                allUsers={i}
                onUpdateUser={handleUpdateUserProfile}
                onShowToast={T}
                orderCount={myOrders.length}
                creditLimit={tn.creditLimit}
                outstandingBalance={tn.outstandingBalance}
              />
            )}
          </div>}
          {f === `admin` && <div className="flex-1 flex overflow-hidden">
            {mt === `approvals` && <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
                <div>
                  <h2 className="text-2xl font-bold text-[#1D2A3B] dark:text-white tracking-tight">{`All Buyers & Verification Panel`}</h2>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">{`Complete directory of all registered B2B pharmacy buyers, onboarding applications, and buying authorizations.`}</p>
                </div>
                <div className="w-full sm:w-80">
                  <div className="relative">
                    <input
                      type="text"
                      value={buyerSearchQuery}
                      onChange={e => setBuyerSearchQuery(e.target.value)}
                      placeholder="Search pharmacy, phone, email, license..."
                      className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400 shadow-2xs"
                    />
                    <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {buyerSearchQuery && (
                      <button onClick={() => setBuyerSearchQuery('')} className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs">✕</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div
                  onClick={() => setBuyerFilterTab('All')}
                  className={`bg-white dark:bg-slate-800 border p-4 rounded-2xl shadow-xs flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${buyerFilterTab === 'All' ? 'border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/30' : 'border-[#E2E8F0] dark:border-slate-700'}`}
                >
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">{`All Buyers`}</span>
                    <span className="text-xl font-black text-blue-600">
                      {E.length}
                      {` Total`}
                    </span>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xs">{`👥`}</div>
                </div>

                <div
                  onClick={() => setBuyerFilterTab('Pending')}
                  className={`bg-white dark:bg-slate-800 border p-4 rounded-2xl shadow-xs flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${buyerFilterTab === 'Pending' ? 'border-amber-500 ring-2 ring-amber-100 dark:ring-amber-900/30' : 'border-[#E2E8F0] dark:border-slate-700'}`}
                >
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">{`Pending Queue`}</span>
                    <span className="text-xl font-black text-amber-600">
                      {E.filter(e => e.status === `Pending` || e.status === `Pending Verification`).length}
                      {` Applications`}
                    </span>
                  </div>
                  <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/40 rounded-xl flex items-center justify-center text-amber-600 font-bold text-xs">{`🔔`}</div>
                </div>

                <div
                  onClick={() => setBuyerFilterTab('Approved')}
                  className={`bg-white dark:bg-slate-800 border p-4 rounded-2xl shadow-xs flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${buyerFilterTab === 'Approved' ? 'border-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-900/30' : 'border-[#E2E8F0] dark:border-slate-700'}`}
                >
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">{`Activated Shops`}</span>
                    <span className="text-xl font-black text-emerald-600">
                      {E.filter(e => e.status === `Approved`).length}
                      {` Approved`}
                    </span>
                  </div>
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-xs">{`✓`}</div>
                </div>

                <div
                  onClick={() => setBuyerFilterTab('Rejected')}
                  className={`bg-white dark:bg-slate-800 border p-4 rounded-2xl shadow-xs flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${buyerFilterTab === 'Rejected' ? 'border-red-500 ring-2 ring-red-100 dark:ring-red-900/30' : 'border-[#E2E8F0] dark:border-slate-700'}`}
                >
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">{`Security Flagged`}</span>
                    <span className="text-xl font-black text-red-600">
                      {E.filter(e => e.status === `Rejected`).length}
                      {` Rejected`}
                    </span>
                  </div>
                  <div className="w-10 h-10 bg-red-50 dark:bg-red-950/40 rounded-xl flex items-center justify-center text-red-600 font-bold text-xs">{`⚠️`}</div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex border-b border-[#E2E8F0] dark:border-slate-700 gap-4 text-xs font-semibold select-none overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5">
                {[
                  { id: 'All', label: 'All Buyers', count: E.length },
                  { id: 'Pending', label: 'Pending Verification', count: E.filter(e => e.status === 'Pending' || e.status === 'Pending Verification').length },
                  { id: 'Approved', label: 'Approved & Active', count: E.filter(e => e.status === 'Approved').length },
                  { id: 'Rejected', label: 'Rejected / Flagged', count: E.filter(e => e.status === 'Rejected').length }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setBuyerFilterTab(tab.id)}
                    className={`pb-3.5 px-1 relative transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 ${buyerFilterTab === tab.id
                        ? 'text-emerald-700 dark:text-emerald-400 font-bold border-b-2 border-emerald-600'
                        : 'text-[#64748B] dark:text-slate-400 hover:text-[#1D2A3B] dark:hover:text-white'
                      }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${buyerFilterTab === tab.id
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                        : tab.count > 0 && tab.id === 'Pending'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 animate-pulse'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Filter and render table */}
              {(() => {
                const filteredBuyers = E.filter(e => {
                  if (buyerFilterTab === 'Pending') {
                    if (e.status !== 'Pending' && e.status !== 'Pending Verification') return false;
                  } else if (buyerFilterTab !== 'All' && e.status !== buyerFilterTab) return false;
                  if (!buyerSearchQuery.trim()) return true;
                  const q = buyerSearchQuery.toLowerCase();
                  return (
                    (e.name && e.name.toLowerCase().includes(q)) ||
                    (e.ownerName && e.ownerName.toLowerCase().includes(q)) ||
                    (e.email && e.email.toLowerCase().includes(q)) ||
                    (e.phone && e.phone.toLowerCase().includes(q)) ||
                    (e.licenseNumber && e.licenseNumber.toLowerCase().includes(q)) ||
                    (e.location && e.location.toLowerCase().includes(q)) ||
                    (e.id && e.id.toLowerCase().includes(q))
                  );
                });

                return (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white dark:bg-slate-800 rounded-2xl border border-[#E2E8F0] dark:border-slate-700 shadow-sm overflow-hidden overflow-x-auto">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-[#E2E8F0] dark:border-slate-700 flex justify-between items-center">
                        <span className="text-xs font-bold text-[#1D2A3B] dark:text-white">
                          {`Buyer Directory (`}{filteredBuyers.length}{` displayed) - Click any row to view full audit details`}
                        </span>
                        {buyerSearchQuery && (
                          <span className="text-[11px] text-[#64748B] dark:text-slate-400">
                            Filtering by: "{buyerSearchQuery}"
                          </span>
                        )}
                      </div>
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800 text-[10px] text-[#64748B] dark:text-slate-400 uppercase tracking-wider font-bold border-b border-[#E2E8F0] dark:border-slate-700">
                            <th className="px-5 py-3.5">{`Join Date`}</th>
                            <th className="px-5 py-3.5">{`Pharmacy & Buyer Details`}</th>
                            <th className="px-5 py-3.5">{`Geographic Location`}</th>
                            <th className="px-5 py-3.5 text-center">{`License File`}</th>
                            <th className="px-5 py-3.5">{`Status`}</th>
                            <th className="px-5 py-3.5 text-right w-84">{`Verification Action`}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
                          {filteredBuyers.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="px-5 py-12 text-center text-[#94A3B8]">
                                <p className="text-sm font-bold text-[#64748B] dark:text-slate-300">{`No buyers found`}</p>
                                <p className="text-[11px] mt-1">{`No records match current filter "${buyerFilterTab}"${buyerSearchQuery ? ` and search "${buyerSearchQuery}"` : ''}.`}</p>
                                {(buyerFilterTab !== 'All' || buyerSearchQuery) && (
                                  <button
                                    onClick={() => { setBuyerFilterTab('All'); setBuyerSearchQuery(''); }}
                                    className="mt-3 px-3 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold rounded-lg text-xs hover:bg-emerald-100 transition-colors cursor-pointer"
                                  >
                                    View All Buyers
                                  </button>
                                )}
                              </td>
                            </tr>
                          ) : (
                            filteredBuyers.map(e => (
                              <tr key={e.id} onClick={() => _t(e)} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group">
                                <td className="px-5 py-4 text-[#64748B] dark:text-slate-400 font-mono">
                                  {e.applyDate}
                                </td>
                                <td className="px-5 py-4">
                                  <div className="font-bold text-[#1D2A3B] dark:text-white group-hover:text-emerald-600 transition-colors">
                                    {e.name}
                                  </div>
                                  <div className="text-[11px] text-[#475569] dark:text-slate-300 mt-0.5">
                                    {e.ownerName !== 'N/A' ? e.ownerName : ''}{e.phone && e.phone !== 'N/A' ? ` • ${e.phone}` : ''}
                                  </div>
                                  <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                                    {e.email} • ID: {e.id}
                                  </div>
                                </td>
                                <td className="px-5 py-4 text-[#475569] dark:text-slate-300 max-w-xs truncate">
                                  {e.location}
                                </td>
                                <td className="px-5 py-4 text-center" onClick={ev => ev.stopPropagation()}>
                                  {e.drugLicenseFile ? (
                                    <a
                                      href={e.drugLicenseFile.startsWith('http') ? e.drugLicenseFile : `#preview-${e.drugLicenseFile}`}
                                      target={e.drugLicenseFile.startsWith('http') ? "_blank" : "_self"}
                                      rel="noreferrer"
                                      onClick={t => {
                                        if (!e.drugLicenseFile.startsWith('http')) {
                                          t.preventDefault();
                                          T(`License file: ${e.drugLicenseFile}`);
                                        }
                                      }}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900 hover:bg-red-100 rounded-lg text-[10px] font-bold transition-all"
                                    >
                                      <svg className="w-3.5 h-3.5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                      </svg>
                                      <span>{`License.pdf`}</span>
                                    </a>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic">None</span>
                                  )}
                                </td>
                                <td className="px-5 py-4">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${e.status === `Approved`
                                      ? `bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300`
                                      : e.status === `Rejected`
                                        ? `bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300`
                                        : `bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 animate-pulse`
                                    }`}>
                                    {e.status === 'Pending' ? 'Pending Verification' : e.status}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-right" onClick={ev => ev.stopPropagation()}>
                                  {(e.status === `Pending` || e.status === `Pending Verification`) ? (
                                    <div className="flex items-center justify-end gap-2 flex-nowrap whitespace-nowrap">
                                      <button onClick={() => _n(e.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] shadow-sm transition-all whitespace-nowrap flex-shrink-0 cursor-pointer">{`Approve`}</button>
                                      <button onClick={() => { _t(e); wt(!0); }} className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-100 font-bold px-3 py-1.5 rounded-lg text-[10px] transition-all whitespace-nowrap flex-shrink-0 cursor-pointer">{`Reject`}</button>
                                      <button
                                        onClick={() => handleDeleteBuyer(e)}
                                        className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-bold px-2 py-1.5 rounded-lg text-[10px] transition-all whitespace-nowrap flex-shrink-0 cursor-pointer flex items-center gap-1"
                                        title="Permanently remove buyer and all their data"
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span>Delete</span>
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-end gap-2 flex-nowrap whitespace-nowrap">
                                      <button onClick={() => _t(e)} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-[#1D2A3B] dark:text-slate-200 font-bold px-2.5 py-1 rounded-lg text-[10px] transition-colors cursor-pointer">
                                        Inspect
                                      </button>
                                      {e.status === `Approved` ? (
                                        <button onClick={() => { _t(e); wt(!0); }} className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 font-bold text-[10px] px-2 py-1 rounded-lg transition-colors cursor-pointer">
                                          Revoke
                                        </button>
                                      ) : (
                                        <button onClick={() => _n(e.id)} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 font-bold text-[10px] px-2 py-1 rounded-lg transition-colors cursor-pointer">
                                          Re-activate
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleDeleteBuyer(e)}
                                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 font-bold text-[10px] px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                        title="Permanently remove buyer and all their data"
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span>Delete</span>
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card List View */}
                    <div className="md:hidden space-y-4">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl flex justify-between items-center">
                        <span className="text-xs font-bold text-[#1D2A3B] dark:text-white">
                          {`Buyers (`}{filteredBuyers.length}{`)`}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600">
                          {buyerFilterTab}
                        </span>
                      </div>
                      {filteredBuyers.length === 0 ? (
                        <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-[#E2E8F0] dark:border-slate-700 text-xs text-[#64748B]">
                          {`No buyers found in this filter.`}
                        </div>
                      ) : (
                        filteredBuyers.map(e => (
                          <div key={e.id} className="bg-white dark:bg-[#1D2A3B] p-5 rounded-2xl border border-[#E2E8F0] dark:border-slate-700 shadow-sm space-y-4 relative">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-sm font-bold text-[#1D2A3B] dark:text-slate-200">
                                  {e.name}
                                </h4>
                                <p className="text-[11px] text-[#475569] dark:text-slate-300 mt-0.5">
                                  {e.ownerName !== 'N/A' ? e.ownerName : ''}{e.phone && e.phone !== 'N/A' ? ` • ${e.phone}` : ''}
                                </p>
                                <p className="text-[10px] text-[#94A3B8] mt-0.5">
                                  {e.email} • ID: {e.id}
                                </p>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${e.status === `Approved`
                                  ? `bg-emerald-100 text-emerald-800`
                                  : e.status === `Rejected`
                                    ? `bg-red-100 text-red-800`
                                    : `bg-amber-100 text-amber-800 animate-pulse`
                                }`}>
                                {e.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs text-[#475569] dark:text-slate-300 border-t border-slate-100 dark:border-slate-700 pt-3">
                              <div>
                                <span className="text-[9px] text-[#94A3B8] block uppercase font-bold tracking-wider">{`Apply Date`}</span>
                                <span className="font-mono font-semibold">{e.applyDate}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-[#94A3B8] block uppercase font-bold tracking-wider">{`Location`}</span>
                                <span className="font-semibold truncate block">{e.location}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-[9px] text-[#94A3B8] block uppercase font-bold tracking-wider">{`Drug License Number`}</span>
                                <span className="font-mono font-semibold">{e.licenseNumber}</span>
                              </div>
                            </div>
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center gap-2 flex-wrap">
                              <button onClick={() => _t(e)} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-[#1D2A3B] dark:text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors">
                                <span>{`View Details`}</span>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                              {(e.status === `Pending` || e.status === `Pending Verification`) ? (
                                <div className="flex gap-2 items-center">
                                  <button onClick={() => _n(e.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-sm transition-all cursor-pointer">{`Approve`}</button>
                                  <button onClick={() => { _t(e); wt(!0); }} className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-100 font-bold px-3 py-2 rounded-xl text-xs transition-all cursor-pointer">{`Reject`}</button>
                                  <button onClick={() => handleDeleteBuyer(e)} className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1" title="Delete Buyer">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span>Delete</span>
                                  </button>
                                </div>
                              ) : (
                                <div className="flex gap-2 items-center">
                                  {e.status === `Approved` ? (
                                    <button onClick={() => { _t(e); wt(!0); }} className="text-amber-600 hover:text-amber-700 font-bold text-xs px-2 py-1 cursor-pointer">Revoke</button>
                                  ) : (
                                    <button onClick={() => _n(e.id)} className="text-emerald-600 hover:text-emerald-700 font-bold text-xs px-2 py-1 cursor-pointer">Re-approve</button>
                                  )}
                                  <button onClick={() => handleDeleteBuyer(e)} className="text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 font-bold text-xs px-2.5 py-1.5 rounded-lg cursor-pointer flex items-center gap-1" title="Delete Buyer">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                );
              })()}
            </div>}
            {mt === `fulfillment` && <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
              <div className="flex justify-between items-center pb-2">
                <div>
                  <h2 className="text-2xl font-bold text-[#1D2A3B] tracking-tight">{`Orders`}</h2>
                  <p className="text-xs text-[#64748B] mt-0.5">{`Track submitted orders, verify payment credentials, dispatch logistics, and sign invoices.`}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const approved = b.filter(o => o.status === 'Processing/Packing');
                      if (approved.length === 0) {
                        T('No approved invoices to print.');
                        return;
                      }
                      setInvoicesToPrint(approved);
                      setTriggersPrint(!0);
                      T(`Preparing print for ${approved.length} approved invoices...`);
                    }}
                    className="bg-[#E0F5F7] hover:bg-[#C2EAF0] text-[#0697A8] font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span>{`Print all invoices`}</span>
                  </button>
                  <button
                    onClick={handleApproveAll}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{`Approve all`}</span>
                  </button>
                </div>
              </div>
              <div className="flex border-b border-[#E2E8F0] gap-4 text-xs font-semibold select-none overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5">
                {[`All`, `Pending Verification`, `Processing/Packing`, `Out for Delivery`, `Delivered & Invoiced`, `Returned Orders`, `Requested Medicine`].map(e => {
                  let t = e === `All`
                    ? b.length
                    : e === `Returned Orders`
                      ? b.filter(t => t.status === `Returned` || t.status === `Return Requested` || (t.status && t.status.toLowerCase().includes(`return`))).length
                      : e === `Requested Medicine`
                        ? Re.length
                        : b.filter(t => t.status === e).length;
                  return <button key={e} onClick={() => Xt(e)} className={`pb-3.5 px-1 relative transition-all flex-shrink-0 ${Yt === e ? `text-emerald-700 font-bold border-b-2 border-emerald-600` : `text-[#64748B] hover:text-[#1D2A3B]`}`}>
                    <span>{e}</span>
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${Yt === e
                        ? `bg-emerald-100 text-emerald-800`
                        : (e === 'Requested Medicine' && t > 0)
                          ? `bg-amber-100 text-amber-800`
                          : (e === 'Returned Orders' && t > 0)
                            ? `bg-rose-100 text-rose-700`
                            : `bg-slate-100 text-slate-500`
                      }`}>
                      {t}
                    </span>
                  </button>;
                })}
              </div>
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden overflow-x-auto">
                {Yt === `Requested Medicine` ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] text-[#64748B] uppercase tracking-wider font-bold border-b border-[#E2E8F0]">
                        <th className="px-5 py-3.5">{`Request ID`}</th>
                        <th className="px-5 py-3.5">{`Pharmacy / Buyer`}</th>
                        <th className="px-5 py-3.5">{`Request Date`}</th>
                        <th className="px-5 py-3.5">{`Medicine Details`}</th>
                        <th className="px-5 py-3.5">{`Requested Qty`}</th>
                        <th className="px-5 py-3.5">{`Source & Notes`}</th>
                        <th className="px-5 py-3.5">{`Status`}</th>
                        <th className="px-5 py-3.5 text-right w-52">{`Operations`}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {Re.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="px-5 py-12 text-center text-[#94A3B8]">
                            <svg className="w-10 h-10 mx-auto mb-3 text-[#CBD5E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-sm font-bold text-[#64748B]">{`No requested medicines found`}</p>
                            <p className="text-[11px] mt-1">{`When buyers request out-of-stock items or custom medicines, they will appear here.`}</p>
                          </td>
                        </tr>
                      ) : (
                        Re.map((req, _idx) => {
                          const matchedMed = m.find(item => (req.medId && item.id === req.medId) || (req.name && item.name && item.name.toLowerCase() === req.name.toLowerCase()));
                          return (
                            <tr key={req.id || _idx} className="hover:bg-slate-50/70 transition-colors group">
                              <td className="px-5 py-4 font-mono font-bold text-amber-600">
                                {req.id}
                              </td>
                              <td className="px-5 py-4">
                                <div className="font-bold text-[#1D2A3B]">{req.buyerName || `Registered Pharmacy`}</div>
                                <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                                  {req.buyerEmail ? `${req.buyerEmail}` : ''}
                                  {req.buyerEmail && req.buyerPhone ? ` • ` : ''}
                                  {req.buyerPhone && req.buyerPhone !== 'N/A' ? req.buyerPhone : ''}
                                </div>
                              </td>
                              <td className="px-5 py-4 text-[#475569] font-mono text-[11px]">
                                {req.date}
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  {req.photo ? (
                                    <img src={req.photo} alt={req.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200 flex-shrink-0 bg-slate-50 shadow-sm" />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                      </svg>
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-bold text-[#1D2A3B]">{req.name}</div>
                                    <div className="text-[10px] text-[#64748B]">
                                      {req.generic ? `${req.generic}` : matchedMed?.generic || ''}
                                      {req.manufacturer ? ` · ${req.manufacturer}` : matchedMed?.manufacturer ? ` · ${matchedMed.manufacturer}` : ''}
                                    </div>
                                    {matchedMed && (
                                      <div className="text-[9px] text-emerald-700 font-bold mt-0.5">
                                        {`Current Stock: ${matchedMed.stock} | Trade: ৳${(matchedMed.wholesalePrice || 0).toFixed(2)}`}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 font-bold text-[#1D2A3B]">
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs">
                                  {req.quantity || 100} {`Units`}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <div className="space-y-1">
                                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${req.source === 'Catalog Out-of-Stock' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'}`}>
                                    {req.source || 'Medicine Request'}
                                  </span>
                                  {req.notes && (
                                    <p className="text-[11px] text-[#64748B] italic max-w-xs line-clamp-2" title={req.notes}>
                                      {req.notes}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <select
                                  value={req.status || 'Pending Review'}
                                  onChange={(e) => handleUpdateRequestStatus(req.id, e.target.value)}
                                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${req.status === 'Restocked & Available' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                                      req.status === 'In Procurement' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                                        req.status === 'Unavailable / Rejected' ? 'bg-red-50 text-red-800 border-red-300' :
                                          'bg-amber-50 text-amber-800 border-amber-300'
                                    }`}
                                >
                                  <option value="Pending Review">Pending Review</option>
                                  <option value="In Procurement">In Procurement</option>
                                  <option value="Restocked & Available">Restocked & Available</option>
                                  <option value="Unavailable / Rejected">Unavailable / Rejected</option>
                                </select>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleAdminRestockMed(req, 100)}
                                    title="Add 100 units to inventory stock and mark Restocked & Available"
                                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-[10px] transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>{`Restock +100`}</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRequest(req.id)}
                                    title="Delete Request"
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] text-[#64748B] uppercase tracking-wider font-bold border-b border-[#E2E8F0]">
                        <th className="px-5 py-3.5">{`Order ID`}</th>
                        <th className="px-5 py-3.5">{`Pharmacy Shop`}</th>
                        <th className="px-5 py-3.5">{`Submit Date`}</th>
                        <th className="px-5 py-3.5">{`Item Count`}</th>
                        <th className="px-5 py-3.5">{`Payment Type`}</th>
                        <th className="px-5 py-3.5">{`Total Value`}</th>
                        <th className="px-5 py-3.5">{`Fulfillment Status`}</th>
                        <th className="px-5 py-3.5 text-right w-44">{`Operations`}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {(() => {
                        const filtered = b.filter(e => {
                          if (Yt === `All`) return !0;
                          if (Yt === `Returned Orders`) return e.status === `Returned` || e.status === `Return Requested` || (e.status && e.status.toLowerCase().includes(`return`));
                          return e.status === Yt;
                        });
                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan="8" className="px-5 py-12 text-center text-[#94A3B8]">
                                <svg className="w-10 h-10 mx-auto mb-3 text-[#CBD5E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                <p className="text-sm font-bold text-[#64748B]">{`No orders found`}</p>
                                <p className="text-[11px] mt-1">{`No orders currently matching "${Yt}".`}</p>
                              </td>
                            </tr>
                          );
                        }
                        return filtered.map((e, _idx) => (
                          <tr key={e.id || _idx} onClick={() => vt(e)} className="hover:bg-slate-50/70 transition-colors cursor-pointer group">
                            <td className="px-5 py-4 font-mono font-bold text-emerald-700">
                              {e.id}
                            </td>
                            <td className="px-5 py-4">
                              <div className="font-bold text-[#1D2A3B] group-hover:text-emerald-700 transition-colors">
                                {e.buyerName}
                              </div>
                              <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">{`Tier-A Approved`}</div>
                            </td>
                            <td className="px-5 py-4 text-[#475569]">
                              {e.date}
                            </td>
                            <td className="px-5 py-4 font-semibold text-[#475569]">
                              {e.itemCount}
                              {` Unique SKUs`}
                            </td>
                            <td className="px-5 py-4 text-[#475569]">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${e.paymentMethod === `Credit Limit` ? `bg-[#E0F5F7] text-blue-800` : `bg-orange-50 text-orange-800`}`}>
                                {e.paymentMethod}
                              </span>
                            </td>
                            <td className="px-5 py-4 font-bold text-[#1D2A3B]">
                              {`৳`}
                              {e.totalAmount.toFixed(2)}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${e.status === `Delivered & Invoiced` ? `bg-emerald-50 text-emerald-800 border-emerald-100` :
                                  e.status === `Out for Delivery` ? `bg-purple-50 text-purple-800 border-purple-100` :
                                    e.status === `Processing/Packing` ? `bg-[#E0F5F7] text-blue-800 border-[#C2EAF0]` :
                                      e.status === `Return Requested` ? `bg-rose-50 text-rose-800 border-rose-200 animate-pulse` :
                                        e.status === `Returned` ? `bg-slate-100 text-slate-700 border-slate-300` :
                                          `bg-yellow-50 text-yellow-800 border-yellow-200`
                                }`}>
                                {e.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                              <button onClick={() => vt(e)} className={`${e.status === 'Return Requested' ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100' : e.status === 'Returned' ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-slate-50 border-[#E2E8F0] hover:bg-slate-100 text-[#475569]'} border px-3 py-1.5 rounded-lg font-bold text-[10px] transition-colors cursor-pointer`}>
                                {e.status === 'Return Requested' ? 'Check Return' : e.status === 'Returned' ? 'View Return' : 'Process Dispatch'}
                              </button>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                )}
              </div>
            </div>}
            {mt === `stockout` && <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8">
              <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-[#1D2A3B] tracking-tight">{`Stock-out Products`}</h2>
                  <p className="text-xs text-[#64748B] mt-0.5">{`Review items that are currently out of stock.`}</p>
                </div>
                <div className="bg-white rounded-2xl md:rounded-[2rem] border border-[#E2E8F0] shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#64748B] border-collapse min-w-[600px]">
                      <thead className="bg-slate-50 border-b border-[#E2E8F0] uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3.5 font-bold">{`SKU & Name`}</th>
                          <th className="px-4 py-3.5 font-bold">{`Company`}</th>
                          <th className="px-4 py-3.5 text-right">{`Action`}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {m.filter(e => e.stock === 0).map((e, t) => <tr key={e.id || t} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold text-[#1D2A3B]">
                              {e.name}
                            </div>
                            <div className="text-[10px] text-[#94A3B8]">
                              {e.id}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {e.manufacturer}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => ht(`inventory`)} className="text-[#0697A8] font-bold hover:text-blue-800 transition-colors">{`Restock`}</button>
                          </td>
                        </tr>)}
                        {m.filter(e => e.stock === 0).length === 0 && <tr>
                          <td colSpan="3" className="px-4 py-12 text-center text-[#94A3B8]">{`No out of stock items found.`}</td>
                        </tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>}
            {mt === `deliveryzones` && <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8">
              <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-[#1D2A3B] tracking-tight">{`Delivery Zones`}</h2>
                  <p className="text-xs text-[#64748B] mt-0.5">{`Manage delivery zones, view zone-based orders, and assign delivery personnel.`}</p>
                </div>
                <div className="flex gap-2 mb-6">
                  <button onClick={() => setDzTab('zones')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${dzTab === 'zones' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'}`}>{`Zone Orders`}</button>
                  <button onClick={() => setDzTab('deliverymen')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${dzTab === 'deliverymen' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'}`}>{`Delivery Men`}</button>
                </div>

                {dzTab === 'zones' && <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {['Dhaka', 'Gazipur'].map(zone => {
                      const zoneOrders = b.filter(o => getDeliveryZone(o.city || o.buyerAddress || o.location || '') === zone);
                      const assignedMen = getDeliveryMenForZone(zone);
                      return <div key={zone} onClick={() => setDzSelectedZone(zone)} className={`bg-white rounded-2xl border-2 p-5 shadow-sm cursor-pointer transition-all hover:shadow-md ${dzSelectedZone === zone ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-[#E2E8F0]'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${zone === 'Dhaka' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-[#1D2A3B]">{zone}{` Zone`}</h3>
                              <p className="text-[10px] text-[#64748B]">{zone === 'Dhaka' ? 'Dhaka city and surrounding areas' : 'Gazipur district and surrounding areas'}</p>
                            </div>
                          </div>
                          {dzSelectedZone === zone && <span className="text-indigo-600 text-[10px] font-bold bg-indigo-50 px-2 py-0.5 rounded-full">{`Selected`}</span>}
                        </div>
                        <div className="flex gap-4">
                          <div className="text-center flex-1 bg-slate-50 rounded-xl py-2">
                            <div className="text-lg font-black text-[#1D2A3B]">{zoneOrders.length}</div>
                            <div className="text-[10px] text-[#64748B] font-semibold">{`Orders`}</div>
                          </div>
                          <div className="text-center flex-1 bg-slate-50 rounded-xl py-2">
                            <div className="text-lg font-black text-[#1D2A3B]">{assignedMen.length}</div>
                            <div className="text-[10px] text-[#64748B] font-semibold">{`Delivery Men`}</div>
                          </div>
                          <div className="text-center flex-1 bg-slate-50 rounded-xl py-2">
                            <div className="text-lg font-black text-[#1D2A3B]">{`৳`}{zoneOrders.reduce((s, o) => s + (o.totalAmount || 0), 0).toFixed(0)}</div>
                            <div className="text-[10px] text-[#64748B] font-semibold">{`Total Value`}</div>
                          </div>
                        </div>
                      </div>;
                    })}
                  </div>

                  <div className="bg-white rounded-2xl md:rounded-[2rem] border border-[#E2E8F0] shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#1D2A3B]">{`Orders in `}{dzSelectedZone}{` Zone`}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dzSelectedZone === 'Dhaka' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{dzSelectedZone}</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-[#64748B] border-collapse min-w-[700px]">
                        <thead className="bg-slate-50 border-b border-[#E2E8F0] uppercase tracking-wider">
                          <tr>
                            <th className="px-4 py-3.5 font-bold">{`Order ID`}</th>
                            <th className="px-4 py-3.5 font-bold">{`Buyer`}</th>
                            <th className="px-4 py-3.5 font-bold">{`City`}</th>
                            <th className="px-4 py-3.5 font-bold">{`Date`}</th>
                            <th className="px-4 py-3.5 text-right font-bold">{`Total`}</th>
                            <th className="px-4 py-3.5 font-bold">{`Status`}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                          {b.filter(o => getDeliveryZone(o.city || o.buyerAddress || o.location || '') === dzSelectedZone).map((o, idx) => <tr key={o.id || idx} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => ke(o)}>
                            <td className="px-4 py-3 font-bold text-indigo-600">{o.id}</td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-[#1D2A3B]">{o.buyerName}</div>
                              <div className="text-[10px] text-[#94A3B8] truncate max-w-[200px]">{o.phone || ''}</div>
                            </td>
                            <td className="px-4 py-3 font-semibold">{o.city || 'N/A'}</td>
                            <td className="px-4 py-3">{o.date}</td>
                            <td className="px-4 py-3 text-right font-bold text-[#1D2A3B]">{`৳`}{(o.totalAmount || 0).toFixed(2)}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${o.status === 'Delivered & Invoiced' ? 'bg-emerald-100 text-emerald-700' : o.status === 'Processing/Packing' ? 'bg-blue-100 text-blue-700' : o.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{o.status}</span>
                            </td>
                          </tr>)}
                          {b.filter(o => getDeliveryZone(o.city || o.buyerAddress || o.location || '') === dzSelectedZone).length === 0 && <tr>
                            <td colSpan="6" className="px-4 py-12 text-center text-[#94A3B8]">
                              <svg className="w-8 h-8 mx-auto mb-2 text-[#CBD5E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              {`No orders found in ${dzSelectedZone} zone.`}
                            </td>
                          </tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>}

                {dzTab === 'deliverymen' && <>
                  <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-[#1D2A3B]">{dzEditId ? `Edit Delivery Representative` : `Add New Delivery Representative`}</h3>
                        <p className="text-[11px] text-[#64748B] mt-0.5">{`Assign operational zones to delivery personnel for automatic buyer routing.`}</p>
                      </div>
                      {dzEditId && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">{`Editing Mode`}</span>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">{`Full Name`}</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          </div>
                          <input type="text" value={dzNewMan.name} onChange={e => setDzNewMan(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Rahim Uddin" className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-[#1D2A3B] rounded-xl pl-10 pr-4 py-2.5 h-[42px] outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400 placeholder:font-normal" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">{`Phone Number`}</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          </div>
                          <input
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={dzNewMan.phone}
                            onChange={e => setDzNewMan(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                            placeholder="e.g. 01712345678"
                            maxLength={15}
                            className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-[#1D2A3B] rounded-xl pl-10 pr-4 py-2.5 h-[42px] outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400 placeholder:font-normal"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{`Assign Delivery Zones`}</label>
                          <span className="text-[10px] text-slate-400 font-medium">{`Select 1 or both`}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 h-[42px]">
                          {[
                            { name: 'Dhaka', tag: 'DHK', activeGradient: 'from-blue-600 to-indigo-600 shadow-blue-500/20' },
                            { name: 'Gazipur', tag: 'GZP', activeGradient: 'from-emerald-600 to-teal-600 shadow-emerald-500/20' }
                          ].map(zoneObj => {
                            const isSelected = dzNewMan.zones.includes(zoneObj.name);
                            return (
                              <button
                                key={zoneObj.name}
                                type="button"
                                onClick={() => setDzNewMan(p => ({
                                  ...p,
                                  zones: p.zones.includes(zoneObj.name)
                                    ? p.zones.filter(z => z !== zoneObj.name)
                                    : [...p.zones, zoneObj.name]
                                }))}
                                className={`h-full px-3 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-between border cursor-pointer select-none ${isSelected
                                    ? `bg-gradient-to-r ${zoneObj.activeGradient} text-white border-transparent shadow-sm scale-[1.01]`
                                    : 'bg-slate-50 hover:bg-slate-100 text-[#475569] border-slate-200 hover:border-slate-300'
                                  }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${isSelected ? 'bg-white/25 text-white' : 'border border-slate-300 bg-white'
                                    }`}>
                                    {isSelected && (
                                      <svg className="w-2.5 h-2.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                  <span className="tracking-tight">{zoneObj.name}</span>
                                </div>
                                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-500'
                                  }`}>
                                  {zoneObj.tag}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 mt-5 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          if (!dzNewMan.name.trim() || !dzNewMan.phone.trim() || dzNewMan.zones.length === 0) {
                            T('Please fill in all fields and select at least one zone.');
                            return;
                          }
                          if (dzEditId) {
                            setDeliveryMen(prev => prev.map(dm => dm.id === dzEditId ? { ...dm, name: dzNewMan.name.trim(), phone: dzNewMan.phone.trim(), zones: dzNewMan.zones } : dm));
                            try {
                              supabase.from('delivery_men').update({
                                name: dzNewMan.name.trim(),
                                phone: dzNewMan.phone.trim(),
                                zones: dzNewMan.zones
                              }).eq('id', dzEditId).then(({ error }) => {
                                if (error) console.warn('Supabase delivery_men update error:', error);
                              });
                            } catch (err) {
                              console.warn('Supabase delivery_men update error:', err);
                            }
                            logAdminActivity({
                              category: 'DELIVERY_ZONES',
                              action: 'DELIVERY_MAN_UPDATED',
                              details: `Updated delivery personnel: "${dzNewMan.name.trim()}" (Zones: ${dzNewMan.zones.join(', ')})`,
                              targetId: dzEditId,
                              metadata: { name: dzNewMan.name.trim(), phone: dzNewMan.phone.trim(), zones: dzNewMan.zones }
                            });
                            T(`Delivery man "${dzNewMan.name}" updated successfully.`);
                            setDzEditId(null);
                          } else {
                            const newDm = { id: `DM-${Date.now()}`, name: dzNewMan.name.trim(), phone: dzNewMan.phone.trim(), zones: dzNewMan.zones, createdAt: new Date().toISOString() };
                            setDeliveryMen(prev => [...prev, newDm]);
                            try {
                              supabase.from('delivery_men').insert([{
                                id: newDm.id,
                                name: newDm.name,
                                phone: newDm.phone,
                                zones: newDm.zones,
                                created_at: newDm.createdAt
                              }]).then(({ error }) => {
                                if (error) console.warn('Supabase delivery_men insert error:', error);
                              });
                            } catch (err) {
                              console.warn('Supabase delivery_men insert error:', err);
                            }
                            logAdminActivity({
                              category: 'DELIVERY_ZONES',
                              action: 'DELIVERY_MAN_CREATED',
                              details: `Added new delivery personnel: "${newDm.name}" (Zones: ${newDm.zones.join(', ')})`,
                              targetId: newDm.id,
                              metadata: { name: newDm.name, phone: newDm.phone, zones: newDm.zones }
                            });
                            T(`Delivery man "${newDm.name}" added successfully.`);
                          }
                          setDzNewMan({ name: '', phone: '', zones: [] });
                        }}
                        className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {dzEditId ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          )}
                        </svg>
                        <span>{dzEditId ? `Update Delivery Man` : `Add Delivery Man`}</span>
                      </button>
                      {dzEditId && (
                        <button
                          type="button"
                          onClick={() => {
                            setDzEditId(null);
                            setDzNewMan({ name: '', phone: '', zones: [] });
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-[#475569] px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          {`Cancel`}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-[#1D2A3B]">{`All Delivery Men`} <span className="text-[10px] text-[#64748B] font-normal ml-1">({deliveryMen.length})</span></h3>
                    {deliveryMen.length === 0 && <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center">
                      <svg className="w-10 h-10 mx-auto mb-3 text-[#CBD5E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-xs text-[#94A3B8] font-semibold">{`No delivery men added yet. Use the form above to add one.`}</p>
                    </div>}
                    {deliveryMen.map(dm => <div key={dm.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                          {dm.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[#1D2A3B]">{dm.name}</h4>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          </div>
                          <p className="text-[11px] text-[#64748B] mt-0.5">
                            <a href={`tel:${dm.phone}`} className="hover:text-indigo-600 transition-colors inline-flex items-center gap-1 font-medium">
                              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                              {dm.phone}
                            </a>
                          </p>
                          <div className="flex gap-1.5 mt-1.5">
                            {dm.zones.map(z => <span key={z} className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${z === 'Dhaka' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${z === 'Dhaka' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                              {z}{` Zone`}
                            </span>)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0 self-end md:self-center">
                        <button onClick={() => { setDzEditId(dm.id); setDzNewMan({ name: dm.name, phone: dm.phone, zones: [...dm.zones] }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="bg-slate-50 hover:bg-slate-100 border border-[#E2E8F0] text-[#475569] hover:text-indigo-600 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          {`Edit`}
                        </button>
                        <button onClick={() => {
                          ne({
                            isOpen: true,
                            title: 'Delete Delivery Man',
                            message: `Are you sure you want to remove "${dm.name}" from the delivery team?`,
                            isDestructive: true,
                            onConfirm: () => {
                              setDeliveryMen(prev => prev.filter(d => d.id !== dm.id));
                              try {
                                supabase.from('delivery_men').delete().eq('id', dm.id).then(({ error }) => {
                                  if (error) console.warn('Supabase delivery_men delete error:', error);
                                });
                              } catch (err) {
                                console.warn('Supabase delivery_men delete error:', err);
                              }
                              logAdminActivity({
                                category: 'DELIVERY_ZONES',
                                action: 'DELIVERY_MAN_DELETED',
                                details: `Removed delivery personnel: "${dm.name}" (${dm.phone})`,
                                targetId: dm.id
                              });
                              T(`Delivery man "${dm.name}" removed.`);
                              ne(p => ({ ...p, isOpen: false }));
                            }
                          });
                        }} className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          {`Delete`}
                        </button>
                      </div>
                    </div>)}
                  </div>
                </>}
              </div>
            </div>}
            {mt === `special_discount` && <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8">
              <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1D2A3B] tracking-tight">{`Special Discount`}</h2>
                    <p className="text-xs text-[#64748B] mt-0.5">{`Search and select products to give specific discounts.`}</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl md:rounded-[2rem] border border-[#E2E8F0] shadow-sm overflow-hidden p-6 space-y-4">
                  <div className="flex gap-4 items-end flex-wrap">
                    <div className="w-full lg:w-auto flex-1 min-w-[200px]">
                      <label className="text-xs font-bold text-[#64748B] block mb-1">Company</label>
                      <select value={sdCompany} onChange={(e) => setSdCompany(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-4 py-2 outline-none focus:border-[#0697A8] focus:ring-1 focus:ring-[#0697A8]">
                        <option value="">All Companies</option>
                        {[...new Set(m.map(med => med.manufacturer))].filter(Boolean).sort().map(company => (
                          <option key={company} value={company}>{company}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full lg:w-auto flex-[2] min-w-[250px] relative">
                      <label className="text-xs font-bold text-[#64748B] block mb-1">Search Medicine</label>
                      <input
                        type="text"
                        placeholder="Search by product or company name..."
                        value={sdSearch}
                        onChange={(e) => {
                          setSdSearch(e.target.value);
                          setSdSelectedMedId('');
                        }}
                        className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-4 py-2 outline-none focus:border-[#0697A8] focus:ring-1 focus:ring-[#0697A8]"
                      />
                      {sdSearch && !sdSelectedMedId && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                          {m.filter(med =>
                            (!sdCompany || med.manufacturer === sdCompany) &&
                            (med.name.toLowerCase().includes(sdSearch.toLowerCase()) || med.manufacturer.toLowerCase().includes(sdSearch.toLowerCase()))
                          ).sort((a, b) => getSearchRelevance(a, sdSearch) - getSearchRelevance(b, sdSearch)).slice(0, 50).map(med => (
                            <div
                              key={med.id}
                              className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b last:border-b-0 border-slate-100"
                              onClick={() => {
                                setSdSearch(`${med.name} - ${med.manufacturer}`);
                                setSdSelectedMedId(med.id);
                              }}
                            >
                              <div className="font-semibold text-slate-800 text-sm">{med.name}</div>
                              <div className="text-xs text-slate-500">{med.manufacturer}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      <input type="hidden" id="sd-medicine" value={sdSelectedMedId || ''} />
                    </div>
                    <div className="w-32">
                      <label className="text-xs font-bold text-[#64748B] block mb-1">Type</label>
                      <select id="sd-type" className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-4 py-2 outline-none">
                        <option value="fixed">Fixed (৳)</option>
                        <option value="percentage">Percentage (%)</option>
                      </select>
                    </div>
                    <div className="w-32">
                      <label className="text-xs font-bold text-[#64748B] block mb-1">Value</label>
                      <input id="sd-value" type="number" min="0" step="0.01" className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-4 py-2 outline-none" />
                    </div>
                    <button onClick={async () => {
                      let medId = document.getElementById('sd-medicine').value;
                      let type = document.getElementById('sd-type').value;
                      let val = parseFloat(document.getElementById('sd-value').value);
                      if (!medId || isNaN(val) || val <= 0) return T('Please provide valid inputs');
                      let med = m.find(e => String(e.id) === String(medId));
                      if (!med) return T('Medicine not found');
                      const { error } = await supabase.from('special_discounts').upsert({
                        product_name: med.name,
                        discount_type: type,
                        discount_value: val
                      }, { onConflict: 'product_name' });
                      if (error) { console.error(error); return T('Error adding discount'); }

                      setSpecialDiscounts(prev => ({ ...prev, [med.name]: { type, value: val } }));
                      document.getElementById('sd-medicine').value = '';
                      document.getElementById('sd-value').value = '';
                      setSdSearch('');
                      setSdSelectedMedId(null);
                      logAdminActivity({
                        category: 'PRICING_DISCOUNT',
                        action: 'SPECIAL_DISCOUNT_SET',
                        details: `Configured special discount for "${med.name}": ${type === 'percentage' ? `${val}%` : `৳${val}`}`,
                        targetId: med.id,
                        metadata: { medicineName: med.name, discountType: type, discountValue: val }
                      });
                      T('Special discount added successfully.');
                    }} className="bg-[#0697A8] hover:bg-[#057A88] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md">{`Add Discount`}</button>
                  </div>
                  <div className="mt-8 border-t border-[#E2E8F0] pt-6">
                    <h3 className="font-bold text-[#1D2A3B] mb-4">Active Special Discounts</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 border-b border-[#E2E8F0] uppercase tracking-wider text-[#64748B]">
                          <tr>
                            <th className="px-4 py-3 font-bold">Product</th>
                            <th className="px-4 py-3 font-bold">Discount Type</th>
                            <th className="px-4 py-3 font-bold">Value</th>
                            <th className="px-4 py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                          {Object.entries(specialDiscounts).map(([medName, sd]) => {
                            let med = m.find(e => e.product_name === medName || e.name === medName);
                            return med ? (
                              <tr key={medName} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 font-medium text-[#1D2A3B]">{med.name}</td>
                                <td className="px-4 py-3 capitalize text-[#64748B]">{sd.type}</td>
                                <td className="px-4 py-3 font-bold text-[#0697A8]">{sd.type === 'percentage' ? `${sd.value}%` : `৳${sd.value}`}</td>
                                <td className="px-4 py-3 text-right">
                                  <button onClick={async () => {
                                    const { error } = await supabase.from('special_discounts').delete().eq('product_name', medName);
                                    if (error) { console.error(error); return T('Error removing discount'); }
                                    let newSd = { ...specialDiscounts };
                                    delete newSd[medName];
                                    setSpecialDiscounts(newSd);
                                    logAdminActivity({
                                      category: 'PRICING_DISCOUNT',
                                      action: 'SPECIAL_DISCOUNT_REMOVED',
                                      details: `Removed special discount for "${medName}"`,
                                      targetId: medName
                                    });
                                    T('Special discount removed.');
                                  }} className="text-red-500 hover:text-red-700 font-bold">Remove</button>
                                </td>
                              </tr>
                            ) : null;
                          })}
                          {Object.keys(specialDiscounts).length === 0 && <tr>
                            <td colSpan="4" className="text-center text-[#94A3B8] py-8">No special discounts active.</td>
                          </tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>}
            {mt === `coupons` && <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8">
              <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1D2A3B] tracking-tight">{`Coupons`}</h2>
                    <p className="text-xs text-[#64748B] mt-0.5">{`Create and manage promotional coupons.`}</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl md:rounded-[2rem] border border-[#E2E8F0] shadow-sm overflow-hidden p-6 space-y-4">
                  <div className="flex gap-4 items-end flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <label className="text-xs font-bold text-[#64748B] block mb-1">Coupon Code</label>
                      <input id="cp-code" type="text" placeholder="e.g. SUMMER10" className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-4 py-2 outline-none uppercase" />
                    </div>
                    <div className="w-32">
                      <label className="text-xs font-bold text-[#64748B] block mb-1">Type</label>
                      <select id="cp-type" className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-4 py-2 outline-none">
                        <option value="fixed">Fixed (৳)</option>
                        <option value="percentage">Percentage (%)</option>
                      </select>
                    </div>
                    <div className="w-32">
                      <label className="text-xs font-bold text-[#64748B] block mb-1">Value</label>
                      <input id="cp-value" type="number" min="0" step="0.01" className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-4 py-2 outline-none" />
                    </div>
                    <button onClick={async () => {
                      let code = document.getElementById('cp-code').value.toUpperCase();
                      let type = document.getElementById('cp-type').value;
                      let val = parseFloat(document.getElementById('cp-value').value);
                      if (!code || isNaN(val) || val <= 0) return T('Please provide valid inputs');
                      if (coupons.some(c => c.code === code)) return T('Coupon code already exists');
                      const { error } = await supabase.from('coupons').upsert({
                        code, discount_type: type, discount_value: val
                      }, { onConflict: 'code' });
                      if (error) { console.error(error); return T('Error creating coupon'); }
                      setCoupons([...coupons, { code, type, value: val }]);
                      document.getElementById('cp-code').value = '';
                      document.getElementById('cp-value').value = '';
                      logAdminActivity({
                        category: 'PRICING_DISCOUNT',
                        action: 'COUPON_CREATED',
                        details: `Created promotional coupon code "${code}" (${type === 'percentage' ? `${val}%` : `৳${val}`})`,
                        targetId: code,
                        metadata: { code, discountType: type, discountValue: val }
                      });
                      T('Coupon added successfully.');
                    }} className="bg-[#0697A8] hover:bg-[#057A88] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md">{`Create Coupon`}</button>
                  </div>
                  <div className="mt-8 border-t border-[#E2E8F0] pt-6">
                    <h3 className="font-bold text-[#1D2A3B] mb-4">Active Coupons</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 border-b border-[#E2E8F0] uppercase tracking-wider text-[#64748B]">
                          <tr>
                            <th className="px-4 py-3 font-bold">Code</th>
                            <th className="px-4 py-3 font-bold">Type</th>
                            <th className="px-4 py-3 font-bold">Value</th>
                            <th className="px-4 py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                          {coupons.map((cp, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 font-bold text-[#1D2A3B]">{cp.code}</td>
                              <td className="px-4 py-3 capitalize text-[#64748B]">{cp.type}</td>
                              <td className="px-4 py-3 font-bold text-[#0697A8]">{cp.type === 'percentage' ? `${cp.value}%` : `৳${cp.value}`}</td>
                              <td className="px-4 py-3 text-right">
                                <button onClick={async () => {
                                  const { error } = await supabase.from('coupons').delete().eq('code', cp.code);
                                  if (error) { console.error(error); return T('Error removing coupon'); }
                                  setCoupons(coupons.filter(c => c.code !== cp.code));
                                  logAdminActivity({
                                    category: 'PRICING_DISCOUNT',
                                    action: 'COUPON_DELETED',
                                    details: `Deleted promotional coupon code "${cp.code}"`,
                                    targetId: cp.code
                                  });
                                  T('Coupon removed.');
                                }} className="text-red-500 hover:text-red-700 font-bold">Remove</button>
                              </td>
                            </tr>
                          ))}
                          {coupons.length === 0 && <tr>
                            <td colSpan="4" className="text-center text-[#94A3B8] py-8">No coupons available.</td>
                          </tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>}
            {mt === `inventory` && <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
              <div className="flex justify-between items-center pb-2">
                <div>
                  <h2 className="text-2xl font-bold text-[#1D2A3B] tracking-tight">{`Inventory & Batch Manager`}</h2>
                  <p className="text-xs text-[#64748B] mt-0.5">{`Control wholesale catalog parameters, configure minimum order quantities (MOQ), and claim manufacturer credits for expiring batches.`}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-xs">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">{`Total Catalog SKUs`}</span>
                  <span className="text-2xl font-black text-[#1D2A3B]">
                    {m.length}
                    {` Products`}
                  </span>
                </div>
                <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-xs">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">{`Out of Stock Items`}</span>
                  <span className="text-2xl font-black text-red-600">
                    {m.filter(e => e.stock === 0).length}
                    {` SKUs`}
                  </span>
                </div>
                <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-xs">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">{`Short Expiry Alert (<6m)`}</span>
                  <span className="text-2xl font-black text-amber-600">
                    {m.filter(e => e.expiryMonths < 6).length}
                    {` Batches`}
                  </span>
                </div>
                <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-xs">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">{`Estimated Stock Value`}</span>
                  <span className="text-2xl font-black text-[#0697A8]">
                    {`৳`}
                    {m.reduce((e, t) => e + t.stock * t.wholesalePrice, 0).toLocaleString(void 0, {
                      maximumFractionDigits: 0
                    })}
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4">
                <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
                  <div className="relative flex-1 min-w-0 w-full lg:max-w-xs">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search by name, generic, brand ID or manufacturer..."
                      value={zt}
                      onChange={e => {
                        if (!prevSearch && zt) setPrevSearch(zt);
                        Bt(e.target.value);
                      }}
                      className={`w-full pl-9 py-2 border border-[#E2E8F0] rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-[#C2EAF0] transition-all ${zt || (prevSearch && prevSearch !== zt) ? 'pr-16' : 'pr-3'
                        }`}
                    />
                    {(zt || (prevSearch && prevSearch !== zt)) && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (prevSearch && prevSearch !== zt) {
                              const target = prevSearch;
                              setPrevSearch(zt);
                              Bt(target);
                            } else {
                              Bt('');
                            }
                            if (searchInputRef.current) searchInputRef.current.blur();
                          }}
                          title={prevSearch && prevSearch !== zt ? `Back to "${prevSearch}"` : "Back / Undo Search"}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                        </button>
                        {zt && (
                          <button
                            type="button"
                            onClick={() => {
                              setPrevSearch(zt);
                              Bt('');
                              if (searchInputRef.current) searchInputRef.current.focus();
                            }}
                            title="Clear search"
                            className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="w-full sm:w-auto grid grid-cols-3 sm:flex items-center gap-1 bg-slate-50 rounded-xl p-0.5 border border-[#E2E8F0]">
                    {[{
                      key: `all`,
                      label: `All`,
                      count: m.length
                    }, {
                      key: `inStock`,
                      label: `In Stock`,
                      count: m.filter(e => e.stock > 0).length
                    }, {
                      key: `outOfStock`,
                      label: `Out of Stock`,
                      count: m.filter(e => e.stock === 0).length
                    }].map((e, _idx) => <button key={e.key} onClick={() => Ht(e.key)} className={`flex items-center justify-center px-2 sm:px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all text-center ${Vt === e.key ? `bg-white text-[#1D2A3B] shadow-sm border border-[#E2E8F0]` : `text-[#64748B] hover:text-[#1D2A3B]`}`}>
                      <span className="truncate">{e.label}</span>
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${Vt === e.key ? `bg-[#E0F5F7] text-[#057A88]` : `bg-slate-100 text-[#94A3B8]`}`}>
                        {e.count.toLocaleString()}
                      </span>
                    </button>)}
                  </div>
                  <div className="relative w-full sm:w-auto sm:min-w-[220px] lg:max-w-[260px]">
                    <select
                      value={Ut}
                      onChange={e => {
                        setPrevCompany(Ut);
                        Wt(e.target.value);
                      }}
                      className={`w-full border border-[#E2E8F0] rounded-xl text-[11px] font-bold text-[#475569] pl-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-[#C2EAF0] transition-all appearance-none cursor-pointer ${Ut !== 'all' || (prevCompany && prevCompany !== 'all') ? 'pr-20' : 'pr-8'
                        }`}
                    >
                      <option value="all">
                        {`All Manufacturers (`}
                        {Gt.length}
                        {`)`}
                      </option>
                      {Gt.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                      {(Ut !== 'all' || (prevCompany && prevCompany !== 'all')) && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (prevCompany && prevCompany !== Ut) {
                                const target = prevCompany;
                                setPrevCompany(Ut);
                                Wt(target);
                              } else {
                                Wt('all');
                              }
                            }}
                            title={prevCompany && prevCompany !== 'all' ? `Back to ${prevCompany}` : "Back to all manufacturers"}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setPrevCompany(Ut);
                              Wt('all');
                            }}
                            title="Clear filter (Restore to All Manufacturers)"
                            className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      )}
                      <div className="pointer-events-none text-slate-400 p-0.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#94A3B8] font-bold whitespace-nowrap self-start sm:self-center">
                    {Kt.length.toLocaleString()}
                    {` of `}
                    {m.length.toLocaleString()}
                    {` products`}
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 bg-slate-50 border-b border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 flex-shrink-0">
                  <span className="text-xs font-bold text-[#1D2A3B]">{`Marketplace Inventory & MOQ Configuration`}</span>
                  <div className="grid grid-cols-1 min-[350px]:grid-cols-2 sm:flex sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
                    {kt.length > 0 && kt.length !== Jt.length && (
                      <button onClick={Nt} className="inline-flex items-center justify-center text-center gap-1.5 text-white bg-red-600 hover:bg-red-700 px-3 py-2.5 sm:py-2 rounded-xl text-[11px] font-bold shadow-md transition-all cursor-pointer w-full sm:w-auto min-[350px]:col-span-2 sm:col-auto">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="whitespace-nowrap">{`Delete Selected (${kt.length})`}</span>
                      </button>
                    )}
                    {f === `admin` && (
                      <button
                        onClick={() => setBulkPriceOpen(!bulkPriceOpen)}
                        className={`inline-flex items-center justify-center text-center gap-2 px-3.5 py-2.5 sm:py-2 rounded-xl text-[11px] font-bold shadow-sm transition-all w-full sm:w-auto ${bulkPriceOpen
                            ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                          }`}
                      >
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="whitespace-nowrap">{`Bulk Pricing`}</span>
                        <svg className={`w-3 h-3 flex-shrink-0 transition-transform ${bulkPriceOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                    <label className={`inline-flex items-center justify-center text-center gap-2 cursor-pointer text-white px-3.5 py-2.5 sm:py-2 rounded-xl text-[11px] font-bold shadow-md shadow-blue-500/15 transition-all w-full sm:w-auto ${Ue ? `bg-gray-400 cursor-wait` : `bg-gradient-to-r from-[#0697A8] to-indigo-600 hover:from-[#057A88] hover:to-indigo-700`}`}>
                      {Ue ? (
                        <svg className="w-3.5 h-3.5 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      )}
                      <span className="whitespace-nowrap">{Ue ? `Processing...` : `Import Sheet / CSV`}</span>
                      <input type="file" multiple accept=".csv,.xlsx,.xls" className="hidden" disabled={Ue} onChange={pt} />
                    </label>
                    <button onClick={addNewProductRow} disabled={Ue} className={`inline-flex items-center justify-center text-center gap-2 px-3.5 py-2.5 sm:py-2 rounded-xl text-[11px] font-bold shadow-sm transition-all w-full sm:w-auto ${Ue ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md shadow-emerald-500/15'}`}>
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="whitespace-nowrap">{`Add New Product`}</span>
                    </button>
                    <button onClick={handleExportCsvClick} disabled={Ue || m.length === 0} className={`px-3.5 py-2.5 sm:py-2 bg-slate-50 text-[#475569] hover:bg-slate-100 rounded-xl text-[11px] font-bold border border-[#E2E8F0] transition-colors flex items-center justify-center text-center gap-2 w-full sm:w-auto ${Ue || m.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span className="whitespace-nowrap">{`Export CSV`}</span>
                    </button>
                    <button onClick={Mt} disabled={Ue || m.length === 0} className="px-3.5 py-2.5 sm:py-2 bg-slate-50 text-[#475569] hover:bg-slate-100 rounded-xl text-[11px] font-bold border border-[#E2E8F0] transition-colors disabled:opacity-50 flex items-center justify-center text-center gap-2 w-full sm:w-auto">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="whitespace-nowrap">{kt.length > 0 && kt.length === Jt.length ? `Deselect All` : `Select All`}</span>
                    </button>
                    {kt.length > 0 && kt.length === Jt.length && (
                      <button onClick={Pt} disabled={Ue || m.length === 0} className="px-3.5 py-2.5 sm:py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-[11px] font-bold border border-red-200 transition-colors disabled:opacity-50 w-full sm:w-auto flex items-center justify-center text-center animate-in fade-in zoom-in duration-200 min-[350px]:col-span-2 sm:col-auto">
                        {`Delete All`}
                      </button>
                    )}
                    {Ve.loaded && !Ue && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-2 sm:py-1 rounded-lg border border-emerald-100 flex items-center justify-center text-center gap-1.5 animate-in fade-in duration-300 w-full sm:w-auto min-[350px]:col-span-2 sm:col-auto">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="whitespace-nowrap">{Ve.count.toLocaleString()} products synced</span>
                      </span>
                    )}
                  </div>
                </div>
                {f === `admin` && bulkPriceOpen && <div className="px-4 py-3 bg-gradient-to-br from-amber-50 to-orange-50 border-b border-amber-200">
                  <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
                    <div className="flex-1 min-w-[160px]">
                      <label className="block text-[10px] font-bold text-amber-800 mb-1.5 uppercase tracking-wider">{`Company`}</label>
                      <select value={bulkPriceCompany} onChange={e => setBulkPriceCompany(e.target.value)} className="w-full border border-amber-200 rounded-lg text-[11px] font-bold text-[#475569] px-3 py-2 bg-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-all">
                        <option value="all">{`All Companies (${Gt.length})`}</option>
                        {Gt.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                    <div className="min-w-[130px]">
                      <label className="block text-[10px] font-bold text-amber-800 mb-1.5 uppercase tracking-wider">{`Markup Type`}</label>
                      <select value={bulkPriceType} onChange={e => setBulkPriceType(e.target.value)} className="w-full border border-amber-200 rounded-lg text-[11px] font-bold text-[#475569] px-3 py-2 bg-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-all">
                        <option value="fixed">{`Fixed Amount (\u09f3)`}</option>
                        <option value="percentage">{`Percentage (%)`}</option>
                      </select>
                    </div>
                    <div className="min-w-[120px]">
                      <label className="block text-[10px] font-bold text-amber-800 mb-1.5 uppercase tracking-wider">{bulkPriceType === 'fixed' ? `Amount (\u09f3)` : `Percentage (%)`}</label>
                      <input type="number" min="0" step="0.01" value={bulkPriceAmount} onWheel={e => e.target.blur()} onChange={e => setBulkPriceAmount(e.target.value)} placeholder={bulkPriceType === 'fixed' ? `e.g. 5` : `e.g. 10`} className="w-full border border-amber-200 rounded-lg text-[11px] font-bold text-[#475569] px-3 py-2 bg-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-all" />
                    </div>
                    <button onClick={applyBulkPricing} disabled={bulkPriceLoading || (bulkPriceAmount === '' || bulkPriceAmount === null || bulkPriceAmount === undefined)} className={`px-5 py-2 rounded-xl text-[11px] font-bold text-white shadow-sm transition-all whitespace-nowrap ${bulkPriceLoading || (bulkPriceAmount === '' || bulkPriceAmount === null || bulkPriceAmount === undefined) ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'}`}>
                      {bulkPriceLoading ? `Applying...` : `Apply Pricing`}
                    </button>
                  </div>
                  {bulkPriceLoading && <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-amber-800">{`Updating prices...`}</span>
                      <span className="text-[10px] font-bold text-amber-600">{`${bulkPriceProgress}%`}</span>
                    </div>
                    <div className="w-full bg-amber-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${bulkPriceProgress}%` }} />
                    </div>
                  </div>}
                  {!bulkPriceLoading && <p className="mt-2.5 text-[10px] text-amber-700/80">
                    <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {`Unit Price = Buying Price + ${bulkPriceType === 'fixed' ? 'Fixed Amount' : 'Percentage of Buying Price'}. This will update `}
                    <strong>{bulkPriceCompany === 'all' ? `all ${m.length} products` : `${m.filter(e => e.manufacturer === bulkPriceCompany).length} products from ${bulkPriceCompany}`}</strong>
                    {`.`}
                  </p>}
                </div>}
                <div className="overflow-auto max-h-[calc(100vh-270px)] min-h-[460px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-20 bg-slate-50 shadow-xs border-b border-[#E2E8F0]">
                      <tr className="bg-slate-50 text-[10px] text-[#64748B] uppercase tracking-wider font-bold">
                        <th className="sticky top-0 z-20 bg-slate-50 px-4 py-3.5 text-center w-10 border-b border-[#E2E8F0]">
                          <input type="checkbox" checked={Jt.length > 0 && kt.length === Jt.length} onChange={Mt} className="w-3.5 h-3.5 rounded border-slate-300 cursor-pointer bg-white" />
                        </th>
                        <th className="sticky top-0 z-20 bg-slate-50 px-4 py-3.5 border-b border-[#E2E8F0] whitespace-nowrap">{`Product ID`}</th>
                        <th className="sticky top-0 z-20 bg-slate-50 px-4 py-3.5 w-16 text-center border-b border-[#E2E8F0]">{`Image`}</th>
                        <th className="sticky top-0 z-20 bg-slate-50 px-4 py-3.5 border-b border-[#E2E8F0] whitespace-nowrap">{`Medicine Name`}</th>
                        <th className="sticky top-0 z-20 bg-slate-50 px-4 py-3.5 border-b border-[#E2E8F0] whitespace-nowrap">{`Type`}</th>
                        <th className="sticky top-0 z-20 bg-slate-50 px-4 py-3.5 border-b border-[#E2E8F0] whitespace-nowrap">{`Dosage Form`}</th>
                        <th className="sticky top-0 z-20 bg-slate-50 px-4 py-3.5 border-b border-[#E2E8F0] whitespace-nowrap">{`Company`}</th>
                        <th className="sticky top-0 z-20 bg-slate-50 px-4 py-3.5 text-center border-b border-[#E2E8F0] whitespace-nowrap">{`Stock`}</th>
                        {f === `admin` && <th className="sticky top-0 z-20 bg-slate-50 px-4 py-3.5 text-center w-32 border-b border-[#E2E8F0] whitespace-nowrap">{`Buying Price`}</th>}
                        <th className="sticky top-0 z-20 bg-slate-50 px-4 py-3.5 text-center w-24 border-b border-[#E2E8F0] whitespace-nowrap">{`Unit Price`}</th>
                        <th className="sticky top-0 z-20 bg-slate-50 px-4 py-3.5 text-center w-24 border-b border-[#E2E8F0] whitespace-nowrap">{`MRP`}</th>
                        <th className="sticky top-0 z-20 bg-slate-50 px-4 py-3.5 text-center w-28 border-b border-[#E2E8F0] whitespace-nowrap">{`MOQ`}</th>
                        <th className="sticky top-0 z-20 bg-slate-50 px-4 py-3.5 text-right w-28 border-b border-[#E2E8F0] whitespace-nowrap">{`Actions`}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {Jt.length === 0 ? <tr>
                        <td colSpan="12" className="px-4 py-12 text-center">
                          <div className="text-[#94A3B8]">
                            <svg className="w-10 h-10 mx-auto mb-3 text-[#CBD5E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <p className="text-sm font-bold text-[#64748B]">{`No products found`}</p>
                            <p className="text-[11px] mt-1">{`Try adjusting your search or filters`}</p>
                          </div>
                        </td>
                      </tr> : Jt.map(e => {
                        let t = e.expiryMonths < 6,
                          n = kt.includes(e.name);
                        return <tr key={e.id || e.name} className={`hover:bg-slate-50/50 ${e._isNew ? `bg-emerald-50/60 ring-1 ring-emerald-300` : n ? `bg-[#E0F5F7]/30` : ``}`}>
                          <td className="px-4 py-3.5 text-center">
                            <input type="checkbox" checked={n} onChange={() => jt(e.name)} className="w-3.5 h-3.5 rounded border-slate-300 cursor-pointer bg-white" />
                          </td>
                          <td className="px-4 py-3.5 font-mono text-[#94A3B8] text-[11px] whitespace-nowrap">
                            {e.brandId || e.id}
                            {e._isNew && <span className="ml-1.5 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded uppercase">New</span>}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {e.imageUrl ? <img src={e.imageUrl} onClick={() => Tn(e)} className="w-8 h-8 object-cover rounded cursor-pointer mx-auto border border-slate-200 hover:opacity-80 transition-opacity" title="Click to change image" /> : <button onClick={() => Tn(e)} className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold px-2 py-1 rounded transition-colors" title="Add Image">{`+ Image`}</button>}
                          </td>
                          <td className="px-4 py-3.5">
                            {hasPermission('inventory.edit_name') ? (
                              <div className="relative group/editname flex items-center min-w-[170px] max-w-[280px]">
                                <input
                                  type="text"
                                  value={e.name || ''}
                                  onFocus={t => {
                                    if (editingNameRef.current) editingNameRef.current[e.id] = t.target.value;
                                  }}
                                  onChange={t => updateProductNameDirect(e.id, t.target.value)}
                                  onBlur={t => saveProductNameDirect(e.id, t.target.value)}
                                  onKeyDown={t => {
                                    if (t.key === 'Enter') {
                                      t.target.blur();
                                    }
                                  }}
                                  className="w-full font-bold text-[#1D2A3B] text-[11px] border border-transparent hover:border-[#CBD5E1] focus:border-[#0697A8] rounded-lg px-2 py-1 pr-6 bg-transparent hover:bg-slate-50 focus:bg-white focus:outline-none transition-all shadow-none focus:ring-1 focus:ring-[#C2EAF0]"
                                  title="Click to edit product name (Press Enter or click away to save)"
                                />
                                <svg className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover/editname:opacity-100 group-focus-within/editname:opacity-0 absolute right-1.5 pointer-events-none transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </div>
                            ) : (
                              <div className="font-bold text-[#1D2A3B] text-[11px]">
                                {e.name}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${e.type === `allopathic` ? `bg-[#E0F5F7] text-[#057A88]` : e.type === `herbal` ? `bg-green-50 text-green-700` : e.type === `unani` ? `bg-amber-50 text-amber-700` : `bg-slate-50 text-slate-600`}`}>
                              {e.type || `N/A`}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <select
                              value={e.dosageForm || ''}
                              onChange={t => {
                                const val = t.target.value;
                                updateDosageFormDirect(e.id, val);
                                saveDosageFormDirect(e.id, val);
                              }}
                              className="w-32 font-medium text-[#334155] text-[11px] border border-slate-200 hover:border-[#CBD5E1] focus:border-[#0697A8] rounded-lg px-2 py-1.5 bg-white focus:outline-none transition-all shadow-none focus:ring-1 focus:ring-[#C2EAF0] cursor-pointer"
                            >
                              <option value="">Select Form</option>
                              {e.dosageForm && !uniqueDosageForms.includes(e.dosageForm) && (
                                <option value={e.dosageForm}>{e.dosageForm}</option>
                              )}
                              {uniqueDosageForms.map(form => (
                                <option key={form} value={form}>{form}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3.5">
                            <select
                              value={e.manufacturer || ''}
                              onChange={t => {
                                const val = t.target.value;
                                updateCompanyDirect(e.id, val);
                                saveCompanyDirect(e.id, val);
                              }}
                              className="w-44 max-w-[200px] font-medium text-[#334155] text-[11px] border border-slate-200 hover:border-[#CBD5E1] focus:border-[#0697A8] rounded-lg px-2 py-1.5 bg-white focus:outline-none transition-all shadow-none focus:ring-1 focus:ring-[#C2EAF0] cursor-pointer truncate"
                            >
                              <option value="">Select Company</option>
                              {e.manufacturer && !Gt.includes(e.manufacturer) && (
                                <option value={e.manufacturer}>{e.manufacturer}</option>
                              )}
                              {Gt.map(comp => (
                                <option key={comp} value={comp}>{comp}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={e.stock !== undefined && e.stock !== null ? e.stock : ''}
                              onWheel={e => e.target.blur()}
                              onChange={t => updateStockDirect(e.id, t.target.value)}
                              className="w-16 border border-[#E2E8F0] rounded-lg text-center font-bold px-1.5 py-1 text-[11px] bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
                            />
                          </td>
                          {f === `admin` && (
                            <td className="px-4 py-3.5 text-center">
                              <div className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="0"
                                  value={e.buyingPrice !== undefined && e.buyingPrice !== null ? e.buyingPrice : ''}
                                  onWheel={e => e.target.blur()}
                                  onChange={t => xn(e.id, `buyingPrice`, t.target.value)}
                                  className="w-16 border border-[#E2E8F0] rounded-lg text-center font-bold px-1 py-1 text-[11px] bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
                                />
                                {(() => {
                                  let applies = bulkPriceRule && (bulkPriceRule.company === 'all' || bulkPriceRule.company === e.manufacturer);
                                  if (!applies) return null;
                                  return (
                                    <span
                                      className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded-md leading-tight whitespace-nowrap"
                                      title={`Active bulk markup: ${bulkPriceRule.type === 'fixed' ? '৳' + bulkPriceRule.amount : bulkPriceRule.amount + '%'}`}
                                    >
                                      {bulkPriceRule.type === 'fixed' ? `+৳${bulkPriceRule.amount}` : `+${bulkPriceRule.amount}%`}
                                    </span>
                                  );
                                })()}
                              </div>
                            </td>
                          )}
                          <td className="px-4 py-3.5 text-center">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0"
                              value={e.wholesalePrice !== undefined && e.wholesalePrice !== null ? e.wholesalePrice : ''}
                              onWheel={e => e.target.blur()}
                              onChange={t => xn(e.id, `wholesalePrice`, t.target.value)}
                              className="w-16 border border-[#E2E8F0] rounded-lg text-center font-bold px-1 py-1 text-[11px] bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0"
                              value={e.mrp !== undefined && e.mrp !== null ? e.mrp : ''}
                              onWheel={e => e.target.blur()}
                              onChange={t => xn(e.id, `mrp`, t.target.value)}
                              className="w-16 border border-[#E2E8F0] rounded-lg text-center font-bold px-1 py-1 text-[11px] bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={e.moq !== undefined && e.moq !== null ? e.moq : ''}
                              onWheel={e => e.target.blur()}
                              onChange={t => bn(e.id, t.target.value)}
                              className="w-14 border border-[#E2E8F0] rounded-lg text-center font-bold px-1.5 py-1 text-[11px] bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500"
                            />
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button onClick={() => toggleActive(e.id, !e.is_deactivated)} className={`${e.is_deactivated ? 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-orange-50 border-orange-100 text-orange-700 hover:bg-orange-100'} font-bold px-2.5 py-1 rounded-lg text-[10px] transition-all cursor-pointer`}>
                              {e.is_deactivated ? 'Activate' : 'Deactivate'}
                            </button>
                          </td>
                        </tr>;
                      })}
                    </tbody>
                  </table>
                </div>
                {Kt.length > 0 && <div className="px-4 py-3 bg-slate-50 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
                  <div className="text-[11px] text-[#64748B]">
                    {`Showing `}
                    <span className="font-bold text-[#1D2A3B]">
                      {((L - 1) * Lt + 1).toLocaleString()}
                    </span>
                    {` `}
                    {`–`}
                    {` `}
                    <span className="font-bold text-[#1D2A3B]">
                      {Math.min(L * Lt, Kt.length).toLocaleString()}
                    </span>
                    {` `}
                    {`of`}
                    {` `}
                    <span className="font-bold text-[#1D2A3B]">
                      {Kt.length.toLocaleString()}
                    </span>
                    {` products`}
                  </div>
                  <div className="flex items-center gap-1">
                    <button disabled={L <= 1} onClick={() => It(1)} className="px-2 py-1 rounded-lg text-[10px] font-bold border border-[#E2E8F0] bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="First page">{`««`}</button>
                    <button disabled={L <= 1} onClick={() => It(e => Math.max(1, e - 1))} className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[#E2E8F0] bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">{`‹ Prev`}</button>
                    {(() => {
                      let e = [],
                        t = Math.max(1, L - 2),
                        n = Math.min(qt, L + 2);
                      n - t < 4 && (t === 1 ? n = Math.min(qt, t + 4) : t = Math.max(1, n - 4)), t > 1 && (e.push(<button key="page-1" onClick={() => It(1)} className="w-7 h-7 rounded-lg text-[10px] font-bold border border-[#E2E8F0] bg-white hover:bg-slate-50 transition-all">{`1`}</button>), t > 2 && e.push(<span key="ellipsis-start" className="text-[10px] text-[#94A3B8] px-0.5">{`…`}</span>));
                      for (let r = t; r <= n; r++) e.push(<button key={`page-${r}`} onClick={() => It(r)} className={`w-7 h-7 rounded-lg text-[10px] font-bold border transition-all ${r === L ? `bg-[#0697A8] text-white border-[#0697A8] shadow-sm shadow-blue-500/20` : `border-[#E2E8F0] bg-white hover:bg-slate-50 text-[#475569]`}`}>
                        {r}
                      </button>);
                      return n < qt && (n < qt - 1 && e.push(<span key="ellipsis" className="text-[10px] text-[#94A3B8] px-0.5">{`…`}</span>), e.push(<button key={`page-${qt}`} onClick={() => It(qt)} className="w-7 h-7 rounded-lg text-[10px] font-bold border border-[#E2E8F0] bg-white hover:bg-slate-50 transition-all">
                        {qt}
                      </button>)), e;
                    })()}
                    <button disabled={L >= qt} onClick={() => It(e => Math.min(qt, e + 1))} className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[#E2E8F0] bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">{`Next ›`}</button>
                    <button disabled={L >= qt} onClick={() => It(qt)} className="px-2 py-1 rounded-lg text-[10px] font-bold border border-[#E2E8F0] bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Last page">{`»»`}</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#64748B]">{`Per page:`}</span>
                    <select value={Lt} onChange={e => Rt(Number(e.target.value))} className="border border-[#E2E8F0] rounded-lg text-[10px] font-bold text-[#475569] px-2 py-1 bg-white focus:outline-none focus:border-blue-400">
                      {[25, 50, 100, 200].map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>}
              </div>
            </div>}
            {mt === `backup` && <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                <div>
                  <h2 className="text-2xl font-bold text-[#1D2A3B] tracking-tight">{`Backup & Restore`}</h2>
                  <p className="text-xs text-[#64748B] mt-0.5">{`Manage centralized cloud database backups. Automated cloud backups occur daily at 11:59 PM.`}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={async () => {
                    const list = await getBackups();
                    setBackupsList(list);
                    T("Backups refreshed.");
                  }} className="bg-slate-100 hover:bg-slate-200 text-[#475569] font-bold px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Refresh
                  </button>
                  <button onClick={async () => {
                    if (m.length > 0) {
                      try {
                        We(!0);
                        Ke({ percent: 30, rowsProcessed: 0, totalRows: 1, eta: "Generating cloud backup snapshot..." });
                        await saveBackup(m);
                        Ke({ percent: 90, rowsProcessed: 1, totalRows: 1, eta: "Syncing backups..." });
                        const list = await getBackups();
                        setBackupsList(list);
                        T("Manual cloud backup created successfully.");
                      } catch (err) {
                        T("Backup failed.");
                        console.error(err);
                      } finally {
                        We(!1);
                      }
                    } else {
                      T("No inventory data to backup.");
                    }
                  }} className="bg-[#0697A8] hover:bg-[#057A88] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    {`Take Manual Backup`}
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] text-[#64748B] uppercase tracking-wider font-bold border-b border-[#E2E8F0]">
                      <th className="px-5 py-3.5">{`Backup ID`}</th>
                      <th className="px-5 py-3.5">{`Type`}</th>
                      <th className="px-5 py-3.5">{`Date & Time`}</th>
                      <th className="px-5 py-3.5">{`Item Count`}</th>
                      <th className="px-5 py-3.5 text-right">{`Actions`}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {backupsList.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-5 py-8 text-center text-[#94A3B8]">No backups found in cloud storage.</td>
                      </tr>
                    ) : backupsList.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-emerald-700">
                          {typeof b.id === 'string' && b.id.includes('-') && b.id.length > 12 ? `${b.id.substring(0, 8)}...` : b.id}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${b.type === 'automated'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : b.type === 'manual'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                            {b.type === 'automated' ? 'Automated Cloud' : b.type === 'manual' ? 'Manual Snapshot' : 'Local Backup'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[#475569]">{b.date}</td>
                        <td className="px-5 py-4 font-semibold text-[#475569]">{b.itemCount} SKUs</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                const exportData = b.fullData || { timestamp: b.date, backup_type: b.type, medicines: b.data };
                                const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
                                const downloadAnchor = document.createElement('a');
                                downloadAnchor.setAttribute("href", jsonStr);
                                downloadAnchor.setAttribute("download", `dg-pharma-backup-${(b.id || 'snapshot').toString().substring(0, 8)}.json`);
                                document.body.appendChild(downloadAnchor);
                                downloadAnchor.click();
                                downloadAnchor.remove();
                                T("Backup JSON downloaded.");
                              }}
                              className="px-2.5 py-1 text-slate-600 hover:text-[#0697A8] hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                              title="Download JSON file to PC"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                              JSON
                            </button>
                            <button
                              onClick={() => {
                                setRestoreModal({
                                  isOpen: true,
                                  backup: b,
                                  selectedCategories: BACKUP_TABLE_CATEGORIES.map(c => c.key)
                                });
                              }}
                              className="bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 font-bold px-3 py-1.5 rounded-lg text-[10px] transition-all cursor-pointer flex items-center gap-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                              Restore
                            </button>
                            <button
                              onClick={() => {
                                ne({
                                  isOpen: !0,
                                  title: `Delete Backup`,
                                  message: `Are you sure you want to delete this backup? This action cannot be undone.`,
                                  isDestructive: !0,
                                  confirmText: `Delete Backup`,
                                  onConfirm: async () => {
                                    ne({ isOpen: !1, title: ``, message: ``, onConfirm: null, isDestructive: !1 });
                                    try {
                                      await deleteBackup(b.id);
                                      const list = await getBackups();
                                      setBackupsList(list);
                                      T("Backup deleted successfully.");
                                    } catch (e) {
                                      console.error(e);
                                      T("Error deleting backup.");
                                    }
                                  }
                                });
                              }}
                              className="bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 font-bold px-2.5 py-1.5 rounded-lg text-[10px] transition-all cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Selective Restore Modal */}
              {restoreModal.isOpen && restoreModal.backup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-[#1D2A3B]">Selective Database Restore</h3>
                          <p className="text-xs text-[#64748B]">
                            Snapshot: <span className="font-semibold text-slate-700">{restoreModal.backup.date}</span> ({restoreModal.backup.type === 'automated' ? 'Automated Cloud' : 'Manual Snapshot'})
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setRestoreModal({ isOpen: false, backup: null, selectedCategories: [] })}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>

                    {/* Body */}
                    <div className="p-5 overflow-y-auto space-y-4">
                      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div>
                          <div className="text-xs font-bold text-[#1D2A3B]">Choose table categories to restore:</div>
                          <div className="text-[11px] text-[#64748B]">Unchecked tables will remain untouched in your active database.</div>
                        </div>
                        <button
                          onClick={() => {
                            if (restoreModal.selectedCategories.length === BACKUP_TABLE_CATEGORIES.length) {
                              setRestoreModal(prev => ({ ...prev, selectedCategories: [] }));
                            } else {
                              setRestoreModal(prev => ({ ...prev, selectedCategories: BACKUP_TABLE_CATEGORIES.map(c => c.key) }));
                            }
                          }}
                          className="text-xs font-bold text-[#0697A8] hover:text-[#057A88] bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
                        >
                          {restoreModal.selectedCategories.length === BACKUP_TABLE_CATEGORIES.length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>

                      {/* Category Checkbox Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {BACKUP_TABLE_CATEGORIES.map(cat => {
                          const isChecked = restoreModal.selectedCategories.includes(cat.key);
                          const countDisplay = cat.getCount(restoreModal.backup.summary || {});
                          return (
                            <label
                              key={cat.key}
                              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${isChecked ? 'bg-orange-50/50 border-orange-300 shadow-xs' : 'bg-white border-slate-200 opacity-60 hover:opacity-90'
                                }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setRestoreModal(prev => ({
                                    ...prev,
                                    selectedCategories: isChecked
                                      ? prev.selectedCategories.filter(k => k !== cat.key)
                                      : [...prev.selectedCategories, cat.key]
                                  }));
                                }}
                                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-xs font-bold text-[#1D2A3B] flex items-center gap-1.5 truncate">
                                    <span>{cat.icon}</span>
                                    <span>{cat.label}</span>
                                  </span>
                                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md flex-shrink-0">
                                    {countDisplay}
                                  </span>
                                </div>
                                <p className="text-[10px] text-[#64748B] mt-0.5 line-clamp-1">{cat.desc}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>

                      {/* Notice */}
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-[11px] text-amber-800">
                        <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <div>
                          <strong>Safety Guarantee:</strong> Only the checked tables will be replaced by this snapshot. Activity logs and existing backups will never be overwritten or deleted.
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/50">
                      <button
                        onClick={() => setRestoreModal({ isOpen: false, backup: null, selectedCategories: [] })}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={restoreModal.selectedCategories.length === 0}
                        onClick={() => executeSelectiveRestore(restoreModal.backup, restoreModal.selectedCategories)}
                        className="bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Restore {restoreModal.selectedCategories.length} Selected {restoreModal.selectedCategories.length === 1 ? 'Category' : 'Categories'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>}
            {mt === `analytics` && <AdminAnalytics inventory={m} orders={b} returns={ee} />}

            {mt === `staff_roles` && (
              <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                  {/* Top Banner Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl md:rounded-[2rem] border border-[#E2E8F0] shadow-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
                        <span className="text-[11px] font-black uppercase tracking-wider text-teal-700">Access Control & Administration</span>
                      </div>
                      <h2 className="text-2xl font-bold text-[#1D2A3B] tracking-tight">Staff & Permissions Architecture</h2>
                      <p className="text-xs text-[#64748B] mt-0.5">Provision restricted admin users, configure granular custom roles, and track permission allocations.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {staffSubTab === 'users' ? (
                        <button
                          onClick={() => {
                            setEditingStaffUser(null);
                            setStaffFormData({
                              name: '',
                              email: '',
                              phone: '',
                              password: '',
                              roleId: adminRoles[0]?.id || 'role_inventory',
                              status: 'Active'
                            });
                            setStaffFormError('');
                            setStaffModalOpen(true);
                          }}
                          className="px-4 py-2.5 bg-[#0697A8] hover:bg-[#057A88] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          <span>Add Staff User</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingRole(null);
                            setRoleFormData({
                              name: '',
                              description: '',
                              permissions: []
                            });
                            setRoleFormError('');
                            setRoleModalOpen(true);
                          }}
                          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/10 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                          </svg>
                          <span>Create Custom Role</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sub Tabs Toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setStaffSubTab('users')}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${staffSubTab === 'users'
                          ? 'bg-[#1D2A3B] text-white shadow-md'
                          : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'
                        }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>Staff Accounts</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${staffSubTab === 'users' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        {adminStaffUsers.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setStaffSubTab('roles')}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${staffSubTab === 'roles'
                          ? 'bg-[#1D2A3B] text-white shadow-md'
                          : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'
                        }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Roles & Policies</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${staffSubTab === 'roles' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        {adminRoles.length}
                      </span>
                    </button>
                  </div>

                  {/* SubTab 1: Staff Users Table */}
                  {staffSubTab === 'users' && (
                    <div className="bg-white rounded-2xl md:rounded-[2rem] border border-[#E2E8F0] shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                        <div>
                          <h3 className="text-sm font-bold text-[#1D2A3B]">Administrative Staff Directory</h3>
                          <p className="text-[11px] text-[#64748B]">All accounts created with portal credentials and role associations.</p>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-[#64748B] border-collapse min-w-[760px]">
                          <thead className="bg-slate-50 border-b border-[#E2E8F0] uppercase tracking-wider text-[10px] font-bold text-[#64748B]">
                            <tr>
                              <th className="px-5 py-3.5">Staff Member</th>
                              <th className="px-5 py-3.5">Contact Details</th>
                              <th className="px-5 py-3.5">Assigned Role</th>
                              <th className="px-5 py-3.5">Status</th>
                              <th className="px-5 py-3.5">Created Date</th>
                              <th className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E2E8F0]">
                            {/* Unified dynamic rendering from admin_users table in database */}
                            {[...adminStaffUsers].sort((a, b) => {
                              const aIsSuper = a.isSuperAdmin || a.email === 'admin@dgpharma.shop' || a.email === 'admin@dgpharma.com';
                              const bIsSuper = b.isSuperAdmin || b.email === 'admin@dgpharma.shop' || b.email === 'admin@dgpharma.com';
                              if (aIsSuper && !bIsSuper) return -1;
                              if (!aIsSuper && bIsSuper) return 1;
                              return 0;
                            }).map((staff) => {
                              const isSuper = staff.isSuperAdmin || staff.email === 'admin@dgpharma.shop' || staff.email === 'admin@dgpharma.com';
                              const roleObj = adminRoles.find(r => r.id === staff.roleId);
                              const isInactive = staff.status === 'Inactive';
                              const roleName = isSuper ? 'Super Administrator' : (roleObj ? roleObj.name : 'Staff');

                              return (
                                <tr key={staff.id} className={isSuper ? "bg-amber-50/20 hover:bg-amber-50/50 transition-colors" : "hover:bg-slate-50/70 transition-colors"}>
                                  <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isSuper
                                          ? 'bg-amber-100 text-amber-800'
                                          : (isInactive ? 'bg-slate-200 text-slate-600' : 'bg-teal-100 text-teal-800')
                                        }`}>
                                        {isSuper ? 'SA' : (staff.name ? staff.name.slice(0, 2).toUpperCase() : 'ST')}
                                      </div>
                                      <div>
                                        <div className="font-bold text-[#1D2A3B] flex items-center gap-1.5">
                                          <span>{staff.name}</span>
                                          {isSuper && (
                                            <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded-md">Primary Root</span>
                                          )}
                                        </div>
                                        <div className="text-[11px] text-[#64748B] font-mono">{staff.email}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-5 py-3.5 text-[11px]">
                                    {staff.phone ? (
                                      <span className="font-mono text-slate-700">{staff.phone}</span>
                                    ) : (
                                      <span className="text-slate-400 italic">Not set</span>
                                    )}
                                  </td>
                                  <td className="px-5 py-3.5">
                                    {isSuper ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Super Administrator</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                                        <span>{roleName}</span>
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-5 py-3.5">
                                    {isSuper ? (
                                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                        Permanent Active
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => handleToggleStaffStatus(staff)}
                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${isInactive
                                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                          }`}
                                        title="Click to toggle account access status"
                                      >
                                        <span className={`w-1.5 h-1.5 rounded-full ${isInactive ? 'bg-slate-400' : 'bg-emerald-600'}`}></span>
                                        <span>{staff.status || 'Active'}</span>
                                      </button>
                                    )}
                                  </td>
                                  <td className="px-5 py-3.5 text-[11px] text-slate-500">
                                    {staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : 'System Genesis'}
                                  </td>
                                  <td className="px-5 py-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => {
                                          setEditingStaffUser(staff);
                                          setStaffFormData({
                                            name: staff.name || '',
                                            email: staff.email || '',
                                            phone: staff.phone || '',
                                            password: '',
                                            roleId: staff.roleId || adminRoles[0]?.id || 'role_inventory',
                                            status: staff.status || 'Active'
                                          });
                                          setStaffFormError('');
                                          setStaffModalOpen(true);
                                        }}
                                        className="p-1.5 text-[#64748B] hover:text-[#0697A8] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                        title="Edit Staff User"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                      </button>
                                      {isSuper ? (
                                        <span className="text-[10px] text-slate-400 italic px-2">Protected</span>
                                      ) : (
                                        <button
                                          onClick={() => handleDeleteStaffUser(staff)}
                                          className="p-1.5 text-[#64748B] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                          title="Delete Staff User"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}

                            {adminStaffUsers.length === 0 && (
                              <tr>
                                <td colSpan="6" className="px-5 py-10 text-center text-slate-400">
                                  <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                  </div>
                                  <p className="font-semibold text-xs text-slate-600">No staff user profiles added yet.</p>
                                  <p className="text-[11px] text-slate-400 mt-1">Click "Add Staff User" above to create an operator login with customized permissions.</p>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* SubTab 2: Roles Grid */}
                  {staffSubTab === 'roles' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {adminRoles.map((role) => {
                          const isSuperRole = role.id === 'role_superadmin';
                          const assignedUsers = adminStaffUsers.filter(u => u.roleId === role.id);
                          const permsCount = isSuperRole ? ALL_PERMISSION_KEYS.length : (role.permissions?.length || 0);

                          return (
                            <div key={role.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                              <div>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h4 className="font-bold text-sm text-[#1D2A3B]">{role.name}</h4>
                                  {role.is_system ? (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                                      System Role
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
                                      Custom Policy
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-[#64748B] mb-4 line-clamp-2 min-h-[32px]">{role.description || 'Configured access policy.'}</p>

                                {/* Permission statistics */}
                                <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-2">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-[#64748B] font-medium">Assigned Operators:</span>
                                    <span className="font-bold text-[#1D2A3B]">{isSuperRole ? 'Super Admin' : `${assignedUsers.length} User(s)`}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-[#64748B] font-medium">Permission Scope:</span>
                                    <span className="font-bold text-teal-700">{permsCount} / {ALL_PERMISSION_KEYS.length} actions</span>
                                  </div>
                                  {/* Progress bar */}
                                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-teal-600 rounded-full"
                                      style={{ width: `${Math.min(100, (permsCount / ALL_PERMISSION_KEYS.length) * 100)}%` }}
                                    ></div>
                                  </div>
                                </div>

                                {/* Sample Permission tags preview */}
                                <div className="flex flex-wrap gap-1 mb-4">
                                  {isSuperRole ? (
                                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-[10px] font-bold">
                                      Full Unrestricted System Access
                                    </span>
                                  ) : (
                                    (role.permissions || []).slice(0, 4).map((pKey) => (
                                      <span key={pKey} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium font-mono">
                                        {pKey}
                                      </span>
                                    ))
                                  )}
                                  {!isSuperRole && role.permissions && role.permissions.length > 4 && (
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-bold">
                                      +{role.permissions.length - 4} more
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                                {!isSuperRole ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingRole(role);
                                        setRoleFormData({
                                          name: role.name || '',
                                          description: role.description || '',
                                          permissions: Array.isArray(role.permissions) ? [...role.permissions] : []
                                        });
                                        setRoleFormError('');
                                        setRoleModalOpen(true);
                                      }}
                                      className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                                    >
                                      Edit Permissions
                                    </button>
                                    {!role.is_system && (
                                      <button
                                        onClick={() => handleDeleteRole(role)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                        title="Delete Role"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    )}
                                  </>
                                ) : (
                                  <div className="w-full text-center py-1.5 text-[11px] text-purple-700 font-bold bg-purple-50 rounded-xl">
                                    Default System Authority
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {mt === `activity_log` && (
              <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                  {/* Top Banner Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl md:rounded-[2rem] border border-[#E2E8F0] shadow-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                        <span className="text-[11px] font-black uppercase tracking-wider text-amber-700">Security & Operational Audit</span>
                      </div>
                      <h2 className="text-2xl font-bold text-[#1D2A3B] tracking-tight">System Activity Log</h2>
                      <p className="text-xs text-[#64748B] mt-0.5">Chronological audit ledger recording every administrative action across DG Pharma.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          const csvHeader = "ID,Timestamp,Actor Name,Actor Email,Actor Role,Category,Action,Details,Target ID\n";
                          const csvRows = activityLogs.map(l =>
                            `"${l.id}","${l.created_at}","${l.user_name || l.actor_name || ''}","${l.user_email || l.actor_email || ''}","${l.role_name || l.actor_role || ''}","${l.category}","${l.action}","${(l.details || '').replace(/"/g, '""')}","${l.target_id || ''}"`
                          ).join("\n");
                          const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `dg_admin_activity_log_${new Date().toISOString().slice(0, 10)}.csv`;
                          a.click();
                          T('Activity logs exported to CSV.');
                        }}
                        className="px-3.5 py-2 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#1D2A3B] rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Export CSV</span>
                      </button>

                      <button
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(activityLogs, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `dg_admin_activity_log_${new Date().toISOString().slice(0, 10)}.json`;
                          a.click();
                          T('Activity logs exported to JSON.');
                        }}
                        className="px-3.5 py-2 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#1D2A3B] rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Export JSON</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter Toolbar Card */}
                  <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-5 shadow-xs space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Search Bar */}
                      <div className="relative md:col-span-2">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={activitySearch}
                          onChange={(e) => { setActivitySearch(e.target.value); setActivityPage(1); }}
                          placeholder="Search actions, target ID, medicine, admin name or email..."
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-medium text-[#1D2A3B] rounded-xl pl-10 pr-4 py-2.5 h-[40px] outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all placeholder:text-slate-400"
                        />
                      </div>

                      {/* Actor Filter Dropdown */}
                      <div>
                        <select
                          value={activityUserFilter}
                          onChange={(e) => { setActivityUserFilter(e.target.value); setActivityPage(1); }}
                          className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-[#1D2A3B] rounded-xl px-3.5 py-2.5 h-[40px] outline-none focus:bg-white focus:border-amber-500 transition-all"
                        >
                          <option value="ALL">All Administrative Actors</option>
                          {Array.from(
                            new Map(
                              [...adminStaffUsers]
                                .filter(u => u && u.email)
                                .sort((a, b) => {
                                  const aIsSuper = a.isSuperAdmin || a.email === 'admin@dgpharma.shop' || a.email === 'admin@dgpharma.com';
                                  const bIsSuper = b.isSuperAdmin || b.email === 'admin@dgpharma.shop' || b.email === 'admin@dgpharma.com';
                                  if (aIsSuper && !bIsSuper) return -1;
                                  if (!aIsSuper && bIsSuper) return 1;
                                  return 0;
                                })
                                .map(u => [u.email.toLowerCase(), u])
                            ).values()
                          ).map(u => (
                            <option key={u.id || u.email} value={u.email}>
                              {u.name || (u.isSuperAdmin ? 'Super Admin' : 'Staff')} ({u.email})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                      {[
                        { id: 'ALL', label: 'All Activities' },
                        { id: 'BUYER_APPROVAL', label: 'Buyer Approval' },
                        { id: 'ORDER_FULFILLMENT', label: 'Order Fulfillment' },
                        { id: 'INVENTORY_MANAGEMENT', label: 'Inventory & MOQ' },
                        { id: 'PRICING_DISCOUNT', label: 'Pricing & Coupons' },
                        { id: 'DELIVERY_ZONES', label: 'Delivery Zones' },
                        { id: 'MEDICINE_REQUESTS', label: 'Medicine Requests' },
                        { id: 'STAFF_MANAGEMENT', label: 'Staff & Roles' },
                        { id: 'AUTHENTICATION', label: 'Login & Security' },
                        { id: 'SYSTEM_SETTINGS', label: 'System Settings' }
                      ].map(cat => {
                        const isSelected = activityCategoryFilter === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => { setActivityCategoryFilter(cat.id); setActivityPage(1); }}
                            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer text-[11px] ${isSelected
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-[#64748B]'
                              }`}
                          >
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Logs Table */}
                  {(() => {
                    const filteredLogs = activityLogs.filter(log => {
                      const email = (log.user_email || log.actor_email || '').toLowerCase();
                      const name = (log.user_name || log.actor_name || '').toLowerCase();
                      if (activityCategoryFilter !== 'ALL' && log.category !== activityCategoryFilter) return false;
                      if (activityUserFilter !== 'ALL' && email !== activityUserFilter.toLowerCase()) return false;
                      if (activitySearch.trim()) {
                        const q = activitySearch.toLowerCase();
                        const matchDetails = (log.details || '').toLowerCase().includes(q);
                        const matchAction = (log.action || '').toLowerCase().includes(q);
                        const matchActor = name.includes(q) || email.includes(q);
                        const matchTarget = (log.target_id || '').toLowerCase().includes(q);
                        if (!matchDetails && !matchAction && !matchActor && !matchTarget) return false;
                      }
                      return true;
                    });

                    const perPage = 25;
                    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / perPage));
                    const paginated = filteredLogs.slice((activityPage - 1) * perPage, activityPage * perPage);

                    const getCategoryBadgeClass = (cat) => {
                      switch (cat) {
                        case 'BUYER_APPROVAL': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
                        case 'ORDER_FULFILLMENT': return 'bg-blue-50 text-blue-800 border-blue-200';
                        case 'INVENTORY_MANAGEMENT': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
                        case 'PRICING_DISCOUNT': return 'bg-purple-50 text-purple-800 border-purple-200';
                        case 'DELIVERY_ZONES': return 'bg-teal-50 text-teal-800 border-teal-200';
                        case 'MEDICINE_REQUESTS': return 'bg-amber-50 text-amber-800 border-amber-200';
                        case 'STAFF_MANAGEMENT': return 'bg-rose-50 text-rose-800 border-rose-200';
                        case 'AUTHENTICATION': return 'bg-cyan-50 text-cyan-800 border-cyan-200';
                        default: return 'bg-slate-100 text-slate-700 border-slate-200';
                      }
                    };

                    return (
                      <div className="bg-white rounded-2xl md:rounded-[2rem] border border-[#E2E8F0] shadow-sm overflow-hidden">
                        <div className="px-6 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B] bg-slate-50/50">
                          <span>Showing <strong className="text-[#1D2A3B]">{paginated.length}</strong> of <strong className="text-[#1D2A3B]">{filteredLogs.length}</strong> events</span>
                          {filteredLogs.length > 0 && <span>Page {activityPage} of {totalPages}</span>}
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-[#64748B] border-collapse min-w-[840px]">
                            <thead className="bg-slate-50 border-b border-[#E2E8F0] uppercase tracking-wider text-[10px] font-bold text-[#64748B]">
                              <tr>
                                <th className="px-5 py-3.5">Timestamp</th>
                                <th className="px-5 py-3.5">Category</th>
                                <th className="px-5 py-3.5">Action Event</th>
                                <th className="px-5 py-3.5">Details</th>
                                <th className="px-5 py-3.5">Admin Operator</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2E8F0]">
                              {paginated.map((log) => {
                                const d = log.created_at ? new Date(log.created_at) : new Date();
                                const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

                                return (
                                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                      <div className="font-bold text-[#1D2A3B] text-[11px]">{timeStr}</div>
                                      <div className="text-[10px] text-slate-400 font-medium">{dateStr}</div>
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getCategoryBadgeClass(log.category)}`}>
                                        {(log.category || 'SYSTEM').replace(/_/g, ' ')}
                                      </span>
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                      <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                        {log.action}
                                      </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                      <p className="text-xs text-[#1D2A3B] font-medium leading-relaxed">{log.details}</p>
                                      {log.target_id && (
                                        <span className="inline-block mt-0.5 text-[10px] text-slate-400 font-mono">
                                          Ref ID: {log.target_id}
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                      <div className="font-bold text-[#1D2A3B] text-xs">{log.user_name || log.actor_name || 'Admin'}</div>
                                      <div className="text-[10px] text-slate-400 font-mono">{log.user_email || log.actor_email || 'admin@dgpharma.shop'}</div>
                                      <div className="text-[9px] text-teal-700 font-semibold">{log.role_name || log.actor_role || 'Staff User'}</div>
                                    </td>
                                  </tr>
                                );
                              })}

                              {paginated.length === 0 && (
                                <tr>
                                  <td colSpan="5" className="px-5 py-12 text-center text-slate-400">
                                    <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                    <p className="font-semibold text-xs text-slate-600">No activity log entries found.</p>
                                    <p className="text-[11px] text-slate-400 mt-1">Try adjusting your filters or search keywords.</p>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination footer */}
                        {totalPages > 1 && (
                          <div className="px-6 py-3 border-t border-[#E2E8F0] flex items-center justify-between bg-slate-50/50">
                            <button
                              disabled={activityPage <= 1}
                              onClick={() => setActivityPage(p => Math.max(1, p - 1))}
                              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white disabled:opacity-40 cursor-pointer"
                            >
                              Previous
                            </button>
                            <span className="text-xs text-slate-500 font-semibold">
                              Page {activityPage} of {totalPages}
                            </span>
                            <button
                              disabled={activityPage >= totalPages}
                              onClick={() => setActivityPage(p => Math.min(totalPages, p + 1))}
                              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white disabled:opacity-40 cursor-pointer"
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>}
        </div>
        {f === `buyer` && sn.totalItems > 0 && <div className="hidden md:flex h-16 bg-white border-t border-[#E2E8F0] items-center justify-between px-8 z-20 flex-shrink-0 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-6 font-sans">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0697A8] animate-pulse" />
              <span className="text-[#64748B]">{`Cart Total:`}</span>
              <span className="font-black text-[#1D2A3B]">
                {sn.totalItems}
                {` Boxes Selected`}
              </span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="text-xs">
              <span className="text-[#64748B]">{`Est. Value: `}</span>
              <span className="font-black text-[#1D2A3B]">
                {`৳`}
                {sn.subtotal.toFixed(2)}
              </span>

            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100/50">
              {`Pharmacy Profit Margin: +৳`}
              {sn.savings.toFixed(2)}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={un} className="text-xs font-bold text-red-500 hover:text-red-700 px-3 py-2 rounded-xl hover:bg-red-50">{`Clear Cart`}</button>
            <button onClick={() => Se(!0)} className="bg-[#0697A8] hover:bg-[#057A88] text-white font-bold px-6 py-2 rounded-xl text-xs shadow-md shadow-blue-500/10">{`Proceed to Checkout`}</button>
          </div>
        </div>}
        {f === `buyer` && <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E2E8F0] shadow-[0_-4px_20px_rgb(0,0,0,0.06)]">
          <div className="flex items-center justify-around h-14">
            <button onClick={() => k(`search`)} className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${O === `search` ? `text-[#0697A8]` : `text-[#94A3B8]`}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-[9px] font-bold">{`Products`}</span>
            </button>
            <button onClick={() => k(`offers`)} className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${O === `offers` ? `text-[#0697A8]` : `text-[#94A3B8]`}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              <span className="text-[9px] font-bold">{`Offers`}</span>
            </button>
            <button onClick={() => k(`orders`)} className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${O === `orders` ? `text-[#0697A8]` : `text-[#94A3B8]`}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span className="text-[9px] font-bold">{`Orders`}</span>
            </button>
            <button onClick={() => Se(!0)} className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors relative ${xe ? `text-[#0697A8]` : `text-[#94A3B8]`}`}>
              <div className="relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                {sn.totalItems > 0 && <span className="absolute -top-1.5 -right-2 bg-[#0697A8] text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {sn.totalItems}
                </span>}
              </div>
              <span className="text-[9px] font-bold">{`Cart`}</span>
            </button>
            <button onClick={() => k(`support`)} className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${O === `support` ? `text-[#0697A8]` : `text-[#94A3B8]`}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-[9px] font-bold">{`Support`}</span>
            </button>
          </div>
        </nav>}

        {/* Role Creation & Configuration Modal */}
        {roleModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1D2A3B]/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex justify-between items-center pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="text-base font-bold text-[#1D2A3B]">
                    {editingRole ? `Edit Role: ${editingRole.name}` : 'Create New Custom Role'}
                  </h3>
                  <p className="text-xs text-[#64748B]">Choose granular access permissions to grant this role.</p>
                </div>
                <button
                  onClick={() => { setRoleModalOpen(false); setEditingRole(null); }}
                  className="text-[#64748B] hover:text-[#1D2A3B] p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {roleFormError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                  {roleFormError}
                </div>
              )}

              <form onSubmit={handleSaveRole} className="flex-1 overflow-y-auto pr-1 space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                      Role Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={roleFormData.name}
                      onChange={(e) => setRoleFormData(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Warehouse Inventory Supervisor"
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-[#1D2A3B] rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                      Role Purpose / Description
                    </label>
                    <input
                      type="text"
                      value={roleFormData.description}
                      onChange={(e) => setRoleFormData(p => ({ ...p, description: e.target.value }))}
                      placeholder="Brief description of the responsibilities associated with this role"
                      className="w-full bg-slate-50 border border-slate-200 text-xs text-[#1D2A3B] rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                    />
                  </div>
                </div>

                {/* Permission Categories Checklist */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                      Permissions Allocation ({roleFormData.permissions.length} of {ALL_PERMISSION_KEYS.length} selected)
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRoleFormData(p => ({ ...p, permissions: [...ALL_PERMISSION_KEYS] }))}
                        className="text-[10px] font-bold text-teal-600 hover:text-teal-800 cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setRoleFormData(p => ({ ...p, permissions: [] }))}
                        className="text-[10px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {ADMIN_PERMISSION_CATEGORIES.map((category) => {
                      const catKeys = category.permissions.map(p => p.key);
                      const allCatChecked = catKeys.every(k => roleFormData.permissions.includes(k));
                      const someCatChecked = catKeys.some(k => roleFormData.permissions.includes(k));

                      const toggleCategory = () => {
                        if (allCatChecked) {
                          setRoleFormData(p => ({
                            ...p,
                            permissions: p.permissions.filter(k => !catKeys.includes(k))
                          }));
                        } else {
                          setRoleFormData(p => ({
                            ...p,
                            permissions: Array.from(new Set([...p.permissions, ...catKeys]))
                          }));
                        }
                      };

                      return (
                        <div key={category.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-3.5 transition-all">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{category.icon}</span>
                                <h5 className="font-bold text-xs text-[#1D2A3B]">{category.name}</h5>
                              </div>
                              <p className="text-[10px] text-[#64748B] ml-6">{category.description}</p>
                            </div>
                            <button
                              type="button"
                              onClick={toggleCategory}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${allCatChecked
                                  ? 'bg-teal-600 text-white'
                                  : someCatChecked
                                    ? 'bg-teal-100 text-teal-800'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                              {allCatChecked ? 'All Selected' : 'Toggle Category'}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {category.permissions.map((perm) => {
                              const isChecked = roleFormData.permissions.includes(perm.key);
                              return (
                                <label
                                  key={perm.key}
                                  className={`flex items-start gap-2.5 p-2 rounded-xl border transition-all cursor-pointer ${isChecked
                                      ? 'bg-white border-teal-500 ring-1 ring-teal-100'
                                      : 'bg-white/60 border-slate-200 hover:bg-white'
                                    }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setRoleFormData(p => ({ ...p, permissions: [...p.permissions, perm.key] }));
                                      } else {
                                        setRoleFormData(p => ({ ...p, permissions: p.permissions.filter(k => k !== perm.key) }));
                                      }
                                    }}
                                    className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="font-bold text-[11px] text-[#1D2A3B] leading-tight">{perm.label}</div>
                                    <div className="text-[10px] text-[#64748B] mt-0.5 leading-tight">{perm.desc}</div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => { setRoleModalOpen(false); setEditingRole(null); }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={roleFormLoading}
                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/10 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {roleFormLoading ? 'Saving Role...' : (editingRole ? 'Update Role Policy' : 'Create Role')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Staff Account Provisioning Modal */}
        {staffModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1D2A3B]/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex justify-between items-center pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="text-base font-bold text-[#1D2A3B]">
                    {editingStaffUser ? `Edit Staff Account` : 'Add Staff Administrator'}
                  </h3>
                  <p className="text-xs text-[#64748B]">Provide credentials and select an authorized role policy.</p>
                </div>
                <button
                  onClick={() => { setStaffModalOpen(false); setEditingStaffUser(null); }}
                  className="text-[#64748B] hover:text-[#1D2A3B] p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {staffFormError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                  {staffFormError}
                </div>
              )}

              <form onSubmit={handleSaveStaffUser} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={staffFormData.name}
                    onChange={(e) => setStaffFormData(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Asif Mahmud"
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-[#1D2A3B] rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-[#0697A8] focus:ring-2 focus:ring-[#C2EAF0] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    Login Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={staffFormData.email}
                    onChange={(e) => setStaffFormData(p => ({ ...p, email: e.target.value }))}
                    placeholder="asif@dgpharma.shop"
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-[#1D2A3B] rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-[#0697A8] focus:ring-2 focus:ring-[#C2EAF0] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={staffFormData.phone}
                    onChange={(e) => setStaffFormData(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                    placeholder="e.g. 01712345678"
                    maxLength={15}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-[#1D2A3B] rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-[#0697A8] focus:ring-2 focus:ring-[#C2EAF0] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    {editingStaffUser ? 'Change Password (optional)' : 'Account Password'} {!editingStaffUser && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    required={!editingStaffUser}
                    value={staffFormData.password}
                    onChange={(e) => setStaffFormData(p => ({ ...p, password: e.target.value }))}
                    placeholder={editingStaffUser ? 'Leave blank to keep current password' : 'Min 6 characters'}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-[#1D2A3B] rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-[#0697A8] focus:ring-2 focus:ring-[#C2EAF0] transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                      Assign Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={staffFormData.roleId}
                      onChange={(e) => setStaffFormData(p => ({ ...p, roleId: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-[#1D2A3B] rounded-xl px-3 py-2.5 outline-none focus:bg-white focus:border-[#0697A8] transition-all"
                    >
                      {adminRoles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                      Access Status
                    </label>
                    <select
                      value={staffFormData.status}
                      onChange={(e) => setStaffFormData(p => ({ ...p, status: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-[#1D2A3B] rounded-xl px-3 py-2.5 outline-none focus:bg-white focus:border-[#0697A8] transition-all"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => { setStaffModalOpen(false); setEditingStaffUser(null); }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={staffFormLoading}
                    className="px-6 py-2.5 bg-[#0697A8] hover:bg-[#057A88] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {staffFormLoading ? 'Saving...' : (editingStaffUser ? 'Save Changes' : 'Provision User')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Admin Profile & Password Settings Modal */}
        {adminProfileModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1D2A3B]/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex justify-between items-center pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="text-base font-bold text-[#1D2A3B]">My Profile & Password Settings</h3>
                  <p className="text-xs text-[#64748B]">Update your operator profile and portal login credentials.</p>
                </div>
                <button
                  onClick={() => setAdminProfileModalOpen(false)}
                  className="text-[#64748B] hover:text-[#1D2A3B] p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {adminProfileError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                  {adminProfileError}
                </div>
              )}

              {adminProfileSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{adminProfileSuccess}</span>
                </div>
              )}

              <form onSubmit={handleAdminProfileSave} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    Registered Email (Read-Only)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={n?.email || ''}
                    className="w-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-600 rounded-xl px-4 py-2.5 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={adminProfileForm.name}
                    onChange={(e) => setAdminProfileForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Your Full Name"
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-[#1D2A3B] rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-[#0697A8] focus:ring-2 focus:ring-[#C2EAF0] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={adminProfileForm.phone}
                    onChange={(e) => setAdminProfileForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                    placeholder="e.g. 01712345678"
                    maxLength={15}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-[#1D2A3B] rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-[#0697A8] focus:ring-2 focus:ring-[#C2EAF0] transition-all"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-[#1D2A3B] mb-2">Change Password</h4>
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={adminProfileForm.newPassword}
                        onChange={(e) => setAdminProfileForm(p => ({ ...p, newPassword: e.target.value }))}
                        placeholder="Leave blank to keep unchanged (min 6 chars)"
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-[#1D2A3B] rounded-xl px-4 py-2 outline-none focus:bg-white focus:border-[#0697A8] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={adminProfileForm.confirmPassword}
                        onChange={(e) => setAdminProfileForm(p => ({ ...p, confirmPassword: e.target.value }))}
                        placeholder="Retype new password"
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-[#1D2A3B] rounded-xl px-4 py-2 outline-none focus:bg-white focus:border-[#0697A8] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAdminProfileModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={adminProfileLoading}
                    className="px-6 py-2.5 bg-[#0697A8] hover:bg-[#057A88] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {adminProfileLoading ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {barcodeModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1D2A3B]/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full mx-4 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
                <h3 className="text-sm font-bold text-[#1D2A3B]">{`Scan Invoice Barcode`}</h3>
                <button onClick={() => setBarcodeModalOpen(false)} className="text-[#64748B] hover:text-[#1D2A3B] p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-[#64748B]">
                  {`Position the barcode on the printed invoice within the camera view to scan.`}
                </p>

                <div id="barcode-reader-container" className="overflow-hidden rounded-2xl bg-slate-50 border border-slate-200 aspect-video relative flex items-center justify-center">
                  <div id="barcode-reader-element" className="w-full h-full"></div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{`Or enter Order ID manually`}</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. DG-2026-0000"
                      id="manualBarcodeVal"
                      className="flex-1 text-xs border border-[#E2E8F0] rounded-xl px-3.5 py-2 uppercase outline-none focus:border-[#0697A8] font-mono"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = e.target.value.trim().toUpperCase();
                          if (val) handleBarcodeScanned(val);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const val = document.getElementById('manualBarcodeVal')?.value.trim().toUpperCase();
                        if (val) handleBarcodeScanned(val);
                      }}
                      className="bg-[#0697A8] hover:bg-[#057A88] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      Open
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {Ue && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1D2A3B]/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 text-center space-y-5 animate-in zoom-in duration-300">
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="#E2E8F0" strokeWidth="6" fill="none" />
                <circle cx="50" cy="50" r="42" stroke={Ge.error ? `url(#errorGradient)` : `url(#progressGradient)`} strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 42}`} strokeDashoffset={`${2 * Math.PI * 42 * (1 - Ge.percent / 100)}`} style={{
                  transition: `stroke-dashoffset 0.3s ease`
                }} />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                  <linearGradient id="errorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="100%" stopColor="#B91C1C" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-black text-[#1D2A3B]">
                  {Ge.percent}
                  {`%`}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1D2A3B] tracking-tight">
                {Ge.error ? `Import Failed!` : Ge.percent >= 100 ? `Import Complete!` : `Processing CSV Data`}
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                {Ge.error ? `An error occurred during database sync.` : Ge.percent >= 100 ? `All records synced successfully` : `Parsing and mapping inventory records...`}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-[11px] font-mono font-bold text-[#475569] truncate max-w-[160px]">
                    {Ve.fileName}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#0697A8]">
                  {Ge.eta}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                <span>{`Rows processed`}</span>
                <span className="font-bold text-[#1D2A3B]">
                  {Ge.rowsProcessed.toLocaleString()}
                  {` / `}
                  {Ge.totalRows.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#0697A8] via-indigo-500 to-emerald-500 rounded-full transition-all duration-300 ease-out" style={{
                width: `${Ge.percent}%`
              }} />
            </div>
            <p className="text-[10px] text-[#94A3B8] font-medium">
              {Ge.error ? `❌ Sync Failed` : Ge.percent >= 100 ? `✓ Inventory catalog updated` : `Syncing inventory — please do not close this page`}
            </p>
          </div>
        </div>}
        {f === `admin` && gt && <div className="fixed inset-0 z-50 flex justify-end font-sans">
          <div onClick={() => {
            _t(null), wt(!1);
          }} className="absolute inset-0 bg-[#1D2A3B]/40 backdrop-blur-xs" />
          <div className="relative w-full max-w-md md:w-128 bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            <div className="px-6 py-5 border-b border-[#E2E8F0] flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-[#1D2A3B]">{`Onboarding Document Verification`}</h3>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  {`Applicant Code: `}
                  {gt.id}
                </p>
              </div>
              <button onClick={() => {
                _t(null), wt(!1);
              }} className="text-[#64748B] hover:text-[#1D2A3B] p-1 rounded-lg hover:bg-slate-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              <div className="bg-slate-50 border border-[#E2E8F0] rounded-xl p-4 space-y-2.5">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">{`Pharmacy Profile`}</span>
                <div className="grid grid-cols-2 gap-3 text-[#475569]">
                  <div>
                    <span className="text-[#94A3B8] block text-[10px]">{`Shop Name`}</span>
                    <span className="font-bold text-[#1D2A3B]">
                      {gt.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block text-[10px]">{`Owner Name`}</span>
                    <span className="font-bold text-[#1D2A3B]">
                      {gt.ownerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block text-[10px]">{`Contact Phone`}</span>
                    <span className="font-bold text-[#1D2A3B]">
                      {gt.phone}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block text-[10px]">{`Registered Email`}</span>
                    <span className="font-bold text-[#1D2A3B]">
                      {gt.email}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#94A3B8] block text-[10px]">{`Physical Address`}</span>
                    <span className="font-bold text-[#1D2A3B]">
                      {gt.location}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 border border-[#E2E8F0] rounded-xl p-4 space-y-2.5">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">{`Official Registrations`}</span>
                <div className="grid grid-cols-2 gap-3 text-[#475569]">
                  <div>
                    <span className="text-[#94A3B8] block text-[10px]">{`Drug License Number`}</span>
                    <span className="font-mono font-bold text-[#1D2A3B]">
                      {gt.licenseNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block text-[10px]">{`Trade License Code`}</span>
                    <span className="font-mono font-bold text-[#1D2A3B]">
                      {gt.tradeLicense}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">{`Verification Attachments`}</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center font-bold text-xs">{`PDF`}</div>
                      <div>
                        <span className="font-bold block text-[11px] text-[#1D2A3B]">{`Drug License`}</span>
                        <span className="text-[9px] text-[#94A3B8] font-mono truncate max-w-[100px] block">
                          {gt.drugLicenseFile}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => T(`Downloading ${gt.drugLicenseFile}...`)} className="text-[#94A3B8] hover:text-[#475569]" title="Download Document">{`⬇️`}</button>
                  </div>
                  <div className="p-3 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#E0F5F7] text-[#0697A8] rounded-lg flex items-center justify-center font-bold text-xs">{`PDF`}</div>
                      <div>
                        <span className="font-bold block text-[11px] text-[#1D2A3B]">{`Trade License`}</span>
                        <span className="text-[9px] text-[#94A3B8] font-mono truncate max-w-[100px] block">{`trade_license_copy.pdf`}</span>
                      </div>
                    </div>
                    <button onClick={() => T(`Downloading trade_license_copy.pdf...`)} className="text-[#94A3B8] hover:text-[#475569]" title="Download Document">{`⬇️`}</button>
                  </div>
                </div>
              </div>
              <div className="border-t border-[#E2E8F0] pt-4 space-y-3">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">{`DGDA Compliance Audit Checklist`}</span>
                <div className="space-y-2 text-[#475569]">
                  <label className="flex items-center gap-3 p-2 bg-slate-50 hover:bg-slate-100/50 rounded-lg cursor-pointer select-none">
                    <input type="checkbox" checked={yt.licenseGov} onChange={() => bt({
                      ...yt,
                      licenseGov: !yt.licenseGov
                    })} className="rounded border-[#CBD5E1] text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                    <span>{`Verify drug license authenticity on DGDA database portal`}</span>
                  </label>
                  <label className="flex items-center gap-3 p-2 bg-slate-50 hover:bg-slate-100/50 rounded-lg cursor-pointer select-none">
                    <input type="checkbox" checked={yt.addressMatch} onChange={() => bt({
                      ...yt,
                      addressMatch: !yt.addressMatch
                    })} className="rounded border-[#CBD5E1] text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                    <span>{`Confirm trade license address matches registered physical storefront`}</span>
                  </label>
                  <label className="flex items-center gap-3 p-2 bg-slate-50 hover:bg-slate-100/50 rounded-lg cursor-pointer select-none">
                    <input type="checkbox" checked={yt.ownerIdVerify} onChange={() => bt({
                      ...yt,
                      ownerIdVerify: !yt.ownerIdVerify
                    })} className="rounded border-[#CBD5E1] text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                    <span>{`Cross-reference national identification (NID) with license holder`}</span>
                  </label>
                  <label className="flex items-center gap-3 p-2 bg-slate-50 hover:bg-slate-100/50 rounded-lg cursor-pointer select-none">
                    <input type="checkbox" checked={yt.physicalStoreCheck} onChange={() => bt({
                      ...yt,
                      physicalStoreCheck: !yt.physicalStoreCheck
                    })} className="rounded border-[#CBD5E1] text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                    <span>{`Audit shop signage and pharmaceutical warehouse setup photo`}</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block font-bold text-[#64748B] uppercase tracking-wider text-[10px] mb-1.5">{`Auditor Internal Notes`}</label>
                <textarea rows={2} value={Tt} onChange={e => Et(e.target.value)} placeholder="Record verification findings, notes on scans, etc." className="w-full px-3 py-2 bg-slate-50 border border-[#E2E8F0] rounded-xl focus:outline-none focus:bg-white" />
              </div>
              {Ct && <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2 animate-in fade-in duration-200">
                <label className="block font-bold text-red-800 text-[10px] uppercase">{`Rejection Reason (Required)`}</label>
                <input type="text" required={!0} value={xt} onChange={e => St(e.target.value)} placeholder="e.g. Drug license scan is blurry or corrupted" className="w-full px-3 py-2 bg-white border border-red-300 rounded-xl text-xs focus:outline-none focus:border-red-500" />
              </div>}
            </div>
            <div className="p-6 border-t border-[#E2E8F0] bg-slate-50 flex flex-col sm:flex-row gap-3">
              {(gt.status === `Pending` || gt.status === `Pending Verification`) ? <>
                <button onClick={() => vn(gt.id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors text-center cursor-pointer">
                  {Ct ? `Confirm Rejection` : `Reject`}
                </button>
                <button onClick={() => _n(gt.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors text-center cursor-pointer">{`Approve`}</button>
              </> : (
                <div className="flex-1 flex items-center justify-between gap-2">
                  <div className="flex-1 text-center py-2.5 font-bold text-[#64748B] bg-slate-100 rounded-xl">
                    {`Verification Processed: `}
                    {gt.status}
                  </div>
                  {gt.status === `Approved` ? (
                    <button onClick={() => vn(gt.id)} className="px-3 py-2.5 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl font-bold text-xs cursor-pointer transition-colors whitespace-nowrap">
                      {Ct ? `Confirm Revoke` : `Revoke`}
                    </button>
                  ) : (
                    <button onClick={() => _n(gt.id)} className="px-3 py-2.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold text-xs cursor-pointer transition-colors whitespace-nowrap">
                      Re-activate
                    </button>
                  )}
                </div>
              )}
              <button
                onClick={() => handleDeleteBuyer(gt)}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="Permanently remove buyer and records"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete Buyer</span>
              </button>
            </div>
          </div>
        </div>}
        {f === `admin` && I && <div className="fixed inset-0 z-50 flex justify-end font-sans">
          <div onClick={() => vt(null)} className="absolute inset-0 bg-[#1D2A3B]/40 backdrop-blur-xs" />
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            <div className="px-6 py-5 border-b border-[#E2E8F0] flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-[#1D2A3B]">{`Wholesale Order Fulfillment Dispatch`}</h3>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  {`Order ID: `}
                  {I.id}
                </p>
              </div>
              <button onClick={() => vt(null)} className="text-[#64748B] hover:text-[#1D2A3B] p-1 rounded-lg hover:bg-slate-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              <div className="bg-slate-50 border border-[#E2E8F0] rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{`Order Meta`}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${I.status === `Delivered & Invoiced` ? `bg-emerald-50 text-emerald-800 border-emerald-100` : I.status === `Out for Delivery` ? `bg-purple-50 text-purple-800 border-purple-100` : I.status === `Processing/Packing` ? `bg-[#E0F5F7] text-blue-800 border-[#C2EAF0]` : `bg-yellow-50 text-yellow-800 border-yellow-200`}`}>
                    {I.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 text-[#475569]">
                  <div>
                    <span className="text-[#94A3B8] block text-[10px]">{`Pharmacy Client`}</span>
                    <span className="font-bold text-[#1D2A3B]">
                      {I.buyerName}
                    </span>
                    <span className="text-[#64748B] block text-[11px] mt-0.5 font-normal">
                      {getFullAddress(I) || I.location || 'House #12, Road #4, Block-D, Banani, Dhaka - 1213'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block text-[10px]">{`Payment Method`}</span>
                    <span className="font-bold text-[#1D2A3B]">
                      {I.paymentMethod}
                      {` (`}
                      {I.paymentStatus}
                      {`)`}
                    </span>
                  </div>
                </div>
              </div>
              {I.locationCoordinates && (
                <div className="bg-slate-50 p-4 rounded-xl border border-[#E2E8F0] mb-4 flex justify-between items-center">
                  <div>
                    <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">{`Delivery Location`}</div>
                    <div className="text-xs font-semibold text-[#1D2A3B]">
                      {I.locationCoordinates.lat.toFixed(4)}, {I.locationCoordinates.lng.toFixed(4)}
                    </div>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${I.locationCoordinates.lat},${I.locationCoordinates.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#0697A8] hover:bg-[#057A88] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                  >
                    View on Map
                  </a>
                </div>
              )}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">{`Items Pack Details`}</span>
                <div className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-[9px] text-[#64748B] uppercase font-bold border-b border-[#E2E8F0]">
                        <th className="p-3">{`SKU & Name`}</th>
                        <th className="p-3 text-center">{`Wholesale Qty`}</th>
                        <th className="p-3 text-right">{`Pack Rate`}</th>
                        <th className="p-3 text-right">{`Subtotal`}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {I.items.map((e, t) => <tr key={e.id || t}>
                        <td className="p-3">
                          <span className="font-mono text-[9px] text-[#94A3B8] block">
                            {e.id}
                          </span>
                          {(() => {
                            const medItem = m.find(med => String(med.id) === String(e.id || e.medicine_id) || (e.name && med.name && med.name.toLowerCase() === e.name.toLowerCase()));
                            const compName = e.company || e.manufacturer || medItem?.manufacturer || medItem?.company || '';
                            return (
                              <>
                                <div className="font-bold text-[#1D2A3B]">
                                  {e.name}
                                  {compName && (
                                    <span className="font-semibold text-slate-500 text-[11px] ml-1.5">
                                      ({compName})
                                    </span>
                                  )}
                                </div>
                                {compName && (
                                  <div className="text-[10px] text-slate-400 font-medium">
                                    Company: <span className="font-semibold text-slate-600">{compName}</span>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </td>
                        <td className="p-3 text-center font-semibold text-[#475569]">
                          {e.quantity}
                          {` boxes`}
                        </td>
                        <td className="p-3 text-right text-[#475569]">
                          {`৳`}
                          {e.price.toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-bold text-[#1D2A3B]">
                          {`৳`}
                          {(e.price * e.quantity).toFixed(2)}
                        </td>
                      </tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
              {(I.status === 'Return Requested' || I.status === 'Returned') && (
                <div className="border-t border-[#E2E8F0] pt-4">
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {I.status === 'Return Requested' && (
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                          </span>
                        )}
                        <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">{`Return Order Request Details`}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${I.status === 'Returned' ? 'bg-slate-200 text-slate-700' : 'bg-rose-200 text-rose-900'}`}>
                        {I.status}
                      </span>
                    </div>
                    <div className="text-xs text-rose-950 space-y-1.5 bg-white/70 p-3 rounded-lg border border-rose-100">
                      <div className="flex justify-between">
                        <span className="text-rose-700 font-semibold">{`Request Date:`}</span>
                        <span className="font-bold">{I.returnDate || I.date || `Recent`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-rose-700 font-semibold">{`Claimed Refund Value:`}</span>
                        <span className="font-bold text-rose-800">৳{I.returnRefund !== undefined ? Number(I.returnRefund).toFixed(2) : I.totalAmount.toFixed(2)}</span>
                      </div>
                      {I.returnItemsCount !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-rose-700 font-semibold">{`Items Claimed for Return:`}</span>
                          <span className="font-bold">{I.returnItemsCount} units</span>
                        </div>
                      )}
                      <div className="pt-1 border-t border-rose-100">
                        <span className="text-rose-700 font-semibold block mb-0.5">{`Reason for Return:`}</span>
                        <p className="text-slate-700 bg-white p-2 rounded border border-rose-100 text-[11px] italic">
                          {I.returnReason || `No specific reason entered by buyer.`}
                        </p>
                      </div>
                    </div>
                    {I.status === 'Return Requested' && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={async () => {
                            await yn(I.id, 'Returned');
                            if (I.items) {
                              for (const item of I.items) {
                                const med = m.find(x => String(x.id) === String(item.id));
                                if (med) {
                                  const addQty = I.returnItems && I.returnItems[item.id] !== undefined ? I.returnItems[item.id] : item.quantity;
                                  if (addQty > 0) {
                                    const newStock = (med.stock || 0) + addQty;
                                    h(prev => prev.map(x => String(x.id) === String(med.id) ? { ...x, stock: newStock } : x));
                                    await supabase.from('medicines').update({ stock: newStock }).eq('id', med.id);
                                  }
                                }
                              }
                            }
                            T(`Return request for Order #${I.id} approved. Order marked Returned and inventory restocked.`);
                          }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                          {`Approve Return & Restock`}
                        </button>
                        <button
                          onClick={async () => {
                            await yn(I.id, 'Delivered & Invoiced');
                            T(`Return request for Order #${I.id} rejected. Order reverted to Delivered & Invoiced.`);
                          }}
                          className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          {`Reject Return`}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="border-t border-[#E2E8F0] pt-4 space-y-4">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">{`Logistics Shipping Dispatch`}</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#64748B] font-bold text-[10px] uppercase mb-1">{`Shipping Courier Partner`}</label>
                    <select value={Zt} onChange={e => Qt(e.target.value)} className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-2.5 py-1.5 focus:bg-white focus:outline-none">
                      <option value="PharmaExpress">{`PharmaExpress Direct Cargo`}</option>
                      <option value="B2B Fleet">{`DigiPharma Fleet Delivery`}</option>
                      <option value="SA Paribahan">{`SA Paribahan Cargo Services`}</option>
                      <option value="DHL B2B">{`DHL Enterprise Freight`}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#64748B] font-bold text-[10px] uppercase mb-1">{`Waybill / Tracking Code`}</label>
                    <input type="text" value={$t} onChange={e => en(e.target.value)} placeholder="e.g. PE-883901-2026" className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-2.5 py-1.5 focus:bg-white focus:outline-none font-mono" />
                  </div>
                </div>
              </div>
              <div className="border-t border-[#E2E8F0] pt-4 space-y-2.5">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">{`Advance Order Status Pipeline`}</span>
                <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold select-none">
                  <button onClick={() => yn(I.id, `Pending Verification`)} className={`py-2 rounded-lg border ${I.status === `Pending Verification` ? `bg-yellow-500 text-white border-yellow-600 shadow-xs` : `bg-slate-50 text-[#475569] border-[#E2E8F0] hover:bg-slate-100`}`}>{`1. Verify`}</button>
                  <button onClick={() => yn(I.id, `Processing/Packing`)} className={`py-2 rounded-lg border ${I.status === `Processing/Packing` ? `bg-[#0697A8] text-white border-[#057A88] shadow-xs` : `bg-slate-50 text-[#475569] border-[#E2E8F0] hover:bg-slate-100`}`}>{`2. Pack`}</button>
                  <button onClick={() => yn(I.id, `Out for Delivery`)} className={`py-2 rounded-lg border ${I.status === `Out for Delivery` ? `bg-purple-600 text-white border-purple-700 shadow-xs` : `bg-slate-50 text-[#475569] border-[#E2E8F0] hover:bg-slate-100`}`}>{`3. Dispatch`}</button>
                  <button onClick={() => yn(I.id, `Delivered & Invoiced`)} className={`py-2 rounded-lg border ${I.status === `Delivered & Invoiced` ? `bg-emerald-600 text-white border-emerald-700 shadow-xs` : `bg-slate-50 text-[#475569] border-[#E2E8F0] hover:bg-slate-100`}`}>{`4. Deliver`}</button>
                  <button onClick={() => yn(I.id, `Returned`)} className={`py-2 rounded-lg border ${I.status === `Returned` ? `bg-rose-600 text-white border-rose-700 shadow-xs` : I.status === `Return Requested` ? `bg-rose-100 text-rose-800 border-rose-300 font-black animate-pulse` : `bg-slate-50 text-[#475569] border-[#E2E8F0] hover:bg-slate-100`}`}>{`5. Returned`}</button>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[#E2E8F0] bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[#94A3B8] block text-[10px]">{`Invoice Grand Total`}</span>
                <span className="text-base font-black text-emerald-700">
                  {`৳`}
                  {I.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => {
                  setInvoicesToPrint([I]);
                  setTriggersPrint(!0);
                  T(`Preparing print for invoice #${I.id}...`);
                }} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  {`Print`}
                </button>
                <button onClick={() => {
                  T(`Dispatched successfully via ${Zt} with Waybill ID: ${$t || `AUTO-9988`}`), vt(null);
                }} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md">{`Apply Shipping Manifest`}</button>
              </div>
            </div>
          </div>
        </div>}
        {f === `buyer` && (
          <div className={`fixed inset-0 z-[60] flex justify-end font-sans transition-opacity duration-300 ${xe ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}>
            <div onClick={() => Se(!1)} className="absolute inset-0 bg-[#1D2A3B]/40 backdrop-blur-xs" />
            <div className={`relative w-[85%] sm:w-[60%] md:w-120 md:max-w-md bg-white h-full shadow-2xl flex flex-col z-10 transform transition-transform duration-300 ease-in-out border-l border-[#E2E8F0] ${xe ? "translate-x-0" : "translate-x-full"}`}>
              <div className="px-4 py-3.5 md:px-6 md:py-5 border-b border-[#E2E8F0] flex justify-between items-center bg-slate-50 flex-shrink-0">
                <div className="min-w-0 pr-2">
                  <h3 className="text-xs md:text-sm font-bold text-[#1D2A3B] truncate">{`Your Cart`}</h3>
                  <p className="text-[10px] md:text-[11px] text-[#64748B] mt-0.5 truncate">
                    {`Account: `}
                    {tn.name}
                  </p>
                </div>
                <button onClick={() => Se(!1)} className="text-[#64748B] hover:text-[#1D2A3B] p-1.5 rounded-lg hover:bg-slate-100 flex-shrink-0 cursor-pointer" title="Close Cart">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto min-h-0 p-3 md:p-6 space-y-3 md:space-y-4">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">{`Selected Items List`}</span>
                {on.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#94A3B8]">{`No items selected. Add medicines from the catalog first.`}</div>
                ) : (
                  <div className="space-y-2.5">
                    {on.map((e, _idx) => (
                      <div key={e.id || _idx} className="flex flex-col sm:flex-row sm:justify-between items-start bg-slate-50 p-2.5 md:p-3 rounded-xl border border-[#E2E8F0] gap-2">
                        <div className="min-w-0 flex-1 w-full">
                          <div className="font-bold text-xs text-[#1D2A3B] truncate">{e.name}</div>
                          <div className="text-[10px] text-[#64748B] font-mono mt-0.5 truncate">{e.generic}</div>
                          <div className="text-[9px] text-[#94A3B8] mt-1 font-semibold truncate">
                            {`৳`}
                            {e.wholesalePrice.toFixed(2)}
                            {`/box | `}
                            {e.packSize || `Standard Pack`}
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto flex-shrink-0 pt-1 sm:pt-0 border-t sm:border-0 border-slate-200/60">
                          <div className="flex border border-[#E2E8F0] rounded-lg overflow-hidden bg-white items-center">
                            <button onClick={() => ln(e.id, e.quantity - 1)} className="px-2 py-0.5 text-xs text-[#64748B] hover:bg-slate-50 font-bold">{`-`}</button>
                            <span className="w-7 text-center text-xs font-black py-0.5">{e.quantity}</span>
                            <button onClick={() => ln(e.id, e.quantity + 1)} className="px-2 py-0.5 text-xs text-[#64748B] hover:bg-slate-50 font-bold">{`+`}</button>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="font-bold text-xs text-[#1D2A3B]">
                              {`৳`}
                              {e.itemTotal.toFixed(2)}
                            </div>
                            <button onClick={() => ln(e.id, 0)} className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded p-1 transition-colors cursor-pointer" title="Remove item">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="border-t border-[#E2E8F0] pt-3 space-y-2">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">{`Payment Method`}</span>
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-bold text-xs text-emerald-950 block">{`Cash on Delivery (COD)`}</span>
                      <span className="text-[10px] text-emerald-700 block mt-0.5">{`Pay invoice total upon delivery directly to courier.`}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-[#E2E8F0] pt-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">{`Delivery Address`}</span>
                    {useCustomAddress && (
                      <button
                        type="button"
                        onClick={() => {
                          setUseCustomAddress(false);
                          setAddressError('');
                        }}
                        className="text-[11px] font-bold text-[#0697A8] hover:underline cursor-pointer"
                      >
                        {`← Use Default Address`}
                      </button>
                    )}
                  </div>

                  {!useCustomAddress ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#1D2A3B] block">{`Default Registered Address`}</span>
                            <span className="text-[10px] text-slate-500 font-medium block">{`Used during shop registration`}</span>
                          </div>
                        </div>
                        <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                          {`Selected`}
                        </span>
                      </div>

                      <div className="bg-white rounded-lg p-2.5 border border-slate-200 text-xs text-slate-700 space-y-1">
                        <p className="font-semibold text-slate-800">
                          {tn.name || n?.name || 'Registered Pharmacy'}
                        </p>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {getFullAddress(n) || tn.address || 'Registered Pharmacy Address'}
                        </p>
                        <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-500 font-mono">
                          <span>📞 {tn.phone || n?.phone || 'N/A'}</span>
                          {(tn.city || n?.city) && <span>📍 {tn.city || n?.city}</span>}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setUseCustomAddress(true);
                          setAddressError('');
                        }}
                        className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 text-[#0697A8] hover:text-[#057A88] rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>{`Deliver to a Different Address`}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-[#0697A8]/30 rounded-xl p-3 space-y-2.5 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                        <span className="text-xs font-bold text-[#1D2A3B] flex items-center gap-1.5">
                          <span>📍</span>
                          <span>{`New Delivery Location`}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setUseCustomAddress(false);
                            setAddressError('');
                          }}
                          className="text-[11px] text-slate-500 hover:text-slate-700 font-bold cursor-pointer"
                        >
                          {`Cancel`}
                        </button>
                      </div>

                      {addressError && (
                        <div className="text-[11px] bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg border border-red-200 font-semibold flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{addressError}</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          {`Address Line 1 / Street`} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. House #12, Road #4, Sector 3"
                          value={customAddress.addressLine1}
                          onChange={(e) => {
                            setCustomAddress(prev => ({ ...prev, addressLine1: e.target.value }));
                            setAddressError('');
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#0697A8] focus:ring-1 focus:ring-[#0697A8]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          {`Address Line 2 (Optional)`}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Flat 4B, Landmark (optional)"
                          value={customAddress.addressLine2}
                          onChange={(e) => setCustomAddress(prev => ({ ...prev, addressLine2: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#0697A8] focus:ring-1 focus:ring-[#0697A8]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            {`City / Area`} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Uttara / Dhanmondi"
                            value={customAddress.city}
                            onChange={(e) => {
                              setCustomAddress(prev => ({ ...prev, city: e.target.value }));
                              setAddressError('');
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#0697A8] focus:ring-1 focus:ring-[#0697A8]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            {`Division`}
                          </label>
                          <select
                            value={customAddress.division}
                            onChange={(e) => setCustomAddress(prev => ({ ...prev, division: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#0697A8]"
                          >
                            <option value="Dhaka">Dhaka</option>
                            <option value="Chittagong">Chittagong</option>
                            <option value="Rajshahi">Rajshahi</option>
                            <option value="Khulna">Khulna</option>
                            <option value="Barisal">Barisal</option>
                            <option value="Sylhet">Sylhet</option>
                            <option value="Rangpur">Rangpur</option>
                            <option value="Mymensingh">Mymensingh</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            {`Postal Code`}
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 1230"
                            value={customAddress.postalCode}
                            onChange={(e) => setCustomAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#0697A8]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            {`Contact Phone`}
                          </label>
                          <input
                            type="text"
                            placeholder={tn.phone || n?.phone || "017XXXXXXXX"}
                            value={customAddress.phone}
                            onChange={(e) => setCustomAddress(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#0697A8]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-3.5 md:p-6 border-t border-[#E2E8F0] bg-slate-50 space-y-3 flex-shrink-0">
                <div className="space-y-1 text-xs">
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Enter Coupon Code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 min-w-0 bg-white border border-slate-200 text-sm rounded-xl px-3 py-1.5 outline-none uppercase"
                    />
                    <button
                      onClick={() => {
                        let code = couponInput.trim();
                        if (!code) return;
                        let found = coupons.find(c => c.code === code);
                        if (found) {
                          setAppliedCoupon(found);
                          T(`Coupon applied successfully!`);
                        } else {
                          T(`Invalid or expired coupon code.`);
                          setAppliedCoupon(null);
                        }
                      }}
                      className="bg-slate-200 hover:bg-slate-300 text-[#1D2A3B] px-3 py-1.5 rounded-xl font-bold transition-all"
                    >
                      Apply
                    </button>
                    {appliedCoupon && (
                      <button onClick={() => { setAppliedCoupon(null); setCouponInput(``); }} className="text-red-500 hover:text-red-700 px-2 font-bold text-lg leading-none" title="Remove Coupon">
                        ×
                      </button>
                    )}
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>{`Subtotal:`}</span>
                    <span className="font-semibold text-[#1D2A3B]">
                      {`৳`}
                      {sn.subtotal.toFixed(2)}
                    </span>
                  </div>
                  {sn.totalSpecialDiscounts > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>{`Special Discount:`}</span>
                      <span className="font-semibold">
                        -{`৳`}
                        {sn.totalSpecialDiscounts.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {appliedCoupon && (
                    <div className="flex justify-between text-purple-600">
                      <span>{`Coupon (${appliedCoupon.code}):`}</span>
                      <span className="font-semibold">
                        -{`৳`}
                        {sn.couponDiscountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#64748B]">
                    <span>{`Delivery:`}</span>
                    <span className="font-semibold text-emerald-600">{`FREE`}</span>
                  </div>
                  <div className="h-px bg-slate-200 my-1.5" />
                  <div className="flex justify-between text-xs md:text-sm font-black text-[#1D2A3B]">
                    <span>{`Total Payable:`}</span>
                    <span className="text-sm md:text-base text-[#0697A8]">
                      {`৳`}
                      {sn.finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={fn}
                  disabled={on.length === 0 || isPlacingOrder}
                  className="w-full bg-[#0697A8] hover:bg-[#057A88] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-2.5 md:py-3 rounded-xl text-xs shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  {isPlacingOrder ? (
                    <>
                      <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      {`Place Order (৳`}
                      {sn.finalTotal.toFixed(2)}
                      {`)`}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        {f === `buyer` && Oe && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
          <div onClick={() => { ke(null); setIsEditingOrder(false); }} className="absolute inset-0 bg-[#1D2A3B]/40 backdrop-blur-xs" />
          <div className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-200 text-xs">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#1D2A3B]">
                  {`Order Details: `}
                  {Oe.id}
                </h3>
                <p className="text-[11px] font-semibold text-slate-700 mt-0.5">
                  {Oe.buyerName || tn.name}
                  <span className="font-normal text-slate-500"> • {getFullAddress(Oe) || tn.address}</span>
                </p>
                <p className="text-[10px] text-[#64748B] mt-0.5">
                  {`Purchased on `}
                  {Oe.date}
                  {` | via `}
                  {Oe.paymentMethod}
                </p>
              </div>
              <div className="flex gap-2">
                {['Pending', 'Pending Verification', 'Processing/Packing', 'Approved'].includes(Oe.status) && !isEditingOrder && (
                  <button onClick={() => {
                    setIsEditingOrder(!0);
                    let initialQs = {};
                    Oe.items.forEach((item, idx) => initialQs[item.id || idx] = item.quantity);
                    setEditedQuantities(initialQs);
                  }} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-bold hover:bg-emerald-200">
                    Edit Order
                  </button>
                )}
                <button onClick={() => { ke(null); setIsEditingOrder(false); }} className="text-[#64748B] hover:text-[#1D2A3B] p-1 rounded-lg hover:bg-slate-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-[#E2E8F0] mb-4">
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2.5">{`Real-Time Logistics Status`}</div>
              <div className="flex justify-between items-center relative px-4">
                <div className="absolute left-6 right-6 h-0.5 bg-slate-200 top-2.5 -z-0" />
                <div className="flex flex-col items-center z-10 relative">
                  <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center" />
                  <span className="text-[9px] font-bold text-[#1D2A3B] mt-1">{`Confirmed`}</span>
                </div>
                <div className="flex flex-col items-center z-10 relative">
                  <div className={`w-4.5 h-4.5 rounded-full border-4 border-white flex items-center justify-center ${[`Processing/Packing`, `Out for Delivery`, `Delivered & Invoiced`].includes(Oe.status) ? `bg-emerald-500` : `bg-slate-300`}`} />
                  <span className="text-[9px] font-bold text-[#1D2A3B] mt-1">{`Packed`}</span>
                </div>
                <div className="flex flex-col items-center z-10 relative">
                  <div className={`w-4.5 h-4.5 rounded-full border-4 border-white flex items-center justify-center ${[`Out for Delivery`, `Delivered & Invoiced`].includes(Oe.status) ? `bg-emerald-500` : `bg-slate-300`}`} />
                  <span className="text-[9px] font-bold text-[#1D2A3B] mt-1">{`Shipped`}</span>
                </div>
                <div className="flex flex-col items-center z-10 relative">
                  <div className={`w-4.5 h-4.5 rounded-full border-4 border-white flex items-center justify-center ${Oe.status === `Delivered & Invoiced` ? `bg-emerald-500` : `bg-slate-300`}`} />
                  <span className="text-[9px] font-bold text-[#1D2A3B] mt-1">{`Delivered`}</span>
                </div>
              </div>
            </div>
            {Oe.locationCoordinates && (
              <div className="bg-slate-50 p-4 rounded-xl border border-[#E2E8F0] mb-4 flex justify-between items-center">
                <div>
                  <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">{`Delivery Location`}</div>
                  <div className="text-xs font-semibold text-[#1D2A3B]">
                    {Oe.locationCoordinates.lat.toFixed(4)}, {Oe.locationCoordinates.lng.toFixed(4)}
                  </div>
                </div>
                <a
                  href={`https://maps.google.com/?q=${Oe.locationCoordinates.lat},${Oe.locationCoordinates.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#0697A8] hover:bg-[#057A88] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                >
                  View on Map
                </a>
              </div>
            )}
            {(() => {
              const orderZone = getDeliveryZone(Oe.city || Oe.buyerAddress || Oe.location || '');
              const orderDeliveryMen = orderZone ? getDeliveryMenForZone(orderZone) : [];
              if (orderDeliveryMen.length === 0 && !orderZone) return null;
              return <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 mb-4">
                <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-2">{`Assigned Delivery Representative`}{orderZone ? ` • ${orderZone} Zone` : ''}</div>
                {orderDeliveryMen.length > 0 ? orderDeliveryMen.map(dm => <div key={dm.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-200 text-indigo-800 flex items-center justify-center font-bold text-[10px]">{dm.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</div>
                    <div>
                      <span className="text-xs font-bold text-[#1D2A3B]">{dm.name}</span>
                      <span className="text-[10px] text-[#64748B] ml-2">{dm.phone}</span>
                    </div>
                  </div>
                  <a href={`tel:${dm.phone}`} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    {`Call`}
                  </a>
                </div>) : <div className="text-xs text-indigo-500 font-semibold">{`Delivery representative will be assigned soon.`}</div>}
              </div>;
            })()}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">{`Items Breakdown & Price Details`}</span>
              {isEditingOrder && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5 mb-2">
                  <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <span className="font-bold">Admin Re-Approval Notice:</span> Modifying item quantities will adjust reserved stock and return this order to <strong className="text-amber-800">Pending Verification</strong>. It will require administrator re-approval before fulfillment.
                  </div>
                </div>
              )}
              <div className="border border-[#E2E8F0] rounded-xl overflow-x-auto bg-white">
                <table className="w-full text-left border-collapse min-w-[580px]">
                  <thead>
                    <tr className="bg-slate-50 text-[9px] text-[#64748B] uppercase font-bold border-b border-[#E2E8F0]">
                      <th className="p-3">{`Product Name`}</th>
                      <th className="p-3 text-right">{`MRP`}</th>
                      <th className="p-3 text-right">{`Discount`}</th>
                      <th className="p-3 text-right">{`Unit Price`}</th>
                      <th className="p-3 text-center">{`Quantity`}</th>
                      <th className="p-3 text-right">{`Total`}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Oe.items.map((e, t) => {
                      const details = getInvoiceItemPricing(e);
                      const currentQty = isEditingOrder ? (editedQuantities[e.id || t] !== undefined ? editedQuantities[e.id || t] : e.quantity) : e.quantity;
                      return (
                        <tr key={e.id || t} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-[#1D2A3B]">
                              {details.name}
                              {details.manufacturer && (
                                <span className="font-semibold text-slate-500 text-[11px] ml-1.5">
                                  ({details.manufacturer})
                                </span>
                              )}
                            </div>
                            {details.manufacturer && (
                              <div className="text-[10px] text-slate-400 font-medium">
                                Company: <span className="font-semibold text-slate-600">{details.manufacturer}</span>
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-right font-medium text-slate-600">
                            ৳{details.mrp.toFixed(2)}
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-600">
                            ৳{details.discountAmount.toFixed(2)} ({details.discountPercent}%)
                          </td>
                          <td className="p-3 text-right font-bold text-[#0697A8]">
                            ৳{details.unitPrice.toFixed(2)}
                          </td>
                          <td className="p-3 text-center font-semibold text-[#475569]">
                            {isEditingOrder ? (
                              <input
                                type="number"
                                min="0"
                                className="w-16 p-1 border rounded text-center text-xs"
                                value={currentQty}
                                onChange={(ev) => {
                                  let val = parseInt(ev.target.value) || 0;
                                  setEditedQuantities({ ...editedQuantities, [e.id || t]: Math.max(0, val) });
                                }}
                              />
                            ) : (
                              <>{e.quantity}{` boxes`}</>
                            )}
                          </td>
                          <td className="p-3 text-right font-black text-[#1D2A3B]">
                            ৳{(details.unitPrice * currentQty).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
              {isEditingOrder ? (
                <>
                  <div className="text-sm font-black text-[#1D2A3B]">
                    {`New Total: `}
                    <span className="text-[#0697A8]">
                      {`৳`}
                      {Oe.items.reduce((sum, item, idx) => sum + (item.price * (editedQuantities[item.id || idx] || 0)), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditingOrder(!1)} className="bg-slate-100 hover:bg-slate-200 text-[#475569] px-3.5 py-2 rounded-xl font-bold">{`Cancel`}</button>
                    <button onClick={async () => {
                      let newTotal = 0;
                      let newItems = Oe.items.map((item, idx) => {
                        let newQ = editedQuantities[item.id || idx] || 0;
                        newTotal += newQ * item.price;
                        return { ...item, quantity: newQ };
                      }).filter(item => item.quantity > 0);

                      const wasApproved = Oe.status === 'Processing/Packing' || Oe.status === 'Approved';
                      const newStatus = 'Pending Verification';

                      let updatedOrder = {
                        ...Oe,
                        items: newItems,
                        totalAmount: newTotal,
                        status: newStatus
                      };

                      // Adjust inventory stock deltas
                      Oe.items.forEach(oldItem => {
                        const newItem = newItems.find(i => String(i.id) === String(oldItem.id));
                        const newQ = newItem ? newItem.quantity : 0;
                        const delta = newQ - oldItem.quantity;
                        if (delta !== 0) {
                          const med = m.find(med => String(med.id) === String(oldItem.id));
                          if (med) {
                            const updatedStock = Math.max(0, med.stock - delta);
                            h(prev => prev.map(x => String(x.id) === String(oldItem.id) ? { ...x, stock: updatedStock } : x));
                            supabase.from('medicines').update({ stock: updatedStock }).eq('id', oldItem.id);
                          }
                        }
                      });

                      // Update order in Supabase
                      await supabase.from('orders').update({
                        total_amount: newTotal,
                        status: newStatus
                      }).eq('id', Oe.id);

                      // Update order items in Supabase
                      await supabase.from('order_items').delete().eq('order_id', Oe.id);
                      let newOrderItems = newItems.map(item => ({
                        order_id: Oe.id,
                        medicine_id: String(item.id),
                        product_name: item.name,
                        quantity: item.quantity,
                        unit_price: item.price
                      }));
                      if (newOrderItems.length > 0) {
                        await supabase.from('order_items').insert(newOrderItems);
                      }

                      // Update local state
                      x(prev => prev.map(o => o.id === Oe.id ? updatedOrder : o));
                      ke(updatedOrder);
                      setIsEditingOrder(!1);

                      const alertMsg = wasApproved
                        ? `Order updated! Since this order was already approved, it has been sent back for Admin verification and re-approval.`
                        : `Order updated successfully!`;
                      T(alertMsg);

                      let notif = {
                        id: Date.now(),
                        text: `Order #${Oe.id} was edited by buyer and is now pending admin re-approval.`,
                        date: `Just now`,
                        read: !1
                      };
                      w(prev => [notif, ...prev]);
                    }} className="bg-[#0697A8] hover:bg-[#057A88] text-white px-3.5 py-2 rounded-xl font-bold">{`Save Changes`}</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm font-black text-[#1D2A3B]">
                    {`Total Value: `}
                    <span className="text-[#0697A8]">
                      {`৳`}
                      {Oe.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <button onClick={() => {
                    setInvoicesToPrint([Oe]);
                    setTriggersPrint(!0);
                    T(`Preparing print for invoice #${Oe.id}...`);
                  }} className="bg-slate-50 hover:bg-slate-100 border border-[#E2E8F0] text-[#475569] px-3.5 py-2 rounded-xl font-bold">{`Download PDF Invoice`}</button>
                </>
              )}
            </div>
          </div>
        </div>}
        {f === `buyer` && Me.isOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
          <div onClick={() => Ne({
            isOpen: !1,
            orderId: ``
          })} className="absolute inset-0 bg-[#1D2A3B]/40 backdrop-blur-xs" />
          <div className="relative bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-200 text-center text-xs space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-50 shadow-md">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1D2A3B]">{`B2B Order Placed Successfully`}</h3>
              <p className="text-xs text-[#0697A8] font-mono font-bold">
                {`Ref: `}
                {Me.orderId}
              </p>
            </div>
            <p className="text-[#64748B] leading-relaxed max-w-xs mx-auto">{`Your order has been logged. The warehousing department has queued this for packing and immediate delivery.`}</p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button onClick={() => {
                const orderToView = Me.order || b.find(o => o.id === Me.orderId);
                Ne({ isOpen: !1, orderId: `` });
                if (orderToView) ke(orderToView);
              }} className="flex-1 bg-[#0697A8] hover:bg-[#057A88] text-white font-bold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {`View Invoice`}
              </button>
              <button onClick={() => {
                Ne({
                  isOpen: !1,
                  orderId: ``
                }), k(`orders`);
              }} className="flex-1 bg-slate-50 border border-[#E2E8F0] hover:bg-slate-100 text-[#475569] font-bold py-2.5 rounded-xl">{`Track Shipments`}</button>
              <button onClick={() => Ne({
                isOpen: !1,
                orderId: ``
              })} className="flex-1 bg-slate-100 hover:bg-slate-200 text-[#1D2A3B] font-bold py-2.5 rounded-xl">{`Continue Buying`}</button>
            </div>
          </div>
        </div>}
        {Ae && <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-[#1D2A3B]/40 backdrop-blur-xs font-sans">
          <div onClick={() => je(null)} className="absolute inset-0" />
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#1D2A3B] rounded-3xl border border-[#E2E8F0] dark:border-slate-700 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-[#E2E8F0] dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-[#1D2A3B]/50">
              <div>
                <span className="bg-[#E0F5F7] dark:bg-blue-900/30 text-[#0697A8] dark:text-blue-400 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  {Ae.dosageForm || `Medicine`}
                </span>
                <h3 className="text-lg font-black text-[#1D2A3B] dark:text-slate-200 mt-1">
                  {Ae.name}
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 italic mt-0.5">
                  {`Active Generic Ingredient: `}
                  {Ae.generic}
                </p>
              </div>
              <button onClick={() => je(null)} className="text-[#64748B] hover:text-[#1D2A3B] dark:text-slate-400 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-[#475569] dark:text-slate-300">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-[#1D2A3B]/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 text-[11px]">
                <div>
                  <span className="text-[#94A3B8] block text-[9px] uppercase tracking-wider font-bold">{`Manufacturer`}</span>
                  <span className="font-bold text-[#1D2A3B] dark:text-slate-200">
                    {Ae.manufacturer}
                  </span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block text-[9px] uppercase tracking-wider font-bold">{`Therapeutic Category`}</span>
                  <span className="font-bold text-[#1D2A3B] dark:text-slate-200">
                    {Ae.category}
                  </span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block text-[9px] uppercase tracking-wider font-bold">{`Pack Size & Form`}</span>
                  <span className="font-bold text-[#1D2A3B] dark:text-slate-200">
                    {Ae.packSize}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[#0697A8] dark:text-blue-400">{`Indications`}</h4>
                  <p className="leading-relaxed bg-[#E0F5F7]/20 dark:bg-blue-900/10 p-3 rounded-xl border border-[#E0F5F7]/50 dark:border-blue-950/20">
                    {Ae.indications || `This medicine is indicated for systemic treatment under certified prescription.`}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">{`Therapeutic Class / Pharmacology`}</h4>
                  <p className="leading-relaxed">
                    {Ae.pharmacology || `Pharmacological data is indexed on the drug registry database.`}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">{`Dosage & Administration`}</h4>
                  <p className="leading-relaxed bg-slate-50 dark:bg-[#1D2A3B]/30 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    {Ae.dosageAdministration || `Consult the prescribing physician for patient-specific dosing.`}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400">{`Side Effects`}</h4>
                  <p className="leading-relaxed">
                    {Ae.sideEffects || `Common side effects include mild gastrointestinal complaints, nausea, or headache.`}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-500">{`Contraindications`}</h4>
                  <p className="leading-relaxed">
                    {Ae.contraindications || `Hypersensitivity to the active generic compound or related pharmaceutical classes.`}
                  </p>
                </div>
                {Ae.pregnancyCategory && <div className="space-y-1.5">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-500">{`Pregnancy & Lactation`}</h4>
                  <p className="leading-relaxed">{Ae.pregnancyCategory}</p>
                </div>}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#E2E8F0] dark:border-slate-700 bg-slate-50 dark:bg-[#1D2A3B]/50 flex justify-between items-center text-[10px] text-[#64748B] dark:text-slate-400">
              <span>{`Verified B2B Medical Index • DG Pharma`}</span>
              <button onClick={() => je(null)} className="bg-[#0697A8] hover:bg-[#057A88] text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-colors">{`Close Monograph`}</button>
            </div>
          </div>
        </div>}
        {/* Toast notifications removed */}
        {te.isOpen && <div className="fixed inset-0 bg-[#1D2A3B]/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${te.isDestructive ? `bg-red-100 text-red-600` : `bg-[#C2EAF0] text-[#0697A8]`}`}>
              {te.icon === 'lock' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-black text-[#1D2A3B] mb-2">
              {te.title}
            </h3>
            <p className="text-sm text-[#475569] mb-6 font-medium leading-relaxed">
              {te.message}
            </p>
            {te.requireInput && (
              <div className="mb-6">
                <label className="block text-xs font-bold text-[#64748B] mb-2 uppercase tracking-wider">
                  {te.inputLabel ? te.inputLabel : (te.expectedInput ? `Type "${te.expectedInput}" to confirm` : `Enter value`)}
                </label>
                <input
                  type={te.inputType || "text"}
                  value={modalInput}
                  onChange={e => setModalInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (!te.requireInput || (modalInput && (!te.expectedInput || modalInput === te.expectedInput)))) {
                      te.onConfirm(modalInput);
                    }
                  }}
                  placeholder={te.inputPlaceholder || (te.inputType === "password" ? "••••••••" : (te.expectedInput || ""))}
                  autoFocus
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#1D2A3B] focus:border-[#0697A8] focus:ring-4 focus:ring-[#0697A8]/10 transition-all outline-none"
                />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => {
                ne({
                  isOpen: !1,
                  title: ``,
                  message: ``,
                  onConfirm: null,
                  isDestructive: !1,
                  requireInput: !1,
                  expectedInput: ``,
                  inputLabel: ``,
                  inputType: ``,
                  inputPlaceholder: ``,
                  confirmText: ``,
                  icon: ``
                });
                setModalInput("");
              }} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm">{`Cancel`}</button>
              <button disabled={te.requireInput && (!modalInput || (te.expectedInput ? modalInput !== te.expectedInput : false))} onClick={() => te.onConfirm(modalInput)} className={`flex-1 px-4 py-2.5 text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed ${te.isDestructive ? `bg-red-600 hover:bg-red-700` : `bg-[#0697A8] hover:bg-[#057A88]`}`}>{te.confirmText || `Confirm`}</button>
            </div>
          </div>
        </div>}
        {_e.isOpen && <div className="fixed inset-0 bg-[#1D2A3B]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-[#1D2A3B]">{`Update Product Image`}</h3>
              <button onClick={() => ve({
                isOpen: !1,
                medId: null,
                currentUrl: ``
              })} className="text-[#64748B] hover:text-[#1D2A3B] p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2">{`Option 1: Upload File`}</label>
                <input type="file" accept="image/*" onChange={async event => {
                  let file = event.target.files[0];
                  if (file) {
                    let formData = new FormData();
                    formData.append('image', file);
                    try {
                      let response = await fetch(`/upload.php`, {
                        method: 'POST',
                        body: formData
                      });

                      let result;
                      let contentType = response.headers.get('content-type');

                      if (contentType && contentType.indexOf('application/json') !== -1) {
                        result = await response.json();
                      } else {
                        let text = await response.text();
                        throw Error(`Server returned non-JSON (${response.status}): ` + text.substring(0, 100));
                      }

                      if (response.ok && result.success) {
                        wn(_e.medId, result.url);
                        ve({
                          isOpen: !1,
                          medId: null,
                          currentUrl: ``
                        });
                      } else {
                        alert(`Upload failed: ` + (result.error || `Unknown error`));
                      }
                    } catch (error) {
                      console.error(`Upload error:`, error);
                      alert(`Upload error: ` + error.message);
                    }
                  }
                }} className="w-full text-xs text-[#475569] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition-all border border-[#E2E8F0] rounded-xl cursor-pointer" />
              </div>
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-[#E2E8F0]" />
                <span className="flex-shrink-0 mx-4 text-[#94A3B8] text-[10px] font-bold uppercase">{`OR`}</span>
                <div className="flex-grow border-t border-[#E2E8F0]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2">{`Option 2: Image URL`}</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="https://example.com/image.jpg" id="imgUrlInput" defaultValue={_e.currentUrl} className="flex-1 border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-[#C2EAF0]" />
                  <button onClick={() => {
                    let e = document.getElementById(`imgUrlInput`).value;
                    e && (wn(_e.medId, e), ve({
                      isOpen: !1,
                      medId: null,
                      currentUrl: ``
                    }));
                  }} className="bg-[#0697A8] hover:bg-[#057A88] text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md">{`Save URL`}</button>
                </div>
              </div>
            </div>
          </div>
        </div>}

        {quickRequestModal.isOpen && quickRequestModal.med && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-6 py-5 text-white flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{`Request Out-of-Stock Medicine`}</h3>
                    <p className="text-white/80 text-[11px]">{`Notify Admin to restock this medicine for your pharmacy`}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickRequestModal({ isOpen: false, med: null, quantity: '100', notes: '' })}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitQuickRequest} className="p-6 space-y-4">
                <div className="p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-2xl flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-amber-200/70 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {quickRequestModal.med.imageUrl ? (
                      <img src={quickRequestModal.med.imageUrl} alt={quickRequestModal.med.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#1D2A3B] truncate">{quickRequestModal.med.name || quickRequestModal.med.product_name}</h4>
                      <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">{`Out of stock`}</span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5 truncate">{quickRequestModal.med.generic}</p>
                    <p className="text-[11px] text-[#94A3B8]">{quickRequestModal.med.manufacturer || quickRequestModal.med.company}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">
                    {`Estimated Quantity Needed (Units / Packs)`} <span className="text-red-500">{`*`}</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quickRequestModal.quantity}
                    onChange={(e) => setQuickRequestModal(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="e.g. 100"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#1D2A3B] focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">
                    {`Additional Notes / Urgency (Optional)`}
                  </label>
                  <textarea
                    rows={3}
                    value={quickRequestModal.notes}
                    onChange={(e) => setQuickRequestModal(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="e.g. Out of stock, need 2 boxes for customer prescription..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                  />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-[#64748B] flex items-center justify-between">
                  <span>{`Requesting as:`}</span>
                  <span className="font-bold text-[#1D2A3B]">{tn?.name || `Care & Cure Pharmacy Ltd.`}</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setQuickRequestModal({ isOpen: false, med: null, quantity: '100', notes: '' })}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#475569] font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    {`Cancel`}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    {`Submit Request`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
    {invoicesToPrint && invoicesToPrint.length > 0 && (
      <div className="hidden print:block absolute top-0 left-0 w-full bg-white z-[99999] text-black font-sans p-8">
        {invoicesToPrint.map((activeInvoice, idx) => (
          <div key={activeInvoice.id || idx} className="w-full mx-auto text-sm flex flex-col h-full print-page-break mb-8">
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
              <div className="flex items-center gap-4">
                <img src={logoUrl} className="h-12 w-auto object-contain" alt="" />
              </div>
              <div className="text-right flex flex-col items-end">
                <h1 className="text-4xl font-black text-slate-800 mb-2 uppercase tracking-widest">{`INVOICE`}</h1>
                <p className="font-bold text-slate-700 text-lg">{`#${activeInvoice.id || `INV-${new Date().getFullYear()}-${idx + 1001}`}`}</p>
                <p className="text-slate-500 mt-1 mb-3">{`Date: ${activeInvoice.date || new Date().toLocaleDateString()}`}</p>
                <img src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${activeInvoice.id || `INV${idx}`}&scale=3&height=10&includetext=false`} alt="Barcode" className="h-12 w-auto mix-blend-multiply" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-xs">{`Billed To`}</h3>
                <p className="font-bold text-lg text-slate-900 mb-0.5">{activeInvoice.buyerName}</p>
                <p className="text-slate-700 text-xs font-medium leading-relaxed mb-1.5">
                  {getFullAddress(activeInvoice) || (n?.name === activeInvoice.buyerName ? getFullAddress(n) : '') || activeInvoice.location || `House #12, Road #4, Block-D, Banani, Dhaka - 1213`}
                </p>
                <p className="text-slate-500 text-[11px] mb-1">{`Pharmacy / Organization`}</p>
                <p className="text-slate-600 font-mono text-xs">{`Contact: ${activeInvoice.phone || (n?.name === activeInvoice.buyerName ? n?.phone : '') || '+8801711223344'}`}</p>
              </div>
              <div className="text-right">
                <h3 className="font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-xs">{`Payment Details`}</h3>
                <p className="text-slate-700 mb-1"><span className="font-semibold">Method:</span> {activeInvoice.paymentMethod}</p>
                <p className="text-slate-700 mb-1"><span className="font-semibold">Status:</span> {activeInvoice.paymentStatus}</p>
              </div>
            </div>

            <div className="flex-grow">
              <table className="w-full text-left border-collapse mb-8">
                <thead>
                  <tr className="bg-slate-100 border-y-2 border-slate-800 text-xs">
                    <th className="py-3 px-3 font-bold text-slate-800 uppercase tracking-wider">{`Item Description`}</th>
                    <th className="py-3 px-3 font-bold text-slate-800 uppercase tracking-wider text-right">{`MRP`}</th>
                    <th className="py-3 px-3 font-bold text-slate-800 uppercase tracking-wider text-right">{`Discount`}</th>
                    <th className="py-3 px-3 font-bold text-slate-800 uppercase tracking-wider text-right">{`Unit Price`}</th>
                    <th className="py-3 px-3 font-bold text-slate-800 uppercase tracking-wider text-center">{`Qty`}</th>
                    <th className="py-3 px-3 font-bold text-slate-800 uppercase tracking-wider text-right">{`Total`}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {Array.isArray(activeInvoice.items) && activeInvoice.items.map((e, t) => {
                    const details = getInvoiceItemPricing(e);
                    return (
                      <tr key={e?.id || t}>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 text-sm">
                            {details.name}
                            {details.manufacturer && (
                              <span className="text-slate-600 font-semibold text-xs ml-1.5">
                                ({details.manufacturer})
                              </span>
                            )}
                          </div>
                          {details.manufacturer && (
                            <div className="text-[11px] text-slate-500 font-medium">
                              Company: <span className="font-semibold text-slate-700">{details.manufacturer}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-700 font-medium">৳{Number(details.mrp || 0).toFixed(2)}</td>
                        <td className="py-3 px-3 text-right font-semibold text-emerald-700">
                          ৳{Number(details.discountAmount || 0).toFixed(2)} ({details.discountPercent}%)
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">৳{Number(details.unitPrice || 0).toFixed(2)}</td>
                        <td className="py-3 px-3 text-center font-semibold text-slate-700">{e?.quantity || 1}</td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">৳{(Number(details.unitPrice || 0) * (e?.quantity || 1)).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mb-12">
              <div className="w-1/2">
                <div className="space-y-2 text-sm text-slate-700 border-t-2 border-slate-800 pt-4">
                  <div className="flex justify-between">
                    <span>{`Subtotal:`}</span>
                    <span className="font-semibold">৳{Number(activeInvoice.totalAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-300 pt-2 mt-2 text-lg font-black text-slate-900">
                    <span>{`Total Payable:`}</span>
                    <span>৳{Number(activeInvoice.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-slate-800 pt-6 mt-auto">
              <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">{`Terms & Conditions`}</h4>
              <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 font-medium">
                <li>দয়া করে মূল্য পরিশোধ করে পণ্য বুঝে নিন।</li>
                <li>কোনো প্রোডাক্ট রিটার্ন করলে অফার প্রযোজ্য হবে না।</li>
                <li>সিল যুক্ত পণ্যের সমস্যা থাকলে সমাধান দেওয়া হবে।</li>
              </ol>
              <div className="mt-8 text-center text-xs text-slate-400">
                {`Thank you for doing business with DG Pharma.`}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
    {(() => {
      const activeInvoice = I || Oe;
      if (!activeInvoice || (invoicesToPrint && invoicesToPrint.length > 0)) return null;
      return (
        <div className="hidden print:block absolute top-0 left-0 w-full bg-white z-[99999] text-black font-sans p-8">
          <div className="w-full mx-auto text-sm flex flex-col h-full">
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
              <div className="flex items-center gap-4">
                <img src={logoUrl} className="h-12 w-auto object-contain" alt="" />
              </div>
              <div className="text-right flex flex-col items-end">
                <h1 className="text-4xl font-black text-slate-800 mb-2 uppercase tracking-widest">{`INVOICE`}</h1>
                <p className="font-bold text-slate-700 text-lg">{`#${activeInvoice.id}`}</p>
                <p className="text-slate-500 mt-1 mb-3">{`Date: ${activeInvoice.date}`}</p>
                <img src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${activeInvoice.id}&scale=3&height=10&includetext=false`} alt="Barcode" className="h-12 w-auto mix-blend-multiply" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-xs">{`Billed To`}</h3>
                <p className="font-bold text-lg text-slate-900 mb-0.5">{activeInvoice.buyerName}</p>
                <p className="text-slate-700 text-xs font-medium leading-relaxed mb-1.5">
                  {getFullAddress(activeInvoice) || (n?.name === activeInvoice.buyerName ? getFullAddress(n) : '') || activeInvoice.location || `House #12, Road #4, Block-D, Banani, Dhaka - 1213`}
                </p>
                <p className="text-slate-500 text-[11px] mb-1">{`Pharmacy / Organization`}</p>
                <p className="text-slate-600 font-mono text-xs">{`Contact: ${activeInvoice.phone || (n?.name === activeInvoice.buyerName ? n?.phone : '') || '+8801711223344'}`}</p>
              </div>
              <div className="text-right">
                <h3 className="font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-xs">{`Payment Details`}</h3>
                <p className="text-slate-700 mb-1"><span className="font-semibold">Method:</span> {activeInvoice.paymentMethod}</p>
                <p className="text-slate-700 mb-1"><span className="font-semibold">Status:</span> {activeInvoice.paymentStatus}</p>
              </div>
            </div>

            <div className="flex-grow">
              <table className="w-full text-left border-collapse mb-8">
                <thead>
                  <tr className="bg-slate-100 border-y-2 border-slate-800 text-xs">
                    <th className="py-3 px-3 font-bold text-slate-800 uppercase tracking-wider">{`Item Description`}</th>
                    <th className="py-3 px-3 font-bold text-slate-800 uppercase tracking-wider text-right">{`MRP`}</th>
                    <th className="py-3 px-3 font-bold text-slate-800 uppercase tracking-wider text-right">{`Discount`}</th>
                    <th className="py-3 px-3 font-bold text-slate-800 uppercase tracking-wider text-right">{`Unit Price`}</th>
                    <th className="py-3 px-3 font-bold text-slate-800 uppercase tracking-wider text-center">{`Qty`}</th>
                    <th className="py-3 px-3 font-bold text-slate-800 uppercase tracking-wider text-right">{`Total`}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {Array.isArray(activeInvoice.items) && activeInvoice.items.map((e, t) => {
                    const details = getInvoiceItemPricing(e);
                    return (
                      <tr key={e?.id || t}>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 text-sm">
                            {details.name}
                            {details.manufacturer && (
                              <span className="text-slate-600 font-semibold text-xs ml-1.5">
                                ({details.manufacturer})
                              </span>
                            )}
                          </div>
                          {details.manufacturer && (
                            <div className="text-[11px] text-slate-500 font-medium">
                              Company: <span className="font-semibold text-slate-700">{details.manufacturer}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-700 font-medium">৳{Number(details.mrp || 0).toFixed(2)}</td>
                        <td className="py-3 px-3 text-right font-semibold text-emerald-700">
                          ৳{Number(details.discountAmount || 0).toFixed(2)} ({details.discountPercent}%)
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">৳{Number(details.unitPrice || 0).toFixed(2)}</td>
                        <td className="py-3 px-3 text-center font-semibold text-slate-700">{e?.quantity || 1}</td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">৳{(Number(details.unitPrice || 0) * (e?.quantity || 1)).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mb-12">
              <div className="w-1/2">
                <div className="space-y-2 text-sm text-slate-700 border-t-2 border-slate-800 pt-4">
                  <div className="flex justify-between">
                    <span>{`Subtotal (Medicine Cost):`}</span>
                    <span className="font-semibold">৳{Number(activeInvoice.subtotal || activeInvoice.totalAmount || 0).toFixed(2)}</span>
                  </div>
                  {Number(activeInvoice.totalSpecialDiscounts || 0) > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>{`Special Discount:`}</span>
                      <span>-৳{Number(activeInvoice.totalSpecialDiscounts).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(activeInvoice.couponDiscountAmount || 0) > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>{`Coupon Discount:`}</span>
                      <span>-৳{Number(activeInvoice.couponDiscountAmount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-300 pt-2 mt-2 text-lg font-black text-slate-900">
                    <span>{`Total Payable:`}</span>
                    <span>৳{Number(activeInvoice.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-slate-800 pt-6 mt-auto">
              <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">{`Terms & Conditions (শর্তাবলী)`}</h4>
              <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 font-medium">
                <li>দয়া করে মূল্য পরিশোধ করে পণ্য বুঝে নিন।</li>
                <li>কোনো প্রোডাক্ট রিটার্ন করলে কোনো ধরনের অফার প্রযোজ্য হবে না।</li>
                <li>আমাদের সিল যুক্ত পণ্যের কোনো সমস্যা থাকলে আমরা সমাধান করে দিবো।</li>
                <li>ডেলিভারি সম্পর্কিত কোন অভিযোগ বা পরামর্শ থাকলে সাপোর্টে যোগাযোগ করুন।</li>
              </ol>
              <div className="mt-8 text-center text-xs text-slate-400">
                {`Thank you for doing business with DG Pharma.`}
              </div>
            </div>
          </div>
        </div>
      );
    })()}
  </> : <div className={`min-h-screen w-full flex flex-col justify-center items-center p-6 premium-gradient-bg font-sans text-[#1D2A3B] relative overflow-hidden ${o ? `dark` : ``}`}>
    {/* Floating Medical SVGs Background decoration */}
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
      <div className="absolute top-[10%] left-[10%] w-16 h-16 text-[#0697A8] opacity-10 float-med-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
          <rect x="2" y="9" width="20" height="6" rx="3" transform="rotate(-45 12 12)" />
          <line x1="8.5" y1="15.5" x2="15.5" y2="8.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="absolute top-[15%] right-[12%] w-12 h-12 text-[#1A56DB] opacity-[0.07] float-med-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m-8-8h16" />
        </svg>
      </div>
      <div className="absolute bottom-[15%] left-[8%] w-14 h-14 text-indigo-500 opacity-10 float-med-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6M10 3v6.342a3 3 0 01-.586 1.79l-4.132 5.51A2 2 0 006.873 20h10.254a2 2 0 001.591-3.21l-4.132-5.51a3 3 0 01-.586-1.79V3" />
        </svg>
      </div>
      <div className="absolute bottom-[12%] right-[10%] w-20 h-20 text-[#0697A8] opacity-[0.08] float-med-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h2.5l2-6 3 12 2-8 1.5 4h4" />
        </svg>
      </div>
      <div className="absolute bottom-[45%] right-[5%] w-12 h-12 text-indigo-500 opacity-[0.08] float-med-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5C6 12 8.5 12 10.5 10.5s4.5-1.5 6 0m-12 3c1.5 1.5 4 1.5 6 0s4.5-1.5 6 0M12 3v18M7.5 7.5v9M16.5 7.5v9" />
        </svg>
      </div>
      <div className="absolute top-[48%] left-[4%] w-10 h-10 text-[#0697A8] opacity-10 float-med-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      </div>
    </div>

    {e === `login` && (
      <div className="w-full max-w-[420px] bg-white rounded-[32px] border border-[#E2E8F0] shadow-[0_12px_40px_rgba(0,0,0,0.03)] p-8 sm:p-10 flex flex-col justify-center relative overflow-hidden transition-all duration-300 z-10">
        <div className="flex flex-col items-center mb-8">
          <img src={logoUrl} className="h-10 w-auto object-contain" alt="DG Pharma Logo" />
          <p className="text-xs font-semibold text-[#64748B] mt-4">{`Sign in to access your dashboard`}</p>
        </div>
        <form onSubmit={async e => {
          e.preventDefault();
          setLoginError('');
          setLoginLoading(true);
          const cleanEmail = qe.trim().toLowerCase();
          const cleanPass = Ye.trim();

          try {
            let n = i.find(u => u.email.toLowerCase() === cleanEmail && (u.password?.trim() === cleanPass || u.password?.trim().toLowerCase() === cleanPass.toLowerCase()));

            // 1. Authenticate against Supabase buyers table directly
            if (!n) {
              try {
                let { data: buyerRow } = await supabase
                  .from('buyers')
                  .select('*')
                  .ilike('email', cleanEmail)
                  .maybeSingle();

                if (buyerRow) {
                  const storedPass = (buyerRow.password || '').trim();
                  const passMatches = storedPass === cleanPass ||
                    storedPass.toLowerCase() === cleanPass.toLowerCase() ||
                    !storedPass;

                  if (passMatches) {
                    // Auto-heal password if was empty, missing, or differed only by casing
                    if (!storedPass || storedPass !== cleanPass) {
                      try {
                        await supabase.from('buyers').update({ password: cleanPass }).eq('id', buyerRow.id);
                      } catch (updateErr) {
                        console.log('Auto-updating password for buyer:', updateErr);
                      }
                    }
                    n = {
                      id: buyerRow.pharmacy_id || buyerRow.id,
                      email: buyerRow.email,
                      password: cleanPass,
                      role: 'buyer',
                      status: buyerRow.status || 'Pending',
                      name: buyerRow.name || 'Verified Pharmacy',
                      ownerName: buyerRow.owner_name || buyerRow.contact_person,
                      pharmacyId: buyerRow.pharmacy_id,
                      buyerUuid: buyerRow.id,
                      licenseNumber: buyerRow.license_number,
                      phone: buyerRow.phone,
                      location: buyerRow.address,
                      address: buyerRow.address,
                      creditLimit: buyerRow.credit_limit || 50000,
                      outstandingBalance: buyerRow.outstanding_balance || 0
                    };
                    a(prev => [...prev.filter(u => u.email.toLowerCase() !== cleanEmail), n]);
                    try {
                      const saved = JSON.parse(localStorage.getItem('dg_users') || '[]');
                      localStorage.setItem('dg_users', JSON.stringify([...saved.filter(u => u.email.toLowerCase() !== cleanEmail), n]));
                    } catch { }
                  }
                } else {
                  // Fallback: Check if the pharmacy was registered in pharmacy_registrations
                  const { data: regRow } = await supabase
                    .from('pharmacy_registrations')
                    .select('*')
                    .ilike('email', cleanEmail)
                    .maybeSingle();

                  if (regRow) {
                    const newBuyer = {
                      name: regRow.name || 'Verified Pharmacy',
                      license_number: regRow.license_number,
                      contact_person: regRow.owner_name,
                      owner_name: regRow.owner_name,
                      email: cleanEmail,
                      password: cleanPass,
                      phone: regRow.phone || '01711111111',
                      address: regRow.location || 'Dhaka',
                      address_line1: regRow.address_line1,
                      address_line2: regRow.address_line2,
                      city: regRow.city,
                      division: regRow.division,
                      postal_code: regRow.postal_code,
                      pharmacy_id: regRow.id,
                      trade_license: regRow.trade_license,
                      drug_license_file: regRow.drug_license_file,
                      status: regRow.status || 'Approved',
                      credit_limit: 50000,
                      outstanding_balance: 0
                    };

                    try {
                      await supabase.from('buyers').upsert([newBuyer], { onConflict: 'email' });
                    } catch (insErr) {
                      console.log('Error migrating registration to buyers table:', insErr);
                    }

                    n = {
                      id: regRow.id,
                      email: cleanEmail,
                      password: cleanPass,
                      role: 'buyer',
                      status: regRow.status || 'Approved',
                      name: regRow.name || 'Verified Pharmacy',
                      ownerName: regRow.owner_name,
                      pharmacyId: regRow.id,
                      licenseNumber: regRow.license_number,
                      phone: regRow.phone,
                      location: regRow.location,
                      address: regRow.location,
                      creditLimit: 50000,
                      outstandingBalance: 0
                    };
                    a(prev => [...prev.filter(u => u.email.toLowerCase() !== cleanEmail), n]);
                    try {
                      const saved = JSON.parse(localStorage.getItem('dg_users') || '[]');
                      localStorage.setItem('dg_users', JSON.stringify([...saved.filter(u => u.email.toLowerCase() !== cleanEmail), n]));
                    } catch { }
                  }
                }
              } catch (err) {
                console.log('Supabase buyers table login check error:', err);
              }
            }

            // 2. Admin users table check (checked first to avoid auth 400 errors for admin profiles)
            if (!n) {
              try {
                let adminRow = null;
                const { data: dbAdminRow } = await supabase
                  .from('admin_users')
                  .select('*')
                  .ilike('email', cleanEmail)
                  .maybeSingle();

                if (dbAdminRow) {
                  adminRow = dbAdminRow;
                } else {
                  // Fallback check in local adminStaffUsers
                  const localStaff = adminStaffUsers.find(u => u.email && u.email.toLowerCase() === cleanEmail);
                  if (localStaff) adminRow = localStaff;
                }

                if (adminRow) {
                  const storedAdminPass = (adminRow.password || '').trim();
                  if (storedAdminPass === cleanPass || !storedAdminPass) {
                    if (adminRow.status === 'Inactive') {
                      setLoginError('Your admin account has been deactivated. Please contact the administrator.');
                      setLoginLoading(false);
                      return;
                    }
                    const isSuper = adminRow.is_super_admin || adminRow.isSuperAdmin || cleanEmail === 'admin@dgpharma.shop' || cleanEmail === 'admin@dgpharma.com' || adminRow.role_id === 'role_superadmin' || adminRow.roleId === 'role_superadmin';
                    n = {
                      id: adminRow.id,
                      email: adminRow.email,
                      role: 'admin',
                      status: 'Approved',
                      name: adminRow.name || 'DG Pharma Administrator',
                      phone: adminRow.phone || '',
                      roleId: adminRow.role_id || adminRow.roleId || (isSuper ? 'role_superadmin' : 'role_inventory'),
                      isSuperAdmin: isSuper
                    };
                    a(prev => [...prev.filter(u => u.email.toLowerCase() !== cleanEmail), n]);
                  }
                }
              } catch (err) {
                console.log('Supabase admin_users table check:', err);
              }
            }

            // 3. Supabase Auth fallback
            if (!n) {
              try {
                const { data: authData } = await supabase.auth.signInWithPassword({
                  email: cleanEmail,
                  password: cleanPass
                });
                if (authData?.user) {
                  const isAdmin = authData.user.user_metadata?.role === 'admin' || cleanEmail.startsWith('admin@') || cleanEmail.includes('admin');
                  n = {
                    id: authData.user.id,
                    email: authData.user.email,
                    role: isAdmin ? 'admin' : (authData.user.user_metadata?.role || 'buyer'),
                    status: 'Approved',
                    name: authData.user.user_metadata?.name || (isAdmin ? 'DG Pharma Administrator' : 'Verified Pharmacy')
                  };
                  a(prev => [...prev.filter(u => u.email.toLowerCase() !== cleanEmail), n]);
                }
              } catch (err) {
                console.log('Supabase Auth sign-in error:', err);
              }
            }

            if (n && n.role === 'buyer') {
              try {
                const { data: bCheck } = await supabase.from('buyers').select('status, id, name').ilike('email', cleanEmail).maybeSingle();
                if (bCheck) {
                  n.status = bCheck.status;
                  n.buyerUuid = bCheck.id;
                  a(prev => prev.map(u => u.email.toLowerCase() === cleanEmail ? { ...u, status: bCheck.status, buyerUuid: bCheck.id } : u));
                  try {
                    const saved = JSON.parse(localStorage.getItem('dg_users') || '[]');
                    localStorage.setItem('dg_users', JSON.stringify(saved.map(u => u.email.toLowerCase() === cleanEmail ? { ...u, status: bCheck.status, buyerUuid: bCheck.id } : u)));
                  } catch { }
                } else {
                  // Not found in buyers table. Check pharmacy_registrations
                  const { data: regCheck } = await supabase.from('pharmacy_registrations').select('status, rejection_reason').ilike('email', cleanEmail).maybeSingle();
                  if (regCheck) {
                    n.status = regCheck.status;
                    if (regCheck.rejection_reason) n.rejectionReason = regCheck.rejection_reason;
                  } else {
                    // DELETED: Buyer does not exist in buyers AND does not exist in pharmacy_registrations!
                    console.warn(`Buyer ${cleanEmail} does not exist in database (deleted). Purging local cache.`);
                    a(prev => prev.filter(u => u.email.toLowerCase() !== cleanEmail));
                    try {
                      const saved = JSON.parse(localStorage.getItem('dg_users') || '[]');
                      localStorage.setItem('dg_users', JSON.stringify(saved.filter(u => u.email.toLowerCase() !== cleanEmail)));
                    } catch { }
                    try {
                      localStorage.removeItem('dg_session');
                      await supabase.auth.signOut();
                    } catch { }
                    setLoginError('This buyer account has been deleted and no longer has access to the portal.');
                    setLoginLoading(false);
                    return;
                  }
                }
              } catch (err) {
                console.log('Supabase buyer status check error:', err);
              }
            }

            if (!n) {
              // Check whether email exists in the system to give a helpful message
              let emailFound = i.some(u => u.email.toLowerCase() === cleanEmail);
              if (!emailFound) {
                try {
                  const { data: bRow } = await supabase.from('buyers').select('email').ilike('email', cleanEmail).maybeSingle();
                  if (bRow) emailFound = true;
                  if (!emailFound) {
                    const { data: regRow } = await supabase.from('pharmacy_registrations').select('email').ilike('email', cleanEmail).maybeSingle();
                    if (regRow) emailFound = true;
                  }
                  if (!emailFound) {
                    const { data: admRow } = await supabase.from('admin_users').select('email').ilike('email', cleanEmail).maybeSingle();
                    if (admRow) emailFound = true;
                  }
                } catch { }
              }

              if (emailFound) {
                setLoginError('Incorrect password. Please verify your password or use "Forgot password?" to reset.');
              } else {
                setLoginError('Invalid email or password. No account found for this email address.');
              }
              setLoginLoading(false);
              return;
            }

            if (n.role === 'buyer') {
              if (n.status === 'Pending' || n.status === 'Pending Verification') {
                r(n);
                t('awaiting_approval');
                setLoginLoading(false);
                return;
              } else if (n.status === 'Rejected') {
                try {
                  localStorage.removeItem('dg_session');
                  await supabase.auth.signOut();
                } catch { }
                setLoginError(`Your registration or access has been rejected or revoked. Reason: ${n.rejectionReason || 'Compliance audit / Administrative action.'}`);
                setLoginLoading(false);
                return;
              } else if (n.status === 'Approved') {
                r(n);
                t('authenticated');
                p('buyer');
                k('search');
                l(false);
                Je('');
                Xe('');
                setLoginError('');
                setLoginLoading(false);
                return;
              } else {
                setLoginError('Your buyer account is not active or authorized.');
                setLoginLoading(false);
                return;
              }
            } else if (n.role === 'admin') {
              r(n);
              t('authenticated');
              p('admin');

              // Route to first authorized tab
              const cleanAdmEmail = (n.email || '').trim().toLowerCase();
              const isSuper = n.isSuperAdmin || cleanAdmEmail === 'admin@dgpharma.shop' || cleanAdmEmail === 'admin@dgpharma.com' || n.roleId === 'role_superadmin';
              if (isSuper) {
                ht('approvals');
              } else {
                const userRole = adminRoles.find(r => r.id === n.roleId);
                const perms = userRole?.permissions || [];
                const tabOrder = [
                  { id: 'approvals', perm: 'approvals.view' },
                  { id: 'fulfillment', perm: 'orders.view' },
                  { id: 'inventory', perm: 'inventory.view' },
                  { id: 'stockout', perm: 'inventory.view' },
                  { id: 'deliveryzones', perm: 'deliveryzones.view' },
                  { id: 'special_discount', perm: 'pricing.view' },
                  { id: 'coupons', perm: 'pricing.view' },
                  { id: 'staff_roles', perm: 'users.manage' },
                  { id: 'activity_log', perm: 'activity_log.view' },
                  { id: 'backup', perm: 'backup.manage' },
                  { id: 'analytics', perm: 'analytics.view' }
                ];
                const firstAllowed = tabOrder.find(item => perms.includes(item.perm) || perms.includes('*'));
                ht(firstAllowed ? firstAllowed.id : 'approvals');
              }

              l(false);
              Je('');
              Xe('');
              setLoginError('');

              // Log login activity
              logAdminActivity({
                category: 'AUTHENTICATION',
                action: 'ADMIN_LOGIN',
                details: `Admin/Staff session started for "${n.name || 'Administrator'}" (${n.email})`
              });
            }
          } catch (globalLoginErr) {
            console.error('Login error:', globalLoginErr);
            setLoginError('An unexpected error occurred during login. Please try again.');
          } finally {
            setLoginLoading(false);
          }
        }} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">{`Email Address`}</label>
            <input
              type="email"
              required={!0}
              value={qe}
              onChange={e => { Je(e.target.value); setLoginError(''); }}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              placeholder="Enter your email"
              className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-800 placeholder-slate-300"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">{`Password`}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required={!0}
                value={Ye}
                onChange={e => { Xe(e.target.value); setLoginError(''); }}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                placeholder="••••••••"
                className="w-full pl-4 pr-10 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-800 placeholder-slate-300"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex justify-end pt-2">
              <button type="button" onClick={() => { setShowForgotModal(true); setForgotMsg(null); }} className="text-[10px] font-bold text-[#1A56DB] hover:underline cursor-pointer">{`Forgot password?`}</button>
            </div>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2 animate-in fade-in duration-150">
              <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold leading-tight">{loginError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full bg-[#1A56DB] hover:bg-[#1A56DB]/90 text-white font-bold py-3.5 rounded-xl shadow-md shadow-blue-500/10 transition-all text-xs cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {loginLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              `Sign in`
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-center">
            <p className="text-xs text-slate-500">
              {`New Pharmacy? `}
              <button type="button" onClick={() => t(`register`)} className="text-[#0697A8] font-bold hover:underline cursor-pointer">{`Register your Shop`}</button>
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-center mt-8 pt-6 border-t border-slate-100 space-y-1.5">
          <h4 className="text-[10px] font-black text-slate-800 tracking-widest">{`DG PHARMA`}</h4>
          <p className="text-[9px] text-slate-400 font-bold tracking-wider uppercase">{`PHARMACY INVENTORY MANAGEMENT SOFTWARE`}</p>
          <p className="text-[8px] text-slate-400">{`© 2026 DG Pharma. All rights reserved.`}</p>
        </div>
      </div>
    )}

    {e === `register` && (
      <div className="w-full max-w-[560px] bg-white rounded-[32px] border border-[#E2E8F0] shadow-[0_12px_40px_rgba(0,0,0,0.03)] p-8 sm:p-10 flex flex-col justify-center relative overflow-hidden transition-all duration-300 z-10">
        <div className="flex flex-col items-center mb-6">
          <img src={logoUrl} className="h-10 w-auto object-contain" alt="DG Pharma Logo" />
          <p className="text-xs font-semibold text-[#64748B] mt-4">{`Register New Pharmacy Shop`}</p>
        </div>
        <form noValidate onSubmit={async e => {
          e.preventDefault();
          setRegError('');

          // Explicit field validation
          if (!Ze.trim()) {
            setRegError('Please enter your Pharmacy Name.');
            return;
          }
          if (!$e.trim()) {
            setRegError('Please enter the Owner Full Name.');
            return;
          }
          if (!tt.trim()) {
            setRegError('Please enter your Email Address.');
            return;
          }
          if (!tt.includes('@') || !tt.includes('.')) {
            setRegError('Please enter a valid Email Address.');
            return;
          }
          if (!rt.trim()) {
            setRegError('Please enter your Phone Number.');
            return;
          }
          if (!at.trim()) {
            setRegError('Please enter the DGDA Drug License Number.');
            return;
          }
          if (!st.trim()) {
            setRegError('Please enter the Trade License Number.');
            return;
          }
          if (!regAddressLine1.trim()) {
            setRegError('Please enter Address Line 1.');
            return;
          }
          if (!regCity.trim()) {
            setRegError('Please enter City.');
            return;
          }
          if (!regPostalCode.trim()) {
            setRegError('Please enter Postal Code.');
            return;
          }
          if (!regPassword || regPassword.length < 6) {
            setRegError('Password must be at least 6 characters long.');
            return;
          }
          if (regPassword !== regConfirmPassword) {
            setRegError('Passwords do not match. Please re-check.');
            return;
          }
          setRegSubmitting(true);

          const emailToCheck = tt.trim().toLowerCase();

          try {
            const { data: existingBuyer } = await supabase
              .from('buyers')
              .select('email')
              .eq('email', emailToCheck)
              .maybeSingle();

            if (existingBuyer) {
              setRegError('This email is already registered in the system. Please log in instead.');
              setRegSubmitting(false);
              return;
            }

            const { data: existingReg } = await supabase
              .from('pharmacy_registrations')
              .select('email')
              .eq('email', emailToCheck)
              .maybeSingle();

            if (existingReg) {
              setRegError('A registration application with this email is already pending or registered. Please log in.');
              setRegSubmitting(false);
              return;
            }
          } catch (err) {
            console.log('Error checking existing Supabase registration:', err);
          }

          // If the email only existed in local storage/state from earlier testing, purge it cleanly
          a(prev => {
            const filtered = prev.filter(u => u.email.toLowerCase() !== emailToCheck);
            try {
              localStorage.setItem('dg_users', JSON.stringify(filtered));
            } catch { }
            return filtered;
          });

          const combinedAddress = [
            regAddressLine1.trim(),
            regAddressLine2.trim(),
            regCity.trim(),
            regDivision && regPostalCode ? `${regDivision} - ${regPostalCode.trim()}` : (regDivision || regPostalCode.trim())
          ].filter(Boolean).join(', ');

          let n = {
            email: tt.trim().toLowerCase(),
            password: regPassword.trim(),
            role: `buyer`,
            status: `Pending`,
            pharmacyId: `PHARM-PEND-${Math.floor(100 + Math.random() * 900)}`,
            name: Ze.trim(),
            addressLine1: regAddressLine1.trim(),
            addressLine2: regAddressLine2.trim(),
            city: regCity.trim(),
            division: regDivision,
            postalCode: regPostalCode.trim(),
            location: combinedAddress,
            address: combinedAddress,
            licenseNumber: at.trim(),
            ownerName: $e.trim(),
            phone: rt.trim(),
            tradeLicense: st.trim(),
            drugLicenseFile: dt || `uploaded_drug_license.pdf`
          };

          a(prev => {
            const next = [...prev, n];
            try {
              localStorage.setItem('dg_users', JSON.stringify(next));
            } catch { }
            return next;
          });

          let o = {
            id: n.pharmacyId,
            applyDate: new Date().toISOString().split(`T`)[0],
            name: n.name,
            addressLine1: n.addressLine1,
            addressLine2: n.addressLine2,
            city: n.city,
            division: n.division,
            postalCode: n.postalCode,
            licenseNumber: n.licenseNumber,
            location: combinedAddress,
            address: combinedAddress,
            attachmentStatus: `Uploaded (Unverified)`,
            ownerName: n.ownerName,
            email: n.email,
            phone: n.phone,
            tradeLicense: n.tradeLicense,
            drugLicenseFile: n.drugLicenseFile,
            status: `Pending`
          };
          D(e => [o, ...e]);

          let s = {
            id: Date.now(),
            text: `New Shop Registration Request: ${n.name} (License ${n.licenseNumber}) submitted for compliance audit.`,
            date: `Just now`,
            read: !1
          };
          w(e => [s, ...e]);
          r(n);
          t(`awaiting_approval`);

          // Asynchronously write to Supabase
          try {
            await supabase.from('pharmacy_registrations').insert([{
              id: n.pharmacyId,
              name: n.name,
              owner_name: n.ownerName,
              email: n.email,
              phone: n.phone,
              license_number: n.licenseNumber,
              trade_license: n.tradeLicense,
              address_line1: n.addressLine1,
              address_line2: n.addressLine2,
              city: n.city,
              division: n.division,
              postal_code: n.postalCode,
              location: n.location,
              drug_license_file: n.drugLicenseFile,
              attachment_status: 'Uploaded (Unverified)',
              status: 'Pending'
            }]);
          } catch (err) {
            console.error('Error inserting to Supabase pharmacy_registrations:', err);
          }

          try {
            await supabase.from('buyers').upsert([{
              name: n.name,
              license_number: n.licenseNumber,
              contact_person: n.ownerName,
              owner_name: n.ownerName,
              email: n.email,
              password: n.password,
              phone: n.phone,
              address: n.location,
              address_line1: n.addressLine1,
              address_line2: n.addressLine2,
              city: n.city,
              division: n.division,
              postal_code: n.postalCode,
              pharmacy_id: n.pharmacyId,
              trade_license: n.tradeLicense,
              drug_license_file: n.drugLicenseFile,
              status: 'Pending',
              credit_limit: 50000,
              outstanding_balance: 0
            }], { onConflict: 'email' });
          } catch (err) {
            console.error('Error inserting to Supabase buyers:', err);
          }

          try {
            await supabase.auth.signUp({
              email: n.email,
              password: n.password,
              options: {
                data: {
                  name: n.name,
                  role: 'buyer',
                  pharmacy_id: n.pharmacyId
                }
              }
            });
          } catch (err) {
            console.log('Supabase Auth signUp note:', err);
          } finally {
            setRegSubmitting(false);
          }
        }} className="space-y-4 max-h-[68vh] overflow-y-auto pr-1 sm:pr-2">
          {/* 1. Pharmacy Name */}
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">{`Pharmacy / Shop Name *`}</label>
            <input
              type="text"
              value={Ze}
              onChange={e => Qe(e.target.value)}
              placeholder="e.g. Lazz Pharma"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* 2. Owner Full Name */}
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">{`Owner / Contact Person Full Name *`}</label>
            <input
              type="text"
              value={$e}
              onChange={e => et(e.target.value)}
              placeholder="e.g. Lutfur Rahman"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* 3. Email Address */}
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">{`Email Address *`}</label>
            <input
              type="email"
              value={tt}
              onChange={e => nt(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              placeholder="contact@pharmacy.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* 4. Phone Number */}
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">{`Phone Number *`}</label>
            <input
              type="tel"
              value={rt}
              onChange={e => it(e.target.value)}
              placeholder="+88017XXXXXXXX"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* 5. DGDA Drug License Number */}
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">{`DGDA Drug License Number *`}</label>
            <input
              type="text"
              value={at}
              onChange={e => ot(e.target.value)}
              placeholder="e.g. DGDA-2026-9912"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 font-mono placeholder-slate-400"
            />
          </div>

          {/* 6. Trade License Number */}
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">{`Trade License Number *`}</label>
            <input
              type="text"
              value={st}
              onChange={e => ct(e.target.value)}
              placeholder="e.g. TR-MIR-11920"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 font-mono placeholder-slate-400"
            />
          </div>

          {/* 7. Pharmacy Physical Store Address Section */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[11px] font-bold text-[#1D2A3B] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#1A56DB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {`Pharmacy Physical Store Address`}
            </p>
            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">{`Address Line 1 *`}</label>
                <input
                  type="text"
                  value={regAddressLine1}
                  onChange={e => setRegAddressLine1(e.target.value)}
                  placeholder="e.g. House #12, Road #4"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">{`Address Line 2 (Optional)`}</label>
                <input
                  type="text"
                  value={regAddressLine2}
                  onChange={e => setRegAddressLine2(e.target.value)}
                  placeholder="e.g. Block-D, Sector-3"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">{`City / Area *`}</label>
                <input
                  type="text"
                  value={regCity}
                  onChange={e => setRegCity(e.target.value)}
                  placeholder="e.g. Uttara / Banani"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">{`Division *`}</label>
                <select
                  value={regDivision}
                  onChange={e => setRegDivision(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                >
                  <option value="Dhaka">{`Dhaka`}</option>
                  <option value="Chittagong">{`Chittagong`}</option>
                  <option value="Rajshahi">{`Rajshahi`}</option>
                  <option value="Khulna">{`Khulna`}</option>
                  <option value="Barisal">{`Barisal`}</option>
                  <option value="Sylhet">{`Sylhet`}</option>
                  <option value="Rangpur">{`Rangpur`}</option>
                  <option value="Mymensingh">{`Mymensingh`}</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">{`Postal Code *`}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={regPostalCode}
                  onChange={e => setRegPostalCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 1230"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>
          </div>

          {/* 8. Drug License PDF Copy Upload */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>{`DGDA Drug License PDF Copy *`}</span>
              <span className="text-[10px] text-slate-400 font-normal">{`Max 5 MB (PDF)`}</span>
            </label>
            <input
              type="file"
              id="drugLicensePdfInput"
              accept="application/pdf,.pdf"
              onChange={handleDrugLicenseUpload}
              className="hidden"
            />
            {dt && dt !== `uploaded_drug_license.pdf` ? (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1D2A3B] truncate">{pdfFileName || `License Document.pdf`}</p>
                    <p className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                      <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {`Uploaded to hosting server`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a href={dt} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1.5 bg-white border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg transition-colors">
                    {`View`}
                  </a>
                  <button
                    type="button"
                    onClick={() => document.getElementById('drugLicensePdfInput').click()}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    {`Change`}
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !pdfUploading && document.getElementById('drugLicensePdfInput').click()}
                className={`p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${pdfUploading ? 'border-blue-300 bg-blue-50/40 cursor-wait' : 'border-slate-200 hover:border-[#1A56DB] bg-slate-50/50 hover:bg-white'}`}
              >
                {pdfUploading ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1A56DB]">
                    <svg className="w-4 h-4 animate-spin text-[#1A56DB]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>{`Uploading Drug License PDF to server...`}</span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1A56DB] flex items-center justify-center mb-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-xs font-bold text-[#1D2A3B]">{`Click to upload Drug License PDF`}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{`PDF format • Max size: 5 MB`}</p>
                  </>
                )}
              </div>
            )}
            {pdfUploadError && (
              <p className="text-[11px] text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {pdfUploadError}
              </p>
            )}
          </div>

          {/* 9. Create Password */}
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">{`Create Password * (Min 6 characters)`}</label>
            <input
              type={showRegPassword ? "text" : "password"}
              value={regPassword}
              onChange={e => setRegPassword(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              placeholder="Create password"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* 10. Confirm Password */}
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">{`Confirm Password *`}</label>
            <input
              type={showRegPassword ? "text" : "password"}
              value={regConfirmPassword}
              onChange={e => setRegConfirmPassword(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              placeholder="Re-type password"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="showRegPass"
              checked={showRegPassword}
              onChange={() => setShowRegPassword(!showRegPassword)}
              className="rounded border-[#CBD5E1] text-[#0697A8] focus:ring-[#0697A8] w-4 h-4 cursor-pointer"
            />
            <label htmlFor="showRegPass" className="text-xs text-slate-600 font-medium cursor-pointer select-none">
              Show passwords
            </label>
          </div>
          {regError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2 animate-in fade-in duration-150">
              <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold leading-tight">{regError}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={regSubmitting || pdfUploading}
            className="w-full bg-[#1A56DB] hover:bg-[#1A56DB]/90 text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-xs cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {regSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Submitting Registration...</span>
              </>
            ) : (
              `Submit Onboarding Registration`
            )}
          </button>
        </form>
        <div className="text-center pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            {`Already have an account?`}
            {` `}
            <button onClick={() => t(`login`)} className="text-[#1A56DB] font-bold hover:underline cursor-pointer">{`Log In here`}</button>
          </p>
        </div>
      </div>
    )}

    {e === `awaiting_approval` && (
      <div className="w-full max-w-[460px] bg-white rounded-[32px] border border-[#E2E8F0] shadow-[0_12px_40px_rgba(0,0,0,0.03)] p-8 sm:p-10 flex flex-col justify-center relative overflow-hidden transition-all duration-300 text-center z-10">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto border-4 border-amber-50 shadow-md">
          <svg className="w-8 h-8 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="space-y-2 mt-4">
          <h3 className="text-lg font-bold text-[#1D2A3B]">{`Application Awaiting Compliance Verification`}</h3>
          <p className="text-xs text-[#0697A8] font-bold font-mono">{`Status: Pending Auditor Review`}</p>
        </div>
        <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-2xl text-left text-xs space-y-2 mt-4">
          <p className="text-[#64748B] leading-relaxed">
            {`Thank you for registering `}
            <span className="font-bold text-[#1D2A3B]">{n?.name}</span>
            {`. Your drug license number `}
            <span className="font-mono font-bold text-[#0697A8]">
              {n?.licenseNumber}
            </span>
            {` has been submitted to the DGDA database compliance queue.`}
          </p>
          <p className="text-[10px] text-[#64748B] italic">
            {`Location: `}
            {n?.location}
            {` | Owner: `}
            {n?.ownerName}
          </p>
        </div>
        <div className="pt-4 border-t border-slate-100 space-y-3 mt-4">
          <button onClick={() => t(`login`)} className="w-full bg-[#0697A8] hover:bg-[#058291] text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-sm">{`Return to Login Page`}</button>
        </div>
      </div>
    )}

    {showForgotModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
          <button
            type="button"
            onClick={() => { setShowForgotModal(false); setForgotMsg(null); setForgotEmail(''); }}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="w-12 h-12 bg-blue-50 text-[#1A56DB] rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>

          <h3 className="text-lg font-bold text-center text-[#1D2A3B] mb-1">{`Forgot Your Password?`}</h3>
          <p className="text-xs text-slate-500 text-center mb-6">
            {`Enter your registered pharmacy or admin email address to receive password reset instructions.`}
          </p>

          {forgotMsg && (
            <div className={`p-3.5 rounded-xl text-xs mb-4 flex items-start gap-2.5 ${forgotMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {forgotMsg.type === 'success' ? (
                <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{forgotMsg.text}</span>
            </div>
          )}

          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!forgotEmail.trim()) return;
            setForgotLoading(true);
            setForgotMsg(null);
            const targetEmail = forgotEmail.trim().toLowerCase();
            try {
              const { error } = await supabase.auth.resetPasswordForEmail(targetEmail);
              if (error) {
                setForgotMsg({
                  type: 'success',
                  text: `Password reset request registered for ${targetEmail}. If an account exists, verification instructions have been dispatched.`
                });
              } else {
                setForgotMsg({
                  type: 'success',
                  text: `A password reset link has been dispatched to ${targetEmail}. Please check your inbox and spam folder.`
                });
              }
            } catch (err) {
              setForgotMsg({
                type: 'success',
                text: `Reset request recorded for ${targetEmail}. Please check your email or contact support@dgpharma.com.`
              });
            } finally {
              setForgotLoading(false);
            }
          }} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">{`Registered Email`}</label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="pharmacy@domain.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
              />
            </div>
            <button
              type="submit"
              disabled={forgotLoading}
              className="w-full bg-[#1A56DB] hover:bg-[#1A56DB]/90 text-white font-bold py-3 rounded-xl text-xs transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {forgotLoading ? 'Processing...' : 'Send Password Reset Link'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForgotModal(false); setForgotMsg(null); setForgotEmail(''); }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
            >
              {`Back to Sign In`}
            </button>
          </form>
        </div>
      </div>
    )}
  </div>;
}