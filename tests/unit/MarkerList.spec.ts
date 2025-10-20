import Vue from "vue";
import Vuetify from "vuetify";
import { mount, createLocalVue } from "@vue/test-utils";
import MarkerList from "@/components/MarkerList.vue";

const localVue = createLocalVue();
Vue.use(Vuetify);

describe("MarkerList.vue", () => {
  let vuetify: Vuetify;

  beforeAll(() => {
    const app = document.createElement("div");
    app.setAttribute("data-app", "true");
    document.body.appendChild(app);
  });

  beforeEach(() => {
    vuetify = new Vuetify();
  });

  it("Should emits 'select' with marker id when list item is clicked", async () => {
    const marker = { id: "m1", title: "Test", lat: 10, lng: 20 };
    const wrapper = mount(MarkerList, {
      localVue,
      vuetify,
      propsData: {
        markers: [marker],
        selectedId: null,
      },
    });

    const item = wrapper.find(".v-list-item");
    expect(item.exists()).toBe(true);

    await item.trigger("click");

    const emits = wrapper.emitted("select");
    expect(emits).toBeTruthy();
    expect(emits?.[0]).toEqual(["m1"]);
  });

  it("Should show correct marker title and coordinates", () => {
    const marker = {
      id: "m2",
      title: "My Marker",
      lat: 42.123456,
      lng: 21.654321,
    };

    const wrapper = mount(MarkerList, {
      localVue,
      vuetify,
      propsData: { markers: [marker], selectedId: null },
    });

    const title = wrapper.find(".v-list-item__title").text();
    const subtitle = wrapper.find(".v-list-item__subtitle").text();

    expect(title).toBe("My Marker");
    expect(subtitle).toContain("42.123456");
    expect(subtitle).toContain("21.654321");
  });

  it("Should confirm and emit 'clear-all' when delete all clicked", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);

    const wrapper = mount(MarkerList, {
      localVue,
      vuetify,
      propsData: { markers: [], selectedId: null },
    });

    const button = wrapper.find("button");
    await button.trigger("click");

    expect(wrapper.emitted("clear-all")).toBeTruthy();

    (window.confirm as jest.Mock).mockRestore();
  });
});
