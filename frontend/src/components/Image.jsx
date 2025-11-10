import React, { useState, useMemo } from 'react'
import { FiImage } from 'react-icons/fi'

const Image = ({ add_image, images, type, setImage, searchQuery = "" }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null)
    
    // Ensure images is always an array
    const imageList = Array.isArray(images) ? images : [];
    
    // Filter images based on search query
    const filteredImages = useMemo(() => {
        if (!searchQuery) return imageList;
        const query = searchQuery.toLowerCase();
        return imageList.filter(img => 
            (img.name && img.name.toLowerCase().includes(query)) ||
            (img.image_url && img.image_url.toLowerCase().includes(query))
        );
    }, [imageList, searchQuery]);
    
    if (filteredImages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                <FiImage className="text-6xl mb-4 opacity-50" />
                <p className="text-lg">
                    {searchQuery ? "No images found" : "No images available"}
                </p>
                <p className="text-sm mt-2">
                    {searchQuery ? "Try a different search term" : "Upload images or check back later"}
                </p>
            </div>
        )
    }
    
    return (
        <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 p-2'>
            {
                filteredImages.map((item, i) => (
                    <div 
                        key={item.id || i} 
                        onClick={() => type === 'background' ? setImage(item.image_url) : add_image(item.image_url)} 
                        className='group relative w-full aspect-square overflow-hidden rounded-lg cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 border-2 border-transparent hover:border-purple-500'
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <img 
                            className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-110' 
                            src={item.image_url} 
                            alt="image"
                            loading="lazy"
                            onError={(e) => {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23333" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E'
                            }}
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-2`}>
                            <span className="text-white text-xs font-medium truncate w-full">
                                {item.name || 'Image'}
                            </span>
                        </div>
                    </div>
                ))
            }
        </div>
    )
}

export default Image