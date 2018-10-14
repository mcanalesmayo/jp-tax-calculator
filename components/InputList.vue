<template>
  <div>
    <div class="form-group row" v-for="(input, key, index) in inputs">
      <label :id="key + 'Label'" class="col-sm-2 col-form-label" :for="key + 'Input'">{{ input.title }}</label>
      <div class="input-group col-sm-10">
        <span class="input-group-prepend input-group-text">&yen;</span>
        <input :id="key + 'Input'" type="text" class="form-control" :placeholder="input.placeholder" :aria-describedby="key + 'Label'" v-model.number="input.value">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: [ 'inputs' ]
};
</script>