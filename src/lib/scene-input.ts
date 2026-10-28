/** Check the event's actual section, including layers covering a sticky scene. */
export function ownsSceneInput(container: Element, target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  const section = container.closest("section");
  return section ? target.closest("section") === section : container.contains(target);
}
