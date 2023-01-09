import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import global_config from '../../../config';

Vue.use(Vuex)

export default {
  namespaced: true,
  state: {
    versions: {
      'dev': 0,
      'staging': 0,
      'prod': 0
    },
    environments: ["dev", "staging", "prod"],
    current_env: global_config.deployment == 'ibmcloud' ? 'dev' : global_config.deployment
  },
  computed: {
  },
  mutations: {
    createEnvironment(state, createdEnvironment){
        var version = createdEnvironment.version;
        var env = createdEnvironment.env;
        state.versions[env] = version;
        state.environments.push(env);
        state.current_env = env;
      },
    updateVersions(state, versions){
      for (var i=0;i<versions.length;i++){
        state.versions[versions[i].env] = {value: versions[i].version, updating_to: versions[i].updating_to};
        if (state.environments.indexOf(versions[i].env) === -1) {
            state.environments.push(versions[i].env);
        }
      }
    },
    updateCurrentEnv(state, env){
      state.current_env = env;
    } 
  },
  actions: {    
    async getVersions({ commit }){
      const response = await axios.get("/api/environments");
      commit('updateVersions', response.data);      
    },
    createEnvironment({ commit, state }, environmentToCreate){
      if (state.environments.includes(environmentToCreate.env)) {
        commit('snackbar/setSnack', {'message': 'Environment already exists!', 'color': 'warning'}, { root: true });
      } else {
        axios.post("/api/environments/create", environmentToCreate)
        .then(function(createdEnvironment){
          commit('createEnvironment', createdEnvironment.data);
          commit('snackbar/setSnack', {'message': 'You have registered a new environment successfully!', 'color': 'success'}, { root: true });
        })
        .catch(function(){
          commit('snackbar/setSnack', {'message': 'Error in registering a new environment!', 'color': 'error'}, { root: true });
        });
      }
    },
    updateEnv({ commit }, env){
      commit('updateCurrentEnv', env);
    },
  },
  getters: {
    // Jobs
    getVersions(state){
      return state.versions;
    },
    getEnvironments(state){
      return state.environments;
    },
    getCurrentEnv(state){
      return state.current_env;
    }
  }
}
