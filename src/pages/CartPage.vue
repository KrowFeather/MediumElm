<template>
  <div class="w-full h-full box-border pl-1em pr-1em">
    <header class="box-border pt-0.5em flex items-center mb-1em">
      <h2 class="text-size-[1.3em] pr-0.5em">购物车</h2>
      <p class="text-1em">云南大学呈贡校区秋苑</p>
    </header>
    <div class="flex justify-center items-center mb-0.8em">
      <div class="w-50% h-2em border-rd-0.5em bg-white flex justify-center items-center mr-0.5em">
        <img src="../assets/icons/oftenbuy.jpg" alt="" class="w-1.1em h-1.1em">
        <h3 class="text-0.7em">我常买</h3>
      </div>
      <div class="w-50% h-2em border-rd-0.5em bg-white flex justify-center items-center">
        <img src="../assets/icons/supermarket-mini.jpg" alt="" class="w-1.1em h-1.1em">
        <h3 class="text-0.7em" @click="toSuperMarket()">万能超市 ></h3>
        <el-icon><i>
            <Right />
          </i></el-icon>
      </div>
    </div>
    <div class="w-full h-20em bg-white border-rd-0.5em flex justify-center items-center flex-col"
      v-if="Object.keys(carts).length === 0">
      <img src="../assets/cart-banner.jpg" alt="" class="w-12em h-9em">
      <h3 class="text-1em fw-500 m-0.3em">购物车竟然空空如也</h3>
      <p class="text-0.6em text-#777">快去加购喜欢的商品吧</p>
    </div>
    <div v-else class="flex justify-center items-center flex-col">
      <div v-for="(item, idx) in carts" :key="idx" class="w-full flex flex-col items-center shadow bg-white">
        <!-- here -->
        <div class="w-full box-border pl-1em pr-1em pt-1em pb-0.5em">
          <div class="w-full flex justify-between items-center">
            <div class="flex items-center">
              <el-checkbox v-model="selectedItems" :value="idx" @change="handleCheckedCartChange"
                :key="'checkbox-' + idx" class="text-0.8em"></el-checkbox>
              <h3 class="text-1em ml-0.5em">{{ item.name }}</h3>
            </div>
            <img src="../assets/icons/trash.svg" alt="" class="w-1.1em" @click="delFromCart(idx)">
          </div>
        </div>
        <div class="w-full h-full flex justify-center items-center flex-col pb-1em">
          <div v-for="(item_, idx) in item.items " :key="idx" class="flex w-full ">
            <img :src="item_.icon" alt="" class="w-5em b-rd-2em">
            <div class="flex justify-around flex-col w-full pr-1em">
              <h2 class="text-0.9em">{{ item_.name }}</h2>
              <div class="flex justify-between items-center w-full">
                <h2 class="text-0.9em">￥{{ (parseFloat(item_.cost) * item_.quantity).toFixed(2) }}</h2>
                <h2 class="text-0.9em b-1px b-solid b-rd-5px b-#666 p-0.1em">x{{ item_.quantity }}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="w-full h-3em flex justify-center items-center">
      <div class="bg-[linear-gradient(90deg,#ddd,#999)] w-20% h-2px mr-0.5em"></div>
      <img src="../assets/icons/oftenbuy.jpg" alt="" class="w-1.1em h-1.1em">
      <h3 class="text-0.7em">我常买</h3>
      <div class="bg-[linear-gradient(270deg,#ddd,#999)] w-20% h-2px ml-0.5em"></div>
    </div>
    <div class="flex justify-center items-center">
      <p class="text-0.6em text-#777">您在云南大学呈贡校区楸苑附近还没有常购门店哦</p>
    </div>
    <div class="w-full h-3em flex justify-center items-center">
      <div class="bg-[linear-gradient(90deg,#ddd,#999)] w-20% h-2px mr-0.5em"></div>
      <h3 class="text-0.7em">新人专享</h3>
      <div class="bg-[linear-gradient(270deg,#ddd,#999)] w-20% h-2px ml-0.5em"></div>
    </div>
  </div>
  <div class="fixed w-full bottom-0 left-0 bg-white h-3.5em mb-[3.5em] flex justify-between items-center"
    v-if="selectedItems.length > 0">
    <div class="w-60% text-center text-1.1em font-semibold flex justify-start pl-1em box-border">
      <p class="">
        总价：￥{{ totalPrice.toFixed(2) }}
      </p>
    </div>
    <div class="w-15em h-full justify-end items-center flex box-border pr-1em">
      <div class="w-60% text-center b-rd-2em h-70% flex justify-center items-center bg-blue" @click="toOrderConfirm">
        <h3 class="text-white text-1.1em">一键结算</h3>
      </div>
    </div>
  </div>
  <FooterComp></FooterComp>
</template>
<script lang="ts" setup>
import { useRouter } from 'vue-router';
import FooterComp from '@/components/FooterComp.vue';
import { onBeforeMount, ref, computed } from 'vue';
import { base_url } from '@/util/const';
const router = useRouter()
const toSuperMarket = () => {
  router.push({
    name: 'supermarket'
  })
}
const selectedItems = ref([]);
const getCartsFromSession = () => {
  const carts = {};
  // 遍历 sessionStorage 的所有键
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    // 检查键是否以 'cart' 开头
    if (key && key.startsWith('cart')) {
      const cartData = sessionStorage.getItem(key);
      if (cartData) {
        try {
          carts[key] = JSON.parse(cartData); // 解析并存储到 carts 对象中
        } catch (e) {
          console.error(`无法解析 ${key} 的数据`, e);
        }
      }
    }
  }
  return carts;
};
import { get } from '@/auth/auth';
// 存储商家购物车信息
const carts = ref(getCartsFromSession());
console.log(carts.value)
onBeforeMount(async () => {
  await getAllMerchantInfo();
})

const getAllMerchantInfo = async () => {
  const allCarts = getCartsFromSession(); // 获取存储在 session 中的购物车数据
  const cartsWithDetails = {};  // 用于存储合并后的购物车数据

  console.log('All Carts:', allCarts);

  // 遍历所有商家的购物车数据
  for (const merchantId in allCarts) {
    const cart = allCarts[merchantId]; // 获取当前商家的购物车数据
    console.log('Cart Data:', cart);
    const merchantInfo = ref()
    get(`${base_url}/api/merchants/${merchantId.substring(5)}`,(data)=>{
      console.log('data',data)
      merchantInfo.value = data
      console.log('data1',merchantInfo.value)
      const items = Object.entries(cart).filter(([key]) => !['name', 'distance'].includes(key)) // 排除掉非商品信息字段
        .map(([key, item]) => item); // 提取商品信息
      cartsWithDetails[merchantId] = {
        name: merchantInfo.value.name,
        distance: merchantInfo.value.distance,
        items: items
      };
      carts.value = cartsWithDetails;
      console.log('Merged Carts:', carts.value);
    })
  }
};

const delFromCart = async (id) => {
  console.log(id)
  sessionStorage.removeItem(`${id}`)
  await getAllMerchantInfo()
}

const totalPrice = computed(() => {
  let total = 0;
  // 遍历选中的商品索引
  selectedItems.value.forEach(idx => {
    const cart = carts.value[idx];  // 获取对应商家的购物车
    if (cart) {
      cart.items.forEach(item_ => {
        // 计算每个商品的总价
        if (item_.quantity && item_.cost) {
          total += parseFloat(item_.cost) * item_.quantity;
        }
      });
    }
  });
  console.log(total)
  return total;  // 返回总价
});

const handleCheckedCartChange = (value: string[]) => {
  console.log(selectedItems.value)
}

const toOrderConfirm = ()=>{
  router.push({
    name:'merchant',
    params:{
      mid: selectedItems.value[0].substring(5)
    }
  })
}
</script>
<style scoped></style>
