import axios from 'axios'
import { defineStore } from 'pinia'
import type { AxiosInstance } from 'axios'

let apiInstance: AxiosInstance | null = null

function getAPI(): AxiosInstance {
    if (!apiInstance) {
        const config = useRuntimeConfig()
        apiInstance = axios.create({ baseURL: config.public.apiBase })
    }
    return apiInstance
}
export const useFilmsStore = defineStore('films', {
    state: () => ({
        films: [] as any[],
        totalPages: 0,
        totalElements: 0,
        currentPage: 0,
        loading: false,
        selectedFilm: null as any,
        modalOpen: false,
        autocompleteOpen: false,

        // search/filter state
        searchQuery: '',
        autocompleteResults: [] as any[],
        filters: {
            language: '',
            priceBracket: '',
            lengthBracket: '',
            ratings: [] as string[]
        }
    }),

    actions: {
        async search(page = 0, size = 20) {
            this.loading = true
            try {
                const params: any = { page, size }
                if (this.searchQuery) params.q = this.searchQuery
                if (this.filters.language) params.language = this.filters.language
                if (this.filters.priceBracket) params.priceBracket = this.filters.priceBracket
                if (this.filters.lengthBracket) params.lengthBracket = this.filters.lengthBracket
                if (this.filters.ratings.length) params.rating = this.filters.ratings

                const { data } = await getAPI().get('/search', { params })
                this.films = data.content
                this.totalPages = data.totalPages
                this.totalElements = data.totalElements
                this.currentPage = data.number
            } finally {
                this.loading = false
            }
        },
        async updateFilm(id: number, payload: any) {
            await getAPI().put(`/${id}`, payload)
        },

        async deleteFilm(id: number) {
            await getAPI().delete(`/${id}`)
        },

        async autocomplete(prefix: string) {
            if (!prefix || prefix.length < 2) {
                this.autocompleteResults = []
                this.autocompleteOpen = false
                return
            }
            const { data } = await getAPI().get('/autocomplete', { params: { q: prefix, limit: 5 } })
            this.autocompleteResults = data
            this.autocompleteOpen = data.length > 0
        },

        async fetchFilmById(id: number) {
            const { data } = await getAPI().get(`/${id}`)
            this.selectedFilm = data
        },

        async openFilm(id: number) {
            await this.fetchFilmById(id)
            this.modalOpen = true
        },

        clearFilters() {
            this.filters.language = ''
            this.filters.priceBracket = ''
            this.filters.lengthBracket = ''
            this.filters.ratings = []
            this.searchQuery = ''
            this.search()
        },

        clearSelection() {
            this.selectedFilm = null as any
        }
    }
})