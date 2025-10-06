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
const areasMap = ref({}) // area_id -> name
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

// Compute filtered trails based on area, search, and difficulty
const filteredTrails = computed(() => {
  let result = { ...trailsByArea.value }

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
    // Fetch all areas
    const areasRes = await axios.get('https://into-the-land-backend.onrender.com/api/areas')
    areasRes.data.forEach(area => {
      areasMap.value[area.id] = area.name
    })

    // Fetch all trails
    const trailsRes = await axios.get('https://into-the-land-backend.onrender.com/api/trails')
    const data = trailsRes.data

    if (Array.isArray(data)) {
      const grouped = {}
      data.forEach(trail => {
        const areaName = areasMap.value[trail.area_id] || 'Unknown'
        if (!grouped[areaName]) grouped[areaName] = []
        grouped[areaName].push(trail)
      })
      trailsByArea.value = grouped
    } else {
      trailsByArea.value = {}
    }

    console.log('Trails grouped by area:', trailsByArea.value)

    // Scroll to section if URL query exists
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
    console.error('Error fetching trails or areas:', error)
    trailsByArea.value = {}
  }
})
</script>
<style scoped>
.trails {
  padding: 1rem;
}

.filter-controls {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(34, 139, 34, 0.15);
}

.search-box {
  position: relative;
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 3rem;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  background-color: white;
}

.search-input:focus {
  outline: none;
  border-color: #2c3e50;
  box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.15);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.area-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.filter-btn {
  padding: 0.6rem 1.2rem;
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #495057;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filter-btn:hover {
  background-color: #e9f5e9;
  border-color: #228B22;
  color: #228B22;
  transform: translateY(-1px);
}

.filter-btn.active {
  background-color: #228B22;
  color: white;
  border-color: #1c6b1c;
  box-shadow: 0 2px 5px rgba(34, 139, 34, 0.3);
}

.difficulty-filters {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.difficulty-filters label {
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
}

.difficulty-select {
  padding: 0.6rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  min-width: 120px;
}

.difficulty-select:focus {
  outline: none;
  border-color: #2c3e50;
  box-shadow: 0 0 0 2px rgba(44, 62, 80, 0.15);
}

.area-section {
  margin-bottom: 3rem;
  scroll-margin-top: 80px;
}

.area-section h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #eee;
  font-size: 1.5rem;
  font-weight: 600;
}

.trail-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.highlighted {
  animation: highlight 1.5s ease;
}

@keyframes highlight {
  from { background-color: rgba(22, 163, 74, 0.2); }
  to { background-color: transparent; }
}

h2 {
  text-align: center;
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-weight: 700;
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.clear-filters-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #228B22;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.clear-filters-btn:hover {
  background-color: #1c6b1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .area-filters {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    margin-right: -0.5rem;
  }
  
  .difficulty-filters {
    justify-content: space-between;
    padding: 0.75rem;
  }
  
  .search-box {
    max-width: 100%;
  }
}
</style>
