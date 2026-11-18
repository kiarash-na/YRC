/**
 * remark plugin for event bodies ("Explore the details"). Admins write plain
 * Markdown; this tags the patterns of the event template so the page can
 * render them as designed components (see EventBody):
 *
 *   ### Kicker line            first node, h3   → data-variant="kicker"
 *   - **07:45** · **Place:** … every item starts with a bold HH:MM time
 *                                              → data-variant="timeline"
 *   ## Pack your kit / Bring along / What to bring …, then a bullet list
 *                                              → data-variant="checklist"
 *   > Come for the run. …      last node, quote → data-variant="signoff"
 *
 * Only top-level nodes are inspected; nothing is removed except the
 * separator ("·", "-", "–", "|") between a timeline time and its text.
 */

interface MdNode {
  type: string;
  depth?: number;
  ordered?: boolean | null;
  value?: string;
  children?: MdNode[];
  data?: { hName?: string; hProperties?: Record<string, unknown> };
}

const TIME_RE = /^\d{1,2}[:.]\d{2}$/;
const CHECKLIST_HEADING_RE = /\b(pack|packing|bring|kit|gear|what to wear)\b/i;
const SEPARATOR_RE = /^\s*[·•\-–—|:]\s*/;

function textOf(node: MdNode): string {
  if (typeof node.value === "string") return node.value;
  return (node.children ?? []).map(textOf).join("");
}

function tag(node: MdNode, variant: string, hName?: string) {
  node.data = {
    ...node.data,
    ...(hName ? { hName } : {}),
    hProperties: { ...node.data?.hProperties, "data-variant": variant },
  };
}

/** The paragraph's leading bold time, if this list item has one. */
function leadingTime(item: MdNode): { paragraph: MdNode; time: MdNode } | null {
  const paragraph = item.children?.[0];
  const time = paragraph?.type === "paragraph" ? paragraph.children?.[0] : undefined;
  if (!paragraph || !time || time.type !== "strong") return null;
  return TIME_RE.test(textOf(time).trim()) ? { paragraph, time } : null;
}

function asTimeline(list: MdNode): boolean {
  const items = list.children ?? [];
  if (items.length < 2 || !items.every(leadingTime)) return false;
  tag(list, "timeline", "ol");
  for (const item of items) {
    const { paragraph, time } = leadingTime(item)!;
    tag(item, "timeline");
    // **07:45** → <time>07:45</time>
    tag(time, "timeline", "time");
    const rest = (paragraph.children ?? []).slice(1);
    if (rest[0]?.type === "text" && rest[0].value) {
      rest[0].value = rest[0].value.replace(SEPARATOR_RE, "");
    }
    // Wrap the description so the item lays out as [time | text].
    const body: MdNode = { type: "emphasis", children: rest };
    tag(body, "timeline", "span");
    paragraph.children = [time, body];
  }
  return true;
}

export function remarkEventBody() {
  return (tree: MdNode) => {
    const nodes = tree.children ?? [];

    const first = nodes[0];
    if (first?.type === "heading" && first.depth === 3) tag(first, "kicker");

    let heading = "";
    for (const node of nodes) {
      if (node.type === "heading") {
        heading = textOf(node);
        continue;
      }
      if (node.type !== "list") continue;
      if (asTimeline(node)) continue;
      if (!node.ordered && CHECKLIST_HEADING_RE.test(heading)) {
        tag(node, "checklist");
        for (const item of node.children ?? []) tag(item, "checklist");
      }
    }

    const last = nodes.at(-1);
    if (last?.type === "blockquote") tag(last, "signoff");
  };
}
