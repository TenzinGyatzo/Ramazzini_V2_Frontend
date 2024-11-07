<script setup>

</script>

<template>
    <div
        class="ring-1 ring-gray-600 border-t-0 bg-gray-50 hover:bg-gray-200 flex justify-between px-2 items-center hover:cursor-pointer transition-all duration-300 ease-in-out hover:translate-x-0.5">
        <div class="flex items-center">
            <div class="mx-2">
                <input class="my-1 transform scale-150" type="checkbox" name="" id="">
            </div>
            <div class="my-1 mx-1">
                <p class="leading-5 text-lg px-1 font-medium">{Tipo de Documento}</p>
                <p class="leading-5 px-1">{fecha}</p>
            </div>
        </div>
        <div class="flex gap-3 md:gap-4 lg:gap-5 mx-2">
            <button type="button" class="hover:scale-110 transition-all duration-100 ease-in-out transform">
                <i class="fa-solid fa-download fa-xl" style="color: #272727"></i>
            </button>
            <button type="button" class="hover:scale-110 transition-all duration-100 ease-in-out transform">
                <i class="fa-regular fa-pen-to-square fa-xl" style="color: #696969"></i>
            </button>
            <button type="button" class="hover:scale-110 transition-all duration-100 ease-in-out transform">
                <i class="fa-solid fa-trash-can fa-xl" style="color: #c43117"></i>
            </button>
        </div>
    </div>
</template>