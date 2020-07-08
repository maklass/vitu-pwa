import { shallowMount, createLocalVue } from "@vue/test-utils";
import BootstrapVue from "bootstrap-vue";
import LinkTile from "@/components/LinkTile.vue";
import VueRouter from "vue-router";

const localVue = createLocalVue();
const router = new VueRouter();
localVue.use(VueRouter);
localVue.use(BootstrapVue);

describe("LinkTile.vue", () => {
  test("renders props.title when passed", () => {
    const title = "new title";
    const wrapper = shallowMount(LinkTile, {
      localVue,
      router,
      propsData: { title }
    });
    expect(wrapper.isVueInstance()).toBeTruthy();
    expect(wrapper.text()).toContain(title);
  });
});
