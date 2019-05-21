import { expect } from "chai";
import { shallowMount } from "@vue/test-utils";
import Vue from "vue";
import BootstrapVue from "bootstrap-vue";
import LinkTile from "@/components/LinkTile.vue";

Vue.use(BootstrapVue);

describe("LinkTile.vue", () => {
  it("renders props.title when passed", () => {
    const title = "new title";
    const wrapper = shallowMount(LinkTile, {
      propsData: { title }
    });
    expect(wrapper.text()).to.include(title);
  });
});
