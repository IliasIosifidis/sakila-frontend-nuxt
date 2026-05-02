<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b px-6 py-4">
      <h1 class="text-2xl font-bold text-gray-900">Sakila Film Catalog</h1>
    </header>

    <div class="flex">
      <!-- Left column: filters + actions -->
      <aside class="w-64 bg-white border-r min-h-screen p-6">
        <h2 class="font-semibold text-gray-700 mb-4">Filters</h2>
        <p class="text-sm text-gray-500">Filters will go here</p>
      </aside>

      <!-- Right column: search + results -->
      <main class="flex-1 p-6">
        <div class="mb-6">
          <input
              type="text"
              placeholder="Search films..."
              class="w-full max-w-xl px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <p class="text-gray-500">Films will go here</p>
        </div>
      </main>
    </div>
  </div>
</template>