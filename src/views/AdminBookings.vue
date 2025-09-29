<!-- AdminBookings.vue -->
 <template>
  <div class="admin-bookings">
    <h1>All Bookings</h1>
    <table v-if="bookings.length > 0">
      <thead>
        <tr>
          <th>ID</th>
          <th>Customer</th>
          <th>Hike</th>
          <th>Date</th>
          <th>Group Size</th>
          <th>Total Price</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="b in bookings" :key="b.id">
          <td>{{ b.id }}</td>
          <td>{{ b.name }} {{ b.surname }}</td>
          <td>{{ b.hike_name }}</td>
          <td>{{ b.hike_date }}</td>
          <td>{{ b.group_size }}</td>
          <td>R{{ b.total_price }}</td>
          <td>{{ b.status }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else>No bookings found.</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "AdminBookings",
  data() {
    return {
      bookings: []
    };
  },
  async created() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      alert('Access denied');
      this.$router.push('/');
      return;
    }

    const token = localStorage.getItem('token');
    try {
  const res = await axios.get(process.env.VUE_APP_API_BASE || 'http://localhost:4000/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.bookings = res.data;
    } catch (err) {
      console.error(err);
    }
  }
};
</script>

<style scoped>
.admin-bookings {
  max-width: 900px;
  margin: auto;
  padding: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
th, td {
  padding: 8px;
  border: 1px solid #ddd;
}
</style>
