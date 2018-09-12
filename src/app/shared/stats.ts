export function mean(values) {
    return values.reduce(function(s, x) { return s+x;}, 0) / values.length;
}

export function variance(values) {
    const m = mean(values);
    return mean(values.map(function(x) {
        return Math.pow(x - m, 2);
    }));
}

export function standardDeviation(values) {
    return Math.sqrt(variance(values));
}

export function root_mean_square(values) {
    if (!values.length) {
        return NaN;
    }
    const sum_of_squares = values.reduce(function(s,x) {return (s + x*x);}, 0);
    return Math.sqrt(sum_of_squares / values.length);
}

export function median(values) {
    if (!values.length) {
        return NaN;
    }
    const numbers = values.slice().sort((a,b) => a - b);
    const middle = Math.floor(numbers.length / 2);
    const isEven = numbers.length % 2 === 0;
    return isEven ? (numbers[middle] + numbers[middle - 1]) / 2 : numbers[middle];
}
