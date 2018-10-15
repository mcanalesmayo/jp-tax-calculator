<template>
  <div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text">{{ fieldData.title }}</span>
      </div>
      <input :id="fieldName + 'Input'" type="text" class="col-sm-4 form-control" :placeholder="fieldData.placeholder" :aria-describedby="fieldName + 'Label'" v-model.number="fieldData.value" :readonly="fieldData.type !== 'in'">
      <div class="input-group-append" v-if="typeof fieldData.description !== 'undefined'">
        <button class="btn btn-outline-secondary" type="button"><i class="fa fa-question-circle"></i></button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: [ 'fieldData', 'fieldName' ]
};
</script>