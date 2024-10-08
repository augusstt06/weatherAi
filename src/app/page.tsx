'use client'
import { useEffect, useState } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import MainTextForm from '@/app/_components/molecules/form/mainTextForm'
import Fallback from '@/app/_components/organisms/fallback/Fallback'
import InitialInputForm from '@/app/_components/organisms/form/initialInputForm'
import WeatherForm from '@/app/_components/organisms/form/weather/weatherForm'
import { fetchWeather } from '@/app/_modules/api'
import { convertEngToKr } from '@/app/_modules/utils/convertKr'
import { locationInputValidator } from '@/app/_modules/utils/inputValidate'
import { weatherClassificationToBackground } from '@/app/_modules/utils/weather'
import { useWeatherStore } from '@/app/_store/weather'
import { type Weather } from '@/app/_type/api'

export default function Home() {
  const queryClient = useQueryClient()
  const { weather, setWeather, setLocation, isCachingDataExist } =
    useWeatherStore()

  const [isMounted, setIsMounted] = useState(false)
  const [isBlinkComplete, setIsBlinkComplete] = useState<boolean>(false)
  const [locationValue, setLocationValue] = useState<string>('')
  const selectArr = ['국내']

  const { mutate, isPending } = useMutation({
    mutationFn: async (locationValue: string) => {
      const weather = await fetchWeather(convertEngToKr(locationValue))
      if (weather === null)
        throw new Error('도시를 찾을수 없습니다 다시 입력해주세요.')
      return weather
    },
    onSuccess: (data: Weather) => {
      setWeather(data)
      queryClient.setQueryData(['weather', data.weather[0].main], data)
      cachingLocation()
    },
    onError: (error) => {
      setLocationValue('')
      alert(error)
    },
  })

  const cachingLocation = () => {
    setLocation(locationValue)
    setLocationValue('')
  }

  const inputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocationValue(e.target.value)
  }
  const selectChangeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {}

  const buttonClickHandler = async () => {
    if (!locationInputValidator(locationValue)) {
      alert('도시를 입력해주세요!')
      return
    }
    mutate(locationValue)
  }

  const sholudWeatherRender = isMounted && weather

  useEffect(() => {
    setIsMounted(true)
  }, [])
  if (isPending) {
    return <Fallback />
  }

  return (
    <main
      className={`grid-row-5 grid ${isMounted && weather && weatherClassificationToBackground(weather.weather[0].main)}`}
    >
      {isMounted && !isCachingDataExist() && (
        <section className="grid-row-2 grid w-full grid-cols-5 row-span-2 gap-8 h-screen">
          <MainTextForm setIsBlinkComplete={setIsBlinkComplete} />
          <InitialInputForm
            inputProps={{
              selectChangeHandler,
              inputChangeHandler,
              selectArr,
              value: locationValue,
              isBlinkComplete,
            }}
            buttonProps={{ buttonClickHandler }}
          />
        </section>
      )}

      {sholudWeatherRender ? (
        <section className="">
          <WeatherForm />
        </section>
      ) : (
        <section></section>
      )}
      <div>{isBlinkComplete}</div>
    </main>
  )
}
