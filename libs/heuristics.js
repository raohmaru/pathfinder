const SQRT = Math.sqrt;
const SQRT2 =  Math.SQRT2;
const max = Math.max;

export function manhattan(dx, dy) {
    return dx + dy;
}

export function euclidean(dx, dy) {
    return SQRT(dx * dx + dy * dy);
}

export function octile(dx, dy) {
    var F = SQRT2 - 1;
    return (dx < dy) ? F * dx + dy : F * dy + dx;
}

export function chebyshev(dx, dy) {
    return max(dx, dy);
}
