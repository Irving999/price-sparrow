import { Navigation, Pagination, A11y } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"


export default function ImageCarousel({ title, images }) {
    return (
        <Swiper
            modules={[Navigation, Pagination, A11y]}
            spaceBetween={50}
            navigation
            pagination={{ clickable: true }}
            loop={true}
            className="h-[500px] w-full"
        >
            {images.map((img, i) => (
                <SwiperSlide key={i}>
                    <img
                        src={img}
                        alt={`Image for ${title}`}
                        className="h-full pb-8 w-auto m-auto object-contain"
                    />
                </SwiperSlide>
            ))}
        </Swiper>
    )
}