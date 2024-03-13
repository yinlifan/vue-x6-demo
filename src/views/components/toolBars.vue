<!--
 * @Author: error: git config user.name && git config user.email & please set dead value or install git
 * @Date: 2022-12-27 10:58:58
 * @LastEditors: error: git config user.name && git config user.email & please set dead value or install git
 * @LastEditTime: 2022-12-28 14:56:29
 * @FilePath: \vue-antvx6-demo\src\views\components\toolBars.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD
-->
<template>
  <div class="topper">
    <slot></slot>
  </div>
</template>
<script>
export default {
  name:"toolBars",
}
</script>
<style lang="less" scoped>
.topper{
  width: 40%;
  position: absolute;
  top: 0%;
  left: calc(50% - 15%);
  z-index: 99999;
}
</style>
