import { createStore } from 'vuex'

export default createStore({
  state: {
    user: {
      name: 'Explorer',
      email: 'explorer@example.com',
      avatar: 'https://i.pravatar.cc/150?img=32',
      preferences: {
        favoriteRegion: 'Drakensberg',
        preferredDifficulty: 'moderate',
        likesGuidedTours: true
      },
      stats: {
        hikesCompleted: 12,
        favorites: [1, 4, 7, 15],
        lastHike: 'Otter Trail'
      }
    },
    hikes: [
      {
        id: 1,
        title: 'Drakensberg Amphitheatre',
        description: 'Towering cliffs and Tugela Falls in Royal Natal National Park.',
        image: 'https://www.gettyimages.com/photos/drakensberg-amphitheatre'
      },
      {
        id: 2,
        title: 'Cederberg Wilderness',
        description: 'Rugged terrain, sandstone arches, and ancient Khoisan rock art.',
        image: 'https://www.gettyimages.com/photos/cederberg-wilderness-area'
      },
      {
        id: 3,
        title: 'Table Mountain Summit',
        description: 'Platteklip Gorge hike up to Cape Town’s famous peak.',
        image: 'https://www.istockphoto.com/photos/table-mountain-south-africa'
      },
      {
        id: 4,
        title: 'Otter Trail',
        description: '5-day coastal hike through the Garden Route’s wildest scenery.',
        image: 'https://www.shutterstock.com/search/otter-trail-south-africa'
      },
      {
        id: 5,
        title: 'Skeleton Gorge',
        description: 'Lush forest trail on the eastern slope of Table Mountain.',
        image: 'https://stock.adobe.com/search?k=skeleton+gorge+cape+town'
      },
      {
        id: 6,
        title: 'Amatola Trail',
        description: 'Forests, waterfalls, and peaks in the Eastern Cape.',
        image: 'https://www.shutterstock.com/search/amatola+trail'
      },
      {
        id: 7,
        title: 'Sentinel Peak',
        description: 'Chain ladders and dramatic cliff views in the Drakensberg.',
        image: 'https://stock.adobe.com/search?k=sentinel+peak+drakensberg'
      },
      {
        id: 8,
        title: 'Lion’s Head',
        description: 'Sunrise and full‑moon hikes with panoramic views of Cape Town.',
        image: 'https://www.istockphoto.com/photos/lions-head-cape-town'
      },
      {
        id: 9,
        title: 'Kasteelspoort',
        description: 'Scenic back-route to Table Mountain via the Twelve Apostles.',
        image: 'https://stock.adobe.com/search?k=kasteelspoort+table+mountain'
      },
      {
        id: 10,
        title: 'Tsitsikamma Waterfall Trail',
        description: 'Short but scenic waterfall hike with a hanging bridge.',
        image: 'https://www.shutterstock.com/search/tsitsikamma+waterfall+trail'
      },
      {
        id: 11,
        title: 'Jonkershoek Panorama Circuit',
        description: 'High ridgelines and valley views near Stellenbosch.',
        image: 'https://www.istockphoto.com/photos/jonkershoek-nature'
      },
      {
        id: 12,
        title: 'Robberg Nature Reserve',
        description: 'Circular cliff hike with views of seals and the sea.',
        image: 'https://www.shutterstock.com/search/robberg+nature+reserve'
      },
      {
        id: 13,
        title: 'Wolfberg Cracks',
        description: 'Cave-like passages in the Cederberg mountains.',
        image: 'https://www.gettyimages.com/photos/wolfberg-arch-cederberg-south-africa'
      },
      {
        id: 14,
        title: 'Hole in the Wall',
        description: 'Coastal hike to the famous arch in Coffee Bay.',
        image: 'https://stock.adobe.com/search?k=hole+in+the+wall+coffee+bay'
      },
      {
        id: 15,
        title: 'Blyde River Canyon',
        description: 'Trails along the world’s third-largest canyon.',
        image: 'https://www.istockphoto.com/photos/blyde-river-canyon'
      },
      {
        id: 16,
        title: 'Suikerbosrand Nature Reserve',
        description: 'Rolling hills and grasslands near Johannesburg.',
        image: 'https://stock.adobe.com/search?k=suikerbosrand+nature+reserve'
      },
      {
        id: 17,
        title: 'De Hoop Whale Trail',
        description: 'Multi-day coastal hike with seasonal whale sightings.',
        image: 'https://www.shutterstock.com/search/de+hoop+whale+trail'
      },
      {
        id: 18,
        title: 'Golden Gate Highlands',
        description: 'Golden cliffs and sandstone formations in Free State.',
        image: 'https://www.istockphoto.com/photos/golden-gate-highlands-national-park'
      },
      {
        id: 19,
        title: 'Chapman’s Peak',
        description: 'Moderate hike with sweeping views over Hout Bay.',
        image: 'https://www.shutterstock.com/search/chapmans+peak+hiking'
      },
      {
        id: 20,
        title: 'Bloukrans River Trail',
        description: 'Jungle-like scenery in Tsitsikamma’s river valleys.',
        image: 'https://stock.adobe.com/search?k=bloukrans+river+trail'
      }
    ]
  },
  mutations: {
    updateUser(state, payload) {
      state.user = { ...state.user, ...payload }
    },
    addFavoriteHike(state, hikeId) {
      if (!state.user.stats.favorites.includes(hikeId)) {
        state.user.stats.favorites.push(hikeId)
      }
    },
    completeHike(state, hikeId) {
      state.user.stats.hikesCompleted++
      const hike = state.hikes.find(h => h.id === hikeId)
      state.user.stats.lastHike = hike?.title || 'Unknown'
    }
  },
  actions: {
    updateUserInfo({ commit }, userInfo) {
      commit('updateUser', userInfo)
    },
    favoriteHike({ commit }, hikeId) {
      commit('addFavoriteHike', hikeId)
    },
    markHikeComplete({ commit }, hikeId) {
      commit('completeHike', hikeId)
    }
  },
  getters: {
    getUser: state => state.user,
    getHikes: state => state.hikes,
    getHikeById: state => id => state.hikes.find(hike => hike.id === id),
    getFavoriteHikes: state =>
      state.user.stats.favorites.map(id =>
        state.hikes.find(h => h.id === id)
      )
  }
})
