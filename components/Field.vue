<template>
  <div>
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" :id="fieldName + 'Label'">{{ fieldData.title }}</span>
      </div>
      <input :id="fieldName + 'Input'" type="text" class="col-sm-4 form-control" :placeholder="fieldData.placeholder" :aria-describedby="fieldName + 'Label'" v-model.number="fieldData.value" :readonly="fieldData.type !== 'in'">
      <div class="input-group-append" v-if="typeof fieldData.description !== 'undefined'">
        <span :id="fieldName + 'Info'" class="d-inline-block">
          <button class="btn btn-primary" type="button"><i class="fa fa-info-circle"></i></button>
        </span>

        <b-popover :show.sync="show" :target="fieldName + 'Info'" :title="fieldData.description">
          <p v-if="fieldData.references" v-for="reference in fieldData.references">{{ reference }}</p>
        </b-popover>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: [ 'fieldData', 'fieldName' ]
};
</script>