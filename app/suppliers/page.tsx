"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, Sun, MapPin, Filter, CheckCircle2, X, 
  Factory, Package, Loader2, ChevronLeft, ChevronRight,
  Send, Mail
} from 'lucide-react';

// --- TYPES ---
interface Product {
  id: number;
  name: string;
  supplier: string;
  supplierId?: number;
  priceEx: number;
  power?: number;
  technology?: string;
  type?: string;
  moq?: string;
  availability?: string;
  city?: string;
  location?: string;
  // Allow dynamic access for location prices (e.g., price_location_Mumbai)
  [key: string]: string | number | undefined; 
}

interface Supplier {
  name: string;
  location: string;
  productCount: number;
  id?: number;
}

interface ApiResponse {
  success: boolean;
  data: Product[];
}

// --- CONFIG ---
const SUPPLIERS_PER_PAGE = 8; 
const TARGET_LOCATIONS = ['Mumbai', 'Delhi', 'Kolkata', 'Chennai', 'Bangalore'];

const FILTERS_DATA = {
    technologies: ['Mono PERC', 'TOPCon', 'HJT', 'Polycrystalline'],
    locations: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai', 'Bangalore', 'North India', 'South India'] 
};

// --- MODAL COMPONENT ---
const ProductDetailModal = ({ product, onClose }: { product: Product | null, onClose: () => void }) => {
    // 1. Hooks (Always called unconditionally)
    const [view, setView] = useState<'details' | 'form' | 'success'>('details');
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (product) {
            setView('details');
            setEmail('');
            setSending(false);
        }
    }, [product]);

    // 2. Safe Return
    if (!product) return null;

    const handleSendInquiry = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        try {
            const res = await fetch('/api/contact-supplier', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userEmail: email, product: product })
            });
            
            if (res.ok) {
                setView('success');
            } else {
                alert("Failed to send inquiry. Please try again.");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Modal Header */}
                <div className="relative h-32 bg-slate-900 flex items-center justify-center shrink-0">
                    <Sun size={48} className="text-orange-500" />
                    <button onClick={onClose} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-all">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    {/* VIEW 1: PRODUCT DETAILS */}
                    {view === 'details' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold text-slate-800 mb-1">{product.name}</h2>
                            <p className="text-sm text-slate-500 mb-6 flex items-center gap-2">
                                <Factory size={14}/> {product.supplier}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Ex-Factory Price</span>
                                    <div className="text-lg font-bold text-slate-900">₹{product.priceEx}<span className="text-xs font-normal text-slate-500">/Wp</span></div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Power Output</span>
                                    <div className="text-lg font-bold text-slate-900">
                                        {product.power} Wp
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-2 mb-6 text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
                                <div className="flex justify-between border-b border-slate-200 pb-2">
                                    <span>Technology</span>
                                    <span className="font-semibold">{product.technology || '-'}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200 pb-2">
                                    <span>Minimum Order</span>
                                    <span className="font-semibold">{product.moq || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Availability</span>
                                    <span className="font-semibold text-green-600">{product.availability ? `${product.availability} Days` : 'Ready Stock'}</span>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setView('form')}
                                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-500/20"
                            >
                                <Mail size={16}/> Contact Supplier
                            </button>
                        </div>
                    )}

                    {/* VIEW 2: EMAIL FORM */}
                    {view === 'form' && (
                        <form onSubmit={handleSendInquiry} className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="mb-6 text-center">
                                <h3 className="text-lg font-bold text-slate-800">Contact {product.supplier}</h3>
                                <p className="text-xs text-slate-500 mt-1">Enter your email to request a formal quote for <strong>{product.name}</strong>.</p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase mb-1 block">Your Email Address</label>
                                    <input 
                                        type="email" 
                                        required
                                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setView('details')}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg transition-colors"
                                >
                                    Back
                                </button>
                                <button 
                                    type="submit"
                                    disabled={sending}
                                    className="flex-[2] py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
                                >
                                    {sending ? <Loader2 size={18} className="animate-spin"/> : <><Send size={16}/> Send Inquiry</>}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* VIEW 3: SUCCESS */}
                    {view === 'success' && (
                        <div className="text-center py-8 animate-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Inquiry Sent!</h3>
                            <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
                                The supplier has been notified. They will contact <strong>{email}</strong> shortly.
                            </p>
                            <button 
                                onClick={onClose}
                                className="px-8 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---
export default function SolarMarketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSupplier, setActiveSupplier] = useState<Supplier | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [filters, setFilters] = useState({
      location: 'All',
      technology: 'All',
      maxPrice: 10000 
  });

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchMarketData = async () => {
        try {
            const res = await fetch('/api/marketplace');
            if(!res.ok) throw new Error("Failed to fetch");
            const json: ApiResponse = await res.json();
            
            if(json.success) {
                setProducts(json.data);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchMarketData();
  }, []);

  // --- DERIVED DATA ---
  
  // 1. Get Unique Suppliers 
  const suppliersList = useMemo(() => {
    const unique = new Map<string, Supplier>();

    products.forEach(item => {
        const pLoc = (item.city || item.location || '').toLowerCase();
        const pTech = (item.technology || '').toLowerCase();
        
        const rawPrice = Number(item.priceEx);
        const pPrice = isNaN(rawPrice) ? 0 : rawPrice;

        const filterLoc = filters.location.toLowerCase();
        const matchesLoc = filters.location === 'All' || pLoc.includes(filterLoc);

        const filterTech = filters.technology.toLowerCase();
        const matchesTech = filters.technology === 'All' || pTech.includes(filterTech);

        const matchesPrice = pPrice === 0 || pPrice <= filters.maxPrice;

        if (matchesLoc && matchesTech && matchesPrice) {
            const supplierName = item.supplier || "Unknown Supplier";
            
            if (!unique.has(supplierName)) {
                unique.set(supplierName, {
                    name: supplierName,
                    location: item.city || item.location || "India", 
                    productCount: 0,
                    id: item.supplierId
                });
            }
            const supplier = unique.get(supplierName);
            if (supplier) {
                supplier.productCount += 1;
            }
        }
    });
    return Array.from(unique.values());
  }, [products, filters]);

  // 2. Pagination Logic
  const totalPages = Math.ceil(suppliersList.length / SUPPLIERS_PER_PAGE);
  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * SUPPLIERS_PER_PAGE;
    return suppliersList.slice(start, start + SUPPLIERS_PER_PAGE);
  }, [suppliersList, currentPage]);

  // 3. Filter Products for the Selected Supplier
  const supplierProducts = useMemo(() => {
    if (!activeSupplier) return [];
    return products.filter(p => {
        const pSupplier = p.supplier || "Unknown Supplier";
        return pSupplier === activeSupplier.name;
    });
  }, [products, activeSupplier]);

  // --- HANDLERS ---
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
        setCurrentPage(newPage);
    }
  };

  if (loading) {
      return (
        <div className="w-full h-screen bg-slate-50 flex items-center justify-center text-slate-400">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-orange-500" size={32} />
                <span className="text-sm font-medium">Loading Solar Market...</span>
            </div>
        </div>
      );
  }

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col font-sans overflow-hidden text-slate-800">
        
        {/* --- HEADER --- */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-30 shrink-0 h-16">
            <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-1.5 rounded-lg shadow-sm"><Sun size={20} className="text-white"/></div>
                <h1 className="text-lg font-bold tracking-tight text-slate-800">SolarChain Market</h1>
            </div>
            
            <div className="flex items-center gap-2">
                {activeSupplier && (
                    <button 
                        onClick={() => setActiveSupplier(null)} 
                        className="text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg flex items-center gap-1 transition-colors"
                    >
                        <ArrowLeft size={14}/> Back to Suppliers
                    </button>
                )}
            </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
            
            {/* --- SIDEBAR FILTERS --- */}
            <div className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex shrink-0 z-20 shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
                <div className="p-5 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-slate-800 font-bold mb-1">
                        <Filter size={16}/> <span className="text-sm">Filters</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Refine supplier search</p>
                </div>

                <div className="p-5 space-y-6 overflow-y-auto flex-1">
                    {/* Location */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Region</label>
                        <select 
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs font-medium outline-none focus:border-orange-500 cursor-pointer text-slate-600"
                            value={filters.location}
                            onChange={e => { setFilters({...filters, location: e.target.value}); setCurrentPage(1); }}
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
                                <input type="radio" name="tech" className="hidden" checked={filters.technology === 'All'} onChange={() => { setFilters({...filters, technology: 'All'}); setCurrentPage(1); }} />
                                <div className={`w-1.5 h-1.5 rounded-full ${filters.technology === 'All' ? 'bg-orange-500' : 'bg-slate-300'}`}></div>
                                Any
                            </label>
                            {FILTERS_DATA.technologies.map(tech => (
                                <label key={tech} className={`flex items-center gap-2 text-xs cursor-pointer px-2 py-1.5 rounded transition-colors ${filters.technology === tech ? 'bg-orange-50 text-orange-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
                                    <input type="radio" name="tech" className="hidden" checked={filters.technology === tech} onChange={() => { setFilters({...filters, technology: tech}); setCurrentPage(1); }} />
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
                            type="range" min="10" max="10000" step="10" 
                            value={filters.maxPrice} 
                            onChange={e => { setFilters({...filters, maxPrice: Number(e.target.value)}); setCurrentPage(1); }}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                            <span>₹10</span>
                            <span>₹10000</span>
                        </div>
                    </div>
                </div>
                
                <div className="p-4 border-t border-slate-200">
                    <button 
                        onClick={() => { setFilters({location: 'All', technology: 'All', maxPrice: 10000}); setCurrentPage(1); }}
                        className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded transition-colors"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 overflow-hidden bg-slate-50/50 flex flex-col relative">
                
                {/* 1. SUPPLIERS GRID VIEW (DEFAULT) */}
                {!activeSupplier && (
                    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="p-8 pb-4 shrink-0">
                            <h2 className="text-2xl font-bold text-slate-800">Verified Suppliers</h2>
                            <p className="text-sm text-slate-500 mt-1">Found {suppliersList.length} suppliers matching your criteria.</p>
                        </div>
                        
                        <div className="flex-1 overflow-auto p-8 pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {paginatedSuppliers.length === 0 ? (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                                        <Package size={48} className="mb-4 text-slate-300"/>
                                        <p className="text-slate-500">No suppliers found.</p>
                                    </div>
                                ) : (
                                    paginatedSuppliers.map((supplier) => (
                                        <div 
                                            key={supplier.name}
                                            onClick={() => setActiveSupplier(supplier)}
                                            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-xl hover:border-orange-200 cursor-pointer transition-all group flex flex-col h-48 relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <Factory size={80} className="text-slate-800"/>
                                            </div>

                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xl font-bold text-slate-600 group-hover:from-orange-100 group-hover:to-orange-200 group-hover:text-orange-700 transition-colors shadow-inner">
                                                    {supplier.name.charAt(0)}
                                                </div>
                                                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                                                    <CheckCircle2 size={10}/> Verified
                                                </span>
                                            </div>
                                            
                                            <div className="mt-auto relative z-10">
                                                <h3 className="font-bold text-base text-slate-800 line-clamp-1 group-hover:text-orange-600 transition-colors">{supplier.name}</h3>
                                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 mb-3"><MapPin size={12}/> {supplier.location}</p>
                                                
                                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                                    <span className="text-xs font-semibold text-slate-500">{supplier.productCount} Products</span>
                                                    <span className="text-xs font-bold text-orange-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                                        View Inventory <ArrowLeft size={12} className="rotate-180"/>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        
                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="h-16 border-t border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
                                <span className="text-xs text-slate-400">Page {currentPage} of {totalPages}</span>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded hover:bg-slate-100 disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronLeft size={16}/>
                                    </button>
                                    <button 
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded hover:bg-slate-100 disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronRight size={16}/>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 2. SPECIFIC SUPPLIER PRODUCTS VIEW */}
                {activeSupplier && (
                    <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300 bg-white">
                        
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    {activeSupplier.name}
                                    <CheckCircle2 size={18} className="text-blue-500"/>
                                </h2>
                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                    <MapPin size={12}/> {activeSupplier.location} • <span className="text-orange-600 font-medium">{supplierProducts.length} Listings</span>
                                </p>
                            </div>
                            <button onClick={() => setActiveSupplier(null)} className="md:hidden p-2 bg-white rounded border shadow-sm"><ArrowLeft size={16}/></button>
                        </div>

                        {/* --- PRODUCT TABLE FOR SELECTED SUPPLIER --- */}
                        <div className="flex-1 overflow-auto bg-white">
                             <div className="min-w-max">
                                {/* Header */}
                                <div className="flex h-10 bg-slate-100 border-b border-slate-200 sticky top-0 z-10 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    <div className="w-[200px] px-4 flex items-center border-r border-slate-200">Product Name</div>
                                    <div className="w-[120px] px-4 flex items-center border-r border-slate-200">Technology</div>
                                    <div className="w-[80px] px-4 flex items-center border-r border-slate-200">Power</div>
                                    <div className="w-[80px] px-4 flex items-center border-r border-slate-200">Type</div>
                                    <div className="w-[80px] px-4 flex items-center border-r border-slate-200">MOQ</div>
                                    <div className="w-[100px] px-4 flex items-center border-r border-slate-200 bg-yellow-50/50">Ex-Factory</div>
                                    {TARGET_LOCATIONS.map(city => (
                                        <div key={city} className="w-[100px] px-4 flex items-center border-r border-slate-200 bg-orange-50/30 text-orange-700">@ {city}</div>
                                    ))}
                                    <div className="w-[100px] px-4 flex items-center sticky right-0 bg-slate-100 shadow-[-5px_0_10px_rgba(0,0,0,0.02)]">Action</div>
                                </div>

                                {/* Rows */}
                                {supplierProducts.map((p, i) => (
                                    <div key={p.id} className={`flex h-12 border-b border-slate-100 hover:bg-orange-50/10 transition-colors group ${i % 2 === 0 ? 'bg-white' : 'bg-slate-[2px]'}`}>
                                        <div className="w-[200px] px-4 flex items-center text-xs font-bold text-slate-700 border-r border-slate-100 truncate" title={p.name}>{p.name}</div>
                                        <div className="w-[120px] px-4 flex items-center text-xs text-slate-600 border-r border-slate-100">{p.technology}</div>
                                        <div className="w-[80px] px-4 flex items-center text-xs text-slate-600 border-r border-slate-100">{p.power} Wp</div>
                                        <div className="w-[80px] px-4 flex items-center text-xs text-slate-600 border-r border-slate-100">{p.type}</div>
                                        <div className="w-[80px] px-4 flex items-center text-xs text-slate-600 border-r border-slate-100">{p.moq}</div>
                                        <div className="w-[100px] px-4 flex items-center text-xs font-bold text-slate-800 border-r border-slate-100 bg-yellow-50/10">₹{p.priceEx}</div>
                                        
                                        {TARGET_LOCATIONS.map(city => {
                                            const val = p[`price_location_${city}`];
                                            return (
                                                <div key={city} className="w-[100px] px-4 flex items-center text-xs text-slate-600 border-r border-slate-100 bg-orange-50/5">
                                                    {val ? `₹${val}` : '-'}
                                                </div>
                                            )
                                        })}
                                        
                                        <div className="w-[100px] px-4 flex items-center justify-center sticky right-0 bg-white shadow-[-5px_0_10px_rgba(0,0,0,0.02)] group-hover:bg-white">
                                            <button 
                                                onClick={() => setSelectedProduct(p)}
                                                className="px-3 py-1 bg-slate-800 hover:bg-orange-600 text-white text-[10px] font-bold rounded shadow-sm transition-colors"
                                            >
                                                Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* --- MODAL --- */}
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />

    </div>
  );
}