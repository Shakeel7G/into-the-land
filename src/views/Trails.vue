<template>
  <div class="trails">
    <h2>Available Trails</h2>

    <!-- Filter Controls -->
    <div class="filter-controls">
      <div class="search-box">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search trails..."
          class="search-input"
        />
        <span class="search-icon">🔍</span>
      </div>

      <div class="filter-row">
        <div class="area-filters">
          <button 
            :class="['filter-btn', activeAreaFilter === 'all' ? 'active' : '']"
            @click="setAreaFilter('all')"
          >
            All Areas
          </button>
          <button 
            v-for="area in Object.keys(trailsByArea)" 
            :key="`filter-${area}`"
            :class="['filter-btn', activeAreaFilter === area ? 'active' : '']"
            @click="setAreaFilter(area)"
          >
            {{ area }}
          </button>
        </div>
      </div>
    </div>

    <!-- Trails Display -->
    <div 
      v-for="(trails, area) in filteredTrails" 
      :key="area" 
      class="area-section"
      :id="formatAnchorId(area)"
    >
      <h3>{{ area }}</h3>
      <div class="trail-list">
        <HikeCard
          v-for="trail in trails"
          :key="trail.id"
          :hike="trail"
        />
      </div>
    </div>

    <!-- No results message -->
    <div v-if="Object.keys(filteredTrails).length === 0" class="no-results">
      <p>No trails found matching your search criteria.</p>
      <button @click="clearFilters" class="clear-filters-btn">Clear All Filters</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import HikeCard from '@/components/HikeCard.vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

const route = useRoute()
const trailsByArea = ref({})
const searchQuery = ref('')
const activeAreaFilter = ref('all')
const activeDifficultyFilter = ref('all')

// Format area name for URL anchor
const formatAnchorId = (area) => {
  if (!area) return ''
  return area.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

// Set active area filter
const setAreaFilter = (area) => {
  activeAreaFilter.value = area
}

// Clear all filters
const clearFilters = () => {
  activeAreaFilter.value = 'all'
  activeDifficultyFilter.value = 'all'
  searchQuery.value = ''
}

// Compute filtered trails
const filteredTrails = computed(() => {
  let result = {...trailsByArea.value}

  // Apply area filter
  if (activeAreaFilter.value !== 'all') {
    const filtered = {}
    if (trailsByArea.value[activeAreaFilter.value]) {
      filtered[activeAreaFilter.value] = trailsByArea.value[activeAreaFilter.value]
    }
    result = filtered
  }

  const searchLower = searchQuery.value.toLowerCase()
  const finalResult = {}

  for (const area in result) {
    const filteredTrails = result[area].filter(trail => {
      const matchesSearch = !searchQuery.value || 
        trail.title.toLowerCase().includes(searchLower) ||
        (trail.description && trail.description.toLowerCase().includes(searchLower))
      
      const matchesDifficulty = activeDifficultyFilter.value === 'all' || 
        (trail.difficulty && trail.difficulty.toLowerCase() === activeDifficultyFilter.value.toLowerCase())
      
      return matchesSearch && matchesDifficulty
    })

    if (filteredTrails.length > 0) {
      finalResult[area] = filteredTrails
    }
  }

  return finalResult
})

onMounted(async () => {
  try {
    const response = await axios.get(`https://into-the-land-backend.onrender.com/api/trails`)
    const data = response.data

    if (Array.isArray(data)) {
      const grouped = {}
      data.forEach(trail => {
        const areaName = trail.area || trail.area_name || 'Unknown'
        if (!grouped[areaName]) grouped[areaName] = []
        // Make sure image property is correct
        trail.image = trail.image_url || trail.image || ''  
        grouped[areaName].push(trail)
      })
      trailsByArea.value = grouped
    } else if (data && typeof data === 'object') {
      trailsByArea.value = data
    } else {
      trailsByArea.value = {}
    }

    // Scroll to area if URL query exists
    if (route.query.area) {
      const sectionId = route.query.area.toLowerCase()
      setTimeout(() => {
        const section = document.getElementById(sectionId)
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' })
          section.classList.add('highlighted')
          setTimeout(() => section.classList.remove('highlighted'), 1500)
        }
      }, 300)
    }
  } catch (error) {
    console.error('Error fetching trails:', error)
    trailsByArea.value = {}
  }
})
</script>

<style scoped>
/* your existing styles remain the same */
</style>
