<template>
  <v-app id="inspire">
    <v-main>
      <v-btn color="white" class="black--text" dark @click="logout">Logout</v-btn>
    </v-main>
  </v-app>
</template>

<script>
import global_config from './../../../config'

export default {
  name: 'Logout',
  data: () => ({
  }),
  components: { 
     
  },
  methods: {
    logout(){      
      location.href = global_config["api"]["base_url"] + "/auth/logout"
    }
  }
}
</script>

<style>
</style>