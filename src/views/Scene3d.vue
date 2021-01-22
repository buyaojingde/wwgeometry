<template>
  <div class="hello">{{ testText }}</div>
</template>

<script lang="ts">
import { observer } from 'mobx-vue';

export default observer({
  name: 'Scene3d',
  components: {},
  data() {
    return {
      testText: 'test',
    };
  },
  computed: {},
  mounted() {
    console.log('3d hello');
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
