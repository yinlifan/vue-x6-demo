<!--
 * @Author: error: git config user.name && git config user.email & please set dead value or install git
 * @Date: 2022-12-27 11:09:00
 * @LastEditors: error: git config user.name && git config user.email & please set dead value or install git
 * @LastEditTime: 2022-12-27 14:08:55
 * @FilePath: \vue-antvx6-demo\src\views\components\LeftDrawer.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="leftbar">
    <div class="drawer_title">常用配置</div>
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: "LeftDrawer"
};
</script>
<style lang="less" scoped>
.leftbar {
  max-width: 300px;
  min-width: 300px;
  .drawer_title {
    border-bottom: 1px solid #e8eaec;
    box-sizing: border-box;
    padding: 14px 16px;
    color: #333;
    font-size: 16px;
  }
}
</style>
