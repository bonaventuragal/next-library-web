import React, { ChangeEvent, useState } from 'react'
import Link from 'next/link'
import ProductSide from '../../../elements/ProductSide'
import { FormProvider, useForm, SubmitHandler } from 'react-hook-form'
import {
  FirstFormInputs,
  UsernameAvailabilityResponse,
} from '../module-elements/Forms/FirstForm/interface'
import { SecondFormInput } from '../module-elements/Forms/SecondForm/interface'
import { FirstForm, SecondForm } from '../module-elements/Forms'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { BackButton } from '@elements'
import { useRouter } from 'next/router'
import { useAuthContext } from '@contexts'

const RegisterSection: React.FC = () => {
  const { ...methods } = useForm<FirstFormInputs & SecondFormInput>()
  const [activeStep, setActiveStep] = useState<number>(1)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean>(true)
  const router = useRouter()
  const usernamePattern = /^[a-zA-Z0-9_.]+$/

  const { httpRequest } = useAuthContext()

  const onSubmit: SubmitHandler<FirstFormInputs & SecondFormInput> = async (
    data
  ) => {
    if (!data.favoriteGenre || data.favoriteGenre.length < 1) {
      methods.setError('favoriteGenre', {})
      return
    }

    try {
      setIsLoading(true)
      await axios.post('/api/auth/register', data)
      setIsLoading(false)
      toast.success('Successfully registered')
      router.push('/login')
    } catch (err: any) {
      setIsLoading(false)
      toast.error('Failed to register')
    }
  }

  const checkUsernameAvailability = async (username: string) => {
    try {
      const response = await httpRequest<UsernameAvailabilityResponse>({
        method: 'get',
        path: `api/user/check/${username}`,
      })
      console.log(response.data.status)
      return response.data.status
    } catch (err) {
      return false
    }
  }

  const handleUsernameChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const username = event.target.value
    methods.setValue('username', username)

    if (username.trim() !== '') {
      const isUsernameAvailable = await checkUsernameAvailability(username)
      setIsUsernameAvailable(isUsernameAvailable)
      if (!isUsernameAvailable) {
        methods.setError('username', {
          type: 'manual',
          message: 'Username has been used',
        })
      } else if (!username.match(usernamePattern)) {
        methods.setError('username', {
          type: 'manual',
          message:
            'Username should only contain alphanumeric characters, dots, and underscores',
        })
      } else {
        methods.clearErrors('username')
      }
    } else {
      methods.setError('username', {
        type: 'manual',
        message: 'Please fill your username',
      })
    }
  }

  return (
    <section className="w-full lg:shadow-2xl lg:w-4/5 lg:bg-[#ffffff] h-screen lg:h-[90vh] lg:border border-gray-300 rounded-xl flex flex-wrap lg:flex-nowrap flex-col lg:flex-row justify-between group">
      <ProductSide imageUrl="/Register2.png" />
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="w-full lg:w-1/2 order-1 lg:order-2 bg-white"
        >
          <div className="items-center space-y-6 lg:px-12 lg:h-full h-screen px-10 relative z-10 lg:pt-10 2xl:pt-16">
            {activeStep === 1 && (
              <FirstForm handleUsernameChange={handleUsernameChange} />
            )}
            {activeStep === 2 && (
              <div className="flex flex-col pl-7 gap-2">
                <BackButton onClick={() => setActiveStep(1)} className="ml-4" />
                <SecondForm />
              </div>
            )}

            <div className="flex flex-col items-center justify-center gap-2">
              {activeStep === 1 && (
                <button
                  type="button"
                  className="flex items-center shadow-sm w-full lg:w-[80%] hover:shadow-lg shadow-buff hover:bg-opacity-90 rounded-lg text-[12px] md:text-[14px] lg:text-[18px] bg-crayola font-bold justify-center py-2 px-8"
                  onClick={async () => {
                    if (methods.getValues('username').trim() === '') {
                      methods.setError('username', {
                        type: 'manual',
                        message: 'Please fill your username',
                      });
                    } else {
                      const isValid = await methods.trigger(['name', 'username', 'password']);
                      if (isValid) {
                        setActiveStep(2);
                      }
                    }
                  }}
                  disabled={!isUsernameAvailable}
                >
                  Next
                </button>
              )}
              {activeStep === 2 && (
                <button
                  type="submit"
                  className="flex items-center shadow-sm w-full lg:w-[80%] hover:shadow-lg shadow-buff hover:bg-opacity-90 rounded-lg text-[12px] md:text-[14px] lg:text-[18px] bg-crayola font-bold justify-center py-2 px-8"
                  disabled={isLoading}
                >
                  Register
                </button>
              )}

              <span className="text-tiger text-[10px] md:text-[12px] xl:text-[16px]">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-semibold hover:text-crayola hover:underline"
                >
                  Login
                </Link>
              </span>
            </div>
          </div>
        </form>
      </FormProvider>
    </section>
  )
}

export default RegisterSection
