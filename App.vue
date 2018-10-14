<template>
  <div id="app">
    <InputList :inputs="inputs" />
    <OutputList :inputs="inputs" :rules="rules" />
  </div>
</template>

<script>
import InputList from './components/InputList.vue';
import OutputList from './components/OutputList.vue';

export default {
  props: [ 'inputs', 'rules' ],
  components: {
    InputList,
    OutputList
  }
};
</script>