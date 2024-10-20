import { generateClasses } from '@formkit/themes'

const config = {
    config: {
        classes: generateClasses({
            global: {
                wrapper: 'space-y-1 mb-1',
                message: 'text-red-700 text-sm mb-3',
                label: 'block mt-4 font-medium text-lg text-gray-700',
                input: 'w-full p-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'

            },
            submit: {
                input: '$reset text-xl bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium w-full p-3 mt-4 transition-transform transform hover:scale-105 shadow-md'
              },
            file: {
            input: 'block w-full p-3 border-2 border-dashed hover:border-emerald-500 rounded-lg cursor-pointer text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 file:cursor-pointer file:bg-emerald-500 file:text-white file:font-normal file:py-2 file:px-4 file:rounded-full file:border-none hover:file:bg-emerald-600 transition-colors duration-200 ease-in-out',
            },              
        })
    }
}

export default config