import { shallowMount } from "@vue/test-utils";
import HelloWorld from "@/components/AboutPage.vue";

describe("AboutPage.vue", () => {
  it("renders props.msg when passed", () => {
    const msg = "new message";
    const wrapper = shallowMount(HelloWorld, {
      propsData: { msg },
    });
    expect(wrapper.text()).toMatch(msg);
  });
});
