import React, { useState, useEffect } from 'react'
import Image from './Image'
import api from '../utils/api'
import { PulseLoader } from 'react-spinners'
import toast from 'react-hot-toast'

const BackgroundImages = ({ setImage, type, searchQuery = "" }) => {
    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const get_images = async () => {
            try {
                setLoading(true)
                const { data } = await api.get('/api/background-images')
                
                // Handle response structure: { success: true, data: { images: [...] } }
                const imageList = Array.isArray(data?.data?.images) 
                  ? data.data.images 
                  : Array.isArray(data?.images) 
                  ? data.images 
                  : [];
                
                setImages(imageList)
                
                if (imageList.length === 0) {
                    toast.error('No background images available')
                }
            } catch (error) {
                console.error('Error fetching background images:', error)
                toast.error('Failed to load background images')
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
        <Image setImage={setImage} type={type} images={images} searchQuery={searchQuery} />
    )
}

export default BackgroundImages