"use client";

import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Search, Sun, MapPin, 
  Filter, CheckCircle2, MessageSquare, X, 
  Factory, FileText, Download, Package
} from 'lucide-react';

// --- MOCK DATABASE (With Location Specific Pricing) ---
const INITIAL_MODULES = [
  {
    id: 1,
    name: "Neo-X High Efficiency 700W",
    supplier: "Solar Tech Solutions",
    location: "North India",
    technology: "TOPCon",
    type: "n-type",
    power: 700,
    moq: "1 MWp",
    qty: 25,
    validity: "2026-06-30",
    availability: 7,
    priceEx: 24.20, // Ex-Factory
    price_location_Mumbai: 25.50,
    price_location_Delhi: 24.80,
    datasheet: "neo_x.pdf",
    panfile: "neo_x.pan",
    description: "Bifacial n-type module, excellent for commercial rooftops."
  },
  {
    id: 2,
    name: "Standard Mono 540W",
    supplier: "Solar Tech Solutions",
    location: "North India",
    technology: "Mono PERC",
    type: "p-type",
    power: 540,
    moq: "500 kWp",
    qty: 120,
    validity: "2025-12-31",
    availability: 3,
    priceEx: 19.00,
    price_location_Mumbai: 20.10,
    price_location_Kolkata: 21.00,
    datasheet: "mono_540.pdf",
    panfile: "mono_540.pan",
    description: "Cost-effective utility scale module."
  },
  {
    id: 3,
    name: "Ultra Black 450W",
    supplier: "GreenEnergy Systems",
    location: "South India",
    technology: "Mono PERC",
    type: "p-type",
    power: 450,
    moq: "100 kWp",
    qty: 50,
    validity: "2026-03-15",
    availability: 14,
    priceEx: 21.50,
    price_location_Bangalore: 22.00,
    price_location_Chennai: 21.80,
    datasheet: "ultra_black.pdf",
    panfile: "ultra.pan",
    description: "All-black aesthetics for residential premium installations."
  },
  {
    id: 4,
    name: "Hyper-Ion HJT 720W",
    supplier: "Rayzon Future",
    location: "West India",
    technology: "HJT",
    type: "n-type",
    power: 720,
    moq: "2 MWp",
    qty: 10,
    validity: "2026-08-01",
    availability: 30,
    priceEx: 28.00,
    price_location_Mumbai: 28.50,
    price_location_Delhi: 29.00,
    datasheet: "hjt_720.pdf",
    panfile: "hjt.pan",
    description: "Next-gen Heterojunction technology."
  }
];

// --- COLUMN CONFIG (Exactly matching Dashboard Layout) ---
const DASHBOARD_COLS = [
  { id: 'technology', label: 'Module Technology', width: 140 },
  { id: 'type', label: 'Type', width: 90 },
  { id: 'power', label: 'Power (Wp)', width: 90 },
  { id: 'moq', label: 'Min Order Qty', width: 110 },
  { id: 'qty', label: 'Qty (MW)', width: 90 },
  { id: 'validity', label: 'Validity', width: 100 },
  { id: 'availability', label: 'Avail (Days)', width: 90 },
  { id: 'datasheet', label: 'Datasheet', width: 80, type: 'file' },
  { id: 'panfile', label: 'PAN File', width: 80, type: 'file' },
  { id: 'priceEx', label: 'Price Ex-Factory', width: 130, isPrice: true },
  // Dynamic location columns will be appended here in render
];

// Specific locations we want to show columns for
const TARGET_LOCATIONS = ['Mumbai', 'Delhi', 'Kolkata', 'Chennai', 'Bangalore'];

const FILTERS_DATA = {
    technologies: ['Mono PERC', 'TOPCon', 'HJT', 'Polycrystalline'],
    locations: ['North India', 'South India', 'West India', 'East India']
};

// --- MODAL COMPONENT ---
const ProductDetailModal = ({ product, onClose }) => {
    if (!product) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="relative h-32 bg-slate-900 flex items-center justify-center shrink-0">
                    <Sun size={48} className="text-orange-500" />
                    <button onClick={onClose} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-all">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-1">{product.name}</h2>
                    <p className="text-sm text-slate-500 mb-6 flex items-center gap-2"><Factory size={14}/> {product.supplier}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                         <div className="p-3 bg-slate-50 rounded border border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Ex-Factory Price</span>
                            <div className="text-lg font-bold text-slate-900">₹{product.priceEx}<span className="text-xs font-normal text-slate-500">/Wp</span></div>
                         </div>
                         <div className="p-3 bg-slate-50 rounded border border-slate-100">
                             {/* Show a relevant location price if available, else generic */}
                            <span className="text-[10px] uppercase font-bold text-slate-400">Price at Mumbai</span>
                            <div className="text-lg font-bold text-slate-900">
                                {product.price_location_Mumbai ? `₹${product.price_location_Mumbai}` : 'N/A'}
                            </div>
                         </div>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-6">{product.description}</p>
                    
                    <button className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                        <MessageSquare size={16}/> Request Formal Quote
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---
export default function SolarMarketplace() {
  const [activeSupplier, setActiveSupplier] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [filters, setFilters] = useState({
      location: 'All',
      technology: 'All',
      maxPrice: 50
  });

  // --- LOGIC ---
  const suppliersList = useMemo(() => {
    const unique = new Map();
    INITIAL_MODULES.forEach(item => {
        if (!unique.has(item.supplier)) {
            unique.set(item.supplier, {
                name: item.supplier,
                location: item.location,
                productCount: 0
            });
        }
        unique.get(item.supplier).productCount += 1;
    });
    return Array.from(unique.values());
  }, []);

  const filteredProducts = useMemo(() => {
    return INITIAL_MODULES.filter(p => {
        const matchesSupplier = activeSupplier ? p.supplier === activeSupplier.name : true;
        const matchesLoc = filters.location === 'All' || p.location === filters.location;
        const matchesTech = filters.technology === 'All' || p.technology === filters.technology;
        const matchesPrice = p.priceEx <= filters.maxPrice;
        return matchesSupplier && matchesLoc && matchesTech && matchesPrice;
    });
  }, [activeSupplier, filters]);

  const visibleSuppliers = useMemo(() => {
      const activeNames = new Set(filteredProducts.map(p => p.supplier));
      return suppliersList.filter(s => activeNames.has(s.name));
  }, [filteredProducts, suppliersList]);

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col font-sans overflow-hidden text-slate-800">
        
        {/* --- HEADER --- */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-30 shrink-0 h-16">
            <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-1.5 rounded-lg shadow-sm"><Sun size={20} className="text-white"/></div>
                <h1 className="text-lg font-bold tracking-tight text-slate-800">SolarChain Market</h1>
            </div>
            {activeSupplier && (
                <button 
                    onClick={() => setActiveSupplier(null)} 
                    className="md:hidden text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg flex items-center gap-1"
                >
                    <ArrowLeft size={14}/> Back
                </button>
            )}
        </div>

        <div className="flex flex-1 overflow-hidden">
            
            {/* --- SIDEBAR FILTERS --- */}
            <div className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex shrink-0 z-20 shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
                <div className="p-5 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-slate-800 font-bold mb-1">
                        <Filter size={16}/> <span className="text-sm">Filters</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Refine your search</p>
                </div>

                <div className="p-5 space-y-6 overflow-y-auto flex-1">
                    {/* Location */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Location</label>
                        <select 
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs font-medium outline-none focus:border-orange-500 cursor-pointer text-slate-600"
                            value={filters.location}
                            onChange={e => setFilters({...filters, location: e.target.value})}
                        >
                            <option value="All">All Locations</option>
                            {FILTERS_DATA.locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                    </div>

                    {/* Tech */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Technology</label>
                        <div className="space-y-1.5">
                            <label className={`flex items-center gap-2 text-xs cursor-pointer px-2 py-1.5 rounded transition-colors ${filters.technology === 'All' ? 'bg-orange-50 text-orange-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
                                <input type="radio" name="tech" className="hidden" checked={filters.technology === 'All'} onChange={() => setFilters({...filters, technology: 'All'})} />
                                <div className={`w-1.5 h-1.5 rounded-full ${filters.technology === 'All' ? 'bg-orange-500' : 'bg-slate-300'}`}></div>
                                Any
                            </label>
                            {FILTERS_DATA.technologies.map(tech => (
                                <label key={tech} className={`flex items-center gap-2 text-xs cursor-pointer px-2 py-1.5 rounded transition-colors ${filters.technology === tech ? 'bg-orange-50 text-orange-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
                                    <input type="radio" name="tech" className="hidden" checked={filters.technology === tech} onChange={() => setFilters({...filters, technology: tech})} />
                                    <div className={`w-1.5 h-1.5 rounded-full ${filters.technology === tech ? 'bg-orange-500' : 'bg-slate-300'}`}></div>
                                    {tech}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Price */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Max Ex-Factory</label>
                             <span className="text-xs font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">₹{filters.maxPrice}</span>
                        </div>
                        <input 
                            type="range" min="10" max="50" 
                            value={filters.maxPrice} 
                            onChange={e => setFilters({...filters, maxPrice: Number(e.target.value)})}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                            <span>₹10</span>
                            <span>₹50</span>
                        </div>
                    </div>
                </div>
                
                <div className="p-4 border-t border-slate-200">
                    <button 
                        onClick={() => setFilters({location: 'All', technology: 'All', maxPrice: 50})}
                        className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded transition-colors"
                    >
                        Reset All
                    </button>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 overflow-hidden bg-slate-50/50 flex flex-col relative">
                
                {/* Header Area for Content */}
                <div className="p-6 pb-2 shrink-0">
                    {activeSupplier ? (
                        <div className="flex items-center gap-3 animate-in slide-in-from-left-2">
                            <button 
                                onClick={() => setActiveSupplier(null)} 
                                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-all shadow-sm hidden md:flex"
                            >
                                <ArrowLeft size={16}/>
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    {activeSupplier.name}
                                    <CheckCircle2 size={16} className="text-blue-500"/>
                                </h2>
                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                    <MapPin size={10}/> {activeSupplier.location} • <span className="text-orange-600 font-medium">{filteredProducts.length} Products Listed</span>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Verified Suppliers</h2>
                            <p className="text-xs text-slate-500 mt-1">Select a supplier to view their real-time inventory.</p>
                        </div>
                    )}
                </div>

                {/* --- CONTENT SWITCHER --- */}
                <div className="flex-1 overflow-auto p-6 pt-2">
                    
                    {/* 1. SUPPLIER GRID VIEW */}
                    {!activeSupplier && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {visibleSuppliers.map(supplier => (
                                <div 
                                    key={supplier.name}
                                    onClick={() => setActiveSupplier(supplier)}
                                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-orange-200 cursor-pointer transition-all group flex flex-col justify-between h-40"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-lg font-bold text-slate-600 group-hover:from-orange-100 group-hover:to-orange-200 group-hover:text-orange-700 transition-colors">
                                                {supplier.name.charAt(0)}
                                            </div>
                                            {supplier.productCount > 0 && <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">Verified</span>}
                                        </div>
                                        <h3 className="font-bold text-sm text-slate-800 line-clamp-1">{supplier.name}</h3>
                                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1"><MapPin size={10}/> {supplier.location}</p>
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-2">
                                        <span className="text-[10px] text-slate-400 font-medium">{supplier.productCount} Products</span>
                                        <span className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                                            <Search size={12}/>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 2. PRODUCT DASHBOARD TABLE VIEW (When Supplier Selected) */}
                    {activeSupplier && (
                        <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden flex flex-col h-full max-h-[600px] animate-in fade-in zoom-in-95 duration-200">
                            
                            <div className="flex flex-1 overflow-hidden relative">
                                
                                {/* A. LEFT FIXED COLUMN (Product Name) */}
                                <div className="w-[200px] flex-shrink-0 border-r border-slate-200 bg-white z-20 flex flex-col shadow-[4px_0_10px_rgba(0,0,0,0.02)]">
                                    <div className="h-10 bg-slate-50 border-b border-slate-200 px-4 flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 sticky top-0">
                                        Product Name
                                    </div>
                                    <div className="overflow-hidden bg-white">
                                        {filteredProducts.map((p, i) => (
                                            <div key={p.id} className={`h-12 border-b border-slate-100 px-4 flex items-center text-xs font-bold text-slate-700 ${i % 2 === 0 ? '' : 'bg-slate-[2px]'}`}>
                                                <span className="truncate" title={p.name}>{p.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* B. RIGHT SCROLLABLE COLUMNS */}
                                <div className="flex-1 overflow-auto bg-white">
                                    <div className="min-w-max flex flex-col">
                                        
                                        {/* Header Row */}
                                        <div className="flex h-10 bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                                            {DASHBOARD_COLS.map(col => (
                                                <div key={col.id} style={{ width: col.width }} className="flex-shrink-0 px-4 flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider border-r border-slate-100 last:border-0">
                                                    {col.label}
                                                </div>
                                            ))}
                                            {/* Dynamic Location Headers */}
                                            {TARGET_LOCATIONS.map(city => (
                                                <div key={city} className="w-[120px] flex-shrink-0 px-4 flex items-center text-[10px] font-bold text-orange-600 uppercase tracking-wider border-r border-orange-100 bg-orange-50/30">
                                                    Price @ {city}
                                                </div>
                                            ))}
                                            {/* Action Header */}
                                            <div className="w-[90px] px-4 flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 sticky right-0 border-l border-slate-200 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] z-20">
                                                Action
                                            </div>
                                        </div>

                                        {/* Data Rows */}
                                        {filteredProducts.map((p, i) => (
                                            <div key={p.id} className={`flex h-12 border-b border-slate-100 hover:bg-orange-50/10 transition-colors group ${i % 2 === 0 ? '' : 'bg-slate-[2px]'}`}>
                                                
                                                {/* Tech */}
                                                <div style={{ width: DASHBOARD_COLS[0].width }} className="flex-shrink-0 px-4 flex items-center text-xs text-slate-600 border-r border-slate-100/50">
                                                    {p.technology}
                                                </div>
                                                {/* Type */}
                                                <div style={{ width: DASHBOARD_COLS[1].width }} className="flex-shrink-0 px-4 flex items-center text-xs text-slate-600 border-r border-slate-100/50">
                                                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-medium">{p.type}</span>
                                                </div>
                                                {/* Power */}
                                                <div style={{ width: DASHBOARD_COLS[2].width }} className="flex-shrink-0 px-4 flex items-center text-xs font-medium text-slate-800 border-r border-slate-100/50">
                                                    {p.power} Wp
                                                </div>
                                                {/* MOQ */}
                                                <div style={{ width: DASHBOARD_COLS[3].width }} className="flex-shrink-0 px-4 flex items-center text-xs text-slate-600 border-r border-slate-100/50">
                                                    {p.moq}
                                                </div>
                                                {/* Qty */}
                                                <div style={{ width: DASHBOARD_COLS[4].width }} className="flex-shrink-0 px-4 flex items-center text-xs text-slate-600 border-r border-slate-100/50">
                                                    {p.qty}
                                                </div>
                                                {/* Validity */}
                                                <div style={{ width: DASHBOARD_COLS[5].width }} className="flex-shrink-0 px-4 flex items-center text-xs text-slate-500 border-r border-slate-100/50 font-mono">
                                                    {p.validity}
                                                </div>
                                                {/* Availability */}
                                                <div style={{ width: DASHBOARD_COLS[6].width }} className="flex-shrink-0 px-4 flex items-center text-xs text-slate-600 border-r border-slate-100/50">
                                                    {p.availability} Days
                                                </div>
                                                {/* Datasheet */}
                                                <div style={{ width: DASHBOARD_COLS[7].width }} className="flex-shrink-0 px-4 flex items-center justify-center border-r border-slate-100/50">
                                                    {p.datasheet ? (
                                                        <span className="text-[10px] font-bold text-blue-600 cursor-pointer hover:underline flex items-center gap-1"><FileText size={10}/> PDF</span>
                                                    ) : <span className="text-slate-300">-</span>}
                                                </div>
                                                {/* PAN File */}
                                                <div style={{ width: DASHBOARD_COLS[8].width }} className="flex-shrink-0 px-4 flex items-center justify-center border-r border-slate-100/50">
                                                    {p.panfile ? (
                                                        <span className="text-[10px] font-bold text-blue-600 cursor-pointer hover:underline flex items-center gap-1"><FileText size={10}/> PAN</span>
                                                    ) : <span className="text-slate-300">-</span>}
                                                </div>
                                                {/* Price Ex-Factory */}
                                                <div style={{ width: DASHBOARD_COLS[9].width }} className="flex-shrink-0 px-4 flex items-center text-xs font-bold text-slate-800 border-r border-slate-100/50 bg-slate-50">
                                                    ₹ {p.priceEx}
                                                </div>

                                                {/* Dynamic Location Prices */}
                                                {TARGET_LOCATIONS.map(city => {
                                                    const priceKey = `price_location_${city}`;
                                                    const price = p[priceKey];
                                                    return (
                                                        <div key={city} className="w-[120px] flex-shrink-0 px-4 flex items-center text-xs text-slate-600 border-r border-orange-100/50 bg-orange-50/10">
                                                            {price ? `₹ ${price}` : <span className="text-slate-300">-</span>}
                                                        </div>
                                                    );
                                                })}

                                                {/* Sticky Action Column */}
                                                <div className="w-[90px] flex-shrink-0 px-2 flex items-center justify-center sticky right-0 bg-white border-l border-slate-200 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] z-10 group-hover:bg-orange-50/20">
                                                    <button 
                                                        onClick={() => setSelectedProduct(p)}
                                                        className="px-2 py-1 bg-slate-800 hover:bg-orange-600 text-white text-[10px] font-bold rounded shadow-sm transition-colors"
                                                    >
                                                        Details
                                                    </button>
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {filteredProducts.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white z-20">
                                    <div className="text-center opacity-50">
                                        <Package size={40} className="mx-auto mb-2 text-slate-300"/>
                                        <p className="text-sm">No modules found matching filters.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* --- MODAL --- */}
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />

    </div>
  );
}