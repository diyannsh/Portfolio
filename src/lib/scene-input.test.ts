import { describe, expect, it } from "vitest";
import { ownsSceneInput } from "./scene-input";

describe("Section input ownership", () => {
  it("keeps a covered lanyard from receiving toolkit, navigation or project overlay input", () => {
    const root = document.createElement("main");
    root.innerHTML = `<section id="about"><div class="lanyard"></div><p>About</p></section>
      <section id="skills"><button>Orbit</button></section><nav><button>Navigate</button></nav>
      <div role="dialog"><button>Close</button></div>`;
    const lanyard = root.querySelector(".lanyard")!;
    expect(ownsSceneInput(lanyard, root.querySelector("#skills button"))).toBe(false);
    expect(ownsSceneInput(lanyard, root.querySelector("nav button"))).toBe(false);
    expect(ownsSceneInput(lanyard, root.querySelector('[role="dialog"] button'))).toBe(false);
    expect(ownsSceneInput(lanyard, root.querySelector("#about p"))).toBe(true);
    expect(ownsSceneInput(lanyard, window)).toBe(false);
  });
});
