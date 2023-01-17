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
      state.versions = versions;
    },
    updateEnvironments(state, environments){
      state.environments = environments;
    },
    updateCurrentEnv(state, env){
      state.current_env = env;
      localStorage.setItem('env', state.current_env)
    } 
  },
  actions: {    
    async getVersions({ commit, state }){
      const response = await axios.get("/api/environments");
      const new_versions = response.data;
      const versions = Object.assign({}, state.versions);
      const environments = [...state.environments];

      for (var i=0;i<new_versions.length;i++){
        versions[new_versions[i].env] = {value: new_versions[i].version, updating_to: new_versions[i].updating_to};
        if (environments.indexOf(new_versions[i].env) === -1) {
            environments.push(new_versions[i].env);
        }
      }
      commit('updateVersions', versions);
      commit('updateEnvironments', environments);

      if (environments.length > 0){
        var env_ls = localStorage.getItem('env')
        if(env_ls && environments.indexOf(env_ls) > -1){
          commit('updateCurrentEnv', env_ls);
        }
        else{
          commit('updateCurrentEnv', environments[0]);
        }
      }
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
