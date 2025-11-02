import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';

function DetailPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/listings/${encodeURIComponent(name)}`)
      .then(response => {
        setListings(response.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [name]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <button
            onClick={() => navigate('/')}
            className="mb-6 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            ← Back to Map / 地図に戻る
          </button>
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🏢</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">No listings found / リスティングが見つかりません</h1>
            <p className="text-gray-600">This building doesn't have any available units. / この建物には利用可能なユニットがありません</p>
          </div>
        </div>
      </div>
    );
  }

  // Generate SEO data
  const buildingName = name;
  const totalListings = listings.length;
  const minPrice = Math.min(...listings.map(l => l.cost));
  const maxPrice = Math.max(...listings.map(l => l.cost));
  const avgPrice = Math.round(listings.reduce((sum, l) => sum + l.cost, 0) / listings.length);
  const hasPool = listings.some(l => l.has_pool);
  const hasParking = listings.some(l => l.has_parking);
  const hasTopFloor = listings.some(l => l.is_top_floor);
  
  const seoTitle = `${buildingName} - ${totalListings} Available Rental Units | Apartments & Condos for Rent`;
  const seoDescription = `Find ${totalListings} available rental units at ${buildingName}. Prices from ${minPrice.toLocaleString()}¥ to ${maxPrice.toLocaleString()}¥/month. ${hasPool ? 'Swimming pool available. ' : ''}${hasParking ? 'Parking available. ' : ''}${hasTopFloor ? 'Top floor units available. ' : ''}Search apartments, condos, and houses for rent in Japan. Book your viewing today.`;
  const seoKeywords = `${buildingName} rental, ${buildingName} apartments for rent, ${buildingName} condos for rent, ${buildingName} houses for rent, rent in ${buildingName}, ${buildingName} long term rental, Japan rentals, Japan apartments, Japan condos, Japan property rental, ${buildingName} building rentals, Japan accommodation, ${buildingName} listings, apartments for rent Japan, condos for rent Japan`;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://jmichi.com/${encodeURIComponent(buildingName)}`} />
        <meta property="og:site_name" content="Jmichi Real Estate" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://jmichi.com/${encodeURIComponent(buildingName)}`} />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-6xl mx-auto py-6 md:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${listings[0]?.latitude},${listings[0]?.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 hover:underline cursor-pointer">
                {name} 📍
              </h1>
            </a>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 text-sm md:text-base whitespace-nowrap"
            >
              ← Back to Map / 地図に戻る
            </button>
          </div>
          <p className="text-gray-600 text-sm md:text-base">
            {listings.length} available unit{listings.length > 1 ? 's' : ''} / {listings.length}空き室
          </p>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {listings.map(listing => {
            const isExpired = new Date(listing.expires_at) < new Date();
            
            return (
              <div 
                key={listing.id} 
                className={`bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-[1.02] ${
                  isExpired ? 'opacity-60' : ''
                }`}
              >
                {/* Video or Business Photo */}
                <div className="relative aspect-video bg-gray-900">
                  {listing.rental_type === 'business' && listing.business_photo ? (
                    <img 
                      src={listing.business_photo} 
                      alt={`${name} - Business Space`}
                      className="w-full h-full object-cover"
                    />
                  ) : listing.youtube_link ? (
                    <iframe 
                      className="w-full h-full"
                      src={listing.youtube_link.replace('watch?v=', 'embed/')} 
                      title={`${name} - Floor ${listing.floor}`}
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <p className="text-gray-500">No media available</p>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Floor & Status */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Floor {listing.floor} / {listing.floor}階</h2>
                    {isExpired && (
                      <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                        EXPIRED / 期限切れ
                      </span>
                    )}
                  </div>

                  {/* Price & Size */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Monthly Rent / 月額賃料</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {listing.cost.toLocaleString()}¥
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Size / サイズ</p>
                      <p className="text-2xl font-bold text-gray-800">{listing.sqm} sqm</p>
                    </div>
                  </div>


                  {/* Description */}
                  <p className="text-gray-700 mb-4 leading-relaxed">{listing.description}</p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {listing.has_pool && (
                      <span className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                        🏊 Pool / プール
                      </span>
                    )}
                    {listing.has_parking && (
                      <span className="bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                        🚗 Parking / 駐車場
                      </span>
                    )}
                    {listing.is_top_floor && (
                      <span className="bg-purple-50 text-purple-700 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                        🏔️ Top Floor / 最上階
                      </span>
                    )}
                    {listing.thai_only && (
                      <span className="bg-yellow-50 text-yellow-700 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                        🇯🇵 Japanese Only / 日本語のみ
                      </span>
                    )}
                    {listing.six_months && (
                      <span className="bg-orange-50 text-orange-700 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                        📅 6-Month / 6ヶ月契約
                      </span>
                    )}
                  </div>

                  {/* Footer Info */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Listed on / 掲載日: {new Date(listing.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
}

export default DetailPage;
