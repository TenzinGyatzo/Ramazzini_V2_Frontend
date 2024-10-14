import { generateClasses } from '@formkit/themes'

const config = {
    config: {
        classes: generateClasses({
            global: {
                wrapper: 'space-y-1 mb-3',
                message: 'bg-red-500 text-white text-center text-sm p-1 mb-3 rounded-lg',
                label: 'block mb-1 font-medium text-lg text-gray-700',
                input: 'w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400'
            },
            submit:{
                input: '$reset bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-semibold w-full p-3 mt-4'
            }
        })
    }
}

export default config