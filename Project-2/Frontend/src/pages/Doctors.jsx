import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import doc1 from '../assets/doc1.png'
import doc2 from '../assets/doc2.png'
import doc3 from '../assets/doc3.png'
import doc4 from '../assets/doc4.png'
import doc5 from '../assets/doc5.png'
import doc6 from '../assets/doc6.png'
import doc7 from '../assets/doc7.png'
import doc8 from '../assets/doc8.png'
import doc9 from '../assets/doc9.png'
import doc10 from '../assets/doc10.png'
import doc11 from '../assets/doc11.png'
import doc12 from '../assets/doc12.png'
import doc13 from '../assets/doc13.png'
import doc14 from '../assets/doc14.png'
import doc15 from '../assets/doc15.png'

const TopDoctors = () => {

const navigate = useNavigate()

        const { doctors, currencySymbol, backendUrl, getDoctosData } = useContext(AppContext)
        const DocImages  = {
            "doc1" : doc1,
            "doc2" : doc2,
            "doc3" : doc3,
            "doc4" : doc4,
            "doc5" : doc5,
            "doc6" : doc6,
            "doc7" : doc7,
            "doc8" : doc8,
            "doc9" : doc9,
            "doc10" : doc10,
            "doc11" : doc11,
            "doc12" : doc12,
            "doc13" : doc13,
            "doc14" : doc14,
            "doc15" : doc15,
        }
  return (
    <div className='flex flex-col items-center gap-4 my-16 text-grey-900 md:mx-10'>
        <h1 className='text-3xl text-green-600 font-medium'>OUR TEAM</h1>
        <p className='sm:w-1/3 text-green-600 text-center text-sm'>Simply browse through list of trusted doctors.</p>
        <div className='w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
            {doctors.map((item,index)=>(
                <div onClick={()=>navigate(`/appointment/doc${item.id}`)} className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'>
                    <img className='bg-blue-50' src= { DocImages[item.image]} alt="doctor" />
                    <div className='p-4'>
                        <div className='flex items-center gap-2 text-sm text-center text-green-500'>
                            <p className='w-2 h-2 bg-green-500 rounded-full'></p><p>Available</p>
                        </div>
                        <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
                        <p className='text-gray-600 text-sm'>{item.speciality}</p>
                    </div>
                </div>
            ))}
        </div>
      
    </div>
  )
}

export default TopDoctors
