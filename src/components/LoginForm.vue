<template>
  <div class="d-flex bg-theme-color justify-content-center align-items-center vh-100">
    <div class="w-30 p-5 rounded bg-white box-shadow">
      <div class="text-center h1 font-weight-bold">Login</div>
      <form>
        <div class="d-flex input-group flex-column mt-4">
          <label for="id" class="mb-2 fw-bold">Login ID</label>
          <input v-model="id" type="text" class="form-control w-100" id="id" name="id" />
        </div>
        <div class="d-flex input-group flex-column my-4">
          <label for="password" class="mb-2 fw-bold">Password</label>
          <input v-model="password" type="password" class="form-control w-100" id="password" name="password" />
        </div>
        <div class="d-flex justify-content-center">
          <button @click.prevent="login" type="submit" class="btn btn-primary w-100">Login</button>
        </div>
        <div v-if="failed" class="failed-text mt-2">
          {{ failed }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import users from '../assets/data/user.json'

export default {
  name: 'LoginForm',

  data() {
    return {
      id: '',
      password: '',
      failed: null
    }
  },
  methods: {
    login() {
      const id = this.id
      const password = this.password

      for (let user of users) {
        if (user.loginId == id && user.password == password) {
          localStorage.setItem('user', JSON.stringify(user))
          this.$router.push({ name: 'ChatBoxPage' })
          this.failed = null
          return true
        }
      }
      this.failed = 'ログインに失敗しました'
      return false
    }
  }
}
</script>

<style scoped>
.box-shadow {
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
}
</style>
