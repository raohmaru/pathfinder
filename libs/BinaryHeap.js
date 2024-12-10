// https://esstudio.site/2018/10/31/implementing-binary-heaps-with-javascript.html
// https://github.com/qiao/heap.js/blob/master/src/heap.coffee

export default function BinaryHeap(compare) {
    const nodes = [];

    function parent(i) {
        return (i - 1) / 2 << 0;
    }

    function left(i) {
        return (2 * i) + 1;
    }

    function right(i) {
        return (2 * i) + 2;
    }

    function shiftUp(i) {
        const node = nodes[i];
        let p = parent(i);
        while (i > 0 && compare(node, nodes[p]) < 0) {
            nodes[i] = nodes[p];
            nodes[p] = node;
            i = p;
            p = parent(i);
        }
    }

    function shiftDown(i) {
        while(true) {
            const l = left(i);
            const r = right(i);
            const lowest = compare(nodes[l], nodes[r]) <= 0 ? l : r;
            if (compare(nodes[lowest], nodes[i]) < 0) {
                const t = nodes[i];
                nodes[i] = nodes[lowest];
                nodes[lowest] = t;
                i = lowest;
            } else {
                break;
            }
        }
    }

    return {
        left,
        right,
        get nodes() {
            return nodes.slice();
        },
        get length() {
            return nodes.length;
        },
        push(node) {
            let i = nodes.push(node) - 1;
            shiftUp(i);
        },
        pop() {
            if (nodes.length <= 1) {
                return nodes.pop();
            }
            const n0 = nodes[0];
            nodes[0] = nodes.pop();
            shiftDown(0);
            return n0;
        },
        update(node) {
            const i = nodes.indexOf(node);
            i === 0 ? shiftDown(i) : shiftUp(i);
        }
    }
}