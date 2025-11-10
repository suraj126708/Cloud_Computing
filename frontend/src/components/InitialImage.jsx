import React, { useState, useEffect } from 'react'
import Image from './Image'
import api from '../utils/api'
import { PulseLoader } from 'react-spinners'
import toast from 'react-hot-toast'

const InitialImage = ({ add_image, searchQuery = "" }) => {
    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const get_images = async () => {
            try {
                setLoading(true)
                const { data } = await api.get('/api/design-images')
                
                // Handle response structure: { success: true, data: { images: [...] } }
                const imageList = Array.isArray(data?.data?.images) 
                  ? data.data.images 
                  : Array.isArray(data?.images) 
                  ? data.images 
                  : [];
                
                setImages(imageList)
                
                if (imageList.length === 0) {
                    toast.error('No design images available')
                }
            } catch (error) {
                console.error('Error fetching design images:', error)
                toast.error('Failed to load design images')
                setImages([])
            } finally {
                setLoading(false)
            }
        }
        get_images()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[400px]">
                <PulseLoader color="#8b3dff" size={10} />
            </div>
        )
    }

    return (
        <Image add_image={add_image} images={images} searchQuery={searchQuery} />
    )
}

export default InitialImage