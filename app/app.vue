<template>
  <div class="min-h-screen bg-violet-800">
    <header class="bg-indigo-700 border-b px-6 py-4 shadow-sm">
      <h1 class="text-2xl font-bold text-gray-50">Sakila Film Catalog</h1>
    </header>

    <div class="flex">
      <!-- Left column: filters -->
      <aside class="w-72 border-r min-h-screen p-6 space-y-6">
        <h2 class="font-semibold text-gray-50 text-lg">Filters</h2>

        <!-- Language -->
        <div>
          <label class="block text-sm font-medium text-gray-50 mb-2">Language</label>
          <select
              v-model="store.filters.language"
              @change="store.search()"
              class="w-full px-3 py-2 border bg-white rounded-md text-sm"
          >
            <option value="">All languages</option>
            <option value="English">English</option>
            <option value="Italian">Italian</option>
            <option value="Japanese">Japanese</option>
            <option value="Mandarin">Mandarin</option>
            <option value="French">French</option>
            <option value="German">German</option>
          </select>
        </div>

        <!-- Rating multi-select -->
        <div>
          <label class="block text-sm font-medium text-gray-50 mb-2">Rating</label>
          <div class="space-y-2">
            <label v-for="r in ['G', 'PG', 'PG-13', 'R', 'NC-17']" :key="r" class="flex text-gray-50 items-center gap-2 text-sm">
              <input
                  type="checkbox"
                  :value="r"
                  v-model="store.filters.ratings"
                  @change="store.search()"
                  class="rounded"
              />
              {{ r }}
            </label>
          </div>
        </div>

        <!-- Price bracket -->
        <div>
          <label class="block text-sm font-medium text-gray-50 mb-2">Price</label>
          <div class="space-y-1">
            <label v-for="bracket in [
        { value: '', label: 'Any price' },
        { value: 'cheap', label: 'Cheap (< $2)' },
        { value: 'standard', label: 'Standard ($2-$4)' },
        { value: 'premium', label: 'Premium ($4+)' }
      ]" :key="bracket.value" class="flex text-gray-50 items-center gap-2 text-sm">
              <input
                  type="radio"
                  name="priceBracket"
                  :value="bracket.value"
                  v-model="store.filters.priceBracket"
                  @change="store.search()"
              />
              {{ bracket.label }}
            </label>
          </div>
        </div>

        <!-- Length bracket -->
        <div>
          <label class="block text-sm font-medium text-gray-50 mb-2">Length</label>
          <div class="space-y-1">
            <label v-for="bracket in [
        { value: '', label: 'Any length' },
        { value: 'short', label: 'Short (< 90 min)' },
        { value: 'medium', label: 'Medium (90-120 min)' },
        { value: 'long', label: 'Long (> 120 min)' }
      ]" :key="bracket.value" class="flex text-gray-50 items-center gap-2 text-sm">
              <input
                  type="radio"
                  name="lengthBracket"
                  :value="bracket.value"
                  v-model="store.filters.lengthBracket"
                  @change="store.search()"
              />
              {{ bracket.label }}
            </label>
          </div>
        </div>

        <!-- Clear filters button -->
        <UButton
            block
            color="neutral"
            variant="outline"
            @click="store.clearFilters()"
            class="text-gray-50"
        >
          Clear all filters
        </UButton>
      </aside>

      <!-- Right column: search + results -->
      <main class="flex-1 p-6">
        <!-- Search bar -->
        <!-- Search bar with autocomplete -->
        <div ref="searchContainer" class="mb-6 max-w-xl relative">
          <UInput
              v-model="store.searchQuery"
              placeholder="Search films..."
              size="lg"
              @keyup.enter="onSearchEnter"
              class="bg-white rounded-lg w-full"
          />

          <!-- Autocomplete dropdown -->
          <ul
              v-if="store.autocompleteOpen"
              class="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border z-40 overflow-hidden"
          >
            <li
                v-for="suggestion in store.autocompleteResults"
                :key="suggestion.id"
                class="px-4 py-3 hover:bg-purple-100 cursor-pointer text-sm border-b last:border-b-0"
                @click="onSuggestionClick(suggestion)"
            >
              {{ suggestion.title }}
            </li>
          </ul>
        </div>

        <!-- Films list -->
        <div v-if="store.loading" class="text-white">Loading...</div>

        <div v-else>
          <p class="text-white mb-4">{{ store.totalElements }} films</p>

          <ul class="bg-white rounded-lg shadow divide-y">
            <li
                v-for="film in store.films"
                :key="film.id"
                class="px-4 py-3 bg-purple-50 hover:bg-purple-200 cursor-pointer transition-colors"
                @click="store.openFilm(film.id)"
            >
              {{ film.title }}
            </li>
          </ul>

          <!-- Simple pagination -->
          <div class="flex gap-2 mt-4">
            <UButton
                :disabled="store.currentPage === 0"
                @click="goToPage(store.currentPage - 1)"
                class="text-gray-50"
            >
              «Previous
            </UButton>
            <span class="text-white px-4 py-2">
              Page {{ store.currentPage + 1 }} of {{ store.totalPages }}
            </span>
            <UButton
                :disabled="store.currentPage >= store.totalPages - 1"
                @click="goToPage(store.currentPage + 1)"
                class="text-gray-50"
            >
              Next»
            </UButton>
          </div>
        </div>

        <!-- Custom modal -->
        <div
            v-if="store.modalOpen"
            class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            @click.self="store.modalOpen = false"
        >
          <div class="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6" v-if="store.selectedFilm">
              <div class="flex justify-between items-start mb-4">
                <h2 class="text-3xl font-bold text-gray-900">{{ store.selectedFilm.title }}</h2>
                <button
                    @click="store.modalOpen = false"
                    class="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >×</button>
              </div>

              <div class="flex gap-3 text-sm text-gray-500 mb-4">
                <span class="px-2 py-1 bg-purple-100 text-purple-700 rounded">{{ store.selectedFilm.rating }}</span>
                <span>{{ store.selectedFilm.length }} min</span>
                <span>{{ store.selectedFilm.releaseYear }}</span>
                <span>${{ store.selectedFilm.rentalRate }}</span>
              </div>

              <!-- View mode -->
              <div v-if="!editMode">
                <p class="text-gray-700 leading-relaxed mb-6">{{ store.selectedFilm.description }}</p>

                <div class="flex gap-2">
                  <button
                      @click="startEdit"
                      class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >Edit</button>
                  <button
                      @click="confirmDelete"
                      class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >Delete</button>
                </div>
              </div>

              <!-- Edit mode -->
              <div v-else class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                      v-model="editForm.title"
                      class="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                      v-model="editForm.description"
                      rows="4"
                      class="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Rental Rate</label>
                  <input
                      v-model.number="editForm.rentalRate"
                      type="number"
                      step="0.01"
                      class="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div class="flex gap-2">
                  <button
                      @click="saveEdit"
                      class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >Save</button>
                  <button
                      @click="editMode = false"
                      class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >Cancel</button>
                </div>
              </div>

              <!-- Error message -->
              <div v-if="actionError" class="mt-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                {{ actionError }}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFilmsStore } from '../stores/films'
import { watchDebounced } from '@vueuse/core'
import { onClickOutside } from '@vueuse/core'

const store = useFilmsStore()
const modalOpen = computed({
  get: () => store.modalOpen,
  set: (v) => store.modalOpen = v
})
const searchContainer = ref(null)
onClickOutside(searchContainer, () => {
  store.autocompleteOpen = false
})
const editMode = ref(false)
const actionError = ref('')
const editForm = ref<any>({
  title: '',
  description: '',
  rentalRate: 0
})

onMounted(() => {
  store.search()
})

watchDebounced(
    () => store.searchQuery,
    (newQuery) => {
      store.autocomplete(newQuery)
    },
    { debounce: 250 }
)
function startEdit() {
  actionError.value = ''
  editForm.value = {
    title: store.selectedFilm.title,
    description: store.selectedFilm.description,
    rentalRate: store.selectedFilm.rentalRate
  }
  editMode.value = true
}
async function saveEdit() {
  actionError.value = ''
  try {
    await store.updateFilm(store.selectedFilm.filmId, editForm.value)
    editMode.value = false
    await store.search(store.currentPage)  // refresh list
  } catch (e: any) {
    actionError.value = e.response?.data?.message || 'Update failed'
  }
}
async function confirmDelete() {
  if (!confirm(`Delete "${store.selectedFilm.title}"? This cannot be undone.`)) return
  actionError.value = ''
  try {
    await store.deleteFilm(store.selectedFilm.filmId)
    store.modalOpen = false
    await store.search(store.currentPage)  // refresh list
  } catch (e: any) {
    actionError.value = e.response?.data?.message || 'Delete failed (film may have rental history)'
  }
}

function onSearchEnter() {
  store.autocompleteOpen = false
  store.search()
}

function onSuggestionClick(suggestion: any) {
  store.searchQuery = suggestion.title
  store.autocompleteOpen = false
  store.openFilm(suggestion.id)
}

function goToPage(page: number) {
  // If user has a search/filter active, paginate through search; otherwise fetch all
  if (store.searchQuery || store.filters.language || store.filters.priceBracket || store.filters.lengthBracket || store.filters.ratings.length) {
    store.search(page)
  } else {
    store.search(page)
  }
}
</script>